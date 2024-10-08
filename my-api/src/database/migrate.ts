import sequelize from './instance'; // Assurez-vous que le chemin est correct
import Emargements from './models/Emargement'; // Ajustez le chemin si nécessaire
import Users from './models/Users'; // Ajustez le chemin si nécessaire
import ResetCodes from './models/ResetCodes'; // Ajustez le chemin si nécessaire

async function migrate() {
  try {
    console.log("Starting migration...");
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");

    // Synchroniser les modèles avec la base de données
    await Users.sync({ alter: true });
    console.log("Users table migrated.");
    await Emargements.sync({ alter: true });
    console.log("Emargements table migrated.");
    await ResetCodes.sync({ alter: true });
    console.log("ResetCodes table migrated.");

    // Vérification de la colonne emargementType
    const columns = await sequelize
      .getQueryInterface()
      .describeTable("Emargements");
    console.log("Table structure:", columns); // Ajouter ce log pour afficher la structure de la table
    if (columns.emargementType) {
      console.log("emargementType column exists.");
    } else {
      console.log("emargementType column does not exist.");
    }

    console.log("Migration réussie !");
  } catch (error) {
    console.error("Erreur lors de la migration :", error);
  } finally {
    await sequelize.close();
  }
}

migrate();
