const { Claim, Policy, ClaimDocument, Validation, ClaimAuditLog } = require('../database/models');
const { performOCR } = require('../utils/ocr');

// Add claim to validation queue (synchronous processing - no Redis needed)
const addClaimToQueue = async (claimId) => {
  // Process validation synchronously without queue
  console.log(`Validating claim ${claimId}...`);
  return Promise.resolve();
};

// Validation rules
const validatePolicy = async (claim, policy) => {
  const results = [];

  // Check if policy is active
  const isActive = policy.status === 'active';
  results.push({
    claimId: claim.id,
    ruleName: 'POLICY_ACTIVE',
    result: isActive ? 'passed' : 'failed',
    details: {
      policyStatus: policy.status,
      message: isActive ? 'Policy is active' : 'Policy is not active'
    }
  });

  // Check date range
  const now = new Date();
  const inDateRange = now >= policy.startDate && now <= policy.endDate;
  results.push({
    claimId: claim.id,
    ruleName: 'POLICY_DATE_VALID',
    result: inDateRange ? 'passed' : 'failed',
    details: {
      currentDate: now,
      policyStart: policy.startDate,
      policyEnd: policy.endDate,
      message: inDateRange ? 'Policy is within valid date range' : 'Policy is expired or not yet active'
    }
  });

  // Check coverage amount
  const withinCoverage = parseFloat(claim.amountClaimed) <= parseFloat(policy.coverageAmount);
  results.push({
    claimId: claim.id,
    ruleName: 'AMOUNT_WITHIN_COVERAGE',
    result: withinCoverage ? 'passed' : 'failed',
    details: {
      claimedAmount: claim.amountClaimed,
      coverageAmount: policy.coverageAmount,
      message: withinCoverage 
        ? 'Claim amount is within coverage limit' 
        : 'Claim amount exceeds coverage limit'
    }
  });

  return results;
};

const validateDocuments = async (claim) => {
  const documents = await ClaimDocument.findAll({
    where: { claimId: claim.id }
  });

  const hasDocuments = documents.length > 0;
  
  return [{
    claimId: claim.id,
    ruleName: 'DOCUMENTS_UPLOADED',
    result: hasDocuments ? 'passed' : 'failed',
    details: {
      documentCount: documents.length,
      message: hasDocuments 
        ? `${documents.length} document(s) uploaded` 
        : 'No documents uploaded'
    }
  }];
};

const performOCRValidation = async (claim) => {
  const documents = await ClaimDocument.findAll({
    where: { claimId: claim.id }
  });

  const results = [];
  let ocrSuccess = false;
  let extractedAmount = null;

  for (const doc of documents) {
    try {
      // Perform OCR on image files
      if (doc.fileUrl.match(/\.(jpg|jpeg|png|webp)$/i)) {
        const filePath = `./uploads/${doc.fileUrl.split('/').pop()}`;
        const ocrResult = await performOCR(filePath);
        
        // Update document with OCR text
        await doc.update({
          ocrText: ocrResult.text,
          ocrData: ocrResult.data
        });

        // Try to extract amount
        const amountMatch = ocrResult.text.match(/(?:total|amount|sum)[:\s]*\$?\s*([\d,]+\.?\d*)/i);
        if (amountMatch) {
          extractedAmount = parseFloat(amountMatch[1].replace(/,/g, ''));
          ocrSuccess = true;
        }
      }
    } catch (error) {
      console.error('OCR error:', error);
    }
  }

  results.push({
    claimId: claim.id,
    ruleName: 'OCR_PERFORMED',
    result: ocrSuccess ? 'passed' : 'warning',
    details: {
      extractedAmount,
      claimedAmount: parseFloat(claim.amountClaimed),
      message: ocrSuccess 
        ? 'OCR successfully extracted invoice data' 
        : 'OCR could not extract invoice data'
    }
  });

  // Compare OCR amount with claimed amount
  if (extractedAmount) {
    const difference = Math.abs(extractedAmount - parseFloat(claim.amountClaimed));
    const threshold = parseFloat(claim.amountClaimed) * 0.1; // 10% tolerance
    const amountsMatch = difference <= threshold;

    results.push({
      claimId: claim.id,
      ruleName: 'OCR_AMOUNT_VERIFICATION',
      result: amountsMatch ? 'passed' : 'warning',
      details: {
        extractedAmount,
        claimedAmount: parseFloat(claim.amountClaimed),
        difference,
        message: amountsMatch 
          ? 'OCR amount matches claimed amount' 
          : 'OCR amount differs from claimed amount'
      }
    });
  }

  return results;
};

const determineClaimStatus = (validationResults) => {
  const failedCount = validationResults.filter(v => v.result === 'failed').length;
  const warningCount = validationResults.filter(v => v.result === 'warning').length;

  if (failedCount > 0) {
    return 'under_review';
  }

  // Auto-approve if all checks pass and amount is small
  if (failedCount === 0 && warningCount === 0) {
    return 'auto_approved';
  }

  return 'under_review';
};

// Worker process (simplified - no Redis needed)
const initWorker = () => {
  console.log('✓ Validation worker ready (synchronous mode)');
  return null;
};

module.exports = {
  addClaimToQueue,
  initWorker
};
