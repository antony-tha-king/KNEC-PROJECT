const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Communication = sequelize.define("Communication", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	type: {
		type: DataTypes.ENUM(
			'ANNOUNCEMENT',
			'MESSAGE',
			'NOTIFICATION',
			'ALERT',
			'NEWSLETTER'
		),
		allowNull: false
	},
	priority: {
		type: DataTypes.ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT'),
		defaultValue: 'MEDIUM'
	},
	subject: {
		type: DataTypes.STRING,
		allowNull: false
	},
	content: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	senderId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Users',
			key: 'id'
		}
	},
	recipients: {
		type: DataTypes.JSON,
		allowNull: false,
		defaultValue: {
			users: [],      // Specific user IDs
			roles: [],      // Role-based recipients
			departments: [], // Department-based recipients
			classes: [],    // Class-based recipients
			all: false      // Send to all users
		}
	},
	scheduledFor: {
		type: DataTypes.DATE,
		allowNull: true
	},
	expiresAt: {
		type: DataTypes.DATE,
		allowNull: true
	},
	attachments: {
		type: DataTypes.JSON,
		defaultValue: []
	},
	metadata: {
		type: DataTypes.JSON,
		defaultValue: {
			requiresAcknowledgment: false,
			allowResponses: false,
			tags: []
		}
	},
	status: {
		type: DataTypes.ENUM(
			'DRAFT',
			'SCHEDULED',
			'SENT',
			'DELIVERED',
			'EXPIRED',
			'CANCELLED'
		),
		defaultValue: 'DRAFT'
	},
	deliveryStats: {
		type: DataTypes.JSON,
		defaultValue: {
			sent: 0,
			delivered: 0,
			read: 0,
			failed: 0
		}
	}
}, {
	timestamps: true,
	hooks: {
		beforeCreate: async (comm) => {
			if (comm.scheduledFor && comm.scheduledFor <= new Date()) {
				throw new Error('Scheduled time must be in the future');
			}
		}
	}
});

// Create CommunicationRecipient junction table for tracking message status per recipient
const CommunicationRecipient = sequelize.define('CommunicationRecipient', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	communicationId: {
		type: DataTypes.INTEGER,
		references: {
			model: 'Communications',
			key: 'id'
		}
	},
	recipientId: {
		type: DataTypes.INTEGER,
		references: {
			model: 'Users',
			key: 'id'
		}
	},
	status: {
		type: DataTypes.ENUM('SENT', 'DELIVERED', 'READ'),
		defaultValue: 'SENT'
	},
	readAt: {
		type: DataTypes.DATE,
		allowNull: true
	},
	acknowledged: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	},
	acknowledgedAt: {
		type: DataTypes.DATE,
		allowNull: true
	}
});

// Instance Methods
Communication.prototype.getFullDetails = async function() {
	const sender = await sequelize.models.User.findByPk(this.senderId);
	const recipientStats = await CommunicationRecipient.findAll({
		where: { communicationId: this.id },
		attributes: [
			'status',
			[sequelize.fn('COUNT', sequelize.col('status')), 'count']
		],
		group: ['status']
	});

	return {
		...this.toJSON(),
		sender: {
			id: sender.id,
			name: `${sender.firstName} ${sender.lastName}`,
			role: sender.role
		},
		deliveryStats: recipientStats.reduce((acc, stat) => {
			acc[stat.status.toLowerCase()] = stat.count;
			return acc;
		}, {})
	};
};

module.exports = { Communication, CommunicationRecipient };