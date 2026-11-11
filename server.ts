import express from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, ThinkingLevel } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '30mb' }));

// ============================================================================
// PERSISTENT DATABASE STORE (stored in data/bharosa.db.json)
// ============================================================================
const DATA_DIR = process.env.DATA_DIR || path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'bharosa.db.json');

export interface DbChecklistItem {
  id: string;
  text: string;
  isSubjective: boolean;
  status: 'PENDING' | 'PASS' | 'FAIL' | 'ASK_HUMAN';
  reason?: string;
  clientDecision?: 'PASS' | 'FAIL';
}

export interface DbDeliveryFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  extractedText?: string;
  base64Data?: string;
}

export interface DbProject {
  id: string;
  title: string;
  brief: string;
  clientName: string;
  freelancerName?: string;
  amountUsd: number;
  deadline: string;
  step: 'PAY' | 'WORK' | 'CHECK' | 'DONE';
  statusWord: 'WAITING' | 'HELD' | 'CHECKING' | 'FIXES NEEDED' | 'PAID' | 'VOIDED';
  freelancerKey: string;
  clientKey: string;
  paypalOrderId?: string;
  paypalAuthorizationId?: string;
  authorizationCreatedAt?: string;
  paypalCaptureId?: string;
  paidAmountUsd?: number;
  revisionRound: number;
  clientFixNote?: string;
  checkCompletedAt?: string;
  freelancerDisputeNote?: string;
  clientDisputeNote?: string;
  disputeSummary?: string;
  disputeSuggestedUsd?: number;
  createdAt: string;
  updatedAt: string;
  checklist: DbChecklistItem[];
  delivery?: {
    note: string;
    link: string;
    files: DbDeliveryFile[];
    submittedAt: string;
  };
}

export interface DbEvent {
  id: string;
  projectId?: string;
  eventType: string;
  payloadJson: string;
  createdAt: string;
}

interface DatabaseSchema {
  projects: DbProject[];
  events: DbEvent[];
}

function buildSeedDemoProject(): DbProject {
  return {
    id: 'demo-college-fest',
    title: 'Logo design for a college fest',
    brief: 'Logo design for a college fest, $200, 3 logo concepts, PNG + SVG, 2 revisions.',
    clientName: 'Alex Rivera (Fest Director)',
    amountUsd: 200,
    deadline: '2026-11-20',
    step: 'PAY',
    statusWord: 'WAITING',
    freelancerKey: 'fk_demo_freelancer_991',
    clientKey: 'ck_demo_client_882',
    revisionRound: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    checklist: [
      {
        id: 'chk-demo-1',
        text: '3 distinct logo concepts delivered',
        isSubjective: false,
        status: 'PASS',
        reason: 'Found 3 separate logo concept files in the submission.',
      },
      {
        id: 'chk-demo-2',
        text: 'High-resolution PNG files included',
        isSubjective: false,
        status: 'PASS',
        reason: 'Verified high-resolution PNG exports.',
      },
      {
        id: 'chk-demo-3',
        text: 'Editable vector SVG source files included',
        isSubjective: false,
        status: 'PASS',
        reason: 'Verified scalable vector .svg source files.',
      },
      {
        id: 'chk-demo-4',
        text: '2 revision rounds included',
        isSubjective: false,
        status: 'PASS',
        reason: 'Revision notes v1 and v2 documented.',
      },
      {
        id: 'chk-demo-5',
        text: 'Overall logo design looks good and fits the college fest vibe',
        isSubjective: true,
        status: 'ASK_HUMAN',
        reason: 'Design quality is subjective — client decides.',
      },
    ],
  };
}

function readDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial: DatabaseSchema = {
        projects: [buildSeedDemoProject()],
        events: [],
      };
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const parsed = JSON.parse(raw) as DatabaseSchema;
    if (!Array.isArray(parsed.projects) || parsed.projects.length === 0) {
      parsed.projects = [buildSeedDemoProject()];
    }
    if (!Array.isArray(parsed.events)) {
      parsed.events = [];
    }
    return parsed;
  } catch {
    return {
      projects: [buildSeedDemoProject()],
      events: [],
    };
  }
}

function writeDb(db: DatabaseSchema) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

function logSilentEvent(
  projectId: string | undefined,
  eventType: string,
  payload: unknown
) {
  const db = readDb();
  db.events.push({
    id: `evt_${crypto.randomBytes(6).toString('hex')}`,
    projectId,
    eventType,
    payloadJson: JSON.stringify(payload),
    createdAt: new Date().toISOString(),
  });
  writeDb(db);
}

function sanitizeProjectWithoutKeys(project: DbProject): DbProject {
  return {
    ...project,
    clientKey: '',
    freelancerKey: '',
  };
}

// ============================================================================
// PAYOUT GUARDRAIL CALCULATION (SERVER-SIDE RULE)
// ============================================================================
export function calculateServerPayout(project: DbProject): {
  passCount: number;
  failCount: number;
  askHumanCount: number;
  recommendedPercent: number;
  recommendedUsd: number;
} {
  let passCount = 0;
  let failCount = 0;
  let askHumanCount = 0;

  for (const item of project.checklist) {
    const effective = item.clientDecision || item.status;
    if (effective === 'PASS') {
      passCount++;
    } else if (effective === 'FAIL') {
      failCount++;
    } else {
      askHumanCount++;
    }
  }

  const denominator = passCount + failCount;
  const ratio = denominator > 0 ? passCount / denominator : 1;
  const recommendedPercent = Math.round(ratio * 100);
  const recommendedUsd = Number(
    ((project.amountUsd * recommendedPercent) / 100).toFixed(2)
  );

  return {
    passCount,
    failCount,
    askHumanCount,
    recommendedPercent,
    recommendedUsd,
  };
}

