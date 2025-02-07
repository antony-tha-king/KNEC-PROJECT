const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Vehicle = sequelize.define("Vehicle", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	registrationNumber: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false
	},
	type: {
		type: DataTypes.ENUM('BUS', 'VAN', 'MINI_BUS'),
		allowNull: false
	},
	capacity: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	driverId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Staff',
			key: 'id'
		}
	},
	status: {
		type: DataTypes.ENUM('ACTIVE', 'MAINTENANCE', 'INACTIVE'),
		defaultValue: 'ACTIVE'
	},
	lastMaintenance: {
		type: DataTypes.DATE,
		allowNull: true
	},
	nextMaintenance: {
		type: DataTypes.DATE,
		allowNull: true
	},
	insuranceExpiry: {
		type: DataTypes.DATE,
		allowNull: false
	}
});

const Route = sequelize.define("Route", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false
	},
	vehicleId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Vehicles',
			key: 'id'
		}
	},
	stops: {
		type: DataTypes.JSON,
		allowNull: false,
		defaultValue: []
	},
	schedule: {
		type: DataTypes.JSON,
		allowNull: false,
		defaultValue: {
			morning: {
				departure: '',
				arrival: ''
			},
			afternoon: {
				departure: '',
				arrival: ''
			}
		}
	},
	distance: {
		type: DataTypes.DECIMAL(5, 2),
		allowNull: true
	},
	fee: {
		type: DataTypes.DECIMAL(10, 2),
		allowNull: false
	},
	status: {
		type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
		defaultValue: 'ACTIVE'
	}
});

const TransportSubscription = sequelize.define("TransportSubscription", {
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
	routeId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Routes',
			key: 'id'
		}
	},
	pickupStop: {
		type: DataTypes.STRING,
		allowNull: false
	},
	dropStop: {
		type: DataTypes.STRING,
		allowNull: false
	},
	startDate: {
		type: DataTypes.DATE,
		allowNull: false
	},
	endDate: {
		type: DataTypes.DATE,
		allowNull: true
	},
	status: {
		type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'PENDING'),
		defaultValue: 'PENDING'
	},
	paymentStatus: {
		type: DataTypes.ENUM('PAID', 'PENDING', 'OVERDUE'),
		defaultValue: 'PENDING'
	}
});

// Associations
Vehicle.hasMany(Route);
Route.belongsTo(Vehicle);
Route.hasMany(TransportSubscription);
TransportSubscription.belongsTo(Route);

// Instance Methods
Route.prototype.getStudentCount = async function() {
	return await TransportSubscription.count({
		where: {
			routeId: this.id,
			status: 'ACTIVE'
		}
	});
};

Vehicle.prototype.getRouteDetails = async function() {
	const routes = await Route.findAll({
		where: { vehicleId: this.id }
	});
	const driver = await sequelize.models.Staff.findByPk(this.driverId);
	
	return {
		...this.toJSON(),
		driver: driver ? `${driver.firstName} ${driver.lastName}` : null,
		routes: routes.map(route => ({
			id: route.id,
			name: route.name,
			stops: route.stops.length
		}))
	};
};

module.exports = { Vehicle, Route, TransportSubscription };