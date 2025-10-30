const express = require('express');
const { body, validationResult } = require('express-validator');
const { Policy } = require('../database/models');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

// Get policy by policy number
router.get('/:policyNumber', authenticate, async (req, res, next) => {
  try {
    const { policyNumber } = req.params;

    const policy = await Policy.findOne({
      where: { policyNumber }
    });

    if (!policy) {
      return res.status(404).json({ error: 'Policy not found' });
    }

    // Check if user has access (owner, insurer, or admin)
    if (
      req.user.role !== 'admin' &&
      req.user.role !== 'insurer' &&
      policy.userId !== req.user.id
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ policy });
  } catch (error) {
    next(error);
  }
});

// Get user's policies
router.get('/', authenticate, async (req, res, next) => {
  try {
    const policies = await Policy.findAll({
      where: { userId: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json({ policies });
  } catch (error) {
    next(error);
  }
});

// Validate policy (used internally by validation worker)
router.post('/validate', authenticate, async (req, res, next) => {
  try {
    const { policyNumber, claimAmount } = req.body;

    const policy = await Policy.findOne({
      where: { policyNumber }
    });

    if (!policy) {
      return res.json({
        valid: false,
        reason: 'Policy not found'
      });
    }

    if (policy.status !== 'active') {
      return res.json({
        valid: false,
        reason: 'Policy is not active'
      });
    }

    const now = new Date();
    if (now < policy.startDate || now > policy.endDate) {
      return res.json({
        valid: false,
        reason: 'Policy is expired or not yet active'
      });
    }

    if (parseFloat(claimAmount) > parseFloat(policy.coverageAmount)) {
      return res.json({
        valid: false,
        reason: 'Claim amount exceeds coverage limit'
      });
    }

    res.json({
      valid: true,
      policy: {
        type: policy.type,
        coverageAmount: policy.coverageAmount
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