// ============================================================================
// GEMINI SERVER-SIDE CLIENT & SAFE HELPERS
// ============================================================================
function getAiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY is not configured on the server.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  timeoutMessage = 'Gemini AI request timed out after 15 seconds'
): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function stripJsonFencesAndParse<T>(rawText: string): T {
  const cleaned = String(rawText || '')
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  if (!cleaned) {
    throw new Error('Empty JSON response from Gemini AI');
  }
  return JSON.parse(cleaned) as T;
}

function getGeminiLanguageLabel(lang?: string): string {
  if (lang === 'hi') {
    return 'Hindi (strictly in Devanagari script)';
  }
  if (lang === 'hinglish') {
    return 'Hinglish (Hindi written in Roman letters)';
  }
  return 'English (100% pure English, no Hindi or Hinglish words)';
}

async function generateFastJson<T>(
  contents: any,
  responseSchema: any,
  label = 'Gemini JSON request'
): Promise<T> {
  const ai = getAiClient();
  let lastError: any = null;

  for (const candidateModel of [
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
    'gemini-2.5-flash',
  ]) {
    try {
      const response = await withTimeout(
        ai.models.generateContent({
          model: candidateModel,
          contents,
          config: {
            ...(candidateModel === 'gemini-3.8-flash'
              ? { thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } }
              : {}),
            responseMimeType: 'application/json',
            responseSchema,
          },
        }),
        6000,
        `${label} (${candidateModel}) timed out`
      );
      if (response && response.text) {
        return stripJsonFencesAndParse<T>(response.text);
      }
    } catch (err: any) {
      console.error(
        `[BHAROSA ${label} with ${candidateModel} error]:`,
        err?.message || err
      );
      lastError = err;
    }
  }

  throw lastError || new Error(`${label} failed across all Gemini models.`);
}

// ============================================================================
// PAYPAL REST API v2 SERVER-SIDE HELPERS (SANDBOX / LIVE)
// ============================================================================
export type PayPalMode = 'live' | 'mock' | 'unconfigured';

const PAYPAL_API_BASE =
  process.env.PAYPAL_API_BASE || 'https://api-m.sandbox.paypal.com';

const PAYPAL_CLIENT_ID = (
  process.env.PAYPAL_CLIENT_ID || 'sb'
).trim();

const PAYPAL_CLIENT_SECRET = (
  process.env.PAYPAL_CLIENT_SECRET || 'sandbox_secret_bharosa_escrow'
).trim();

const PAYPAL_UNCONFIGURED_MSG =
  'PayPal is not configured on the server. Set PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET.';

function hasRealPayPalCredentials(): boolean {
  const id = (process.env.PAYPAL_CLIENT_ID || '').trim();
  const secret = (process.env.PAYPAL_CLIENT_SECRET || '').trim();
  return Boolean(
    id &&
      secret &&
      id !== 'sb' &&
      id !== 'YOUR_PAYPAL_SANDBOX_CLIENT_ID' &&
      secret !== 'sandbox_secret_bharosa_escrow' &&
      secret !== 'YOUR_PAYPAL_SANDBOX_CLIENT_SECRET'
  );
}

export function getPayPalMode(): PayPalMode {
  if (hasRealPayPalCredentials()) {
    return 'live';
  }
  if (process.env.PAYPAL_ALLOW_MOCK === 'false') {
    return 'unconfigured';
  }
  return 'mock';
}

function paypalErrorText(data: any, fallback: string): string {
  const firstDetail = Array.isArray(data?.details) ? data.details[0] : undefined;
  if (firstDetail && (firstDetail.issue || firstDetail.description)) {
    return [firstDetail.issue, firstDetail.description]
      .filter(Boolean)
      .join(': ');
  }
  if (typeof data?.message === 'string' && data.message.trim().length > 0) {
    return data.message.trim();
  }
  return fallback;
}

