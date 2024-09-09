require("dotenv").config();
import { Sequelize } from "sequelize";

let sequelize: Sequelize;

if (process.env.JAWSDB_MARIA_URL) {
  sequelize = new Sequelize(process.env.JAWSDB_MARIA_URL, {
    dialect: "mariadb",
    protocol: "mariadb",
    define: {
      timestamps: false,
    },
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME as string,
    process.env.DB_USER as string,
    process.env.DB_PASSWORD as string,
    {
      dialect: "mariadb",
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      define: {
        timestamps: false,
      },
    }
  );
}

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
})();

export default sequelize;
