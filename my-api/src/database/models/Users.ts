import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../instance";

// Définir les attributs du modèle
interface UserAttributes {
  id: number;
  Nom: string;
  Prenom: string;
  UserName: string;
  Password: string;
  Email: string;
}

// Définir les attributs optionnels pour l'initialisation du modèle
interface UserCreationAttributes extends Optional<UserAttributes, 'id'> {}

// Définir la classe du modèle en étendant `Model` avec les attributs définis
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public Nom!: string;
  public Prenom!: string;
  public UserName!: string;
  public Password!: string;
  public Email!: string;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Nom: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Prenom: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    UserName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Users",
  }
);

export default User;