async function getPayPalAccessToken(): Promise<string> {
  const clientId = PAYPAL_CLIENT_ID;
  const clientSecret = PAYPAL_CLIENT_SECRET;
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`PayPal OAuth failed (${response.status}): ${text}`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

// ============================================================================
// SERVER-SIDE FILE TEXT EXTRACTION (PDF / DOCX / TXT)
// ============================================================================
function extractTextOnServer(file: DbDeliveryFile): string {
  if (
    file.mimeType &&
    file.mimeType.startsWith('image/') &&
    file.mimeType !== 'image/svg+xml'
  ) {
    return '';
  }
  if (file.extractedText && file.extractedText.trim().length > 0) {
    return file.extractedText.slice(0, 2500);
  }
  if (!file.base64Data) return '';

  try {
    const cleanBase64 = file.base64Data.includes(',')
      ? file.base64Data.split(',')[1]
      : file.base64Data;
    const buf = Buffer.from(cleanBase64, 'base64');
    const rawString = buf.toString('utf-8');
    const printable = rawString
      .replace(/[^\x20-\x7E\n]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    return printable.slice(0, 2500);
  } catch {
    return '';
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

// 0. Health Check Route
app.get('/api/health', (_req, res) => {
  const mode = getPayPalMode();
  const paypalClientId =
    mode === 'live' ? PAYPAL_CLIENT_ID : PAYPAL_CLIENT_ID || 'sb';
  const paypalEnv = PAYPAL_API_BASE.includes('sandbox') ? 'sandbox' : 'live';
  const webhookConfigured = Boolean(
    process.env.PAYPAL_WEBHOOK_ID &&
      process.env.PAYPAL_WEBHOOK_ID.trim() !== '' &&
      process.env.PAYPAL_WEBHOOK_ID.trim() !== 'YOUR_PAYPAL_SANDBOX_WEBHOOK_ID'
  );

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    paypalMode: mode,
    paypalConfigured: mode === 'live' || mode === 'mock',
    paypalClientId,
    paypalEnv,
    webhookConfigured,
    geminiConfigured: Boolean(
      process.env.GEMINI_API_KEY &&
        process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY'
    ),
    database: 'json-file',
  });
});

// 0B. List all projects for MY PROJECTS screen (disabled in live mode)
app.get('/api/projects', (_req, res) => {
  if (getPayPalMode() === 'live') {
    return res.status(404).json({ error: 'Not available.' });
  }
  const db = readDb();
  return res.json({
    projects: db.projects,
  });
});

// 1. Gemini Structured Checklist Generation (3 to 5 simple, testable points)
app.post('/api/gemini/checklist', async (req, res) => {
  const { brief, amountUsd, language } = req.body;
  const trimmedBrief = String(brief || '').trim();
  const targetLanguage = getGeminiLanguageLabel(language);

  if (!trimmedBrief) {
    return res.status(400).json({ error: 'Please describe the job first' });
  }

  try {
    const prompt = `Break this freelance job into 3 to 5 simple, short checklist items that are easy to understand in 5 seconds.
Job description: "${trimmedBrief}"
Amount: $${Number(amountUsd) || 200} USD

Rules:
- Return a JSON object {"checklist": ["string", ...]} with 3 to 5 items.
- Make items concrete and testable (file format, count, link, length, revisions).
- Keep each item under 10 words.
- Write the checklist and reasons in ${targetLanguage}.`;

    const checklistSchema = {
      type: Type.OBJECT,
      properties: {
        checklist: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: '3 to 5 simple, testable checklist strings',
        },
      },
      required: ['checklist'],
    };

    const parsed = await generateFastJson<{ checklist?: unknown }>(
      prompt,
      checklistSchema,
      'Checklist Generation'
    );

    if (
      !parsed ||
      !Array.isArray(parsed.checklist) ||
      parsed.checklist.length === 0
    ) {
      throw new Error('Gemini returned an empty or invalid checklist array.');
    }

    const checklistStrings = parsed.checklist
      .map((item) => String(item || '').trim())
      .filter((item) => item.length > 0)
      .slice(0, 5);

    if (checklistStrings.length === 0) {
      throw new Error('No valid checklist strings after parsing Gemini output.');
    }

    const items = checklistStrings.map((text) => ({
      text,
      isSubjective: /looks good|quality|vibe|style|taste|aesthetic/i.test(text),
    }));

    return res.json({
      checklist: checklistStrings,
      items,
    });
  } catch (error: any) {
    console.error('[BHAROSA /api/gemini/checklist Error]:', error);
    return res.status(502).json({
      error: error?.message || 'Failed to generate checklist with Gemini AI.',
    });
  }
});

// 2. Create New Project (Generates Freelancer & Client Magic Links)
app.post('/api/projects', (req, res) => {
  const {
    title,
    brief,
    clientName,
    freelancerName,
    amountUsd,
    deadline,
    checklist,
  } = req.body;

  const id = `p_${crypto.randomBytes(5).toString('hex')}`;
  const freelancerKey = `fk_${crypto.randomBytes(8).toString('hex')}`;
  const clientKey = `ck_${crypto.randomBytes(8).toString('hex')}`;

  const rawList =
    Array.isArray(checklist) && checklist.length > 0
      ? checklist
      : [
          { text: 'All requested deliverables uploaded', isSubjective: false },
          { text: 'Correct file formats included', isSubjective: false },
          { text: 'Overall work looks good to client', isSubjective: true },
        ];

  const formattedChecklist: DbChecklistItem[] = rawList.map(
    (item: any, idx: number) => ({
      id: `chk_${idx + 1}_${crypto.randomBytes(3).toString('hex')}`,
      text: String(item.text || `Deliverable point ${idx + 1}`),
      isSubjective: Boolean(
        item.isSubjective ||
          /looks good|quality|vibe|style|taste|aesthetic/i.test(
            String(item.text || '')
          )
      ),
      status: 'PENDING',
    })
  );

  const newProject: DbProject = {
    id,
    title: String(title || brief || 'Freelance Project').slice(0, 90),
    brief: String(brief || title || 'Freelance Project'),
    clientName: String(clientName || 'Client'),
    freelancerName: freelancerName ? String(freelancerName).trim() : undefined,
    amountUsd: Math.max(1, Number(amountUsd) || 100),
    deadline: String(deadline || '2026-11-25'),
    step: 'PAY',
    statusWord: 'WAITING',
    freelancerKey,
    clientKey,
    revisionRound: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    checklist: formattedChecklist,
  };

  const db = readDb();
  db.projects.unshift(newProject);
  writeDb(db);

  logSilentEvent(id, 'PROJECT.CREATED', {
    title: newProject.title,
    amountUsd: newProject.amountUsd,
  });

  return res.json({
    project: newProject,
    freelancerUrl: `/p/${id}?k=${freelancerKey}`,
    clientUrl: `/p/${id}?k=${clientKey}`,
  });
});

// 3. Load or Reset Demo Project
app.post('/api/projects/demo', (_req, res) => {
  const db = readDb();
  const seeded = buildSeedDemoProject();
  const existingIdx = db.projects.findIndex((p) => p.id === seeded.id);
  if (existingIdx >= 0) {
    db.projects[existingIdx] = seeded;
  } else {
    db.projects.unshift(seeded);
  }
  writeDb(db);
  logSilentEvent(seeded.id, 'PROJECT.DEMO_LOADED', { id: seeded.id });

  return res.json({
    project: seeded,
    freelancerUrl: `/p/${seeded.id}?k=${seeded.freelancerKey}`,
    clientUrl: `/p/${seeded.id}?k=${seeded.clientKey}`,
  });
});

// 4. Get Project by ID and Magic Key (?k=...)
app.get('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const key = String(req.query.k || '');

  const db = readDb();
  const project = db.projects.find((p) => p.id === id);

  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const hasValidKey =
    key === project.clientKey ||
    key === project.freelancerKey ||
    getPayPalMode() !== 'live';
  const role: 'FREELANCER' | 'CLIENT' =
    key === project.freelancerKey ? 'FREELANCER' : 'CLIENT';

  let isAuthorizationExpired = false;
  if (project.authorizationCreatedAt && project.step !== 'DONE') {
    const createdMs = new Date(project.authorizationCreatedAt).getTime();
    const ageDays = (Date.now() - createdMs) / (1000 * 60 * 60 * 24);
    if (ageDays >= 29) {
      isAuthorizationExpired = true;
    }
  }

  let isEligibleForAutoRelease = false;
  if (project.checkCompletedAt && project.step === 'CHECK') {
    const checkMs = new Date(project.checkCompletedAt).getTime();
    const ageDays = (Date.now() - checkMs) / (1000 * 60 * 60 * 24);
    if (ageDays >= 3) {
      isEligibleForAutoRelease = true;
    }
  }

  const payout = calculateServerPayout(project);

  return res.json({
    project: hasValidKey ? project : sanitizeProjectWithoutKeys(project),
    role,
    payout,
    isAuthorizationExpired,
    isEligibleForAutoRelease,
  });
});

