const sequelize = require('../connection');
const User = require('./User');
const Policy = require('./Policy');
const Claim = require('./Claim');
const ClaimDocument = require('./ClaimDocument');
const ClaimNote = require('./ClaimNote');
const ClaimAuditLog = require('./ClaimAuditLog');
const Validation = require('./Validation');

// Define associations
User.hasMany(Policy, { foreignKey: 'userId', as: 'policies' });
Policy.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Claim, { foreignKey: 'userId', as: 'claims' });
Claim.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Policy.hasMany(Claim, { foreignKey: 'policyId', as: 'claims' });
Claim.belongsTo(Policy, { foreignKey: 'policyId', as: 'policy' });

Claim.hasMany(ClaimDocument, { foreignKey: 'claimId', as: 'documents' });
ClaimDocument.belongsTo(Claim, { foreignKey: 'claimId', as: 'claim' });

Claim.hasMany(ClaimNote, { foreignKey: 'claimId', as: 'notes' });
ClaimNote.belongsTo(Claim, { foreignKey: 'claimId', as: 'claim' });
ClaimNote.belongsTo(User, { foreignKey: 'authorId', as: 'author' });

Claim.hasMany(ClaimAuditLog, { foreignKey: 'claimId', as: 'auditLogs' });
ClaimAuditLog.belongsTo(Claim, { foreignKey: 'claimId', as: 'claim' });
ClaimAuditLog.belongsTo(User, { foreignKey: 'actorId', as: 'actor' });

Claim.hasMany(Validation, { foreignKey: 'claimId', as: 'validations' });
Validation.belongsTo(Claim, { foreignKey: 'claimId', as: 'claim' });

module.exports = {
  sequelize,
  User,
  Policy,
  Claim,
  ClaimDocument,
  ClaimNote,
  ClaimAuditLog,
  Validation
};
