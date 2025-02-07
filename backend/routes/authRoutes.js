const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, isActive, hasRole } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes
router.get('/profile', verifyToken, isActive, authController.getProfile);

// Role-specific registration routes
router.post('/register/student', verifyToken, isActive, hasRole(['SUPER_ADMIN', 'PRINCIPAL']), async (req, res) => {
	req.body.role = 'STUDENT';
	return authController.register(req, res);
});

router.post('/register/teacher', verifyToken, isActive, hasRole(['SUPER_ADMIN', 'PRINCIPAL']), async (req, res) => {
	req.body.role = 'TEACHER';
	return authController.register(req, res);
});

router.post('/register/admin', verifyToken, isActive, hasRole(['SUPER_ADMIN']), async (req, res) => {
	req.body.role = 'PRINCIPAL';
	return authController.register(req, res);
});

module.exports = router;