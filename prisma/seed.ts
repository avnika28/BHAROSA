import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'bharosa.db.json');

const demoProject = {
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
      reason: '3 distinct logo concept files verified.',
    },
    {
      id: 'chk-demo-2',
      text: 'High-resolution PNG files included',
      isSubjective: false,
      status: 'PASS',
      reason: 'High-resolution raster PNG files verified.',
    },
    {
      id: 'chk-demo-3',
      text: 'Editable vector SVG source files included',
      isSubjective: false,
      status: 'PASS',
      reason: 'Scalable vector SVG source files verified.',
    },
    {
      id: 'chk-demo-4',
      text: 'Up to 2 revision rounds included',
      isSubjective: false,
      status: 'PASS',
      reason: 'Revision notes v1 and v2 included in package.',
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

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

fs.writeFileSync(
  DB_FILE,
  JSON.stringify(
    {
      projects: [demoProject],
      events: [
        {
          id: 'evt-seed-1',
          projectId: demoProject.id,
          eventType: 'PROJECT.SEEDED',
          payloadJson: JSON.stringify({ title: demoProject.title, amountUsd: 200 }),
          createdAt: new Date().toISOString(),
        },
      ],
    },
    null,
    2
  ),
  'utf-8'
);

console.log('Seeded BHAROSA demo project:', demoProject.id);
console.log(`Freelancer Magic Link: /p/${demoProject.id}?k=${demoProject.freelancerKey}`);
console.log(`Client Magic Link:     /p/${demoProject.id}?k=${demoProject.clientKey}`);
