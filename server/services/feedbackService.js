import { db } from '../db/database.js';

export function getAllFeedback() {
  const rows = db.prepare('SELECT * FROM patient_feedback ORDER BY created_at DESC').all();
  return rows.map((r) => ({
    id: r.id,
    claimId: r.claim_id,
    patientName: r.patient_name,
    overallExperience: r.overall_experience,
    statusClarity: r.status_clarity,
    paymentClarity: r.payment_clarity,
    supportHelpfulness: r.support_helpfulness,
    wouldRecommend: Boolean(r.would_recommend),
    followUpNeeded: Boolean(r.follow_up_needed),
    comments: r.comments,
    createdAt: r.created_at,
  }));
}

export function saveFeedback(fb) {
  const id = fb.id || `FB-${Math.floor(100 + Math.random() * 900)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO patient_feedback (id, claim_id, patient_name, overall_experience, status_clarity, payment_clarity, support_helpfulness, would_recommend, follow_up_needed, comments, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    fb.claimId || 'CLM-24081',
    fb.patientName || 'Anonymous Patient',
    fb.overallExperience || 5,
    fb.statusClarity || 5,
    fb.paymentClarity || 5,
    fb.supportHelpfulness || 5,
    fb.wouldRecommend ? 1 : 0,
    fb.followUpNeeded ? 1 : 0,
    fb.comments || '',
    now
  );

  return { id, success: true };
}
