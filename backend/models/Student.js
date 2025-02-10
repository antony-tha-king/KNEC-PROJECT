const { DataTypes, Op } = require("sequelize");
const sequelize = require("../config/database");
const User = require("./User");
const Role = require("./Role");

const Student = sequelize.define("Student", {
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
  studentId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  gender: {
    type: DataTypes.ENUM('Male', 'Female', 'Other'),
    allowNull: false
  },
  currentClass: {
    type: DataTypes.STRING,
    allowNull: false
  },
  admissionDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  guardianName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guardianContact: {
    type: DataTypes.STRING,
    allowNull: false
  },
  guardianEmail: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: { isEmail: true }
  },
  bloodGroup: {
    type: DataTypes.STRING,
    allowNull: true
  },
  healthConditions: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  previousSchool: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (student) => {
      // Generate admission number: Year + Sequential Number (e.g., 2024001)
      const currentYear = new Date().getFullYear();
      const lastStudent = await Student.findOne({
        where: {
          studentId: {
            [Op.like]: `${currentYear}%`
          }
        },
        order: [['studentId', 'DESC']]
      });

      let nextNumber = '001';
      if (lastStudent) {
        const lastNumber = parseInt(lastStudent.studentId.slice(-3));
        nextNumber = String(lastNumber + 1).padStart(3, '0');
      }
      student.studentId = `${currentYear}${nextNumber}`;
    },
    afterCreate: async (student) => {
      // Assign student role after creation
      const studentRole = await Role.findOne({ where: { name: 'STUDENT' } });
      if (studentRole) {
        await sequelize.models.UserRole.create({
          userId: student.userId,
          roleId: studentRole.id
        });
      }
    }
  }
});

// Associations
Student.belongsTo(User, { foreignKey: 'userId' });
User.hasOne(Student);

// Instance Methods
Student.prototype.getFullDetails = async function() {
  const user = await User.findByPk(this.userId);
  return {
    ...this.toJSON(),
    ...user.toJSON(),
    password: undefined
  };
};

module.exports = Student;
