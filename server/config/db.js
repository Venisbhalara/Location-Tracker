const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");
dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const commonOptions = {
  dialect: "mysql",
  logging: false,
  dialectOptions: isProduction
    ? {
        ssl: {
          require: true,
          rejectUnauthorized: false,
        },
        connectTimeout: 60000,
      }
    : {},
  pool: {
    max: 15,
    min: 2,
    acquire: 30000,
    idle: 10000,
    evict: 10000,
  },
};

let sequelize;

if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL.trim(), commonOptions);
} else {
  let cleanHost = (process.env.DB_HOST || "localhost").trim();
  // Strip protocol and path if accidentally included (e.g. mysql://host:port or host/)
  cleanHost = cleanHost.replace(/^[a-z]+:\/\//i, "").replace(/\/.*$/, "");

  sequelize = new Sequelize(
    process.env.DB_NAME ? process.env.DB_NAME.trim() : "",
    process.env.DB_USER ? process.env.DB_USER.trim() : "",
    process.env.DB_PASSWORD ? process.env.DB_PASSWORD.trim() : "",
    {
      ...commonOptions,
      host: cleanHost,
      port: parseInt(process.env.DB_PORT, 10) || 3306,
    },
  );
}

// Just exports the sequelize instance — sync is done in server.js
module.exports = sequelize;
