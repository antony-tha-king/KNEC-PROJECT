const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Fee = sequelize.define("Fee", {
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
	termId: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	feeType: {
		type: DataTypes.ENUM('Tuition', 'Transport', 'Hostel', 'Library', 'Laboratory', 'Other'),
		allowNull: false
	},
	amount: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false
	},
	dueDate: {
		type: DataTypes.DATE,
		allowNull: false
	},
	status: {
		type: DataTypes.ENUM('Paid', 'Pending', 'Overdue', 'Partial'),
		defaultValue: 'Pending'
	},
	paidAmount: {
		type: DataTypes.DECIMAL(10, 2),
		defaultValue: 0
	},
	lastPaymentDate: {
		type: DataTypes.DATE
	},
	paymentMethod: {
		type: DataTypes.ENUM('Cash', 'Bank Transfer', 'Check', 'Online Payment'),
		allowNull: true
	},
	receiptNumber: {
		type: DataTypes.STRING,
		unique: true
	}
}, {
	timestamps: true,
	indexes: [
		{
			fields: ['studentId', 'termId']
		}
	]
});

module.exports = Fee;