// 4B. Update Project Step (when clicking PAY - WORK - CHECK - DONE bar)
app.patch('/api/projects/:id/step', (req, res) => {
  const { id } = req.params;
  const { step } = req.body;
  const db = readDb();
  const project = db.projects.find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }
  if (['PAY', 'WORK', 'CHECK', 'DONE'].includes(step)) {
    project.step = step;
    project.updatedAt = new Date().toISOString();
    writeDb(db);
  }
  return res.json({ project });
});

// 5. PayPal Create Order (POST /v2/checkout/orders with intent=AUTHORIZE)
app.post('/api/paypal/create-order', async (req, res) => {
  const mode = getPayPalMode();
  if (mode === 'unconfigured') {
    return res.status(503).json({ error: PAYPAL_UNCONFIGURED_MSG });
  }

  const { projectId } = req.body;
  const db = readDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (project.statusWord === 'PAID' || project.statusWord === 'VOIDED') {
    return res
      .status(409)
      .json({ error: 'This project is already finalized.' });
  }

  try {
    if (mode === 'live') {
      const accessToken = await getPayPalAccessToken();
      const ppRes = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'PayPal-Request-Id': crypto.randomUUID(),
        },
        body: JSON.stringify({
          intent: 'AUTHORIZE',
          purchase_units: [
            {
              reference_id: project.id,
              custom_id: project.id,
              description: project.title.slice(0, 120),
              amount: {
                currency_code: 'USD',
                value: project.amountUsd.toFixed(2),
              },
            },
          ],
        }),
      });

      const data = (await ppRes.json().catch(() => ({}))) as any;
      if (!ppRes.ok || !data?.id) {
        throw new Error(paypalErrorText(data, 'PayPal create order failed'));
      }

      project.paypalOrderId = data.id;
      project.updatedAt = new Date().toISOString();
      writeDb(db);
      logSilentEvent(project.id, 'PAYPAL.ORDER.CREATED', data);
      return res.json({ orderId: data.id });
    }

    // mock mode
    const orderId = `ORD-SB-${crypto.randomBytes(5).toString('hex').toUpperCase()}`;
    project.paypalOrderId = orderId;
    project.updatedAt = new Date().toISOString();
    writeDb(db);
    logSilentEvent(project.id, 'PAYPAL.ORDER.CREATED_SANDBOX', { orderId });
    return res.json({ orderId });
  } catch (error: any) {
    return res
      .status(500)
      .json({ error: error?.message || 'Could not create PayPal order.' });
  }
});

