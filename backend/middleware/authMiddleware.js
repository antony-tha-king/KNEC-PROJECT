const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const { Permission } = require('../models/Permission');

// Verify JWT token
const verifyToken = async (req, res, next) => {
	try {
		const token = req.headers.authorization?.split(' ')[1];
		if (!token) {
			return res.status(401).json({ message: 'No token provided' });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findByPk(decoded.id);

		if (!user) {
			return res.status(401).json({ message: 'User not found' });
		}

		req.user = user;
		next();
	} catch (error) {
		return res.status(401).json({ message: 'Invalid token' });
	}
};

// Check if user has required role
const hasRole = (roles) => {
	return async (req, res, next) => {
		try {
			const userRoles = await req.user.getRoleNames();
			const hasRequiredRole = roles.some(role => userRoles.includes(role));

			if (!hasRequiredRole) {
				return res.status(403).json({ 
					message: 'Access denied: Required role not found' 
				});
			}

			next();
		} catch (error) {
			return res.status(500).json({ 
				message: 'Error checking user roles',
				error: error.message 
			});
		}
	};
};

// Check if user has required permission
const hasPermission = (requiredPermission) => {
	return async (req, res, next) => {
		try {
			const hasAccess = await req.user.hasPermission(requiredPermission);
			
			if (!hasAccess) {
				return res.status(403).json({ 
					message: 'Access denied: Required permission not found' 
				});
			}

			next();
		} catch (error) {
			return res.status(500).json({ 
				message: 'Error checking user permissions',
				error: error.message 
			});
		}
	};
};

// Check if user is active
const isActive = async (req, res, next) => {
	if (req.user.status !== 'active') {
		return res.status(403).json({ 
			message: 'Account is not active' 
		});
	}
	next();
};

// Combine multiple middleware
const combineMiddleware = (...middleware) => {
	return async (req, res, next) => {
		try {
			for (const mw of middleware) {
				await new Promise((resolve, reject) => {
					mw(req, res, (err) => {
						if (err) reject(err);
						resolve();
					});
				});
			}
			next();
		} catch (error) {
			next(error);
		}
	};
};

// Example usage:
// Protect admin routes
const adminOnly = combineMiddleware(
	verifyToken,
	isActive,
	hasRole(['SUPER_ADMIN', 'PRINCIPAL'])
);

// Protect teacher routes
const teacherOnly = combineMiddleware(
	verifyToken,
	isActive,
	hasRole(['TEACHER'])
);

// Protect student routes
const studentOnly = combineMiddleware(
	verifyToken,
	isActive,
	hasRole(['STUDENT'])
);

module.exports = {
	verifyToken,
	hasRole,
	hasPermission,
	isActive,
	combineMiddleware,
	adminOnly,
	teacherOnly,
	studentOnly
};