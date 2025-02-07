const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Role = sequelize.define("Role", {
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
	category: {
		type: DataTypes.ENUM(
			'ADMINISTRATION',
			'ACADEMIC',
			'SUPPORT',
			'FINANCE',
			'EXTERNAL'
		),
		allowNull: false
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: true
	},
	permissions: {
		type: DataTypes.JSON,
		allowNull: false,
		defaultValue: {}
	},
	accessLevel: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 1,
		validate: {
			min: 1,
			max: 10
		}
	}
}, {
	timestamps: true,
	hooks: {
		beforeCreate: (role) => {
			// Ensure permissions is an object if not set
			if (!role.permissions) {
				role.permissions = {};
			}
		}
	}
});

// Define default roles with their permissions
const DEFAULT_ROLES = [
	{
		name: 'PRINCIPAL',
		category: 'ADMINISTRATION',
		description: 'School Principal/Head of Institution',
		accessLevel: 10,
		permissions: {
			all: true
		}
	},
	{
		name: 'DEPUTY_PRINCIPAL',
		category: 'ADMINISTRATION',
		description: 'Deputy Principal',
		accessLevel: 9,
		permissions: {
			staff: ['view', 'create', 'edit'],
			students: ['view', 'create', 'edit'],
			discipline: ['view', 'create', 'edit'],
			academics: ['view', 'create', 'edit']
		}
	},
	{
		name: 'REGISTRAR',
		category: 'ADMINISTRATION',
		description: 'School Registrar',
		accessLevel: 8,
		permissions: {
			admissions: ['view', 'create', 'edit'],
			students: ['view', 'create', 'edit'],
			records: ['view', 'create', 'edit']
		}
	},
	{
		name: 'FINANCE_MANAGER',
		category: 'FINANCE',
		description: 'Finance Manager',
		accessLevel: 8,
		permissions: {
			finance: ['view', 'create', 'edit'],
			fees: ['view', 'create', 'edit'],
			expenses: ['view', 'create', 'edit'],
			reports: ['view', 'create']
		}
	},
	{
		name: 'HR_MANAGER',
		category: 'ADMINISTRATION',
		description: 'Human Resources Manager',
		accessLevel: 8,
		permissions: {
			staff: ['view', 'create', 'edit'],
			payroll: ['view', 'create', 'edit'],
			recruitment: ['view', 'create', 'edit']
		}
	},
	{
		name: 'HEAD_OF_DEPARTMENT',
		category: 'ACADEMIC',
		description: 'Department Head',
		accessLevel: 7,
		permissions: {
			department: ['view', 'create', 'edit'],
			teachers: ['view', 'assign'],
			curriculum: ['view', 'edit']
		}
	},
	{
		name: 'TEACHER',
		category: 'ACADEMIC',
		description: 'Teaching Staff',
		accessLevel: 6,
		permissions: {
			classes: ['view', 'edit'],
			attendance: ['view', 'mark'],
			grades: ['view', 'edit'],
			students: ['view']
		}
	},
	{
		name: 'ACCOUNTANT',
		category: 'FINANCE',
		description: 'School Accountant',
		accessLevel: 6,
		permissions: {
			transactions: ['view', 'create'],
			fees: ['view', 'collect'],
			reports: ['view']
		}
	},
	{
		name: 'LIBRARIAN',
		category: 'SUPPORT',
		description: 'School Librarian',
		accessLevel: 5,
		permissions: {
			library: ['view', 'create', 'edit'],
			books: ['view', 'create', 'edit'],
			students: ['view']
		}
	},
	{
		name: 'PARENT',
		category: 'EXTERNAL',
		description: 'Parent/Guardian',
		accessLevel: 2,
		permissions: {
			children: ['view'],
			attendance: ['view'],
			grades: ['view'],
			fees: ['view', 'pay']
		}
	},
	{
		name: 'STUDENT',
		category: 'EXTERNAL',
		description: 'Enrolled Student',
		accessLevel: 1,
		permissions: {
			profile: ['view'],
			attendance: ['view'],
			grades: ['view'],
			courses: ['view']
		}
	}
];

// Function to initialize default roles
Role.initializeRoles = async () => {
	try {
		for (const role of DEFAULT_ROLES) {
			await Role.findOrCreate({
				where: { name: role.name },
				defaults: role
			});
		}
		console.log('Default roles initialized successfully');
	} catch (error) {
		console.error('Error initializing default roles:', error);
	}
};

module.exports = Role;