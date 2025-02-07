const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AcademicTerm = sequelize.define("AcademicTerm", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	academicYear: {
		type: DataTypes.STRING,
		allowNull: false,
		validate: {
			is: /^\d{4}-\d{4}$/ // Format: 2023-2024
		}
	},
	term: {
		type: DataTypes.INTEGER,
		allowNull: false,
		validate: {
			min: 1,
			max: 3
		}
	},
	startDate: {
		type: DataTypes.DATE,
		allowNull: false
	},
	endDate: {
		type: DataTypes.DATE,
		allowNull: false
	},
	status: {
		type: DataTypes.ENUM('Upcoming', 'Current', 'Completed'),
		defaultValue: 'Upcoming'
	},
	feeSubmissionDeadline: {
		type: DataTypes.DATE,
		allowNull: false
	},
	examStartDate: {
		type: DataTypes.DATE,
		allowNull: true
	},
	examEndDate: {
		type: DataTypes.DATE,
		allowNull: true
	},
	resultPublishDate: {
		type: DataTypes.DATE,
		allowNull: true
	}
}, {
	timestamps: true,
	indexes: [
		{
			unique: true,
			fields: ['academicYear', 'term']
		}
	],
	hooks: {
		beforeCreate: async (term) => {
			// Ensure end date is after start date
			if (term.endDate <= term.startDate) {
				throw new Error('End date must be after start date');
			}
			// Ensure fee deadline is within term dates
			if (term.feeSubmissionDeadline < term.startDate || term.feeSubmissionDeadline > term.endDate) {
				throw new Error('Fee submission deadline must be within term dates');
			}
		}
	}
});

module.exports = AcademicTerm;