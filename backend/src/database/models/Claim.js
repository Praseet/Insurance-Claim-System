const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const Claim = sequelize.define('Claim', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  claimNumber: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  policyId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'policies',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM('health', 'vehicle'),
    allowNull: false
  },
  amountClaimed: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  amountApproved: {
    type: DataTypes.DECIMAL(10, 2)
  },
  incidentDate: {
    type: DataTypes.DATE,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('submitted', 'under_review', 'approved', 'rejected'),
    defaultValue: 'submitted'
  },
  rejectionReason: {
    type: DataTypes.TEXT
  },
  autoApproved: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'claims',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Claim;
