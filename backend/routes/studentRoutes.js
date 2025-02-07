const express = require("express");
const router = express.Router();
const studentController = require("../controllers/studentController"); // Ensure this path is correct

// Ensure these functions exist in studentController.js
router.post("/register", studentController.registerStudent);
router.post("/login", studentController.loginStudent);

module.exports = router;
