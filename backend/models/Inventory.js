const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Inventory = sequelize.define("Inventory", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	itemName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	category: {
		type: DataTypes.ENUM(
			'Furniture',
			'IT_Equipment',
			'Lab_Equipment',
			'Sports_Equipment',
			'Books',
			'Stationery',
			'Other'
		),
		allowNull: false
	},
	quantity: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	unitPrice: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false
	},
	location: {
		type: DataTypes.STRING,
		allowNull: false
	},
	status: {
		type: DataTypes.ENUM('Available', 'Low_Stock', 'Out_of_Stock', 'Maintenance'),
		defaultValue: 'Available'
	},
	minimumQuantity: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 10
	},
	lastRestockDate: {
		type: DataTypes.DATE
	},
	supplier: {
		type: DataTypes.STRING,
		allowNull: true
	},
	serialNumber: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: true
	},
	purchaseDate: {
		type: DataTypes.DATE,
		allowNull: true
	}
}, {
	timestamps: true,
	hooks: {
		beforeSave: async (item) => {
			if (item.quantity <= item.minimumQuantity) {
				item.status = 'Low_Stock';
			}
			if (item.quantity === 0) {
				item.status = 'Out_of_Stock';
			}
			if (item.quantity > item.minimumQuantity) {
				item.status = 'Available';
			}
		}
	}
});

module.exports = Inventory;