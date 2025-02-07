const sequelize = require('./database');
const User = require('../models/User');
const Role = require('../models/Role');
const { Permission } = require('../models/Permission');
const bcrypt = require('bcrypt');

const initializeDatabase = async () => {
	try {
		// Sync all models with database
		await sequelize.sync({ force: true }); // Be careful with force: true in production

		// Initialize roles and permissions
		await Role.initializeRoles();
		await Permission.initializePermissions();

		// Create super admin user
		const superAdminRole = await Role.findOne({ where: { name: 'SUPER_ADMIN' } });
		const hashedPassword = await bcrypt.hash('admin123', 10);

		const superAdmin = await User.create({
			username: 'admin',
			email: 'admin@smartschool.com',
			password: hashedPassword,
			firstName: 'System',
			lastName: 'Administrator',
			status: 'active'
		});

		await superAdmin.addRole(superAdminRole);

		console.log('Database initialized successfully');
		console.log('Super Admin created with credentials:');
		console.log('Email: admin@smartschool.com');
		console.log('Password: admin123');

	} catch (error) {
		console.error('Database initialization error:', error);
		process.exit(1);
	}
};

// Add this to handle cleanup
process.on('SIGINT', async () => {
	try {
		await sequelize.close();
		console.log('Database connection closed.');
		process.exit(0);
	} catch (error) {
		console.error('Error closing database connection:', error);
		process.exit(1);
	}
});

if (require.main === module) {
	initializeDatabase();
}

module.exports = initializeDatabase;