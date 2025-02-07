const Admin = require("../models/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerAdmin = async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    res.status(201).json({ message: "Admin registered successfully", admin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ where: { email } });

    if (!admin || !(await bcrypt.compare(password, admin.password))) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin.id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login successful", token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAdmin = async (req, res) => {
  try {
    const admin = await Admin.create(req.body);
    res.status(201).json({ message: "Admin created successfully", admin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.status(200).json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    res.status(200).json(admin);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    await admin.update(req.body);
    res.status(200).json({ message: "Admin updated successfully", admin });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const admin = await Admin.findByPk(req.params.id);
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }
    await admin.destroy();
    res.status(204).json();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
