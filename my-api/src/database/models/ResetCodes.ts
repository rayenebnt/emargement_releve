import { DataTypes } from "sequelize";
import sequelize from "../instance";
import Users from "./Users";

const ResetCodes = sequelize.define(
  "ResetCodes",
  {
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Users,
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
    tableName: "ResetCodes",
  }
);

export default ResetCodes;
