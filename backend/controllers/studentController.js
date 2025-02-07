const Student = require("../models/Student");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Generate admission number based on course code and year
function generateAdmissionNumber(courseCode, yearOfStudy) {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  return `${courseCode}/${year}/${Math.floor(1000 + Math.random() * 9000)}`;
}

exports.registerStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      phone,
      department,
      courseCode,
      courseName,
      yearOfStudy,
      guardianName,
      guardianPhone,
      guardianEmail,
      guardianRelationship,
      alternativeContact,
      password
    } = req.body;

    // Check if email already exists
    const existingStudent = await Student.findOne({ where: { email } });
    if (existingStudent) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Generate admission number
    const admissionNumber = generateAdmissionNumber(courseCode, yearOfStudy);

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student record
    const student = await Student.create({
      admissionNumber,
      firstName,
      lastName,
      email,
      phone,
      department,
      courseCode,
      courseName,
      yearOfStudy,
      guardianName,
      guardianPhone,
      guardianEmail,
      guardianRelationship,
      alternativeContact,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Registration successful",
      admissionNumber: student.admissionNumber
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.loginStudent = async (req, res) => {
  try {
    const { admissionNumber, password } = req.body;
    const student = await Student.findOne({ where: { admissionNumber } });

    if (!student || !(await bcrypt.compare(password, student.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: student.id, role: "student" }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
