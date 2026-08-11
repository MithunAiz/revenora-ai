import { db } from '../db/database.js';
import { simulateClearinghouseValidation } from './clearinghouseSimulator.js';
import { simulateInsuranceAdjudication } from './insuranceSimulator.js';

export function getAllClaims() {
  const claims = db.prepare('SELECT * FROM claims ORDER BY created_at DESC').all();
  return claims.map(formatClaimFromDb);
}

export function getClaimById(claimId) {
  const claim = db.prepare('SELECT * FROM claims WHERE claim_id = ?').get(claimId);
  if (!claim) return null;
  return formatClaimFromDb(claim);
}

function formatClaimFromDb(c) {
  const patientRow = db.prepare('SELECT * FROM patients WHERE patient_id = ?').get(c.patient_id);
  const codingRow = db.prepare('SELECT * FROM medical_codings WHERE claim_id = ?').get(c.claim_id);
  const billingRow = db.prepare('SELECT * FROM billing_summaries WHERE claim_id = ?').get(c.claim_id);
  const aiReviewRow = db.prepare('SELECT * FROM ai_reviews WHERE claim_id = ?').get(c.claim_id);
  const docsRows = db.prepare('SELECT type, content, updated_at FROM clinical_documents WHERE claim_id = ?').all(c.claim_id);
  const timelineRows = db.prepare('SELECT stage, timestamp FROM claim_timeline WHERE claim_id = ? ORDER BY id ASC').all(c.claim_id);
  const activityRows = db.prepare('SELECT timestamp, actor, action, detail FROM claim_activities WHERE claim_id = ? ORDER BY id DESC').all(c.claim_id);
  const denialRow = db.prepare('SELECT * FROM denial_intelligence WHERE claim_id = ?').get(c.claim_id);
  const insuranceRow = db.prepare('SELECT * FROM insurance_decisions WHERE claim_id = ? ORDER BY id DESC LIMIT 1').get(c.claim_id);

  return {
    claimId: c.claim_id,
    patientId: c.patient_id,
    patient: patientRow?.name || c.patient_id,
    age: patientRow?.age || 52,
    gender: patientRow?.gender || 'Male',
    admissionDate: patientRow?.admission_date || '2026-02-14',
    dischargeDate: patientRow?.discharge_date || '2026-02-18',
    primaryPhysician: patientRow?.primary_physician || 'Dr. Abhinav Mukund',
    diagnosis: c.diagnosis,
    insurance: c.insurance,
    status: c.status,
    riskScore: c.risk_score,
    claimHealth: c.claim_health,
    denialRisk: c.denial_risk,
    assignedStaff: c.assigned_staff,
    priority: c.priority,
    lastUpdated: c.last_updated,
    expectedCompletion: c.expected_completion,
    department: c.department,
    amount: c.amount,
    stage: c.stage,
    currentStage: c.stage,
    aiReviewStatus: c.ai_review_status,
    submissionStatus: c.submission_status,
    assignedToMe: Boolean(c.assigned_to_me),
    coding: codingRow
      ? {
          icdCodes: JSON.parse(codingRow.icd_codes_json || '[]'),
          procedureCodes: JSON.parse(codingRow.procedure_codes_json || '[]'),
          modifiers: JSON.parse(codingRow.modifiers_json || '[]'),
        }
      : { icdCodes: [], procedureCodes: [], modifiers: [] },
    billing: billingRow
      ? {
          hospitalCharges: billingRow.hospital_charges,
          departmentCharges: billingRow.department_charges,
          procedureCharges: billingRow.procedure_charges,
          insuranceCoverage: billingRow.insurance_coverage,
          patientResponsibility: billingRow.patient_responsibility,
          discounts: billingRow.discounts,
          grandTotal: billingRow.grand_total,
        }
      : { hospitalCharges: 0, departmentCharges: 0, procedureCharges: 0, insuranceCoverage: 0, patientResponsibility: 0, discounts: 0, grandTotal: 0 },
    aiReview: aiReviewRow
      ? {
          claimHealth: aiReviewRow.claim_health,
          documentationScore: aiReviewRow.documentation_score,
          codingScore: aiReviewRow.coding_score,
          complianceScore: aiReviewRow.compliance_score,
          medicalNecessityScore: aiReviewRow.medical_necessity_score,
          denialRisk: aiReviewRow.denial_risk,
          coverageValidation: JSON.parse(aiReviewRow.coverage_metric_json || '{}'),
          duplicateBillingCheck: JSON.parse(aiReviewRow.duplicate_metric_json || '{}'),
          completenessCheck: JSON.parse(aiReviewRow.completeness_metric_json || '{}'),
          issues: JSON.parse(aiReviewRow.issues_json || '[]'),
          recommendations: JSON.parse(aiReviewRow.recommendations_json || '[]'),
          summary: aiReviewRow.summary,
          reviewedAt: aiReviewRow.reviewed_at,
        }
      : { claimHealth: c.claim_health, denialRisk: c.denial_risk, issues: [], recommendations: [] },
    documents: docsRows.map((d) => ({ type: d.type, content: d.content, updatedAt: d.updated_at })),
    timeline: timelineRows,
    activity: activityRows,
    denialIntelligence: denialRow
      ? {
          rootCause: denialRow.root_cause,
          evidence: denialRow.evidence,
          suggestedFix: denialRow.suggested_fix,
          affectedDocument: denialRow.affected_document,
          affectedCode: denialRow.affected_code,
          severity: denialRow.severity,
          confidence: denialRow.confidence,
          recommendedCorrection: denialRow.recommended_correction,
        }
      : null,
    insuranceDecision: insuranceRow
      ? {
          insurerName: insuranceRow.insurer_name,
          decision: insuranceRow.decision,
          approvedAmount: insuranceRow.approved_amount,
          rationale: insuranceRow.rationale,
          timestamp: insuranceRow.timestamp,
        }
      : null,
  };
}

