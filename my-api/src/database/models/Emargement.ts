// src/database/models/Emargement.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../instance";
import User from "./Users"; // Assurez-vous que le chemin est correct

interface EmargementAttributes {
  id: number;
  user_id: number;
  city: string;
  status: string;
  note: string;
  emargementType: string;
  emargementTime: Date;
  createdAt?: Date; // Ajout de createdAt et updatedAt
  updatedAt?: Date;
  user?: User;
}

interface EmargementCreationAttributes extends Optional<EmargementAttributes, 'id'> {}

class Emargement extends Model<EmargementAttributes, EmargementCreationAttributes> implements EmargementAttributes {
  public id!: number;
  public user_id!: number;
  public city!: string;
  public status!: string;
  public note!: string;
  public emargementType!: string;
  public emargementTime!: Date;
  public createdAt!: Date;
  public updatedAt!: Date;
  public user?: User;
}

Emargement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    note: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emargementType: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    emargementTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "Emargements",
    timestamps: true, // Active les champs createdAt et updatedAt
  }
);

export default Emargement;
