const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Expense = sequelize.define("Expense", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	category: {
		type: DataTypes.ENUM(
			'Salary',
			'Utilities',
			'Maintenance',
			'Supplies',
			'Equipment',
			'Transport',
			'Other'
		),
		allowNull: false
	},
	amount: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: false
	},
	paymentDate: {
		type: DataTypes.DATE,
		allowNull: false
	},
	paymentMethod: {
		type: DataTypes.ENUM('Cash', 'Bank Transfer', 'Check'),
		allowNull: false
	},
	paymentStatus: {
		type: DataTypes.ENUM('Pending', 'Completed', 'Cancelled'),
		defaultValue: 'Pending'
	},
	invoiceNumber: {
		type: DataTypes.STRING,
		unique: true
	},
	approvedBy: {
		type: DataTypes.INTEGER,
		references: {
			model: 'Admins',
			key: 'id'
		}
	},
	supplier: {
		type: DataTypes.STRING,
		allowNull: true
	},
	receiptImage: {
		type: DataTypes.STRING,
		allowNull: true
	}
}, {
	timestamps: true,
	indexes: [
		{
			fields: ['category', 'paymentDate']
		}
	]
});

module.exports = Expense;