const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Department = sequelize.define("Department", {
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
	code: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	type: {
		type: DataTypes.ENUM(
			'ACADEMIC',
			'ADMINISTRATIVE',
			'SUPPORT',
			'FINANCE'
		),
		allowNull: false
	},
	headId: {
		type: DataTypes.INTEGER,
		allowNull: true,
		references: {
			model: 'Staff',
			key: 'id'
		}
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: true
	},
	budget: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: true,
		defaultValue: 0
	},
	location: {
		type: DataTypes.STRING,
		allowNull: true
	},
	status: {
		type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
		defaultValue: 'ACTIVE'
	}
});

// Define default departments
const DEFAULT_DEPARTMENTS = [
	{
		name: 'Administration',
		code: 'ADMIN',
		type: 'ADMINISTRATIVE',
		description: 'School Administration Department'
	},
	{
		name: 'Finance',
		code: 'FIN',
		type: 'FINANCE',
		description: 'Finance and Accounts Department'
	},
	{
		name: 'Mathematics',
		code: 'MATH',
		type: 'ACADEMIC',
		description: 'Mathematics Department'
	},
	{
		name: 'Sciences',
		code: 'SCI',
		type: 'ACADEMIC',
		description: 'Science Department'
	},
	{
		name: 'Languages',
		code: 'LANG',
		type: 'ACADEMIC',
		description: 'Languages Department'
	},
	{
		name: 'Library',
		code: 'LIB',
		type: 'SUPPORT',
		description: 'Library Services'
	},
	{
		name: 'Student Affairs',
		code: 'STD',
		type: 'SUPPORT',
		description: 'Student Support Services'
	}
];

// Function to initialize default departments
Department.initializeDepartments = async () => {
	try {
		for (const dept of DEFAULT_DEPARTMENTS) {
			await Department.findOrCreate({
				where: { code: dept.code },
				defaults: dept
			});
		}
		console.log('Default departments initialized successfully');
	} catch (error) {
		console.error('Error initializing default departments:', error);
	}
};

module.exports = Department;