const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Role = require("./Role");

const Permission = sequelize.define("Permission", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: true
	},
	category: {
		type: DataTypes.ENUM(
			'STUDENT_MANAGEMENT',
			'TEACHER_MANAGEMENT',
			'COURSE_MANAGEMENT',
			'ATTENDANCE',
			'FINANCE',
			'REPORTS',
			'SYSTEM_SETTINGS'
		),
		allowNull: false
	},
	action: {
		type: DataTypes.ENUM('VIEW', 'CREATE', 'EDIT', 'DELETE', 'APPROVE'),
		allowNull: false
	},
	resource: {
		type: DataTypes.STRING,
		allowNull: false
	}
}, {
	timestamps: true
});

// Define default permissions
const DEFAULT_PERMISSIONS = [
	// Student Management
	{
		name: 'VIEW_STUDENTS',
		description: 'View student profiles and information',
		category: 'STUDENT_MANAGEMENT',
		action: 'VIEW',
		resource: 'students'
	},
	{
		name: 'CREATE_STUDENT',
		description: 'Create new student accounts',
		category: 'STUDENT_MANAGEMENT',
		action: 'CREATE',
		resource: 'students'
	},
	// Teacher Management
	{
		name: 'VIEW_TEACHERS',
		description: 'View teacher profiles and information',
		category: 'TEACHER_MANAGEMENT',
		action: 'VIEW',
		resource: 'teachers'
	},
	{
		name: 'CREATE_TEACHER',
		description: 'Create new teacher accounts',
		category: 'TEACHER_MANAGEMENT',
		action: 'CREATE',
		resource: 'teachers'
	},
	// Attendance
	{
		name: 'VIEW_ATTENDANCE',
		description: 'View attendance records',
		category: 'ATTENDANCE',
		action: 'VIEW',
		resource: 'attendance'
	},
	{
		name: 'MARK_ATTENDANCE',
		description: 'Mark student attendance',
		category: 'ATTENDANCE',
		action: 'CREATE',
		resource: 'attendance'
	},
	// Finance
	{
		name: 'VIEW_FEES',
		description: 'View fee records',
		category: 'FINANCE',
		action: 'VIEW',
		resource: 'fees'
	},
	{
		name: 'MANAGE_FEES',
		description: 'Manage fee records',
		category: 'FINANCE',
		action: 'EDIT',
		resource: 'fees'
	}
];

// Function to initialize default permissions
Permission.initializePermissions = async () => {
	try {
		for (const permission of DEFAULT_PERMISSIONS) {
			await Permission.findOrCreate({
				where: { name: permission.name },
				defaults: permission
			});
		}
		console.log('Default permissions initialized successfully');
	} catch (error) {
		console.error('Error initializing default permissions:', error);
	}
};

// Create join table for Role-Permission many-to-many relationship
const RolePermission = sequelize.define('RolePermission', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	}
});

// Set up associations
Permission.belongsToMany(Role, { through: RolePermission });
Role.belongsToMany(Permission, { through: RolePermission });

module.exports = { Permission, RolePermission };