const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");

const Parent = sequelize.define("Parent", {
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
	occupation: {
		type: DataTypes.STRING,
		allowNull: true
	},
	workPlace: {
		type: DataTypes.STRING,
		allowNull: true
	},
	annualIncome: {
		type: DataTypes.DECIMAL(12, 2),
		allowNull: true
	},
	alternativePhone: {
		type: DataTypes.STRING,
		allowNull: true
	},
	relationship: {
		type: DataTypes.ENUM('FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'),
		allowNull: false
	},
	communicationPreference: {
		type: DataTypes.ENUM('EMAIL', 'SMS', 'BOTH'),
		defaultValue: 'BOTH'
	},
	notificationSettings: {
		type: DataTypes.JSON,
		defaultValue: {
			attendance: true,
			grades: true,
			fees: true,
			events: true,
			discipline: true
		}
	},
	status: {
		type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
		defaultValue: 'ACTIVE'
	},
	lastLogin: {
		type: DataTypes.DATE,
		allowNull: true
	}
}, {
	timestamps: true
});

// Associations
Parent.belongsTo(User, { foreignKey: 'userId' });

// Create ParentStudent junction table for many-to-many relationship
const ParentStudent = sequelize.define('ParentStudent', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	relationship: {
		type: DataTypes.ENUM('FATHER', 'MOTHER', 'GUARDIAN', 'OTHER'),
		allowNull: false
	},
	isPrimary: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	canPickup: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	emergencyContact: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	}
});

// Instance Methods
Parent.prototype.getStudents = async function() {
	const students = await sequelize.models.Student.findAll({
		include: [{
			model: Parent,
			through: {
				model: ParentStudent,
				where: { parentId: this.id }
			}
		}]
	});
	return students;
};

Parent.prototype.getFullDetails = async function() {
	const user = await User.findByPk(this.userId);
	const students = await this.getStudents();
	return {
		...this.toJSON(),
		user: {
			firstName: user.firstName,
			lastName: user.lastName,
			email: user.email,
			phone: user.phoneNumber
		},
		students: students.map(student => ({
			id: student.id,
			name: `${student.User.firstName} ${student.User.lastName}`,
			class: student.currentClass,
			relationship: student.ParentStudent.relationship
		}))
	};
};

module.exports = { Parent, ParentStudent };