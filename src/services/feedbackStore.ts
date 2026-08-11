import { PatientFeedback } from '../types';

const STORAGE_KEY = 'revenora.patientFeedback';

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

const seedFeedback: PatientFeedback[] = [
  {
    id: 'FB-1001',
    createdAt: new Date().toISOString(),
    patientName: 'Avery Chen',
    claimId: 'CLM-24081',
    overallExperience: 5,
    statusClarity: 4,
    paymentClarity: 4,
    supportHelpfulness: 5,
    wouldRecommend: true,
    followUpNeeded: false,
    comments: 'The claim status updates were easy to understand and the support team responded quickly.',
  },
];

const readFeedback = (): PatientFeedback[] => {
  if (!isBrowser) {
    return [...seedFeedback];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedFeedback));
    return [...seedFeedback];
  }

  try {
    const parsed = JSON.parse(raw) as PatientFeedback[];
    return Array.isArray(parsed) ? parsed : [...seedFeedback];
  } catch {
    return [...seedFeedback];
  }
};

const writeFeedback = (entries: PatientFeedback[]) => {
  if (!isBrowser) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const getPatientFeedback = () => readFeedback();

import { saveFeedbackToBackend } from './claimsApi';

export const submitPatientFeedback = (
  feedback: Omit<PatientFeedback, 'id' | 'createdAt'>,
): PatientFeedback => {
  const entry: PatientFeedback = {
    ...feedback,
    id: `FB-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
  };

  const existing = readFeedback();
  const next = [entry, ...existing].slice(0, 50);
  writeFeedback(next);

  saveFeedbackToBackend(entry).catch(() => {});

  return entry;
};

export const getPatientFeedbackSummary = () => {
  const entries = readFeedback();
  const total = entries.length;
  const averageOverall = total ? Math.round((entries.reduce((sum, entry) => sum + entry.overallExperience, 0) / total) * 10) / 10 : 0;
  const followUpCount = entries.filter((entry) => entry.followUpNeeded).length;
  const recommendCount = entries.filter((entry) => entry.wouldRecommend).length;

  return {
    total,
    averageOverall,
    followUpCount,
    recommendCount,
    latest: entries[0] ?? null,
  };
};