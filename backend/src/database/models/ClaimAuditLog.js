const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const ClaimAuditLog = sequelize.define('ClaimAuditLog', {
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
  actorId: {
    type: DataTypes.UUID,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  details: {
    type: DataTypes.JSONB
  },
  ipAddress: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'claim_audit_logs',
  timestamps: true,
  createdAt: 'timestamp',
  updatedAt: false
});

module.exports = ClaimAuditLog;
