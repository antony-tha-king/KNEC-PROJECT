const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const bcrypt = require("bcrypt");
const Role = require("./Role");
const UserRole = require("./UserRole");

const User = sequelize.define("User", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	username: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
	},
	email: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true,
		validate: { isEmail: true },
	},
	password: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	firstName: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	lastName: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	phoneNumber: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	address: {
		type: DataTypes.TEXT,
		allowNull: true,
	},
	profileImage: {
		type: DataTypes.STRING,
		allowNull: true,
	},
	status: {
		type: DataTypes.ENUM('active', 'inactive', 'suspended'),
		defaultValue: 'active'
	},
	lastLogin: {
		type: DataTypes.DATE,
		allowNull: true
	}
}, {
	timestamps: true,
	hooks: {
		beforeCreate: async (user) => {
			if (user.password) {
				const salt = await bcrypt.genSalt(10);
				user.password = await bcrypt.hash(user.password, salt);
			}
		}
	}
});

// Instance Methods
User.prototype.validatePassword = async function(password) {
	return await bcrypt.compare(password, this.password);
};

User.prototype.getRoleNames = async function() {
	const userRoles = await UserRole.findAll({
		where: { userId: this.id, isActive: true },
		include: [{ model: Role }]
	});
	return userRoles.map(ur => ur.Role.name);
};

User.prototype.hasPermission = async function(permission) {
	const userRoles = await UserRole.findAll({
		where: { userId: this.id, isActive: true },
		include: [{ model: Role }]
	});

	for (const userRole of userRoles) {
		const rolePermissions = userRole.Role.permissions;
		if (rolePermissions.all === true) return true;
		if (permission in rolePermissions) return true;
	}
	return false;
};

// Associations
User.belongsToMany(Role, { through: UserRole });
Role.belongsToMany(User, { through: UserRole });

module.exports = User;