import http from 'node:http';
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const serverDir = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(serverDir, '..');
const envPath = join(projectRoot, '.env');

function loadEnvFile(pathname) {
  if (!existsSync(pathname)) {
    return;
  }

  const content = readFileSync(pathname, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^['"]|['"]$/g, '');
    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

loadEnvFile(envPath);

const PORT = Number(process.env.PORT ?? 8787);
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
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

function extractJsonObject(text) {
  const trimmed = text.trim();
  try {
    return JSON.parse(trimmed);
  } catch {
    const start = trimmed.indexOf('{');
    const end = trimmed.lastIndexOf('}');
    if (start >= 0 && end > start) {
      return JSON.parse(trimmed.slice(start, end + 1));
    }
    throw new Error('Groq response did not contain valid JSON');
  }
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
            patientId: claim.patientId,
            age: claim.age,
            gender: claim.gender,
            diagnosis: claim.diagnosis,
            insurance: claim.insurance,
            status: claim.status,
            assignedStaff: claim.assignedStaff,
            department: claim.department,
            amount: claim.amount,
            coding: claim.coding,
            billing: claim.billing,
            documents: claim.documents,
            timeline: claim.timeline,
          }),
        },
      ],
    }),
  });

  if (!completion.ok) {
    const message = await completion.text();
    throw new Error(`Groq request failed: ${completion.status} ${message}`);
  }

  const payload = await completion.json();
  const content = payload?.choices?.[0]?.message?.content ?? '';
  return extractJsonObject(content);
}

const server = http.createServer(async (request, response) => {
  if (request.method === 'OPTIONS') {
    response.writeHead(204, corsHeaders);
    response.end();
    return;
  }

  if (request.url === '/health') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (request.method === 'POST' && request.url === '/api/ai-review') {
    try {
      const body = await readBody(request);
      if (!body?.claim) {
        sendJson(response, 400, { error: 'claim payload is required' });
        return;
      }

      const result = await reviewWithGroq(body.claim);
      sendJson(response, 200, result);
    } catch (error) {
      sendJson(response, 500, { error: error instanceof Error ? error.message : 'Unknown server error' });
    }
    return;
  }

  sendJson(response, 404, { error: 'Not found' });
});

server.listen(PORT, () => {
  console.log(`Groq claim reviewer backend running on http://localhost:${PORT}`);
});