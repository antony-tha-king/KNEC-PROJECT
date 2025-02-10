const { DataTypes, Op } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Role = require("./Role");

const Teacher = sequelize.define("Teacher", {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  teacherId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  department: {
    type: DataTypes.STRING,
    allowNull: false
  },
  designation: {
    type: DataTypes.STRING,
    allowNull: false
  },
  qualifications: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  specialization: {
    type: DataTypes.STRING,
    allowNull: true
  },
  experience: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  joiningDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  employmentStatus: {
    type: DataTypes.ENUM('Full-time', 'Part-time', 'Contract'),
    allowNull: false,
    defaultValue: 'Full-time'
  },
  subjects: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: []
  },
  emergencyContact: {
    type: DataTypes.JSON,
    allowNull: false,
    defaultValue: {
      name: '',
      relationship: '',
      phone: '',
      address: ''
    }
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (teacher) => {
      // Generate lecturer number: LEC + Year + Sequential Number (e.g., LEC2024001)
      const currentYear = new Date().getFullYear();
      const lastTeacher = await Teacher.findOne({
        where: {
          teacherId: {
            [Op.like]: `LEC${currentYear}%`
          }
        },
        order: [['teacherId', 'DESC']]
      });

      let nextNumber = '001';
      if (lastTeacher) {
        const lastNumber = parseInt(lastTeacher.teacherId.slice(-3));
        nextNumber = String(lastNumber + 1).padStart(3, '0');
      }
      teacher.teacherId = `LEC${currentYear}${nextNumber}`;
    },
    afterCreate: async (teacher) => {
      // Assign teacher role after creation
      const teacherRole = await Role.findOne({ where: { name: 'TEACHER' } });
      if (teacherRole) {
        await sequelize.models.UserRole.create({
          userId: teacher.userId,
          roleId: teacherRole.id
        });
      }
    }
  }
});

// Associations
Teacher.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Teacher);

// Instance Methods
Teacher.prototype.getFullDetails = async function() {
  const user = await User.findByPk(this.userId);
  return {
    ...this.toJSON(),
    ...user.toJSON(),
    password: undefined
  };
};

Teacher.prototype.getAssignedClasses = async function() {
  return await sequelize.models.Class.findAll({
    where: { classTeacherId: this.id }
  });
};

Teacher.prototype.getTeachingSchedule = async function() {
  // Implementation for getting teacher's schedule
  // This would typically join with a Schedule or Timetable model
  return [];
};

module.exports = Teacher;