// 6. PayPal Authorize Order (POST /v2/checkout/orders/{id}/authorize)
app.post('/api/paypal/authorize-order', async (req, res) => {
  const mode = getPayPalMode();
  if (mode === 'unconfigured') {
    return res.status(503).json({ error: PAYPAL_UNCONFIGURED_MSG });
  }

  const { projectId, orderId } = req.body;
  const db = readDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (
    typeof orderId !== 'string' ||
    !/^[A-Za-z0-9-]{5,64}$/.test(orderId) ||
    !project.paypalOrderId ||
    orderId !== project.paypalOrderId
  ) {
    return res.status(400).json({
      error: 'This PayPal order does not belong to this project.',
    });
  }

  try {
    let authorizationId: string;

    if (mode === 'live') {
      const accessToken = await getPayPalAccessToken();
      const ppRes = await fetch(
        `${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/authorize`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `auth-${orderId}`,
          },
        }
      );
      const data = (await ppRes.json().catch(() => ({}))) as any;
      if (!ppRes.ok) {
        throw new Error(
          paypalErrorText(data, 'PayPal order authorization failed')
        );
      }

      const authObj = data?.purchase_units?.[0]?.payments?.authorizations?.[0];
      const expectedValue = project.amountUsd.toFixed(2);
      if (
        !authObj ||
        !authObj.id ||
        authObj.status !== 'CREATED' ||
        authObj?.amount?.value !== expectedValue
      ) {
        throw new Error(
          'PayPal authorization did not return a valid CREATED hold for the expected amount.'
        );
      }
      authorizationId = authObj.id;
    } else {
      authorizationId = `AUTH-SB-${crypto
        .randomBytes(5)
        .toString('hex')
        .toUpperCase()}`;
    }

    project.paypalAuthorizationId = authorizationId;
    project.authorizationCreatedAt = new Date().toISOString();
    project.step = 'WORK';
    project.statusWord = 'HELD';
    project.updatedAt = new Date().toISOString();
    writeDb(db);

    logSilentEvent(project.id, 'PAYMENT.AUTHORIZATION.CREATED', {
      orderId,
      authorizationId,
      amountUsd: project.amountUsd,
    });

    return res.json({
      project,
      authorizationId,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Failed to authorize PayPal payment hold.',
    });
  }
});

// 7. Submit Work + Server-Side File Extraction + Gemini AI Review
app.post('/api/projects/:id/submit-work', async (req, res) => {
  const { id } = req.params;
  const { note, link, files, samplePreset, language } = req.body;
  const targetLanguage = getGeminiLanguageLabel(language);

  const db = readDb();
  const project = db.projects.find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  const processedFiles: DbDeliveryFile[] = (
    Array.isArray(files) ? files : []
  ).map((f: DbDeliveryFile) => ({
    ...f,
    extractedText: extractTextOnServer(f),
  }));

  project.delivery = {
    note: String(note || ''),
    link: String(link || ''),
    files: processedFiles,
    submittedAt: new Date().toISOString(),
  };

  let usedFallback = false;
  let aiErrorMessage: string | undefined;

  try {
    if (samplePreset === 'COMPLETE' || samplePreset === 'INCOMPLETE') {
      const isComplete = samplePreset === 'COMPLETE';
      project.checklist = project.checklist.map((item, idx) => {
        if (item.isSubjective) {
          return {
            ...item,
            status: 'ASK_HUMAN',
            clientDecision: undefined,
            reason: 'Design quality is subjective — client decides.',
          };
        }
        if (
          !isComplete &&
          (item.text.toLowerCase().includes('svg') || idx === 2)
        ) {
          return {
            ...item,
            status: 'FAIL',
            clientDecision: undefined,
            reason: 'SVG vector file was not found in the uploaded files.',
          };
        }
        return {
          ...item,
          status: 'PASS',
          clientDecision: undefined,
          reason: 'Verified in the uploaded files.',
        };
      });
    } else {
      const parts: any[] = [];

      for (const f of processedFiles) {
        if (
          f.base64Data &&
          f.mimeType &&
          f.mimeType.startsWith('image/') &&
          f.mimeType !== 'image/svg+xml'
        ) {
          const cleanBase64 = f.base64Data.includes(',')
            ? f.base64Data.split(',')[1]
            : f.base64Data;
          parts.push({
            inlineData: {
              mimeType: f.mimeType,
              data: cleanBase64,
            },
          });
        }
      }

      const fileSummary = processedFiles
        .map(
          (f, i) =>
            `File ${i + 1}: "${f.name}" (${f.mimeType}, ${f.sizeBytes} bytes)${
              f.extractedText
                ? `\nExtracted Text: ${f.extractedText.slice(0, 800)}`
                : ''
            }`
        )
        .join('\n\n');

      const checklistPrompt = project.checklist
        .map(
          (c) =>
            `- ID: "${c.id}" | Point: "${c.text}" | isSubjective: ${c.isSubjective}`
        )
        .join('\n');

      parts.push({
        text: `You are checking a freelancer's submitted work for the project "${project.title}".

Checklist items to verify:
${checklistPrompt}

Freelancer Note: ${note || 'Work completed as requested.'}
External Link: ${link || 'Provided in submission'}
Uploaded Files (${processedFiles.length}):
${fileSummary || 'Standard deliverable package submitted'}

Rules:
1. Return JSON matching {"evaluations": [{"id": "string", "status": "PASS" | "FAIL" | "ASK_HUMAN", "reason": "string"}]} for every checklist ID.
2. Any item with isSubjective: true (or about "looks good", "design quality", "vibe") MUST be marked ASK_HUMAN.
3. Write the checklist and reasons in ${targetLanguage}.`,
      });

      const reviewSchema = {
        type: Type.OBJECT,
        properties: {
          evaluations: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: {
                  type: Type.STRING,
                  description: 'Exact checklist item ID',
                },
                status: {
                  type: Type.STRING,
                  description: 'PASS, FAIL, or ASK_HUMAN',
                },
                reason: {
                  type: Type.STRING,
                  description: 'One short plain-language sentence explaining why',
                },
              },
              required: ['id', 'status', 'reason'],
            },
          },
        },
        required: ['evaluations'],
      };

      const parsed = await generateFastJson<{
        evaluations?: Array<{ id: string; status: string; reason: string }>;
      }>({ parts }, reviewSchema, 'AI Work Review');

      if (!parsed || !Array.isArray(parsed.evaluations)) {
        throw new Error('Gemini returned an invalid evaluations payload.');
      }

      const evaluations = parsed.evaluations;

      project.checklist = project.checklist.map((item) => {
        if (
          item.isSubjective ||
          /looks good|quality|vibe|style|taste|aesthetic/i.test(item.text)
        ) {
          return {
            ...item,
            status: 'ASK_HUMAN',
            clientDecision: undefined,
            reason: 'Subjective quality — client decides.',
          };
        }
        const matched = evaluations.find((e) => e.id === item.id);
        const rawStatus = String(matched?.status || 'PASS').toUpperCase();
        const status: 'PASS' | 'FAIL' | 'ASK_HUMAN' =
          rawStatus === 'FAIL'
            ? 'FAIL'
            : rawStatus === 'ASK_HUMAN'
            ? 'ASK_HUMAN'
            : 'PASS';

        return {
          ...item,
          status,
          clientDecision: undefined,
          reason: matched?.reason || 'Checked against submitted files.',
        };
      });
    }
  } catch (error: any) {
    console.error('[BHAROSA /api/projects/:id/submit-work AI Review Error]:', error);
    usedFallback = true;
    aiErrorMessage = error?.message || 'AI review failed';
    project.checklist = project.checklist.map((item) => {
      if (
        item.isSubjective ||
        /looks good|quality|vibe|style|taste|aesthetic/i.test(item.text)
      ) {
        return {
          ...item,
          status: 'ASK_HUMAN',
          clientDecision: undefined,
          reason: 'Design quality is subjective — client decides.',
        };
      }
      return {
        ...item,
        status: 'PASS',
        clientDecision: undefined,
        reason: 'Standard check applied (files/links attached). Client can review.',
      };
    });
  } finally {
    project.step = 'CHECK';
    project.statusWord = 'CHECKING';
    project.checkCompletedAt = new Date().toISOString();
    project.updatedAt = new Date().toISOString();
    writeDb(db);
  }

  const payout = calculateServerPayout(project);
  logSilentEvent(project.id, 'WORK.CHECKED', { payout, usedFallback });

  return res.json({
    project,
    payout,
    usedFallback,
    aiError: aiErrorMessage,
  });
});

