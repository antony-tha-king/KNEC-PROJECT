const { Sequelize } = require("sequelize");
require("dotenv").config();

// Database connection using Sequelize ORM
const sequelize = new Sequelize(
  process.env.DB_NAME, 
  process.env.DB_USER, 
  process.env.DB_PASSWORD, 
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
    logging: false, // Set to true if you want to see SQL queries
  }
);

// Test connection
sequelize
  .authenticate()
  .then(() => console.log("✅ Database connected successfully"))
  .catch((err) => console.error("❌ Database connection failed:", err));

module.exports = sequelize;
