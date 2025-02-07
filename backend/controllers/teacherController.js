const Teacher = require("../models/Teacher");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Generate staff number based on department and course code
function generateStaffNumber(department, courseCode) {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const deptCode = department.slice(0, 2).toUpperCase();
  return `T${year}${deptCode}${courseCode}`;
}

exports.registerTeacher = async (req, res) => {
  try {
    const {
      name,
      nationalId,
      email,
      phone,
      department,
      courseCode,
      courseName,
      password
    } = req.body;

    // Check if teacher with national ID already exists
    const existingTeacher = await Teacher.findOne({
      where: { nationalId }
    });

    if (existingTeacher) {
      return res.status(400).json({
        error: "A teacher with this National ID already exists"
      });
    }

    // Generate staff number
    const staffNumber = generateStaffNumber(department, courseCode);

    // Create teacher with generated staff number
    const teacher = await Teacher.create({
      staffNumber,
      name,
      nationalId,
      email,
      phone,
      department,
      courseCode,
      courseName,
      password,
      status: 'pending'
    });

    res.status(201).json({
      message: "Registration successful. Please wait for admin approval.",
      staffNumber: teacher.staffNumber
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.loginTeacher = async (req, res) => {
  try {
    const { staffNumber, password } = req.body;
    const teacher = await Teacher.findOne({ where: { staffNumber } });

    if (!teacher || !(await bcrypt.compare(password, teacher.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: teacher.id, role: "teacher" }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.create(req.body);
    res.status(201).json({ message: "Teacher created successfully", teacher });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllTeachers = async (req, res) => {
  try {
    const teachers = await Teacher.findAll();
    res.status(200).json(teachers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeacherById = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    res.status(200).json(teacher);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    await teacher.update(req.body);
    res.status(200).json({ message: "Teacher updated successfully", teacher });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findByPk(req.params.id);
    if (!teacher) {
      return res.status(404).json({ error: "Teacher not found" });
    }
    await teacher.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