// 8. Client resolves an item (PASS or FAIL)
app.post('/api/projects/:id/client-item-decision', (req, res) => {
  const { id } = req.params;
  const { itemId, decision } = req.body;

  const db = readDb();
  const project = db.projects.find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  project.checklist = project.checklist.map((item) =>
    item.id === itemId ? { ...item, clientDecision: decision } : item
  );
  project.updatedAt = new Date().toISOString();
  writeDb(db);

  return res.json({
    project,
    payout: calculateServerPayout(project),
  });
});

// 9. Client Clicks "ASK FOR FIXES" (Max 2 rounds)
app.post('/api/projects/:id/ask-fixes', (req, res) => {
  const { id } = req.params;
  const { fixNote } = req.body;

  const db = readDb();
  const project = db.projects.find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (project.revisionRound >= 2) {
    return res
      .status(400)
      .json({ error: 'Maximum of 2 revision rounds already used.' });
  }

  project.revisionRound += 1;
  project.clientFixNote =
    String(fixNote || '').trim() ||
    'Please fix the failed checklist items and upload again.';
  project.step = 'WORK';
  project.statusWord = 'FIXES NEEDED';
  project.updatedAt = new Date().toISOString();
  writeDb(db);

  logSilentEvent(project.id, 'PROJECT.FIXES_REQUESTED', {
    revisionRound: project.revisionRound,
    clientFixNote: project.clientFixNote,
  });

  return res.json({ project });
});

// 10. PayPal Capture Payment (RELEASE MONEY)
app.post('/api/paypal/capture', async (req, res) => {
  const mode = getPayPalMode();
  if (mode === 'unconfigured') {
    return res.status(503).json({ error: PAYPAL_UNCONFIGURED_MSG });
  }

  const { projectId, key, customAmountUsd } = req.body;

  const db = readDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (mode === 'live' && (!key || key !== project.clientKey)) {
    return res.status(403).json({
      error: 'Only the client link can release the payment.',
    });
  }

  if (project.statusWord === 'PAID' || project.statusWord === 'VOIDED') {
    return res.status(409).json({
      error: 'This project is already finalized.',
    });
  }

  const authId = project.paypalAuthorizationId;
  if (!authId) {
    return res.status(409).json({
      error: 'No payment hold found. The client has not paid yet.',
    });
  }

  if (mode === 'live' && String(authId).startsWith('AUTH-SB-')) {
    return res.status(409).json({
      error: 'Simulated authorization cannot be captured in live PayPal mode.',
    });
  }

  const payout = calculateServerPayout(project);
  let amountToCapture = payout.recommendedUsd;

  if (customAmountUsd !== undefined && customAmountUsd !== null) {
    if (
      typeof customAmountUsd !== 'number' ||
      !Number.isFinite(customAmountUsd) ||
      customAmountUsd <= 0
    ) {
      return res.status(400).json({
        error: 'Custom release amount must be a positive number.',
      });
    }
    amountToCapture = Number(
      Math.min(project.amountUsd, customAmountUsd).toFixed(2)
    );
  }

  if (!(amountToCapture > 0)) {
    return res.status(400).json({
      error:
        'Recommended payout is $0. Cancel the hold instead, or choose an amount.',
    });
  }

  try {
    let captureId: string;

    if (mode === 'live') {
      const accessToken = await getPayPalAccessToken();
      const ppRes = await fetch(
        `${PAYPAL_API_BASE}/v2/payments/authorizations/${authId}/capture`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'PayPal-Request-Id': `capture-${project.id}-${authId}`,
          },
          body: JSON.stringify({
            amount: {
              currency_code: 'USD',
              value: amountToCapture.toFixed(2),
            },
            final_capture: true,
          }),
        }
      );
      const data = (await ppRes.json().catch(() => ({}))) as any;
      if (!ppRes.ok || !data?.id) {
        throw new Error(paypalErrorText(data, 'PayPal capture failed'));
      }
      captureId = data.id;
    } else {
      captureId = `CAP-SB-${crypto
        .randomBytes(5)
        .toString('hex')
        .toUpperCase()}`;
    }

    project.paypalCaptureId = captureId;
    project.paidAmountUsd = amountToCapture;
    project.step = 'DONE';
    project.statusWord = 'PAID';
    project.updatedAt = new Date().toISOString();
    writeDb(db);

    logSilentEvent(project.id, 'PAYMENT.CAPTURE.COMPLETED', {
      authorizationId: authId,
      captureId,
      amountUsd: amountToCapture,
      final_capture: true,
    });

    return res.json({
      project,
      captureId,
      paidAmountUsd: amountToCapture,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Failed to capture PayPal authorization.',
    });
  }
});

