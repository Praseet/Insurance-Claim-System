const express = require('express');
const { ClaimDocument, Claim } = require('../database/models');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Upload additional documents to existing claim
router.post('/:claimId', authenticate, upload.array('documents', 10), async (req, res, next) => {
  try {
    const { claimId } = req.params;
    const { docType = 'other' } = req.body;

    // Find claim
    const claim = await Claim.findByPk(claimId);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Check access
    if (req.user.role === 'user' && claim.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Save documents
    const documents = [];
    for (const file of req.files) {
      const doc = await ClaimDocument.create({
        claimId,
        fileUrl: `/uploads/${file.filename}`,
        fileName: file.originalname,
        fileSize: file.size,
        docType
      });
      documents.push(doc);
    }

    res.status(201).json({
      message: 'Documents uploaded successfully',
      documents
    });
  } catch (error) {
    next(error);
  }
});

// Get documents for a claim
router.get('/:claimId', authenticate, async (req, res, next) => {
  try {
    const { claimId } = req.params;

    // Find claim
    const claim = await Claim.findByPk(claimId);
    if (!claim) {
      return res.status(404).json({ error: 'Claim not found' });
    }

    // Check access
    if (req.user.role === 'user' && claim.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const documents = await ClaimDocument.findAll({
      where: { claimId },
      order: [['uploaded_at', 'DESC']]
    });

    res.json({ documents });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