export function submitClaimToBackend(claimId) {
  const claim = getClaimById(claimId);
  if (!claim) throw new Error(`Claim ${claimId} not found`);

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  db.prepare(`
    UPDATE claims SET status = 'Submitted', stage = 'Submitted', submission_status = 'Submitted', last_updated = ? WHERE claim_id = ?
  `).run(now, claimId);

  db.prepare('INSERT INTO claim_timeline (claim_id, stage, timestamp) VALUES (?, ?, ?)').run(claimId, 'Submitted', now);
  db.prepare('INSERT INTO claim_activities (claim_id, timestamp, actor, action, detail) VALUES (?, ?, ?, ?, ?)').run(claimId, now, 'Billing Staff', 'Claim Submitted', 'Submitted claim packet to insurance');

  const clearinghouseRes = simulateClearinghouseValidation(claim);

  db.prepare(`
    INSERT INTO clearinghouse_logs (claim_id, status, batch_id, validation_checks_json, timestamp)
    VALUES (?, ?, ?, ?, ?)
  `).run(claimId, clearinghouseRes.status, clearinghouseRes.batchId, JSON.stringify(clearinghouseRes.checks), now);

  if (clearinghouseRes.status === 'Accepted') {
    db.prepare(`UPDATE claims SET status = 'Under Insurance Review', stage = 'Under Insurance Review', submission_status = 'Under Insurance Review' WHERE claim_id = ?`).run(claimId);
    db.prepare('INSERT INTO claim_timeline (claim_id, stage, timestamp) VALUES (?, ?, ?)').run(claimId, 'Under Insurance Review', now);

    const insuranceRes = simulateInsuranceAdjudication(claim, claim.documents);

    db.prepare(`
      INSERT INTO insurance_decisions (claim_id, insurer_name, decision, approved_amount, coverage_status, eligibility_verified, prior_auth_verified, medical_necessity_verified, rationale, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      claimId,
      insuranceRes.insurerName,
      insuranceRes.decision,
      insuranceRes.approvedAmount,
      insuranceRes.coverageStatus,
      insuranceRes.eligibilityVerified,
      insuranceRes.priorAuthVerified,
      insuranceRes.medicalNecessityVerified,
      insuranceRes.rationale,
      now
    );

    if (insuranceRes.decision === 'Approved') {
      db.prepare(`UPDATE claims SET status = 'Approved', stage = 'Paid', submission_status = 'Paid', claim_health = 99, denial_risk = 1 WHERE claim_id = ?`).run(claimId);
      db.prepare('INSERT INTO claim_timeline (claim_id, stage, timestamp) VALUES (?, ?, ?)').run(claimId, 'Approved', now);
      db.prepare('INSERT INTO claim_timeline (claim_id, stage, timestamp) VALUES (?, ?, ?)').run(claimId, 'Paid', now);
      db.prepare('INSERT INTO claim_activities (claim_id, timestamp, actor, action, detail) VALUES (?, ?, ?, ?, ?)').run(claimId, now, 'Payer Simulator', 'Claim Approved & Paid', insuranceRes.rationale);
    } else {
      db.prepare(`UPDATE claims SET status = 'Rejected', stage = 'Rejected', submission_status = 'Rejected', denial_risk = 85 WHERE claim_id = ?`).run(claimId);
      db.prepare('INSERT INTO claim_timeline (claim_id, stage, timestamp) VALUES (?, ?, ?)').run(claimId, 'Rejected', now);
      db.prepare('INSERT INTO claim_activities (claim_id, timestamp, actor, action, detail) VALUES (?, ?, ?, ?, ?)').run(claimId, now, 'Payer Simulator', 'Claim Denied', insuranceRes.rationale);

      if (insuranceRes.denialIntelligence) {
        db.prepare(`
          INSERT INTO denial_intelligence (claim_id, root_cause, evidence, suggested_fix, affected_document, affected_code, severity, confidence, recommended_correction, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          ON CONFLICT(claim_id) DO UPDATE SET
            root_cause = excluded.root_cause,
            evidence = excluded.evidence,
            suggested_fix = excluded.suggested_fix,
            recommended_correction = excluded.recommended_correction
        `).run(
          claimId,
          insuranceRes.denialIntelligence.root_cause || insuranceRes.denialIntelligence.rootCause,
          insuranceRes.denialIntelligence.evidence,
          insuranceRes.denialIntelligence.suggested_fix || insuranceRes.denialIntelligence.suggestedFix,
          insuranceRes.denialIntelligence.affected_document || insuranceRes.denialIntelligence.affectedDocument,
          insuranceRes.denialIntelligence.affected_code || insuranceRes.denialIntelligence.affectedCode,
          insuranceRes.denialIntelligence.severity,
          insuranceRes.denialIntelligence.confidence,
          insuranceRes.denialIntelligence.recommended_correction || insuranceRes.denialIntelligence.recommendedCorrection,
          now
        );
      }
    }
  }

  return getClaimById(claimId);
}

export function correctAndResubmitClaim(claimId, corrections) {
  const claim = getClaimById(claimId);
  if (!claim) throw new Error(`Claim ${claimId} not found`);

  const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (corrections.icdCodes || corrections.procedureCodes || corrections.modifiers) {
    const existingCoding = claim.coding;
    const nextCoding = {
      icdCodes: corrections.icdCodes || existingCoding.icdCodes,
      procedureCodes: corrections.procedureCodes || existingCoding.procedureCodes,
      modifiers: corrections.modifiers || existingCoding.modifiers,
    };
    db.prepare(`UPDATE medical_codings SET icd_codes_json = ?, procedure_codes_json = ?, modifiers_json = ? WHERE claim_id = ?`).run(
      JSON.stringify(nextCoding.icdCodes),
      JSON.stringify(nextCoding.procedureCodes),
      JSON.stringify(nextCoding.modifiers),
      claimId
    );
  }

  if (corrections.documentText && corrections.documentType) {
    db.prepare(`UPDATE clinical_documents SET content = ?, updated_at = ? WHERE claim_id = ? AND type = ?`).run(
      corrections.documentText,
      now,
      claimId,
      corrections.documentType
    );
  }

  db.prepare(`
    UPDATE claims SET status = 'Approved', stage = 'Paid', submission_status = 'Paid', claim_health = 96, denial_risk = 4, last_updated = ? WHERE claim_id = ?
  `).run(now, claimId);

  db.prepare('INSERT INTO claim_timeline (claim_id, stage, timestamp) VALUES (?, ?, ?)').run(claimId, 'Resubmitted', now);
  db.prepare('INSERT INTO claim_timeline (claim_id, stage, timestamp) VALUES (?, ?, ?)').run(claimId, 'Approved', now);
  db.prepare('INSERT INTO claim_timeline (claim_id, stage, timestamp) VALUES (?, ?, ?)').run(claimId, 'Paid', now);

  db.prepare('INSERT INTO claim_activities (claim_id, timestamp, actor, action, detail) VALUES (?, ?, ?, ?, ?)').run(
    claimId,
    now,
    'Billing Staff',
    'Claim Corrected & Resubmitted',
    corrections.notes || 'Applied AI recommended denial corrections and resubmitted successfully.'
  );

  return getClaimById(claimId);
}
