const INSURER_POLICIES = {
  'Star Health Insurance': {
    name: 'Star Health Insurance',
    requiresSepsisBundleDocs: true,
    defaultCoinsuranceRate: 0.85,
  },
  'HDFC ERGO Health': {
    name: 'HDFC ERGO Health',
    defaultCoinsuranceRate: 0.9,
  },
  'ICICI Lombard Health': {
    name: 'ICICI Lombard Health',
    requiresRadiologyForModifier22: true,
    defaultCoinsuranceRate: 0.82,
  },
  'Niva Bupa Health': {
    name: 'Niva Bupa Health',
    defaultCoinsuranceRate: 0.88,
  },
  'Care Health Insurance': {
    name: 'Care Health Insurance',
    defaultCoinsuranceRate: 0.85,
  },
  'Ayushman Bharat (PM-JAY)': {
    name: 'Ayushman Bharat (PM-JAY)',
    defaultCoinsuranceRate: 1.0,
  },
  'Bajaj Allianz': {
    name: 'Bajaj Allianz',
    defaultCoinsuranceRate: 0.85,
  },
};

export function simulateInsuranceAdjudication(claim, documents = []) {
  const insurerName = claim.insurance || 'Star Health Insurance';
  const policy = INSURER_POLICIES[insurerName] ?? INSURER_POLICIES['Star Health Insurance'];

  let approved = true;
  let rationale = 'Claim satisfies TPA medical necessity and cashless coverage guidelines.';
  let rootCause = '';
  let evidence = '';
  let suggestedFix = '';
  let affectedDocument = '';
  let affectedCode = '';

  const docText = documents.map((d) => d.content).join(' ');

  if (claim.claimHealth < 60 || claim.denialRisk > 40) {
    approved = false;
    if (insurerName === 'Star Health Insurance' && /sepsis/i.test(claim.diagnosis) && !/blood culture/i.test(docText)) {
      rationale = 'Star Health TPA denied claim due to unattached Sepsis 3-hour bundle blood culture timestamp.';
      rootCause = 'Sepsis 3-Hour Bundle Lab Timestamp Missing';
      evidence = 'Severe sepsis ICD A41.9 billed without blood culture order confirmation in packet.';
      suggestedFix = 'Attach lab report LR-9021 confirming blood draw prior to antibiotic administration.';
      affectedDocument = 'Laboratory Report / ICU Chart';
      affectedCode = 'ICD A41.9';
    } else if (insurerName === 'ICICI Lombard Health' && /cholecystectomy|47563/i.test(docText + claim.diagnosis)) {
      rationale = 'ICICI Lombard TPA denied claim due to missing intraoperative radiology attachment for CPT 47563.';
      rootCause = 'Missing Radiology Attachment for CPT 47563';
      evidence = 'Intraoperative cholangiogram scan RAD-409 omitted from claims attachment.';
      suggestedFix = 'Attach Radiology Report RAD-409 and append modifier 22 for surgical complexity.';
      affectedDocument = 'Radiology Report / Operative Notes';
      affectedCode = 'CPT 47563';
    } else {
      rationale = 'Claim denied due to insufficient medical necessity documentation.';
      rootCause = 'Documentation Discrepancy';
      evidence = 'Clinical progress notes do not support billed level of service.';
      suggestedFix = 'Update physician progress notes with clinical indicators.';
      affectedDocument = 'Progress Notes';
      affectedCode = claim.coding?.procedureCodes?.[0] || 'CPT 99223';
    }
  }

  const approvedAmount = approved ? Math.round(claim.amount * policy.defaultCoinsuranceRate) : 0;

  return {
    insurerName,
    decision: approved ? 'Approved' : 'Rejected',
    approvedAmount,
    coverageStatus: approved ? 'Cashless Pre-Auth Settled' : 'Coverage Conditional',
    eligibilityVerified: 1,
    priorAuthVerified: approved ? 1 : 0,
    medicalNecessityVerified: approved ? 1 : 0,
    rationale,
    denialIntelligence: approved
      ? null
      : {
          rootCause,
          evidence,
          suggestedFix,
          affectedDocument,
          affectedCode,
          severity: 'Critical',
          confidence: 96,
          recommendedCorrection: suggestedFix,
        },
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  };
}
