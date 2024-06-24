import { DataTypes } from "sequelize";
import sequelize from "../instance";

const Users = sequelize.define(
  "Users",
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
    tableName: "Users",
  }
);

export default Users;
