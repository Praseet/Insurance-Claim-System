const { DataTypes } = require('sequelize');
const sequelize = require('../connection');

const ClaimDocument = sequelize.define('ClaimDocument', {
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
  fileUrl: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileName: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fileSize: {
    type: DataTypes.INTEGER
  },
  docType: {
    type: DataTypes.ENUM('invoice', 'bill', 'report', 'id_proof', 'prescription', 'estimate', 'other'),
    defaultValue: 'other'
  },
  ocrText: {
    type: DataTypes.TEXT
  },
  ocrData: {
    type: DataTypes.JSONB
  }
}, {
  tableName: 'claim_documents',
  timestamps: true,
  createdAt: 'uploaded_at',
  updatedAt: false
});

module.exports = ClaimDocument;
