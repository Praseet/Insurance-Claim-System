const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Validation = sequelize.define('Validation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  claimId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'claims',
      key: 'id'
    }
  },
  ruleName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  result: {
    type: DataTypes.ENUM('passed', 'failed', 'warning'),
    allowNull: false
  },
  details: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'validations',
  timestamps: true,
  createdAt: 'run_at',
  updatedAt: false
});

module.exports = Validation;
