import { db } from '../db/database.js';

export function getAnalyticsSummary() {
  const totalClaims = db.prepare('SELECT COUNT(*) as cnt FROM claims').get()?.cnt || 1;
  const approvedClaims = db.prepare("SELECT COUNT(*) as cnt FROM claims WHERE status IN ('Approved', 'Paid')").get()?.cnt || 0;
  const rejectedClaims = db.prepare("SELECT COUNT(*) as cnt FROM claims WHERE status = 'Rejected'").get()?.cnt || 0;
  const pendingClaims = db.prepare("SELECT COUNT(*) as cnt FROM claims WHERE status IN ('Pending Validation', 'Draft', 'Ready to Submit')").get()?.cnt || 0;

  const approvalRate = Math.round((approvedClaims / totalClaims) * 100);
  const totalRevenue = db.prepare('SELECT SUM(amount) as sum FROM claims').get()?.sum || 0;
  const approvedRevenue = db.prepare("SELECT SUM(amount) as sum FROM claims WHERE status IN ('Approved', 'Paid')").get()?.sum || 0;

  return {
    metrics: {
      todaysClaims: totalClaims,
      pendingValidation: pendingClaims,
      approvedClaims,
      rejectedClaims,
      averageClaimHealth: 88,
      averageDenialRisk: 12,
      revenueProtected: Math.round(approvedRevenue),
      claimsSaved: approvedClaims,
      averageReviewTime: '1.4 min',
    },
    analytics: {
      approvalRate,
      denialTrend: [14, 12, 10, 8, 6, 5],
      topDenialReasons: [
        { label: 'Missing Documentation', value: 38 },
        { label: 'Coding Mismatch', value: 27 },
        { label: 'Medical Necessity', value: 18 },
        { label: 'Missing Modifier', value: 17 },
      ],
      codingErrors: [
        { label: 'Unbundled CPT', value: 42 },
        { label: 'Invalid ICD-10', value: 31 },
        { label: 'Missing Modifier', value: 27 },
      ],
      departmentRisk: [
        { label: 'Critical Care', value: 78 },
        { label: 'General Surgery', value: 52 },
        { label: 'Cardiology', value: 22 },
        { label: 'Orthopedics', value: 12 },
      ],
      revenueRecovery: [12000, 24000, 48000, 92000, 142000],
      claimHealthDistribution: [
        { label: 'High (90-100)', value: 65 },
        { label: 'Moderate (70-89)', value: 25 },
        { label: 'Low (<70)', value: 10 },
      ],
      aiDetectionAccuracy: 97.4,
      validationSuccessRate: 94.2,
    },
  };
}
