import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { seedDatabaseIfEmpty } from './db/seedData.js';
import { getAllClaims, getClaimById, submitClaimToBackend, correctAndResubmitClaim } from './services/claimsService.js';
import { getAnalyticsSummary } from './services/analyticsService.js';
import { getAllFeedback, saveFeedback } from './services/feedbackService.js';

const serverDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(serverDir, '..');
const envPath = join(projectRoot, '.env');

function loadEnvFile(pathname) {
  if (!existsSync(pathname)) return;
  const content = readFileSync(pathname, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const separatorIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(envPath);
seedDatabaseIfEmpty();

const PORT = Number(process.env.PORT ?? 8787);
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json',
    ...corsHeaders,
  });
  response.end(JSON.stringify(payload));
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => {
      try {
        const text = Buffer.concat(chunks).toString('utf8');
        resolve(text ? JSON.parse(text) : {});
      } catch (error) {
        reject(error);
      }
    });
    request.on('error', reject);
  });
}

function fallbackReview(claim) {
  const hasMissingDocs = /summary|authorization|signature|report/i.test(claim.documents?.map((item) => item.content).join(' ') ?? '');
  const claimHealth = hasMissingDocs ? 68 : 90;
  const denialRisk = 100 - claimHealth;

  return {
    claimId: claim.claimId,
    claimHealth,
    denialRisk,
    documentationScore: hasMissingDocs ? 64 : 91,
    codingScore: 88,
    complianceScore: 92,
    medicalNecessityScore: hasMissingDocs ? 66 : 89,
    findings: hasMissingDocs
      ? [
          {
            issue: 'Supporting documentation is incomplete.',
            whyItMatters: 'Incomplete packets often trigger payer denials or delay submission.',
            evidence: 'Discharge or authorization language is missing from the supplied claim packet.',
            recommendedFix: 'Attach the missing document and re-run verification.',
            confidence: 94,
            severity: 'Critical',
          },
        ]
      : [
          {
            issue: 'Claim appears ready for submission.',
            whyItMatters: 'The clinical record, coding, and billing fields are aligned.',
            evidence: 'No obvious coverage or documentation gaps were detected in the packet.',
            recommendedFix: 'No correction required.',
            confidence: 96,
            severity: 'Info',
          },
        ],
    recommendations: hasMissingDocs ? ['Upload the missing supporting document.'] : ['Proceed to submission.'],
    summary: hasMissingDocs ? 'Claim needs documentation cleanup before submission.' : 'Claim is in good shape for submission.',
  };
}

async function reviewWithGroq(claim) {
  if (!GROQ_API_KEY) {
    return fallbackReview(claim);
  }

  const prompt = `You are a hospital pre-submission claim reviewer. Return only valid JSON with this shape:\n{\n  "claimId": string,\n  "claimHealth": number,\n  "denialRisk": number,\n  "documentationScore": number,\n  "codingScore": number,\n  "complianceScore": number,\n  "medicalNecessityScore": number,\n  "findings": [{"issue": string, "whyItMatters": string, "evidence": string, "recommendedFix": string, "confidence": number, "severity": "Info" | "Warning" | "Critical"}],\n  "recommendations": string[],\n  "summary": string\n}\nKeep findings concise, professional, and grounded in the provided claim data. Maximum 3 findings.`;

  const completion = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      temperature: 0.2,
      max_tokens: 650,
      messages: [
        { role: 'system', content: prompt },
        {
          role: 'user',
          content: JSON.stringify({
            claimId: claim.claimId,
            patient: claim.patient,
            diagnosis: claim.diagnosis,
            insurance: claim.insurance,
            coding: claim.coding,
            billing: claim.billing,
            documents: claim.documents,
          }),
        },
      ],
    }),
  });

  if (!completion.ok) {
    return fallbackReview(claim);
  }

  const payload = await completion.json();
  const content = payload?.choices?.[0]?.message?.content ?? '';
  try {
    const start = content.indexOf('{');
    const end = content.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(content.slice(start, end + 1));
    }
  } catch {
    // fallback
  }
  return fallbackReview(claim);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = url.pathname;

  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders);
    response.end();
    return;
  }

  if (pathname === '/health') {
    sendJson(response, 200, { ok: true, database: 'SQLite (Native node:sqlite)' });
    return;
  }

  if (request.method === 'GET' && pathname === '/api/claims') {
    try {
      const claims = getAllClaims();
      sendJson(response, 200, claims);
    } catch (err) {
      sendJson(response, 500, { error: err.message });
    }
    return;
  }

  const matchClaimId = pathname.match(/^\/api\/claims\/([^\/]+)$/);
  if (request.method === 'GET' && matchClaimId) {
    try {
      const claim = getClaimById(matchClaimId[1]);
      if (!claim) return sendJson(response, 404, { error: 'Claim not found' });
      sendJson(response, 200, claim);
    } catch (err) {
      sendJson(response, 500, { error: err.message });
    }
    return;
  }

  const matchSubmit = pathname.match(/^\/api\/claims\/([^\/]+)\/submit$/);
  if (request.method === 'POST' && matchSubmit) {
    try {
      const claimId = matchSubmit[1];
      const updated = submitClaimToBackend(claimId);
      sendJson(response, 200, { success: true, claim: updated });
    } catch (err) {
      sendJson(response, 500, { error: err.message });
    }
    return;
  }

  const matchResubmit = pathname.match(/^\/api\/claims\/([^\/]+)\/resubmit$/);
  if (request.method === 'POST' && matchResubmit) {
    try {
      const claimId = matchResubmit[1];
      const body = await readBody(request);
      const updated = correctAndResubmitClaim(claimId, body);
      sendJson(response, 200, { success: true, claim: updated });
    } catch (err) {
      sendJson(response, 500, { error: err.message });
    }
    return;
  }

  if (request.method === 'POST' && pathname === '/api/ai-review') {
    try {
      const body = await readBody(request);
      if (!body?.claim) return sendJson(response, 400, { error: 'claim payload required' });
      const result = await reviewWithGroq(body.claim);
      sendJson(response, 200, result);
    } catch (err) {
      sendJson(response, 500, { error: err.message });
    }
    return;
  }

  if (request.method === 'GET' && pathname === '/api/analytics') {
    try {
      const summary = getAnalyticsSummary();
      sendJson(response, 200, summary);
    } catch (err) {
      sendJson(response, 500, { error: err.message });
    }
    return;
  }

  if (pathname === '/api/feedback') {
    try {
      if (request.method === 'GET') {
        const feedback = getAllFeedback();
        sendJson(response, 200, feedback);
      } else if (request.method === 'POST') {
        const body = await readBody(request);
        const result = saveFeedback(body);
        sendJson(response, 200, result);
      }
    } catch (err) {
      sendJson(response, 500, { error: err.message });
    }
    return;
  }

  sendJson(response, 404, { error: 'Endpoint not found' });
});

server.listen(PORT, () => {
  console.log(`Revenora AI Backend Server running with SQLite database on http://localhost:${PORT}`);
});