const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Hostel = sequelize.define("Hostel", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	name: {
		type: DataTypes.STRING,
		allowNull: false,
		unique: true
	},
	type: {
		type: DataTypes.ENUM('BOYS', 'GIRLS'),
		allowNull: false
	},
	capacity: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	wardenId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Staff',
			key: 'id'
		}
	},
	blocks: {
		type: DataTypes.JSON,
		defaultValue: []
	},
	facilities: {
		type: DataTypes.JSON,
		defaultValue: []
	},
	rules: {
		type: DataTypes.JSON,
		defaultValue: []
	},
	status: {
		type: DataTypes.ENUM('ACTIVE', 'MAINTENANCE', 'CLOSED'),
		defaultValue: 'ACTIVE'
	}
});

const Room = sequelize.define("Room", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	hostelId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Hostels',
			key: 'id'
		}
	},
	roomNumber: {
		type: DataTypes.STRING,
		allowNull: false
	},
	block: {
		type: DataTypes.STRING,
		allowNull: false
	},
	floor: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	capacity: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 2
	},
	occupied: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 0
	},
	type: {
		type: DataTypes.ENUM('STANDARD', 'DELUXE', 'SPECIAL'),
		defaultValue: 'STANDARD'
	},
	facilities: {
		type: DataTypes.JSON,
		defaultValue: []
	},
	status: {
		type: DataTypes.ENUM('AVAILABLE', 'FULL', 'MAINTENANCE'),
		defaultValue: 'AVAILABLE'
	}
});

const HostelAllocation = sequelize.define("HostelAllocation", {
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
	roomId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Rooms',
			key: 'id'
		}
	},
	bedNumber: {
		type: DataTypes.INTEGER,
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
		type: DataTypes.ENUM('ACTIVE', 'COMPLETED', 'CANCELLED'),
		defaultValue: 'ACTIVE'
	},
	feeStatus: {
		type: DataTypes.ENUM('PAID', 'PENDING', 'OVERDUE'),
		defaultValue: 'PENDING'
	}
}, {
	hooks: {
		afterCreate: async (allocation) => {
			await Room.increment('occupied', {
				where: { id: allocation.roomId }
			});
		},
		afterUpdate: async (allocation) => {
			if (allocation.status === 'COMPLETED') {
				await Room.decrement('occupied', {
					where: { id: allocation.roomId }
				});
			}
		}
	}
});

// Associations
Hostel.hasMany(Room);
Room.belongsTo(Hostel);
Room.hasMany(HostelAllocation);
HostelAllocation.belongsTo(Room);

// Instance Methods
Room.prototype.checkAvailability = async function() {
	return this.capacity > this.occupied;
};

Hostel.prototype.getOccupancyStats = async function() {
	const rooms = await Room.findAll({
		where: { hostelId: this.id }
	});
	
	const stats = {
		totalRooms: rooms.length,
		totalCapacity: rooms.reduce((sum, room) => sum + room.capacity, 0),
		totalOccupied: rooms.reduce((sum, room) => sum + room.occupied, 0),
		availableRooms: rooms.filter(room => room.status === 'AVAILABLE').length
	};
	
	stats.occupancyRate = (stats.totalOccupied / stats.totalCapacity) * 100;
	return stats;
};

module.exports = { Hostel, Room, HostelAllocation };