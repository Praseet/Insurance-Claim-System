const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { v4: uuidv4 } = require('uuid');
const { Claim, Policy, ClaimDocument, ClaimNote, ClaimAuditLog, Validation, User } = require('../database/models');
const { authenticate, authorize } = require('../middleware/auth');
const { addClaimToQueue } = require('../workers/validationWorker');
const upload = require('../middleware/upload');

const router = express.Router();

// Generate claim number
const generateClaimNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 5).toUpperCase();
  return `CLM-${timestamp}-${random}`;
};

// Create audit log
const createAuditLog = async (claimId, action, actorId, details = {}) => {
  await ClaimAuditLog.create({
    claimId,
    actorId,
    action,
    details
  });
};

// Validation middleware
const createClaimValidation = [
  body('policyNumber').notEmpty().withMessage('Policy number is required'),
  body('type').isIn(['health', 'vehicle']).withMessage('Invalid claim type'),
  body('amountClaimed').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('incidentDate').isISO8601().withMessage('Invalid date format'),
  body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters')
];

// Submit new claim
router.post('/', authenticate, upload.array('documents', 10), createClaimValidation, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { policyNumber, type, amountClaimed, incidentDate, description } = req.body;

    // Find policy
    const policy = await Policy.findOne({
      where: { policyNumber, userId: req.user.id }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found or does not belong to you' });
    }

    if (policy.status !== 'active') {
      return res.status(400).json({ error: 'Policy is not active' });
    }

    if (policy.type !== type) {
      return res.status(400).json({ error: 'Claim type does not match policy type' });
    }

    // Create claim
    const claimNumber = generateClaimNumber();
    const claim = await Claim.create({
      claimNumber,
      policyId: policy.id,
      userId: req.user.id,
      type,
      amountClaimed,
      incidentDate,
      description,
      status: 'submitted'
    });

    // Save uploaded documents
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        await ClaimDocument.create({
          claimId: claim.id,
          fileUrl: `/uploads/${file.filename}`,
          fileName: file.originalname,
          fileSize: file.size,
          docType: 'other'
        });
      }
    }

    // Create audit log
    await createAuditLog(claim.id, 'CLAIM_SUBMITTED', req.user.id, {
      claimNumber,
      amount: amountClaimed
    });

    // Add to validation queue
    await addClaimToQueue(claim.id);

    res.status(201).json({
      message: 'Claim submitted successfully',
      claim: {
        id: claim.id,
        claimNumber: claim.claimNumber,
        status: claim.status,
        amountClaimed: claim.amountClaimed
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get all claims (with filters for insurers/admins)
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let whereClause = {};

    // Users see only their claims
    if (req.user.role === 'user') {
      whereClause.userId = req.user.id;
    }

    // Apply filters
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    const { count, rows: claims } = await Claim.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: Policy,
          as: 'policy',
          attributes: ['policyNumber', 'type', 'coverageAmount']
        },
        {
          model: ClaimDocument,
          as: 'documents',
          attributes: ['id', 'fileName', 'docType', 'fileUrl']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    });

    res.json({
      claims,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    next(error);
  }
});

// Get claim by ID
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const claim = await Claim.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: Policy,
          as: 'policy'
        },
        {
          model: ClaimDocument,
          as: 'documents'
        },
        {
          model: ClaimNote,
          as: 'notes',
          include: [{
            model: User,
            as: 'author',
            attributes: ['id', 'name', 'role']
          }]
        },
        {
          model: Validation,
          as: 'validations'
        }
      ]
    });

    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Check access
    if (req.user.role === 'user' && claim.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ claim });
  } catch (error) {
    next(error);
  }
});

// Update claim status (insurer/admin only)
router.patch('/:id/status', authenticate, authorize('insurer', 'admin'), async (req, res, next) => {
  try {
    const { status, rejectionReason, amountApproved } = req.body;

    if (!['under_review', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const claim = await Claim.findByPk(req.params.id);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    const oldStatus = claim.status;
    claim.status = status;

    if (status === 'rejected' && rejectionReason) {
      claim.rejectionReason = rejectionReason;
    }

    if (status === 'approved' && amountApproved) {
      claim.amountApproved = amountApproved;
    }

    await claim.save();

    // Create audit log
    await createAuditLog(claim.id, 'STATUS_UPDATED', req.user.id, {
      oldStatus,
      newStatus: status,
      rejectionReason,
      amountApproved
    });

    res.json({
      message: 'Claim status updated',
      claim
    });
  } catch (error) {
    next(error);
  }
});

// Add note to claim
router.post('/:id/notes', authenticate, async (req, res, next) => {
  try {
    const { note, isInternal = false } = req.body;

    if (!note || note.trim().length === 0) {
      return res.status(400).json({ error: 'Note cannot be empty' });
    }

    const claim = await Claim.findByPk(req.params.id);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Check access
    if (req.user.role === 'user' && claim.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const claimNote = await ClaimNote.create({
      claimId: claim.id,
      authorId: req.user.id,
      note,
      isInternal: req.user.role !== 'user' ? isInternal : false
    });

    // Create audit log
    await createAuditLog(claim.id, 'NOTE_ADDED', req.user.id, {
      noteId: claimNote.id
    });

    const noteWithAuthor = await ClaimNote.findByPk(claimNote.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'role']
      }]
    });

    res.status(201).json({
      message: 'Note added successfully',
      note: noteWithAuthor
    });
  } catch (error) {
    next(error);
  }
});

// Get audit log
router.get('/:id/audit', authenticate, authorize('insurer', 'admin'), async (req, res, next) => {
  try {
    const auditLogs = await ClaimAuditLog.findAll({
      where: { claimId: req.params.id },
      include: [{
        model: User,
        as: 'actor',
        attributes: ['id', 'name', 'email', 'role']
      }],
      order: [['timestamp', 'DESC']]
    });

    res.json({ auditLogs });
  } catch (error) {
    next(error);
  }
});

// Get claim statistics (admin/insurer)
router.get('/stats/summary', authenticate, authorize('insurer', 'admin'), async (req, res, next) => {
  try {
    const { sequelize } = require('../database/models');

    const stats = await Claim.findAll({
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('amount_claimed')), 'totalAmount']
      ],
      group: ['status'],
      raw: true
    });

    res.json({ stats });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
