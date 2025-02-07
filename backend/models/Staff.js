const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Department = require("./Department");

const Staff = sequelize.define("Staff", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	userId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Users',
			key: 'id'
		}
	},
	staffId: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false
	},
	departmentId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Departments',
			key: 'id'
		}
	},
	position: {
		type: DataTypes.STRING,
		allowNull: false
	},
	employmentType: {
		type: DataTypes.ENUM('FULL_TIME', 'PART_TIME', 'CONTRACT', 'TEMPORARY'),
		allowNull: false,
		defaultValue: 'FULL_TIME'
	},
	employmentDate: {
		type: DataTypes.DATEONLY,
		allowNull: false
	},
	contractEndDate: {
		type: DataTypes.DATEONLY,
		allowNull: true
	},
	qualifications: {
		type: DataTypes.JSON,
		allowNull: false,
		defaultValue: []
	},
	specializations: {
		type: DataTypes.JSON,
		allowNull: true,
		defaultValue: []
	},
	salary: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false
	},
	bankDetails: {
		type: DataTypes.JSON,
		allowNull: true
	},
	emergencyContact: {
		type: DataTypes.JSON,
		allowNull: false,
		defaultValue: {
			name: '',
			relationship: '',
			phone: '',
			address: ''
		}
	},
	status: {
		type: DataTypes.ENUM('ACTIVE', 'ON_LEAVE', 'SUSPENDED', 'TERMINATED'),
		defaultValue: 'ACTIVE'
	},
	leaveBalance: {
		type: DataTypes.INTEGER,
		defaultValue: 30
	},
	documents: {
		type: DataTypes.JSON,
		allowNull: true,
		defaultValue: []
	}
}, {
	timestamps: true,
	hooks: {
		beforeCreate: async (staff) => {
			// Generate staff ID based on department and count
			const deptCode = await Department.findByPk(staff.departmentId)
				.then(dept => dept.code);
			const count = await Staff.count({
				where: { departmentId: staff.departmentId }
			});
			staff.staffId = `${deptCode}${(count + 1).toString().padStart(3, '0')}`;
		}
	}
});

// Associations
Staff.belongsTo(User, { foreignKey: 'userId' });
Staff.belongsTo(Department, { foreignKey: 'departmentId' });

// Instance Methods
Staff.prototype.getFullDetails = async function() {
	const user = await User.findByPk(this.userId);
	const department = await Department.findByPk(this.departmentId);
	return {
		...this.toJSON(),
		user: {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email
		},
		department: {
			name: department.name,
			code: department.code
		}
	};
};

Staff.prototype.calculateLeaveBalance = async function() {
	// Implementation for leave balance calculation
	return this.leaveBalance;
};

module.exports = Staff;