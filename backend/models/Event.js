const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Event = sequelize.define("Event", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	title: {
		type: DataTypes.STRING,
		allowNull: false
	},
	type: {
		type: DataTypes.ENUM(
			'ACADEMIC',
			'SPORTS',
			'CULTURAL',
			'MEETING',
			'EXAM',
			'HOLIDAY',
			'OTHER'
		),
		allowNull: false
	},
	startDate: {
		type: DataTypes.DATE,
		allowNull: false
	},
	endDate: {
		type: DataTypes.DATE,
		allowNull: false
	},
	location: {
		type: DataTypes.STRING,
		allowNull: true
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: true
	},
	organizer: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Staff',
			key: 'id'
		}
	},
	participants: {
		type: DataTypes.JSON,
		defaultValue: {
			classes: [],
			departments: [],
			specific: []
		}
	},
	budget: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: true,
		defaultValue: 0
	},
	requirements: {
		type: DataTypes.JSON,
		defaultValue: {
			equipment: [],
			facilities: [],
			staff: []
		}
	},
	status: {
		type: DataTypes.ENUM(
			'PLANNED',
			'APPROVED',
			'IN_PROGRESS',
			'COMPLETED',
			'CANCELLED'
		),
		defaultValue: 'PLANNED'
	},
	approvedBy: {
		type: DataTypes.INTEGER,
		allowNull: true,
		references: {
			model: 'Staff',
			key: 'id'
		}
	},
	notifications: {
		type: DataTypes.JSON,
		defaultValue: {
			staff: true,
			students: true,
			parents: false
		}
	},
	attachments: {
		type: DataTypes.JSON,
		defaultValue: []
	},
	feedback: {
		type: DataTypes.JSON,
		defaultValue: {
			ratings: [],
			comments: []
		}
	}
}, {
	timestamps: true,
	hooks: {
		beforeCreate: async (event) => {
			if (event.endDate <= event.startDate) {
				throw new Error('End date must be after start date');
			}
		},
		afterCreate: async (event) => {
			// Send notifications based on event type and participants
			if (event.status === 'APPROVED') {
				// Implement notification logic
			}
		}
	}
});

// Instance Methods
Event.prototype.getFullDetails = async function() {
	const organizer = await sequelize.models.Staff.findByPk(this.organizer);
	const approver = this.approvedBy ? 
		await sequelize.models.Staff.findByPk(this.approvedBy) : null;

	return {
		...this.toJSON(),
		organizer: organizer ? `${organizer.firstName} ${organizer.lastName}` : null,
		approvedBy: approver ? `${approver.firstName} ${approver.lastName}` : null
	};
};

// Static Methods
Event.getUpcomingEvents = async function(days = 7) {
	const endDate = new Date();
	endDate.setDate(endDate.getDate() + days);

	return await this.findAll({
		where: {
			startDate: {
				[sequelize.Op.between]: [new Date(), endDate]
			},
			status: {
				[sequelize.Op.not]: 'CANCELLED'
			}
		},
		order: [['startDate', 'ASC']]
	});
};

module.exports = Event;