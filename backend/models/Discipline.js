const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Discipline = sequelize.define("Discipline", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	studentId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Students',
			key: 'id'
		}
	},
	incidentDate: {
		type: DataTypes.DATE,
		allowNull: false
	},
	category: {
		type: DataTypes.ENUM(
			'ATTENDANCE',
			'ACADEMIC_DISHONESTY',
			'BEHAVIORAL',
			'DRESS_CODE',
			'BULLYING',
			'PROPERTY_DAMAGE',
			'OTHER'
		),
		allowNull: false
	},
	severity: {
		type: DataTypes.ENUM('MINOR', 'MODERATE', 'MAJOR', 'SEVERE'),
		allowNull: false
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	location: {
		type: DataTypes.STRING,
		allowNull: true
	},
	witnesses: {
		type: DataTypes.JSON,
		defaultValue: []
	},
	reportedBy: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Staff',
			key: 'id'
		}
	},
	action: {
		type: DataTypes.JSON,
		allowNull: false,
		defaultValue: {
			type: '',
			duration: '',
			startDate: null,
			endDate: null,
			conditions: []
		}
	},
	parentNotified: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	parentNotificationDate: {
		type: DataTypes.DATE,
		allowNull: true
	},
	parentResponse: {
		type: DataTypes.TEXT,
		allowNull: true
	},
	status: {
		type: DataTypes.ENUM(
			'PENDING',
			'IN_PROGRESS',
			'COMPLETED',
			'APPEALED',
			'CANCELLED'
		),
		defaultValue: 'PENDING'
	},
	followUp: {
		type: DataTypes.JSON,
		defaultValue: {
			required: false,
			date: null,
			notes: '',
			outcome: ''
		}
	},
	attachments: {
		type: DataTypes.JSON,
		defaultValue: []
	},
	appealDetails: {
		type: DataTypes.JSON,
		defaultValue: {
			appealed: false,
			date: null,
			reason: '',
			decision: '',
			decidedBy: null
		}
	}
}, {
	timestamps: true,
	hooks: {
		afterCreate: async (record) => {
			// Send notification to parent
			if (record.severity !== 'MINOR') {
				// Implement notification logic
			}
		}
	}
});

// Instance Methods
Discipline.prototype.getFullDetails = async function() {
	const student = await sequelize.models.Student.findByPk(this.studentId, {
		include: [{ model: sequelize.models.User }]
	});
	const reporter = await sequelize.models.Staff.findByPk(this.reportedBy);

	return {
		...this.toJSON(),
		student: {
			id: student.id,
			name: `${student.User.firstName} ${student.User.lastName}`,
			class: student.currentClass
		},
		reportedBy: reporter ? `${reporter.firstName} ${reporter.lastName}` : null
	};
};

// Static Methods
Discipline.getStudentHistory = async function(studentId) {
	return await this.findAll({
		where: { studentId },
		order: [['incidentDate', 'DESC']]
	});
};

module.exports = Discipline;