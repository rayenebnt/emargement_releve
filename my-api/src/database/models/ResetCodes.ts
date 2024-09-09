// src/database/models/ResetCodes.ts
import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../instance";
import User from "./Users"; // Assurez-vous que le chemin est correct

interface ResetCodeAttributes {
  userId: number;
  code: number;
  expiresAt: Date;
}

interface ResetCodeCreationAttributes extends Optional<ResetCodeAttributes, "userId"> {}

class ResetCode extends Model<ResetCodeAttributes, ResetCodeCreationAttributes> implements ResetCodeAttributes {
  public userId!: number;
  public code!: number;
  public expiresAt!: Date;
}

ResetCode.init(
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "id",
      },
    },
    code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "ResetCodes",
  }
);

// Définir les associations si nécessaire
User.hasMany(ResetCode, { foreignKey: "userId" });
ResetCode.belongsTo(User, { foreignKey: "userId" });

export default ResetCode;
