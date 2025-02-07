const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Book = sequelize.define("Book", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	isbn: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false
	},
	title: {
		type: DataTypes.STRING,
		allowNull: false
	},
	author: {
		type: DataTypes.STRING,
		allowNull: false
	},
	category: {
		type: DataTypes.STRING,
		allowNull: false
	},
	publisher: {
		type: DataTypes.STRING,
		allowNull: true
	},
	publicationYear: {
		type: DataTypes.INTEGER,
		allowNull: true
	},
	edition: {
		type: DataTypes.STRING,
		allowNull: true
	},
	copies: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	availableCopies: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	location: {
		type: DataTypes.STRING,
		allowNull: false
	},
	status: {
		type: DataTypes.ENUM('AVAILABLE', 'LOW_STOCK', 'OUT_OF_STOCK'),
		defaultValue: 'AVAILABLE'
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: true
	},
	coverImage: {
		type: DataTypes.STRING,
		allowNull: true
	}
});

const BookLending = sequelize.define("BookLending", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	bookId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Books',
			key: 'id'
		}
	},
	borrowerId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Users',
			key: 'id'
		}
	},
	borrowerType: {
		type: DataTypes.ENUM('STUDENT', 'STAFF'),
		allowNull: false
	},
	issueDate: {
		type: DataTypes.DATE,
		allowNull: false,
		defaultValue: DataTypes.NOW
	},
	dueDate: {
		type: DataTypes.DATE,
		allowNull: false
	},
	returnDate: {
		type: DataTypes.DATE,
		allowNull: true
	},
	status: {
		type: DataTypes.ENUM(
			'BORROWED',
			'RETURNED',
			'OVERDUE',
			'LOST',
			'DAMAGED'
		),
		defaultValue: 'BORROWED'
	},
	fine: {
		type: DataTypes.DECIMAL(10, 2),
		defaultValue: 0
	},
	remarks: {
		type: DataTypes.TEXT,
		allowNull: true
	}
}, {
	hooks: {
		afterCreate: async (lending) => {
			// Update available copies
			await Book.decrement('availableCopies', {
				where: { id: lending.bookId }
			});
		},
		afterUpdate: async (lending) => {
			if (lending.status === 'RETURNED') {
				await Book.increment('availableCopies', {
					where: { id: lending.bookId }
				});
			}
		}
	}
});

// Instance Methods
BookLending.prototype.calculateFine = async function() {
	if (this.returnDate) return this.fine;

	const today = new Date();
	const dueDate = new Date(this.dueDate);
	if (today > dueDate) {
		const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));
		this.fine = daysOverdue * 1.00; // $1 per day
		await this.save();
	}
	return this.fine;
};

// Static Methods
Book.findAvailable = async function() {
	return await this.findAll({
		where: {
			availableCopies: {
				[sequelize.Op.gt]: 0
			}
		}
	});
};

module.exports = { Book, BookLending };