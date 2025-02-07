const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Curriculum = sequelize.define("Curriculum", {
	id: {
		type: DataTypes.INTEGER,
		autoIncrement: true,
		primaryKey: true,
	},
	subjectCode: {
		type: DataTypes.STRING,
		unique: true,
		allowNull: false
	},
	subjectName: {
		type: DataTypes.STRING,
		allowNull: false
	},
	departmentId: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Departments',
			key: 'id'
		}
	},
	level: {
		type: DataTypes.STRING,
		allowNull: false,
		comment: 'Class/Grade level'
	},
	credits: {
		type: DataTypes.INTEGER,
		allowNull: false,
		defaultValue: 1
	},
	description: {
		type: DataTypes.TEXT,
		allowNull: true
	},
	objectives: {
		type: DataTypes.JSON,
		defaultValue: []
	},
	syllabus: {
		type: DataTypes.JSON,
		defaultValue: {
			units: [],
			resources: [],
			assessments: []
		}
	},
	prerequisites: {
		type: DataTypes.JSON,
		defaultValue: []
	},
	teachingMethods: {
		type: DataTypes.JSON,
		defaultValue: []
	},
	assessmentMethods: {
		type: DataTypes.JSON,
		defaultValue: {
			continuous: 40,
			final: 60,
			methods: []
		}
	},
	resources: {
		type: DataTypes.JSON,
		defaultValue: {
			textbooks: [],
			onlineResources: [],
			materials: []
		}
	},
	status: {
		type: DataTypes.ENUM('ACTIVE', 'INACTIVE', 'DRAFT'),
		defaultValue: 'DRAFT'
	},
	lastUpdated: {
		type: DataTypes.DATE,
		defaultValue: DataTypes.NOW
	},
	updatedBy: {
		type: DataTypes.INTEGER,
		allowNull: false,
		references: {
			model: 'Staff',
			key: 'id'
		}
	}
}, {
	timestamps: true,
	hooks: {
		beforeUpdate: (curriculum) => {
			curriculum.lastUpdated = new Date();
		}
	}
});

// Create CurriculumTeacher junction table
const CurriculumTeacher = sequelize.define('CurriculumTeacher', {
	id: {
		type: DataTypes.INTEGER,
		primaryKey: true,
		autoIncrement: true
	},
	academicYear: {
		type: DataTypes.STRING,
		allowNull: false
	},
	term: {
		type: DataTypes.INTEGER,
		allowNull: false
	},
	isCoordinator: {
		type: DataTypes.BOOLEAN,
		defaultValue: false
	}
});

// Instance Methods
Curriculum.prototype.getFullDetails = async function() {
	const department = await sequelize.models.Department.findByPk(this.departmentId);
	const teachers = await sequelize.models.Staff.findAll({
		include: [{
			model: Curriculum,
			through: {
				model: CurriculumTeacher,
				where: { curriculumId: this.id }
			}
		}]
	});

	return {
		...this.toJSON(),
		department: department ? department.name : null,
		teachers: teachers.map(teacher => ({
			id: teacher.id,
			name: `${teacher.firstName} ${teacher.lastName}`,
			isCoordinator: teacher.CurriculumTeacher.isCoordinator
		}))
	};
};

module.exports = { Curriculum, CurriculumTeacher };