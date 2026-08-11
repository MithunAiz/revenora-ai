import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const dataDir = join(__dirname, '..', 'data');

if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const dbPath = join(dataDir, 'revenora.db');
export const db = new DatabaseSync(dbPath);

db.exec(`
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS patients (
    patient_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    age INTEGER NOT NULL,
    gender TEXT NOT NULL,
    admission_date TEXT NOT NULL,
    discharge_date TEXT NOT NULL,
    primary_physician TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    insurance_provider TEXT NOT NULL,
    policy_type TEXT DEFAULT 'Standard Commercial'
  );

  CREATE TABLE IF NOT EXISTS claims (
    claim_id TEXT PRIMARY KEY,
    patient_id TEXT NOT NULL,
    diagnosis TEXT NOT NULL,
    insurance TEXT NOT NULL,
    status TEXT NOT NULL,
    risk_score INTEGER NOT NULL,
    claim_health INTEGER NOT NULL,
    denial_risk INTEGER NOT NULL,
    assigned_staff TEXT NOT NULL,
    priority TEXT NOT NULL,
    last_updated TEXT NOT NULL,
    expected_completion TEXT NOT NULL,
    department TEXT NOT NULL,
    amount REAL NOT NULL,
    stage TEXT NOT NULL,
    ai_review_status TEXT NOT NULL,
    submission_status TEXT NOT NULL,
    assigned_to_me INTEGER DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(patient_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS clinical_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id TEXT NOT NULL,
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS medical_codings (
    claim_id TEXT PRIMARY KEY,
    icd_codes_json TEXT NOT NULL,
    procedure_codes_json TEXT NOT NULL,
    modifiers_json TEXT NOT NULL,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS billing_summaries (
    claim_id TEXT PRIMARY KEY,
    hospital_charges REAL NOT NULL,
    department_charges REAL NOT NULL,
    procedure_charges REAL NOT NULL,
    insurance_coverage REAL NOT NULL,
    patient_responsibility REAL NOT NULL,
    discounts REAL NOT NULL,
    grand_total REAL NOT NULL,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ai_reviews (
    claim_id TEXT PRIMARY KEY,
    claim_health INTEGER NOT NULL,
    documentation_score INTEGER NOT NULL,
    coding_score INTEGER NOT NULL,
    compliance_score INTEGER NOT NULL,
    medical_necessity_score INTEGER NOT NULL,
    denial_risk INTEGER NOT NULL,
    coverage_metric_json TEXT NOT NULL,
    duplicate_metric_json TEXT NOT NULL,
    completeness_metric_json TEXT NOT NULL,
    issues_json TEXT NOT NULL,
    recommendations_json TEXT NOT NULL,
    summary TEXT,
    reviewed_at TEXT NOT NULL,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS claim_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id TEXT NOT NULL,
    stage TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS claim_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    detail TEXT NOT NULL,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS clearinghouse_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id TEXT NOT NULL,
    status TEXT NOT NULL,
    batch_id TEXT NOT NULL,
    validation_checks_json TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS insurance_decisions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id TEXT NOT NULL,
    insurer_name TEXT NOT NULL,
    decision TEXT NOT NULL,
    approved_amount REAL NOT NULL,
    coverage_status TEXT NOT NULL,
    eligibility_verified INTEGER NOT NULL,
    prior_auth_verified INTEGER NOT NULL,
    medical_necessity_verified INTEGER NOT NULL,
    rationale TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS denial_intelligence (
    claim_id TEXT PRIMARY KEY,
    root_cause TEXT NOT NULL,
    evidence TEXT NOT NULL,
    suggested_fix TEXT NOT NULL,
    affected_document TEXT NOT NULL,
    affected_code TEXT NOT NULL,
    severity TEXT NOT NULL,
    confidence INTEGER NOT NULL,
    recommended_correction TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (claim_id) REFERENCES claims(claim_id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS patient_feedback (
    id TEXT PRIMARY KEY,
    claim_id TEXT NOT NULL,
    patient_name TEXT NOT NULL,
    overall_experience INTEGER NOT NULL,
    status_clarity INTEGER NOT NULL,
    payment_clarity INTEGER NOT NULL,
    support_helpfulness INTEGER NOT NULL,
    would_recommend INTEGER NOT NULL,
    follow_up_needed INTEGER NOT NULL,
    comments TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id TEXT,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    tone TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    read INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    claim_id TEXT,
    actor TEXT NOT NULL,
    action TEXT NOT NULL,
    metadata_json TEXT,
    timestamp TEXT NOT NULL
  );
`);

console.log('SQLite database initialized at', dbPath);
