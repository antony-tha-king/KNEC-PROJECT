const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Class = sequelize.define("Class", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	className: {
		type: DataTypes.STRING,
		allowNull: false
	},
	section: {
		type: DataTypes.STRING,
		allowNull: false
	},
	academicYear: {
		type: DataTypes.STRING,
		allowNull: false
	},
	classTeacherId: {
		type: DataTypes.INTEGER,
		references: {
			model: 'Staff',
			key: 'id'
		}
	},
	capacity: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 40
	},
	currentStrength: {
		type: DataTypes.INTEGER,
		defaultValue: 0
	},
	room: {
		type: DataTypes.STRING,
		allowNull: true
	},
	schedule: {
		type: DataTypes.JSON,
		allowNull: true
	},
	subjects: {
		type: DataTypes.JSON,
		allowNull: true
	}
}, {
	timestamps: true,
	indexes: [
		{
			unique: true,
			fields: ['className', 'section', 'academicYear']
		}
	]
});

module.exports = Class;