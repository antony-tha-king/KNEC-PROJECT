const express = require("express");
const cors = require("cors");
require("dotenv").config();
const sequelize = require("./config/database");

// Import the routes
const studentRoutes = require("./routes/studentRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Use the routes
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/admins", adminRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("Welcome to the School Management System API!");
});

// Sync models with the database
sequelize.sync()
  .then(() => {
    console.log("✅ Database connected successfully!");
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });
  })
  .catch(err => console.error("❌ Unable to connect to the database:", err));
