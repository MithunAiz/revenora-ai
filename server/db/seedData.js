import { db } from './database.js';

export function seedDatabaseIfEmpty() {
  db.exec('DELETE FROM claims;');
  db.exec('DELETE FROM patients;');
  db.exec('DELETE FROM clinical_documents;');
  db.exec('DELETE FROM medical_codings;');
  db.exec('DELETE FROM billing_summaries;');
  db.exec('DELETE FROM ai_reviews;');
  db.exec('DELETE FROM claim_timeline;');
  db.exec('DELETE FROM claim_activities;');
  db.exec('DELETE FROM denial_intelligence;');
  db.exec('DELETE FROM patient_feedback;');

  console.log('Seeding 25+ Indian Healthcare Claims into SQLite database...');

  const now = new Date().toISOString();
  const formatOffset = (minutes) => {
    const stamp = new Date(Date.now() - minutes * 60_000);
    return stamp.toLocaleString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const indianClaims = [
    {
      claimId: 'CLM-24081',
      patientId: 'PAT-1081',
      patient: 'Rajesh Sharma',
      age: 58,
      gender: 'Male',
      admissionDate: '2026-02-14',
      dischargeDate: '2026-02-18',
      primaryPhysician: 'Dr. Abhinav Mukund',
      diagnosis: 'Severe Sepsis with Acute Kidney Injury',
      insurance: 'Star Health Insurance',
      status: 'Pending Validation',
      riskScore: 78,
      claimHealth: 72,
      denialRisk: 28,
      assignedStaff: 'Priya Nair',
      priority: 'High',
      lastUpdated: formatOffset(12),
      expectedCompletion: 'Today, 5:00 PM',
      department: 'Critical Care (Apollo Hospitals)',
      amount: 248500,
      stage: 'AI Validation Started',
      aiReviewStatus: 'Needs Attention',
      submissionStatus: 'Pending Validation',
      assignedToMe: 1,
      coding: { icdCodes: ['A41.9', 'N17.9', 'R65.20'], procedureCodes: ['99291', '99292', '36556'], modifiers: ['25'] },
      billing: { hospitalCharges: 160000, departmentCharges: 48000, procedureCharges: 40500, insuranceCoverage: 210000, patientResponsibility: 38500, discounts: 0, grandTotal: 248500 },
      aiReview: {
        claimHealth: 72,
        documentationScore: 68,
        codingScore: 74,
        complianceScore: 82,
        medicalNecessityScore: 64,
        coverageValidation: { label: 'Coverage Validation', value: 85, status: 'Passed', explanation: 'Star Health active policy verified via Medi Assist TPA.' },
        duplicateBillingCheck: { label: 'Duplicate Billing Check', value: 92, status: 'Passed', explanation: 'No duplicate claim detected.' },
        completenessCheck: { label: 'Completeness Check', value: 65, status: 'Warning', explanation: 'Sepsis 3-hour bundle blood culture timestamp missing.' },
        denialRisk: 28,
        issues: [
          {
            title: 'Sepsis 3-Hour Bundle Documentation Gap',
            severity: 'Critical',
            explanation: 'Star Health requires documented blood culture draw timestamp prior to antibiotic administration for severe sepsis billing.',
            suggestion: 'Attach blood culture order lab timestamp from ICU chart.',
            confidence: 96,
            affectedDocumentation: 'CLM-24081 ICU Chart',
            affectedCode: 'ICD A41.9',
            evidence: 'Antibiotic injection given at 14:15, culture draw report omitted.',
            recommendedFix: 'Attach Lab Report LR-9021 showing blood draw timestamp at 14:02.',
            whyItMatters: 'Star Health TPA automatically rejects sepsis DRG claims without bundle compliance timestamps.',
          },
        ],
        recommendations: ['Attach lab blood culture report LR-9021', 'Verify modifier 25 on critical care CPT 99291'],
        summary: 'Claim requires blood culture lab report attachment to prevent Sepsis bundle TPA denial.',
      },
    },
    {
      claimId: 'CLM-24082',
      patientId: 'PAT-1082',
      patient: 'Sunita Verma',
      age: 49,
      gender: 'Female',
      admissionDate: '2026-02-15',
      dischargeDate: '2026-02-17',
      primaryPhysician: 'Dr. Swati Kulkarni',
      diagnosis: 'Acute Coronary Syndrome - PTCA Stenting',
      insurance: 'HDFC ERGO Health',
      status: 'Ready to Submit',
      riskScore: 22,
      claimHealth: 94,
      denialRisk: 6,
      assignedStaff: 'Rohan Gupta',
      priority: 'Medium',
      lastUpdated: formatOffset(45),
      expectedCompletion: 'Today, 6:00 PM',
      department: 'Cardiology (Manipal Hospital)',
      amount: 320000,
      stage: 'Ready for Submission',
      aiReviewStatus: 'Approved',
      submissionStatus: 'Ready for Submission',
      assignedToMe: 0,
      coding: { icdCodes: ['I21.4', 'I25.10'], procedureCodes: ['92928', '93458'], modifiers: ['RC'] },
      billing: { hospitalCharges: 210000, departmentCharges: 65000, procedureCharges: 45000, insuranceCoverage: 290000, patientResponsibility: 30000, discounts: 0, grandTotal: 320000 },
      aiReview: {
        claimHealth: 94,
        documentationScore: 95,
        codingScore: 94,
        complianceScore: 96,
        medicalNecessityScore: 92,
        coverageValidation: { label: 'Coverage Validation', value: 96, status: 'Passed', explanation: 'HDFC ERGO cashless pre-authorization approved.' },
        duplicateBillingCheck: { label: 'Duplicate Billing Check', value: 98, status: 'Passed', explanation: 'Passed.' },
        completenessCheck: { label: 'Completeness Check', value: 94, status: 'Passed', explanation: 'Complete angiogram film attachment verified.' },
        denialRisk: 6,
        issues: [],
        recommendations: ['Proceed to submit cashless claim packet.'],
        summary: 'Claim meets all clinical documentation, DES stent barcode, and coding validation guidelines.',
      },
    },
    {
      claimId: 'CLM-24083',
      patientId: 'PAT-1083',
      patient: 'Ananya Deshmukh',
      age: 41,
      gender: 'Female',
      admissionDate: '2026-02-16',
      dischargeDate: '2026-02-19',
      primaryPhysician: 'Dr. Arvind Swamy',
      diagnosis: 'Complex Laparoscopic Cholecystectomy',
      insurance: 'ICICI Lombard Health',
      status: 'Rejected',
      riskScore: 89,
      claimHealth: 48,
      denialRisk: 52,
      assignedStaff: 'Priya Nair',
      priority: 'Urgent',
      lastUpdated: formatOffset(120),
      expectedCompletion: 'Overdue',
      department: 'Gastroenterology (Max Healthcare)',
      amount: 185000,
      stage: 'Rejected',
      aiReviewStatus: 'Needs Attention',
      submissionStatus: 'Rejected',
      assignedToMe: 1,
      coding: { icdCodes: ['K80.20'], procedureCodes: ['47563'], modifiers: [] },
      billing: { hospitalCharges: 110000, departmentCharges: 42000, procedureCharges: 33000, insuranceCoverage: 135000, patientResponsibility: 50000, discounts: 0, grandTotal: 185000 },
      aiReview: {
        claimHealth: 48,
        documentationScore: 50,
        codingScore: 45,
        complianceScore: 60,
        medicalNecessityScore: 40,
        coverageValidation: { label: 'Coverage Validation', value: 70, status: 'Passed', explanation: 'ICICI Lombard cashless policy active.' },
        duplicateBillingCheck: { label: 'Duplicate Billing Check', value: 90, status: 'Passed', explanation: 'Passed.' },
        completenessCheck: { label: 'Completeness Check', value: 40, status: 'Failed', explanation: 'Intraoperative cholangiogram imaging report omitted.' },
        denialRisk: 52,
        issues: [
          {
            title: 'Missing Modifier 22 & Operative Cholangiogram Radiology Report',
            severity: 'Critical',
            explanation: 'CPT 47563 includes intraoperative cholangiogram, but no imaging report was attached to the claim.',
            suggestion: 'Add Modifier 22 for surgical complexity and attach Radiology Report RAD-409.',
            confidence: 98,
            affectedDocumentation: 'CLM-24083 Operative Notes',
            affectedCode: 'CPT 47563',
            evidence: 'Radiology report RAD-409 found in hospital PACS but missing from claims packet.',
            recommendedFix: 'Attach Radiology Report RAD-409 and append modifier 22.',
            whyItMatters: 'ICICI Lombard automatically rejects CPT 47563 without matching intraoperative imaging report.',
          },
        ],
        recommendations: ['Attach RAD-409 PDF', 'Append Modifier 22 to CPT 47563'],
        summary: 'Claim rejected by ICICI Lombard due to missing intraoperative cholangiogram radiology report.',
      },
    },
    {
      claimId: 'CLM-24084',
      patientId: 'PAT-1084',
      patient: 'Vikramaditya Singh',
      age: 67,
      gender: 'Male',
      admissionDate: '2026-02-12',
      dischargeDate: '2026-02-16',
      primaryPhysician: 'Dr. Radhika Sen',
      diagnosis: 'Total Knee Replacement (Arthroplasty)',
      insurance: 'Niva Bupa Health',
      status: 'Approved',
      riskScore: 12,
      claimHealth: 98,
      denialRisk: 2,
      assignedStaff: 'Kavita Reddy',
      priority: 'Low',
      lastUpdated: formatOffset(300),
      expectedCompletion: 'Completed',
      department: 'Orthopedics (Fortis Healthcare)',
      amount: 380000,
      stage: 'Paid',
      aiReviewStatus: 'Approved',
      submissionStatus: 'Paid',
      assignedToMe: 0,
      coding: { icdCodes: ['M17.11'], procedureCodes: ['27447'], modifiers: ['80'] },
      billing: { hospitalCharges: 250000, departmentCharges: 75000, procedureCharges: 55000, insuranceCoverage: 340000, patientResponsibility: 40000, discounts: 0, grandTotal: 380000 },
      aiReview: {
        claimHealth: 98,
        documentationScore: 98,
        codingScore: 98,
        complianceScore: 99,
        medicalNecessityScore: 97,
        coverageValidation: { label: 'Coverage Validation', value: 99, status: 'Passed', explanation: 'Reimbursement settled.' },
        duplicateBillingCheck: { label: 'Duplicate Billing Check', value: 99, status: 'Passed', explanation: 'Passed.' },
        completenessCheck: { label: 'Completeness Check', value: 98, status: 'Passed', explanation: 'Passed.' },
        denialRisk: 2,
        issues: [],
        recommendations: ['Cashless settlement completed by Niva Bupa.'],
        summary: 'Claim fully approved and reimbursed by Niva Bupa Health Insurance.',
      },
    },
    {
      claimId: 'CLM-24085',
      patientId: 'PAT-1085',
      patient: 'Meera Nair',
      age: 36,
      gender: 'Female',
      admissionDate: '2026-02-18',
      dischargeDate: '2026-02-20',
      primaryPhysician: 'Dr. Sanjay Subhash',
      diagnosis: 'Acute Appendicitis - Appendectomy',
      insurance: 'Care Health Insurance',
      status: 'Ready to Submit',
      riskScore: 18,
      claimHealth: 95,
      denialRisk: 5,
      assignedStaff: 'Rohan Gupta',
      priority: 'Medium',
      lastUpdated: formatOffset(30),
      expectedCompletion: 'Today, 7:00 PM',
      department: 'General Surgery (Narayana Health)',
      amount: 145000,
      stage: 'Ready for Submission',
      aiReviewStatus: 'Approved',
      submissionStatus: 'Ready for Submission',
      assignedToMe: 1,
      coding: { icdCodes: ['K35.80'], procedureCodes: ['44970'], modifiers: [] },
      billing: { hospitalCharges: 90000, departmentCharges: 30000, procedureCharges: 25000, insuranceCoverage: 130000, patientResponsibility: 15000, discounts: 0, grandTotal: 145000 },
      aiReview: {
        claimHealth: 95,
        documentationScore: 96,
        codingScore: 95,
        complianceScore: 97,
        medicalNecessityScore: 94,
        coverageValidation: { label: 'Coverage Validation', value: 97, status: 'Passed', explanation: 'Pre-auth approval attached.' },
        duplicateBillingCheck: { label: 'Duplicate Billing Check', value: 99, status: 'Passed', explanation: 'Passed.' },
        completenessCheck: { label: 'Completeness Check', value: 95, status: 'Passed', explanation: 'USG Abdomen report attached.' },
        denialRisk: 5,
        issues: [],
        recommendations: ['Ready for electronic claim submission.'],
        summary: 'Emergency laparoscopic appendectomy packet meets all cashless validation rules.',
      },
    },
    {
      claimId: 'CLM-24086',
      patientId: 'PAT-1086',
      patient: 'Suresh Iyer',
      age: 64,
      gender: 'Male',
      admissionDate: '2026-02-10',
      dischargeDate: '2026-02-15',
      primaryPhysician: 'Dr. Harish Chandra',
      diagnosis: 'Type 2 Diabetes with Diabetic Nephropathy (Dialysis)',
      insurance: 'Ayushman Bharat (PM-JAY)',
      status: 'Pending Validation',
      riskScore: 65,
      claimHealth: 79,
      denialRisk: 21,
      assignedStaff: 'Priya Nair',
      priority: 'High',
      lastUpdated: formatOffset(60),
      expectedCompletion: 'Tomorrow, 12:00 PM',
      department: 'Nephrology (AIIMS New Delhi)',
      amount: 95000,
      stage: 'AI Validation Started',
      aiReviewStatus: 'Needs Attention',
      submissionStatus: 'Pending Validation',
      assignedToMe: 0,
      coding: { icdCodes: ['E11.22', 'N18.6'], procedureCodes: ['90935'], modifiers: [] },
      billing: { hospitalCharges: 60000, departmentCharges: 20000, procedureCharges: 15000, insuranceCoverage: 95000, patientResponsibility: 0, discounts: 0, grandTotal: 95000 },
      aiReview: {
        claimHealth: 79,
        documentationScore: 75,
        codingScore: 82,
        complianceScore: 80,
        medicalNecessityScore: 78,
        coverageValidation: { label: 'Coverage Validation', value: 90, status: 'Passed', explanation: 'PM-JAY Gold Card verified.' },
        duplicateBillingCheck: { label: 'Duplicate Billing Check', value: 95, status: 'Passed', explanation: 'Passed.' },
        completenessCheck: { label: 'Completeness Check', value: 72, status: 'Warning', explanation: 'Hemodialysis session log sheet missing doctor sign-off.' },
        denialRisk: 21,
        issues: [
          {
            title: 'PM-JAY Dialysis Session Signature Missing',
            severity: 'Warning',
            explanation: 'Ayushman Bharat claims require nephrologist signature on session log sheet.',
            suggestion: 'Upload signed Dialysis Log Sheet DS-12.',
            confidence: 94,
            affectedDocumentation: 'Dialysis Log Sheet',
            affectedCode: 'CPT 90935',
            evidence: 'Log sheet DS-12 lacks consultant digital signature.',
            recommendedFix: 'Obtain Dr. Harish Chandra signature on DS-12.',
            whyItMatters: 'PM-JAY portal rejects hemodialysis package claims without attending doctor sign-off.',
          },
        ],
        recommendations: ['Upload signed DS-12 log sheet'],
        summary: 'PM-JAY claim requires signed dialysis session sheet before submission.',
      },
    },
  ];

  for (let i = 7; i <= 25; i++) {
    const patId = `PAT-10${i < 10 ? '0' + i : i}`;
    const claimId = `CLM-240${i < 10 ? '0' + i : i}`;
    const names = ['Rohan Gupta', 'Deepa Joshi', 'Arjun Kapoor', 'Kavita Reddy', 'Mohammad Rizwan', 'Lakshmi Narayanan', 'Aarav Kumar', 'Divya Sharma', 'Nikhil Mehta', 'Preeti Nair', 'Amitabh Roy', 'Shalini Pandey', 'Gautam Singhania', 'Bhavna Kulkarni', 'Tarun Verma', 'Vandana Sen', 'Vijay Merchant', 'Pooja Bhatt', 'Manish Malhotra'];
    const insurances = ['Star Health Insurance', 'HDFC ERGO Health', 'ICICI Lombard Health', 'Niva Bupa Health', 'Care Health Insurance', 'Ayushman Bharat (PM-JAY)', 'Bajaj Allianz'];
    const hospitals = ['Apollo Hospitals', 'Manipal Hospitals', 'Max Healthcare', 'Fortis Healthcare', 'Narayana Health', 'Medanta Gurugram', 'AIIMS New Delhi'];
    const physicians = ['Dr. Abhinav Mukund', 'Dr. Swati Kulkarni', 'Dr. Arvind Swamy', 'Dr. Radhika Sen', 'Dr. Sanjay Subhash', 'Dr. Meenakshi Sundaram'];

    const name = names[(i - 7) % names.length];
    const insurance = insurances[(i - 7) % insurances.length];
    const hospital = hospitals[(i - 7) % hospitals.length];
    const doctor = physicians[(i - 7) % physicians.length];
    const isApproved = i % 3 === 0;

    indianClaims.push({
      claimId,
      patientId: patId,
      patient: name,
      age: 30 + (i * 2) % 40,
      gender: i % 2 === 0 ? 'Male' : 'Female',
      admissionDate: `2026-02-0${(i % 8) + 1}`,
      dischargeDate: `2026-02-1${(i % 8) + 1}`,
      primaryPhysician: doctor,
      diagnosis: `Clinical Case Study ${i} - Hospital Evaluation`,
      insurance,
      status: isApproved ? 'Approved' : 'Pending Validation',
      riskScore: isApproved ? 15 : 65,
      claimHealth: isApproved ? 96 : 76,
      denialRisk: isApproved ? 4 : 24,
      assignedStaff: 'Priya Nair',
      priority: isApproved ? 'Low' : 'Medium',
      lastUpdated: formatOffset(100 + i * 15),
      expectedCompletion: 'In Progress',
      department: `Department (${hospital})`,
      amount: 75000 + i * 12000,
      stage: isApproved ? 'Paid' : 'AI Validation Started',
      aiReviewStatus: isApproved ? 'Approved' : 'Needs Attention',
      submissionStatus: isApproved ? 'Paid' : 'Pending Validation',
      assignedToMe: i % 2 === 0 ? 1 : 0,
      coding: { icdCodes: ['J18.9', 'I10'], procedureCodes: ['99223'], modifiers: [] },
      billing: { hospitalCharges: 50000 + i * 8000, departmentCharges: 15000, procedureCharges: 10000, insuranceCoverage: 65000 + i * 10000, patientResponsibility: 10000, discounts: 0, grandTotal: 75000 + i * 12000 },
      aiReview: {
        claimHealth: isApproved ? 96 : 76,
        documentationScore: isApproved ? 95 : 72,
        codingScore: 94,
        complianceScore: 96,
        medicalNecessityScore: 92,
        coverageValidation: { label: 'Coverage Validation', value: 95, status: 'Passed', explanation: `${insurance} coverage active.` },
        duplicateBillingCheck: { label: 'Duplicate Billing Check', value: 98, status: 'Passed', explanation: 'Passed.' },
        completenessCheck: { label: 'Completeness Check', value: isApproved ? 96 : 75, status: isApproved ? 'Passed' : 'Warning', explanation: isApproved ? 'Complete.' : 'Verification needed.' },
        denialRisk: isApproved ? 4 : 24,
        issues: isApproved ? [] : [{ title: 'Documentation Check Required', severity: 'Warning', explanation: 'Clinical notes pending review.', suggestion: 'Review physician chart.', confidence: 90, affectedDocumentation: 'Doctor Notes', affectedCode: 'CPT 99223', evidence: 'Notes incomplete.', recommendedFix: 'Update chart.', whyItMatters: 'Payer requirement.' }],
        recommendations: [isApproved ? 'Claim settled.' : 'Complete review.'],
        summary: `Claim for ${name} under ${insurance}.`,
      },
    });
  }

  const stmtPatient = db.prepare(`
    INSERT INTO patients (patient_id, name, age, gender, admission_date, discharge_date, primary_physician, diagnosis, insurance_provider)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const stmtClaim = db.prepare(`
    INSERT INTO claims (claim_id, patient_id, diagnosis, insurance, status, risk_score, claim_health, denial_risk, assigned_staff, priority, last_updated, expected_completion, department, amount, stage, ai_review_status, submission_status, assigned_to_me, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const stmtDoc = db.prepare(`
    INSERT INTO clinical_documents (claim_id, type, content, updated_at)
    VALUES (?, ?, ?, ?)
  `);

  const stmtCoding = db.prepare(`
    INSERT INTO medical_codings (claim_id, icd_codes_json, procedure_codes_json, modifiers_json)
    VALUES (?, ?, ?, ?)
  `);

  const stmtBilling = db.prepare(`
    INSERT INTO billing_summaries (claim_id, hospital_charges, department_charges, procedure_charges, insurance_coverage, patient_responsibility, discounts, grand_total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const stmtAiReview = db.prepare(`
    INSERT INTO ai_reviews (claim_id, claim_health, documentation_score, coding_score, compliance_score, medical_necessity_score, denial_risk, coverage_metric_json, duplicate_metric_json, completeness_metric_json, issues_json, recommendations_json, summary, reviewed_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const stmtTimeline = db.prepare(`
    INSERT INTO claim_timeline (claim_id, stage, timestamp)
    VALUES (?, ?, ?)
  `);

  const stmtActivity = db.prepare(`
    INSERT INTO claim_activities (claim_id, timestamp, actor, action, detail)
    VALUES (?, ?, ?, ?, ?)
  `);

  const stmtDenial = db.prepare(`
    INSERT INTO denial_intelligence (claim_id, root_cause, evidence, suggested_fix, affected_document, affected_code, severity, confidence, recommended_correction, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const stmtFeedback = db.prepare(`
    INSERT INTO patient_feedback (id, claim_id, patient_name, overall_experience, status_clarity, payment_clarity, support_helpfulness, would_recommend, follow_up_needed, comments, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of indianClaims) {
    stmtPatient.run(c.patientId, c.patient, c.age, c.gender, c.admissionDate, c.dischargeDate, c.primaryPhysician, c.diagnosis, c.insurance);
    stmtClaim.run(
      c.claimId,
      c.patientId,
      c.diagnosis,
      c.insurance,
      c.status,
      c.riskScore,
      c.claimHealth,
      c.denialRisk,
      c.assignedStaff,
      c.priority,
      c.lastUpdated,
      c.expectedCompletion,
      c.department,
      c.amount,
      c.stage,
      c.aiReviewStatus,
      c.submissionStatus,
      c.assignedToMe,
      now
    );

    const docTypes = ['Doctor Notes', 'Consultation Notes', 'Progress Notes', 'Operative Notes', 'Discharge Summary', 'Radiology Report', 'Laboratory Report', 'Prescription'];
    docTypes.forEach((type, idx) => {
      stmtDoc.run(c.claimId, type, `Document ${type} for patient ${c.patient}. Diagnosis: ${c.diagnosis}. Physician ${c.primaryPhysician} recorded clinical examination findings in detail. Hospital: ${c.department}.`, formatOffset(100 - idx * 10));
    });

    stmtCoding.run(c.claimId, JSON.stringify(c.coding.icdCodes), JSON.stringify(c.coding.procedureCodes), JSON.stringify(c.coding.modifiers));
    stmtBilling.run(c.claimId, c.billing.hospitalCharges, c.billing.departmentCharges, c.billing.procedureCharges, c.billing.insuranceCoverage, c.billing.patientResponsibility, c.billing.discounts, c.billing.grandTotal);

    stmtAiReview.run(
      c.claimId,
      c.aiReview.claimHealth,
      c.aiReview.documentationScore,
      c.aiReview.codingScore,
      c.aiReview.complianceScore,
      c.aiReview.medicalNecessityScore,
      c.aiReview.denialRisk,
      JSON.stringify(c.aiReview.coverageValidation),
      JSON.stringify(c.aiReview.duplicateBillingCheck),
      JSON.stringify(c.aiReview.completenessCheck),
      JSON.stringify(c.aiReview.issues),
      JSON.stringify(c.aiReview.recommendations),
      c.aiReview.summary,
      now
    );

    const stages = ['Claim Created', 'Clinical Documentation Completed', 'Medical Coding Completed', 'Billing Generated', c.stage];
    stages.forEach((st, idx) => {
      stmtTimeline.run(c.claimId, st, formatOffset(200 - idx * 30));
    });

    stmtActivity.run(c.claimId, formatOffset(10), 'System', 'Claim Loaded', 'Claim synchronized from SQLite database.');

    if (c.status === 'Rejected') {
      stmtDenial.run(
        c.claimId,
        'Missing Intraoperative Radiology Report RAD-409 for CPT 47563',
        'Intraoperative cholangiogram procedure documented in CPT 47563 requires radiology report RAD-409.',
        'Attach Radiology Report RAD-409 and append Modifier 22.',
        'Operative Notes / Radiology Report',
        'CPT 47563',
        'Critical',
        98,
        'Upload RAD-409 PDF and append modifier 22 before resubmission.',
        now
      );
    }
  }

  stmtFeedback.run(
    'FB-101',
    'CLM-24084',
    'Vikramaditya Singh',
    5,
    5,
    5,
    5,
    1,
    0,
    'Cashless approval from Niva Bupa at Fortis Hospital was completely seamless and transparent.',
    now
  );

  console.log('Database successfully re-seeded with 25 Indian healthcare claims!');
}
