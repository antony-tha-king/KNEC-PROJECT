const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const Role = require('../models/Role');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');

const generateToken = (user) => {
	return jwt.sign(
		{ id: user.id, email: user.email },
		process.env.JWT_SECRET,
		{ expiresIn: '24h' }
	);
};

const authController = {
	// Register new user with role
	register: async (req, res) => {
		try {
			const { email, password, firstName, lastName, role, ...additionalData } = req.body;

			// Check if user already exists
			const existingUser = await User.findOne({ where: { email } });
			if (existingUser) {
				return res.status(400).json({ message: 'Email already registered' });
			}

			// Create base user
			const user = await User.create({
				email,
				password,
				firstName,
				lastName,
				username: email // Default username as email
			});

			// Assign role
			const userRole = await Role.findOne({ where: { name: role } });
			if (!userRole) {
				await user.destroy();
				return res.status(400).json({ message: 'Invalid role specified' });
			}

			await user.addRole(userRole);

			// Create role-specific profile
			let profile;
			switch (role) {
				case 'STUDENT':
					profile = await Student.create({
						userId: user.id,
						studentId: additionalData.studentId,
						...additionalData
					});
					break;
				case 'TEACHER':
					profile = await Teacher.create({
						userId: user.id,
						teacherId: additionalData.teacherId,
						...additionalData
					});
					break;
			}

			const token = generateToken(user);
			res.status(201).json({
				message: 'Registration successful',
				token,
				user: {
					id: user.id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					role
				}
			});
		} catch (error) {
			console.error('Registration error:', error);
			res.status(500).json({
				message: 'Error during registration',
				error: error.message
			});
		}
	},

	// Login user
	login: async (req, res) => {
		try {
			const { email, password } = req.body;

			// Find user
			const user = await User.findOne({ 
				where: { email },
				include: [{ model: Role }]
			});

			if (!user) {
				return res.status(401).json({ message: 'Invalid credentials' });
			}

			// Verify password
			const isValidPassword = await user.validatePassword(password);
			if (!isValidPassword) {
				return res.status(401).json({ message: 'Invalid credentials' });
			}

			// Check if user is active
			if (user.status !== 'active') {
				return res.status(403).json({ message: 'Account is not active' });
			}

			// Get user roles
			const roles = await user.getRoleNames();

			// Update last login
			user.lastLogin = new Date();
			await user.save();

			const token = generateToken(user);
			res.json({
				message: 'Login successful',
				token,
				user: {
					id: user.id,
					email: user.email,
					firstName: user.firstName,
					lastName: user.lastName,
					roles
				}
			});
		} catch (error) {
			console.error('Login error:', error);
			res.status(500).json({
				message: 'Error during login',
				error: error.message
			});
		}
	},

	// Get current user profile
	getProfile: async (req, res) => {
		try {
			const user = await User.findByPk(req.user.id, {
				include: [{ model: Role }],
				attributes: { exclude: ['password'] }
			});

			const roles = await user.getRoleNames();
			let profile;

			// Get role-specific profile
			if (roles.includes('STUDENT')) {
				profile = await Student.findOne({ where: { userId: user.id } });
			} else if (roles.includes('TEACHER')) {
				profile = await Teacher.findOne({ where: { userId: user.id } });
			}

			res.json({
				user: {
					...user.toJSON(),
					roles,
					profile
				}
			});
		} catch (error) {
			res.status(500).json({
				message: 'Error fetching profile',
				error: error.message
			});
		}
	}
};

module.exports = authController;