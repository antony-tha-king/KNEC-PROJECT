const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Finance = sequelize.define("Finance", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	transactionId: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false
	},
	type: {
		type: DataTypes.ENUM(
			'FEE_PAYMENT',
			'SALARY_PAYMENT',
			'EXPENSE',
			'INCOME',
			'REFUND'
		),
		allowNull: false
	},
	category: {
		type: DataTypes.STRING,
		allowNull: false
	},
	amount: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false
	},
	paymentMethod: {
		type: DataTypes.ENUM(
			'CASH',
			'BANK_TRANSFER',
			'CHECK',
			'MOBILE_MONEY',
			'ONLINE'
		),
		allowNull: false
	},
	status: {
		type: DataTypes.ENUM(
			'PENDING',
			'COMPLETED',
			'FAILED',
			'CANCELLED',
			'REFUNDED'
		),
		defaultValue: 'PENDING'
	},
	relatedTo: {
		type: DataTypes.INTEGER,
		allowNull: true,
		comment: 'ID of related student/staff/supplier'
	},
	relatedModel: {
		type: DataTypes.STRING,
		allowNull: true,
		comment: 'Name of related model (Student/Staff/Supplier)'
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: true
	},
	dueDate: {
		type: DataTypes.DATE,
		allowNull: true
	},
	processedBy: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Staff',
			key: 'id'
		}
	},
	approvedBy: {
		type: DataTypes.INTEGER,
		allowNull: true,
		references: {
			model: 'Staff',
			key: 'id'
		}
	},
	receiptNumber: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: true
	},
	attachments: {
		type: DataTypes.JSON,
		defaultValue: []
	},
	metadata: {
		type: DataTypes.JSON,
		defaultValue: {}
	}
}, {
	timestamps: true,
	hooks: {
		beforeCreate: async (transaction) => {
			// Generate transaction ID
			const prefix = transaction.type.substring(0, 3);
			const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
			const count = await Finance.count({
				where: {
					createdAt: {
						[sequelize.Op.gte]: new Date().setHours(0, 0, 0, 0)
					}
				}
			});
			transaction.transactionId = `${prefix}${date}${(count + 1).toString().padStart(4, '0')}`;
			
			// Generate receipt number for completed payments
			if (transaction.status === 'COMPLETED' && 
				['FEE_PAYMENT', 'INCOME'].includes(transaction.type)) {
				transaction.receiptNumber = `RCP${date}${(count + 1).toString().padStart(4, '0')}`;
			}
		}
	}
});

// Instance Methods
Finance.prototype.getDetails = async function() {
	const processor = await sequelize.models.Staff.findByPk(this.processedBy);
	const approver = this.approvedBy ? 
		await sequelize.models.Staff.findByPk(this.approvedBy) : null;

	let relatedEntity = null;
	if (this.relatedTo && this.relatedModel) {
		relatedEntity = await sequelize.models[this.relatedModel].findByPk(this.relatedTo);
	}

	return {
		...this.toJSON(),
		processedBy: processor ? `${processor.firstName} ${processor.lastName}` : null,
		approvedBy: approver ? `${approver.firstName} ${approver.lastName}` : null,
		relatedTo: relatedEntity ? {
			id: relatedEntity.id,
			name: `${relatedEntity.firstName} ${relatedEntity.lastName}`,
			type: this.relatedModel
		} : null
	};
};

module.exports = Finance;