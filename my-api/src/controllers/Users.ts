import { Request, Response } from "express";
import Users from "../database/models/Users";
import Emargements from "../database/models/Emargement";
import jwt from "jsonwebtoken";
import dayjs from "dayjs";
import "dayjs/locale/fr";
import "dayjs/plugin/customParseFormat";
import utc from "dayjs/plugin/utc";
import tz from "dayjs/plugin/timezone";
import { Op } from "sequelize";
import nodemailer from "nodemailer";
import { randomInt } from "crypto";
import ResetCodes from "../database/models/ResetCodes";
import cron from "node-cron";
import moment from "moment-timezone";
import bcrypt from "bcryptjs";

dayjs.extend(utc);
dayjs.locale("fr");
dayjs.extend(tz);
dayjs.tz.setDefault("Europe/Paris");

Users.hasMany(Emargements, {
  foreignKey: "user_id",
  as: "emargements",
});
Emargements.belongsTo(Users, {
  foreignKey: "user_id",
  as: "user",
});



async function getAll(req: Request, res: Response) {
  try {
    const users = await Users.findAll();
    res.send(JSON.stringify(users));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

async function getById(req: Request, res: Response) {
  try {
    const user = await Users.findByPk(req.params.id);

    if (user) {
      res.send({ user });
    } else {
      res.status(404).json({ error: "Utilisateur non trouvé." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

async function create(req: Request, res: Response) {
  try {
    const { Nom, Prenom, UserName, Password, Email } = req.body;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(Password, salt);

    const user = await Users.create({
      Nom,
      Prenom,
      UserName,
      Password: hashedPassword,
      Email,
    });

    res.status(201).json({ user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

async function update(req: Request, res: Response) {
  try {
    const user = await Users.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (user[0]) {
      res.json({ message: "Utilisateur mis à jour avec succès." });
    } else {
      res.status(404).json({ error: "Utilisateur non trouvé." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

async function remove(req: Request, res: Response) {
  try {
    const result = await Users.destroy({
      where: { id: req.params.id },
    });

    if (result) {
      res.json({ message: "Utilisateur supprimé avec succès." });
    } else {
      res.status(404).json({ error: "Utilisateur non trouvé." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

async function login(req: Request, res: Response) {
  const { UserName, Password } = req.body;

  try {
    const user = await Users.findOne({ where: { UserName } });

    if (user) {
      const validPassword = await bcrypt.compare(Password, user.Password);
      if (!validPassword) {
        return res.status(401).json({ error: "Mot de passe incorrect." });
      }

      const token = jwt.sign({ userId: user.id }, "cle", { expiresIn: "1h" });
      res.status(200).json({ message: "Connexion réussie", token });
    } else {
      res
        .status(401)
        .json({ error: "Nom d'utilisateur ou mot de passe incorrect." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

async function emargement(req: Request, res: Response) {
  const { lastName, firstName, city, deviceId, status, note, emargementType } =
    req.body;

  console.log(req.body);

  try {
    const user = await Users.findOne({
      where: {
        Nom: lastName,
        Prenom: firstName,
      },
    });

    if (user) {
      const user_id = user.id;
      const today = moment().tz("Europe/Paris").startOf("day");
      const emargementsToday = await Emargements.count({
        where: {
          deviceId: deviceId,
          createdAt: {
            [Op.gte]: today.toDate(),
            [Op.lt]: today.clone().add(1, "day").toDate(),
          },
        },
      });

      if (emargementsToday >= 9) {
        return res.status(403).json({
          error:
            "Nombre maximal d'émargements atteint pour cet appareil aujourd'hui.",
        });
      }

      const emargement = await Emargements.create({
        user_id,
        city,
        deviceId,
        status,
        note: note,
        emargementType: emargementType,
        emargementTime: dayjs().tz("Europe/Paris").add(2, "hour").toDate(),
      });

      return res
        .status(200)
        .json({ emargement, message: "Émargement réussi." });
    } else {
      return res.status(404).json({
        error: "Utilisateur non trouvé. Veuillez vérifier les informations.",
      });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur lors de l'émargement." });
  }
}

async function getEmargement(req: Request, res: Response) {
  try {
    const emargements = await Emargements.findAll({
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["Nom", "Prenom"],
        },
      ],
    });

    res.status(200).json(emargements);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Erreur lors de la récupération des informations d'émargement.",
    });
  }
}

async function forgotPassword(req: Request, res: Response) {
  const { email } = req.body;

  try {
    const user = await Users.findOne({ where: { Email: email } });

    if (user) {
      const resetCode = randomInt(1000, 9999);

      await ResetCodes.create({
        userId: user.id,
        code: resetCode,
        expiresAt: new Date(Date.now() + 3600000),
      });

      const transporter = nodemailer.createTransport({
        service: "gmail",
        secure: false,
        tls: {
          rejectUnauthorized: false,
        },
        auth: {
          user: "larelevebariolee@gmail.com",
          pass: "ldyb tvms pfiv yqak",
        },
      });

      const mailOptions = {
        from: "larelevebariolee@gmail.com",
        to: email,
        subject: "Réinitialisation du mot de passe",
        text: `Votre code de réinitialisation du mot de passe est : ${resetCode}`,
      };

      await transporter.sendMail(mailOptions);

      res.status(200).json({
        message: "Lien de réinitialisation du mot de passe envoyé avec succès.",
      });
    } else {
      res.status(404).json({ error: "Utilisateur non trouvé." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

async function verifyResetCode(req: Request, res: Response) {
  const { email, code } = req.body;

  try {
    const user = await Users.findOne({ where: { Email: email } });
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé." });
    }

    const validCode = await ResetCodes.findOne({
      where: {
        userId: user.id,
        code: code,
        expiresAt: { [Op.gte]: new Date() },
      },
    });

    if (validCode) {
      res.status(200).json({ message: "Code de réinitialisation valide." });
    } else {
      res
        .status(400)
        .json({ error: "Code de réinitialisation invalide ou expiré." });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

async function changePassword(req: Request, res: Response) {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ where: { Email: email } });

    if (user) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      await Users.update(
        { Password: hashedPassword },
        { where: { Email: email } }
      );
      return res
        .status(200)
        .json({ message: "Mot de passe réinitialisé avec succès." });
    }

    return res.status(404).json({ error: "Utilisateur non trouvé." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erreur interne du serveur." });
  }
}

async function sendEmargementInfo() {
  try {
    const today = dayjs().startOf("day").toDate();
    const tomorrow = dayjs().add(1, "day").startOf("day").toDate();

    const emargements = await Emargements.findAll({
      include: [
        {
          model: Users,
          as: "user",
          attributes: ["Nom", "Prenom"],
        },
      ],
      where: {
        createdAt: {
          [Op.gte]: today,
          [Op.lt]: tomorrow,
        },
      },
    });

    const formattedEmargements = emargements.map((emargement) => ({
      nom: emargement.user.Nom,
      prenom: emargement.user.Prenom,
      city: emargement.city,
      status: emargement.status,
      note: emargement.note,
      EmargementsType: emargement.emargementType,
      emargementTime: dayjs(emargement.emargementTime)
        .add(-2, "hour")
        .format("DD/MM/YYYY HH:mm:ss"),
    }));

    const transporter = nodemailer.createTransport({
      service: "gmail",
      secure: false,
      tls: {
        rejectUnauthorized: false,
      },
      auth: {
        user: "larelevebariolee@gmail.com",
        pass: "ldyb tvms pfiv yqak",
      },
    });

    const mailOptions = {
      from: "larelevebariolee@gmail.com",
      to: "larelevebariolee@gmail.com",
      subject: "Informations d'émargement du jour",
      text: JSON.stringify(formattedEmargements, null, 2),
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email envoyé : " + info.response);
      }
    });
  } catch (error) {
    console.error(
      "Erreur lors de l'envoi des informations d'émargement :",
      error
    );
  }
}

cron.schedule("00 18 * * *", () => {
  console.log("Envoi des informations d'émargement...");
  sendEmargementInfo();
});

export {
  getAll,
  getById,
  create,
  update,
  remove,
  login,
  emargement,
  getEmargement,
  forgotPassword,
  verifyResetCode,
  changePassword,
  sendEmargementInfo,
};
