require("dotenv").config()

module.exports = {
  development: {
    username: "postgres",
    password: "root",
    database: "dumb_ways",
    host: "127.0.0.1",
    dialect: "postgres"
  },
  testing: {
    username: "postgres",
    password: "root",
    database: "b56personalweb",
    host: "localhost",
    dialect: "postgres",
  },
  production: {
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  },
};