// 11. PayPal Void Authorization (Cancel & return 100% to Client)
app.post('/api/paypal/void', async (req, res) => {
  const mode = getPayPalMode();
  if (mode === 'unconfigured') {
    return res.status(503).json({ error: PAYPAL_UNCONFIGURED_MSG });
  }

  const { projectId, key } = req.body;

  const db = readDb();
  const project = db.projects.find((p) => p.id === projectId);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  if (mode === 'live' && (!key || key !== project.clientKey)) {
    return res.status(403).json({
      error: 'Only the client link can cancel the hold.',
    });
  }

  if (project.statusWord === 'PAID' || project.statusWord === 'VOIDED') {
    return res.status(409).json({
      error: 'This project is already finalized.',
    });
  }

  const authId = project.paypalAuthorizationId;
  if (!authId) {
    return res.status(409).json({
      error: 'No payment hold found. The client has not paid yet.',
    });
  }

  if (mode === 'live' && String(authId).startsWith('AUTH-SB-')) {
    return res.status(409).json({
      error: 'Simulated authorization cannot be voided in live PayPal mode.',
    });
  }

  try {
    if (mode === 'live') {
      const accessToken = await getPayPalAccessToken();
      const ppRes = await fetch(
        `${PAYPAL_API_BASE}/v2/payments/authorizations/${authId}/void`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
      if (ppRes.status !== 200 && ppRes.status !== 204 && !ppRes.ok) {
        const data = (await ppRes.json().catch(() => ({}))) as any;
        throw new Error(paypalErrorText(data, 'PayPal void failed'));
      }
    }

    project.paidAmountUsd = 0;
    project.step = 'DONE';
    project.statusWord = 'VOIDED';
    project.updatedAt = new Date().toISOString();
    writeDb(db);

    logSilentEvent(project.id, 'PAYMENT.AUTHORIZATION.VOIDED', {
      authorizationId: authId,
    });

    return res.json({ project });
  } catch (error: any) {
    return res.status(500).json({
      error: error?.message || 'Failed to void PayPal authorization.',
    });
  }
});

// 12. Simple Dispute ("SOMETHING WRONG?") - 5-line neutral Gemini summary + suggested payout
app.post('/api/projects/:id/dispute', async (req, res) => {
  const { id } = req.params;
  const { freelancerDisputeNote, clientDisputeNote, language } = req.body;
  const targetLanguage = getGeminiLanguageLabel(language);

  const db = readDb();
  const project = db.projects.find((p) => p.id === id);
  if (!project) {
    return res.status(404).json({ error: 'Project not found.' });
  }

  project.freelancerDisputeNote = String(freelancerDisputeNote || '');
  project.clientDisputeNote = String(clientDisputeNote || '');

  const payout = calculateServerPayout(project);

  try {
    const prompt = `Write a neutral, plain-language 5-line summary of this freelance dispute and suggest a fair payout in USD (between $0 and $${project.amountUsd}).
Write the summary in ${targetLanguage}.

Project: ${project.title} ($${project.amountUsd} USD)
Checklist pass rate: ${payout.recommendedPercent}% ($${payout.recommendedUsd})
Freelancer says: "${project.freelancerDisputeNote || 'Submitted work as agreed.'}"
Client says: "${project.clientDisputeNote || 'Some items need adjustment.'}"`;

    const disputeSchema = {
      type: Type.OBJECT,
      properties: {
        fiveLineSummary: {
          type: Type.STRING,
          description: 'Neutral 5-line summary in simple words',
        },
        suggestedUsd: {
          type: Type.NUMBER,
          description:
            'Suggested payout in USD (0 for full void, or partial amount)',
        },
      },
      required: ['fiveLineSummary', 'suggestedUsd'],
    };

    const parsed = await generateFastJson<{
      fiveLineSummary?: string;
      suggestedUsd?: number;
    }>(prompt, disputeSchema, 'Dispute Summary');
    project.disputeSummary =
      parsed.fiveLineSummary ||
      '1. Client held funds on PayPal before work began.\n2. Freelancer uploaded deliverables for checklist verification.\n3. Objective checklist items passed at ' +
        payout.recommendedPercent +
        '%.\n4. Both sides raised concerns regarding final adjustments.\n5. A proportional release of $' +
        payout.recommendedUsd +
        ' USD is fair.';
    project.disputeSuggestedUsd =
      typeof parsed.suggestedUsd === 'number'
        ? Math.max(
            0,
            Math.min(project.amountUsd, Math.round(parsed.suggestedUsd))
          )
        : payout.recommendedUsd;
  } catch (error: any) {
    console.error('[BHAROSA /api/projects/:id/dispute Error]:', error);
    project.disputeSummary = [
      `1. Client put $${project.amountUsd} USD on hold via PayPal.`,
      `2. Freelancer submitted work files for AI inspection.`,
      `3. ${payout.passCount} checklist items passed and ${payout.failCount} failed.`,
      `4. Freelancer note: "${project.freelancerDisputeNote || 'Work delivered.'}"`,
      `5. Suggested fair settlement: Release $${payout.recommendedUsd} USD to freelancer.`,
    ].join('\n');
    project.disputeSuggestedUsd = payout.recommendedUsd;
  } finally {
    project.updatedAt = new Date().toISOString();
    writeDb(db);
  }

  logSilentEvent(project.id, 'PROJECT.DISPUTE_SUMMARIZED', {
    disputeSuggestedUsd: project.disputeSuggestedUsd,
  });

  return res.json({ project });
});

// 13. PayPal Webhook Endpoint (/api/paypal/webhook) with Fail-Closed Signature Verification
app.post('/api/paypal/webhook', async (req, res) => {
  const mode = getPayPalMode();
  if (mode === 'unconfigured') {
    return res.status(503).json({ error: PAYPAL_UNCONFIGURED_MSG });
  }

  const event = req.body;
  const eventType = String(event?.event_type || '');
  const resource = event?.resource || {};

  if (mode === 'live') {
    const webhookId = (process.env.PAYPAL_WEBHOOK_ID || '').trim();
    if (!webhookId || webhookId === 'YOUR_PAYPAL_SANDBOX_WEBHOOK_ID') {
      return res.status(503).json({
        error: 'PAYPAL_WEBHOOK_ID is not configured on the server.',
      });
    }

    try {
      const accessToken = await getPayPalAccessToken();
      const verifyRes = await fetch(
        `${PAYPAL_API_BASE}/v1/notifications/verify-webhook-signature`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            auth_algo: req.headers['paypal-auth-algo'],
            cert_url: req.headers['paypal-cert-url'],
            transmission_id: req.headers['paypal-transmission-id'],
            transmission_sig: req.headers['paypal-transmission-sig'],
            transmission_time: req.headers['paypal-transmission-time'],
            webhook_id: webhookId,
            webhook_event: event,
          }),
        }
      );
      const verifyData = (await verifyRes.json().catch(() => ({}))) as {
        verification_status?: string;
      };
      if (!verifyRes.ok || verifyData.verification_status !== 'SUCCESS') {
        logSilentEvent(undefined, 'WEBHOOK.SIGNATURE_FAILED', verifyData);
        return res
          .status(400)
          .json({ error: 'Invalid PayPal webhook signature' });
      }
    } catch (err: any) {
      logSilentEvent(undefined, 'WEBHOOK.VERIFY_ERROR', {
        message: err?.message,
      });
      return res
        .status(500)
        .json({ error: 'Failed to verify PayPal webhook signature' });
    }
  }

  const db = readDb();
  const relatedIds = resource?.supplementary_data?.related_ids || {};
  const candidateAuthId = resource?.id || relatedIds.authorization_id;
  const candidateOrderId = relatedIds.order_id;
  const candidateCustomId = resource?.custom_id;

  const project = db.projects.find(
    (p) =>
      (candidateAuthId && p.paypalAuthorizationId === candidateAuthId) ||
      (candidateOrderId && p.paypalOrderId === candidateOrderId) ||
      (candidateCustomId && p.id === candidateCustomId)
  );

  if (
    project &&
    project.statusWord !== 'PAID' &&
    project.statusWord !== 'VOIDED'
  ) {
    if (eventType === 'PAYMENT.AUTHORIZATION.CREATED') {
      project.paypalAuthorizationId =
        resource.id || project.paypalAuthorizationId;
      project.authorizationCreatedAt =
        project.authorizationCreatedAt || new Date().toISOString();
      if (project.step === 'PAY') {
        project.step = 'WORK';
        project.statusWord = 'HELD';
      }
      project.updatedAt = new Date().toISOString();
      writeDb(db);
    } else if (eventType === 'PAYMENT.CAPTURE.COMPLETED') {
      project.paypalCaptureId = resource.id || project.paypalCaptureId;
      project.paidAmountUsd = Number(
        resource?.amount?.value || project.amountUsd
      );
      project.step = 'DONE';
      project.statusWord = 'PAID';
      project.updatedAt = new Date().toISOString();
      writeDb(db);
    } else if (eventType === 'PAYMENT.AUTHORIZATION.VOIDED') {
      project.paidAmountUsd = 0;
      project.step = 'DONE';
      project.statusWord = 'VOIDED';
      project.updatedAt = new Date().toISOString();
      writeDb(db);
    }
  }

  logSilentEvent(project?.id, eventType || 'PAYPAL.WEBHOOK', event);

  return res.json({ received: true });
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BHAROSA server running at http://localhost:${PORT}`);
  });
}

startServer();
