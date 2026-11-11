import React, { useEffect, useRef, useState } from 'react';
import {
  formatInrFromUsd,
  formatUsd,
  getFallbackChecklistForTemplate,
  JOB_TEMPLATES,
  JobTemplate,
  USD_INR_RATE,
} from './config';
import {
  createTranslator,
  getFaqsForLanguage,
  LanguageCode,
} from './i18n';
import {
  PayPalLogoMark,
  PayPalMode,
  PayPalOfficialButtons,
} from './components/PayPalOfficialButtons';
import { downloadProjectReceiptPdf } from './utils/receiptGenerator';
import {
  buildCompleteDemoDelivery,
  buildIncompleteDemoDelivery,
} from './data/demoSeed';

type ScreenId =
  | 'HOME'
  | 'NEW_PROJECT'
  | 'PROJECT'
  | 'MY_PROJECTS'
  | 'HOW_IT_WORKS'
  | 'HELP'
  | 'LOGIN';

type ProjectStep = 'PAY' | 'WORK' | 'CHECK' | 'DONE';
type UserRole = 'FREELANCER' | 'CLIENT';

interface DemoUser {
  name: string;
  email: string;
  role: UserRole;
}

interface ChecklistItemData {
  id: string;
  text: string;
  isSubjective: boolean;
  status: 'PENDING' | 'PASS' | 'FAIL' | 'ASK_HUMAN';
  reason?: string;
  clientDecision?: 'PASS' | 'FAIL';
}

interface DeliveryFileData {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  extractedText?: string;
  base64Data?: string;
}

interface ProjectData {
  id: string;
  title: string;
  brief: string;
  clientName: string;
  freelancerName?: string;
  amountUsd: number;
  deadline: string;
  step: ProjectStep;
  statusWord:
    | 'WAITING'
    | 'HELD'
    | 'CHECKING'
    | 'FIXES NEEDED'
    | 'PAID'
    | 'VOIDED';
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
  checklist: ChecklistItemData[];
  delivery?: {
    note: string;
    link: string;
    files: DeliveryFileData[];
    submittedAt: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface SavedLocalProjectRef {
  id: string;
  title: string;
  amountUsd: number;
  stepWord: 'PAY' | 'WORK' | 'CHECK' | 'PAID';
  freelancerKey: string;
  clientKey: string;
  updatedAt: string;
}

const LOCAL_PROJECTS_KEY = 'bharosa_saved_projects_v1';
const LOCAL_LANG_KEY = 'bharosa_lang_v2';
const LOCAL_DEMO_USER_KEY = 'bharosa_demo_user';

function loadSavedProjectsFromStorage(): SavedLocalProjectRef[] {
  try {
    const raw = localStorage.getItem(LOCAL_PROJECTS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProjectToStorage(project: ProjectData) {
  try {
    const current = loadSavedProjectsFromStorage();
    const stepWord = mapProjectToStepWord(project);
    const prevRef = current.find((p) => p.id === project.id);
    const entry: SavedLocalProjectRef = {
      id: project.id,
      title: project.title,
      amountUsd: project.amountUsd,
      stepWord,
      freelancerKey: project.freelancerKey || prevRef?.freelancerKey || '',
      clientKey: project.clientKey || prevRef?.clientKey || '',
      updatedAt: new Date().toISOString(),
    };
    const filtered = current.filter((p) => p.id !== project.id);
    localStorage.setItem(
      LOCAL_PROJECTS_KEY,
      JSON.stringify([entry, ...filtered].slice(0, 25))
    );
  } catch {
    // ignore storage errors
  }
}

function loadDemoUserFromStorage(): DemoUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_DEMO_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.name === 'string' &&
      typeof parsed.email === 'string' &&
      (parsed.role === 'FREELANCER' || parsed.role === 'CLIENT')
    ) {
      return {
        name: parsed.name,
        email: parsed.email,
        role: parsed.role,
      };
    }
    return null;
  } catch {
    return null;
  }
}

function saveDemoUserToStorage(user: DemoUser | null) {
  try {
    if (!user) {
      localStorage.removeItem(LOCAL_DEMO_USER_KEY);
    } else {
      localStorage.setItem(LOCAL_DEMO_USER_KEY, JSON.stringify(user));
    }
  } catch {
    // ignore storage errors
  }
}

function mapProjectToStepWord(
  project: ProjectData
): 'PAY' | 'WORK' | 'CHECK' | 'PAID' {
  if (project.step === 'DONE' || project.statusWord === 'PAID') return 'PAID';
  if (project.step === 'CHECK') return 'CHECK';
  if (project.step === 'WORK') return 'WORK';
  return 'PAY';
}

function safeCopyToClipboard(text: string) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  } catch {
    // ignore
  }
}

// ============================================================================
// CUSTOM HAND-DRAWN SVG TOUCHES & LINE ICONS
// ============================================================================

const PaperGrainOverlay: React.FC = () => (
  <svg
    aria-hidden="true"
    className="pointer-events-none fixed inset-0 z-50 h-full w-full opacity-[0.04]"
  >
    <filter id="bharosa-paper-grain">
      <feTurbulence
        type="fractalNoise"
        baseFrequency="0.82"
        numOctaves="3"
        stitchTiles="stitch"
      />
    </filter>
    <rect width="100%" height="100%" filter="url(#bharosa-paper-grain)" />
  </svg>
);

const TruckArtJhalarStrip: React.FC = () => (
  <div className="w-full overflow-hidden border-b-2 border-[#08090B] bg-[#FAF8F3] py-1">
    <svg
      viewBox="0 0 1200 18"
      preserveAspectRatio="none"
      className="w-full h-3.5 text-[#08090B]"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M0 3 L20 15 L40 3 L60 15 L80 3 L100 15 L120 3 L140 15 L160 3 L180 15 L200 3 L220 15 L240 3 L260 15 L280 3 L300 15 L320 3 L340 15 L360 3 L380 15 L400 3 L420 15 L440 3 L460 15 L480 3 L500 15 L520 3 L540 15 L560 3 L580 15 L600 3 L620 15 L640 3 L660 15 L680 3 L700 15 L720 3 L740 15 L760 3 L780 15 L800 3 L820 15 L840 3 L860 15 L880 3 L900 15 L920 3 L940 15 L960 3 L980 15 L1000 3 L1020 15 L1040 3 L1060 15 L1080 3 L1100 15 L1120 3 L1140 15 L1160 3 L1180 15 L1200 3"
        stroke="#08090B"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="60" cy="7" r="2.2" fill="#FF9933" />
      <circle cx="180" cy="7" r="2.2" fill="#CDF22B" />
      <circle cx="300" cy="7" r="2.2" fill="#FFC900" />
      <circle cx="420" cy="7" r="2.2" fill="#FF9933" />
      <circle cx="540" cy="7" r="2.2" fill="#CDF22B" />
      <circle cx="660" cy="7" r="2.2" fill="#FFC900" />
      <circle cx="780" cy="7" r="2.2" fill="#FF9933" />
      <circle cx="900" cy="7" r="2.2" fill="#CDF22B" />
      <circle cx="1020" cy="7" r="2.2" fill="#FFC900" />
      <circle cx="1140" cy="7" r="2.2" fill="#FF9933" />
    </svg>
  </div>
);

const RangoliCornerOrnament: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    className={`w-12 h-12 text-[#08090B] pointer-events-none ${className}`}
    aria-hidden="true"
  >
    <path
      d="M6 6 C22 6, 34 18, 34 34 C18 34, 6 22, 6 6 Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6 22 C16 22, 22 28, 22 38"
      stroke="#FF9933"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle
      cx="14"
      cy="14"
      r="2.5"
      fill="#CDF22B"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="38" cy="10" r="2" fill="#FFC900" />
    <circle cx="10" cy="38" r="2" fill="#FFC900" />
  </svg>
);

const SquigglyUnderline: React.FC<{ color?: string }> = ({
  color = '#CDF22B',
}) => (
  <svg
    viewBox="0 0 220 16"
    fill="none"
    preserveAspectRatio="none"
    className="w-full h-3.5 mt-0.5 overflow-visible"
    aria-hidden="true"
  >
    <path
      d="M3 10.5 C32 3.5, 58 14.5, 92 7.5 C124 2.5, 156 14, 188 6.5 C201 4.5, 211 9.5, 217 8"
      stroke={color}
      strokeWidth="4.5"
      strokeLinecap="round"
    />
    <path
      d="M4 11.5 C34 4.5, 60 14, 94 8 C126 3.5, 158 13.5, 216 8.5"
      stroke="#08090B"
      strokeWidth="1.8"
      strokeLinecap="round"
    />
  </svg>
);

const HeadlineWithSquiggle: React.FC<{
  text: string;
  className?: string;
  squiggleColor?: string;
}> = ({ text, className = '', squiggleColor = '#CDF22B' }) => {
  const words = String(text || '')
    .trim()
    .split(/\s+/);
  if (words.length <= 1) {
    return (
      <h1 className={className}>
        <span className="relative inline-block">
          {text}
          <SquigglyUnderline color={squiggleColor} />
        </span>
      </h1>
    );
  }
  const lastWord = words[words.length - 1];
  const leading = words.slice(0, -1).join(' ');

  return (
    <h1 className={className}>
      {leading}{' '}
      <span className="relative inline-block">
        <span>{lastWord}</span>
        <SquigglyUnderline color={squiggleColor} />
      </span>
    </h1>
  );
};

const HandDrawnCircle: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div className="relative inline-block px-5 py-2">
    <svg
      viewBox="0 0 260 110"
      fill="none"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-0 w-full h-full overflow-visible"
      aria-hidden="true"
    >
      <path
        d="M18 52 C14 19, 76 7, 136 8 C202 9, 248 24, 246 56 C244 88, 189 102, 124 101 C58 100, 12 83, 16 49 C18 33, 42 19, 74 15"
        stroke="#FFC900"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M16 54 C12 20, 78 8, 138 9 C204 10, 246 26, 244 57 C242 87, 187 101, 122 100 C56 99, 14 82, 18 48"
        stroke="#08090B"
        strokeWidth="2.2"
        strokeLinecap="round"
      />
    </svg>
    <div className="relative z-10">{children}</div>
  </div>
);

const HandDrawnCurvedArrow: React.FC<{ className?: string }> = ({
  className = '',
}) => (
  <svg
    viewBox="0 0 68 42"
    fill="none"
    className={`w-14 h-9 text-[#08090B] shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M4 8 C18 34, 40 34, 59 20"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
    />
    <path
      d="M49 16 L61 19 L54 30"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const NoLoginSticker: React.FC<{ text: string; className?: string }> = ({
  text,
  className = '',
}) => (
  <span
    className={`inline-block -rotate-3 bg-[#FFC900] text-[#08090B] border-2 border-[#08090B] px-3.5 py-1 rounded-[10px] font-hand text-base md:text-lg font-bold select-none ${className}`}
    style={{ boxShadow: '3px 3px 0 #08090B' }}
  >
    {text}
  </span>
);

const SketchSpinner: React.FC = () => (
  <svg
    className="w-4 h-4 animate-spin text-[#08090B] shrink-0"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M12 3C7.03 3 3 7.03 3 12C3 14.8 4.28 17.3 6.29 18.95"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
    />
  </svg>
);

// Custom rough hand-drawn navigation & UI line icons
const SketchHomeIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M3.5 10.8 L12 3.6 L20.5 10.8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.2 9.8 V19.6 C6.2 20.1 6.6 20.4 7.2 20.4 H16.8 C17.4 20.4 17.8 20 17.8 19.5 V9.8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SketchPlusIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M12 4.5 C17 4.3, 19.8 7.5, 19.6 12.2 C19.4 16.9, 16.4 19.8, 11.8 19.6 C7.2 19.4, 4.3 16.6, 4.5 11.9 C4.7 7.2, 7.6 4.7, 12 4.5 Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <path
      d="M12 8.5 V15.5 M8.5 12 H15.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const SketchFolderIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M3.8 7.2 C3.8 6.3, 4.4 5.8, 5.3 5.8 H9.6 L11.5 8.1 H18.8 C19.6 8.1, 20.2 8.7, 20.1 9.6 L19.7 18.2 C19.6 19.1, 19 19.6, 18.1 19.6 H5.4 C4.5 19.6, 3.9 19, 3.9 18.1 Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SketchHelpIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M9.6 9.2 C9.9 7.5, 11.6 6.8, 13.2 7.3 C14.8 7.8, 15.3 9.5, 14.2 10.7 C13.2 11.8, 12.1 12.2, 12 13.8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <circle cx="12" cy="17.3" r="1.2" fill="currentColor" />
  </svg>
);

const SketchUserIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <circle
      cx="12"
      cy="8.5"
      r="3.8"
      stroke="currentColor"
      strokeWidth="2"
    />
    <path
      d="M5 19.5 C6.2 15.8, 9 14.4, 12 14.4 C15 14.4, 17.8 15.8, 19 19.5"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const SketchCheckIcon: React.FC<{ className?: string }> = ({
  className = 'w-4 h-4',
}) => (
  <svg viewBox="0 0 24 24" fill="none" className={className}>
    <path
      d="M4.5 12.5 L9.8 17.8 L19.5 6.8"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SketchChevronIcon: React.FC<{ open?: boolean }> = ({ open }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    className={`w-5 h-5 text-[#08090B] shrink-0 transition-transform ${
      open ? 'rotate-180' : ''
    }`}
  >
    <path
      d="M6 9.5 L12.1 15.3 L18 9.4"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Small underlined "what's this?" link next to money terms
 */
const MoneyInfoTooltip: React.FC<{ text: string; label: string }> = ({
  text,
  label,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline-flex items-center ml-2 align-baseline">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        className="studio-label text-[#8A8780] hover:text-[#08090B] underline decoration-wavy decoration-[#08090B]/50 underline-offset-4 cursor-pointer select-none"
      >
        {label}
      </button>
      {open && (
        <span
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2.5 w-64 p-3.5 rounded-[10px] bg-[#FAF8F3] text-[#08090B] border-2 border-[#08090B] font-body text-xs font-normal leading-relaxed z-50 text-left pointer-events-none"
          style={{ boxShadow: '4px 4px 0 #08090B' }}
        >
          {text}
        </span>
      )}
    </span>
  );
};

/**
 * Deterministic payout calculation in code:
 * pass / (pass + fail), with ASK_HUMAN items excluded and routed to the client.
 */
function computeClientSidePayout(project: ProjectData): {
  passCount: number;
  failCount: number;
  askHumanCount: number;
  percent: number;
  usd: number;
} {
  let passCount = 0;
  let failCount = 0;
  let askHumanCount = 0;

  for (const item of project.checklist) {
    const effective = item.clientDecision || item.status;
    if (effective === 'PASS') passCount++;
    else if (effective === 'FAIL') failCount++;
    else askHumanCount++;
  }

  const denom = passCount + failCount;
  const ratio = denom > 0 ? passCount / denom : 1;
  const percent = Math.round(ratio * 100);
  const usd = Number(((project.amountUsd * percent) / 100).toFixed(2));

  return { passCount, failCount, askHumanCount, percent, usd };
}

async function readClientFile(file: File): Promise<DeliveryFileData> {
  const id = `file_${Math.random().toString(36).slice(2, 8)}`;
  const isRasterImage =
    file.type.startsWith('image/') && file.type !== 'image/svg+xml';

  if (isRasterImage) {
    const base64Data = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.readAsDataURL(file);
    });
    return {
      id,
      name: file.name,
      mimeType: file.type || 'image/png',
      sizeBytes: file.size,
      base64Data,
    };
  }

  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.readAsDataURL(file);
  });
  const text = await file.text().catch(() => '');

  return {
    id,
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    extractedText: text.slice(0, 2500),
    base64Data,
  };
}

export default function App() {
  // Default language = English ('en'). Saved to localStorage and applied immediately everywhere.
  const [lang, setLang] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_LANG_KEY) as LanguageCode | null;
      return saved === 'en' || saved === 'hi' || saved === 'hinglish'
        ? saved
        : 'en';
    } catch {
      return 'en';
    }
  });

  // Translator function t("key") with strict fallback to English ('en')
  const t = createTranslator(lang);
  const faqs = getFaqsForLanguage(lang);

  // Demo Session loaded on app start from localStorage key "bharosa_demo_user"
  const [demoUser, setDemoUser] = useState<DemoUser | null>(() =>
    loadDemoUserFromStorage()
  );

  // Demo Login screen (/login) form state
  const [loginRole, setLoginRole] = useState<UserRole>(() => {
    const existing = loadDemoUserFromStorage();
    return existing ? existing.role : 'FREELANCER';
  });
  const [loginName, setLoginName] = useState(() => {
    const existing = loadDemoUserFromStorage();
    return existing ? existing.name : '';
  });
  const [loginEmail, setLoginEmail] = useState(() => {
    const existing = loadDemoUserFromStorage();
    return existing ? existing.email : '';
  });
  const [loginError, setLoginError] = useState<string | null>(null);

  const [screen, setScreen] = useState<ScreenId>('HOME');
  const [paypalClientId, setPaypalClientId] = useState<string>('');
  const [paypalMode, setPaypalMode] = useState<PayPalMode>('loading');
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
    }, 6500);
  };

  // Active Project & Magic Key state
  const [project, setProject] = useState<ProjectData | null>(null);
  const [activeKey, setActiveKey] = useState<string>('');
  const [role, setRole] = useState<'FREELANCER' | 'CLIENT'>('CLIENT');
  const [isAuthExpired, setIsAuthExpired] = useState(false);

  // Screen 2: NEW PROJECT state
  const [newStage, setNewStage] = useState<'FORM' | 'CHECKLIST' | 'SHARE'>(
    'FORM'
  );
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<JobTemplate['id']>('logo');
  const [jobText, setJobText] = useState(
    () => JOB_TEMPLATES[0].defaultTextByLang[lang] || JOB_TEMPLATES[0].defaultText
  );
  const [amountUsdInput, setAmountUsdInput] = useState('200');
  const [deadlineInput, setDeadlineInput] = useState('2026-11-20');
  const [freelancerNameInput, setFreelancerNameInput] = useState(() => {
    const existing = loadDemoUserFromStorage();
    return existing && existing.role === 'FREELANCER' ? existing.name : '';
  });
  const [clientNameInput, setClientNameInput] = useState('Alex Rivera');
  const [isGeneratingChecklist, setIsGeneratingChecklist] = useState(false);
  const [draftChecklist, setDraftChecklist] = useState<
    Array<{ text: string; isSubjective: boolean }>
  >([]);
  const [newPointInput, setNewPointInput] = useState('');
  const [isSavingProject, setIsSavingProject] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Screen 3: WORK step inputs (preloaded with sample files so 1-click submit works immediately)
  const [workFiles, setWorkFiles] = useState<DeliveryFileData[]>(() =>
    buildCompleteDemoDelivery().files
  );
  const [workLink, setWorkLink] = useState('');
  const [workNote, setWorkNote] = useState(
    'Delivered all 3 logo concepts in high-resolution PNG and editable vector SVG formats.'
  );
  const [samplePreset, setSamplePreset] = useState<
    'COMPLETE' | 'INCOMPLETE' | undefined
  >(undefined);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Screen 3: CHECK step states & Confirmation Modal before releasing money
  const [isReleasing, setIsReleasing] = useState(false);
  const [confirmReleaseAmount, setConfirmReleaseAmount] = useState<
    number | null
  >(null);
  const [showFixBox, setShowFixBox] = useState(false);
  const [fixMessageInput, setFixMessageInput] = useState('');
  const [showDisputeBox, setShowDisputeBox] = useState(false);
  const [freelancerDisputeInput, setFreelancerDisputeInput] = useState('');
  const [clientDisputeInput, setClientDisputeInput] = useState('');
  const [isSummarizingDispute, setIsSummarizingDispute] = useState(false);

  // MY PROJECTS list
  const [myProjects, setMyProjects] = useState<SavedLocalProjectRef[]>(() =>
    loadSavedProjectsFromStorage()
  );

  // HELP screen expandable FAQ state
  const [openFaqIdx, setOpenFaqIdx] = useState<number | null>(0);

  const changeLanguage = (next: LanguageCode) => {
    const matchingTemplate = JOB_TEMPLATES.find(
      (tpl) =>
        tpl.defaultTextByLang.en === jobText ||
        tpl.defaultTextByLang.hi === jobText ||
        tpl.defaultTextByLang.hinglish === jobText
    );
    if (matchingTemplate) {
      setJobText(
        matchingTemplate.defaultTextByLang[next] ||
          matchingTemplate.defaultTextByLang.en
      );
    }

    setLang(next);
    try {
      localStorage.setItem(LOCAL_LANG_KEY, next);
    } catch {
      // ignore
    }
  };

  // Sync projects list from localStorage and server
  const refreshProjectsList = async () => {
    const localList = loadSavedProjectsFromStorage();
    setMyProjects(localList);
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        const serverProjects: ProjectData[] = Array.isArray(data.projects)
          ? data.projects
          : [];
        const mergedMap = new Map<string, SavedLocalProjectRef>();
        for (const sp of serverProjects) {
          const localMatch = localList.find((lp) => lp.id === sp.id);
          mergedMap.set(sp.id, {
            id: sp.id,
            title: sp.title,
            amountUsd: sp.amountUsd,
            stepWord: mapProjectToStepWord(sp),
            freelancerKey: sp.freelancerKey || localMatch?.freelancerKey || '',
            clientKey: sp.clientKey || localMatch?.clientKey || '',
            updatedAt: sp.updatedAt || new Date().toISOString(),
          });
        }
        for (const lp of localList) {
          if (!mergedMap.has(lp.id)) {
            mergedMap.set(lp.id, lp);
          }
        }
        setMyProjects(Array.from(mergedMap.values()));
      }
    } catch {
      // fallback to localStorage
    }
  };

  // Load project from Magic Link `/p/{id}?k={key}`
  const openProjectByIdAndKey = async (
    projectId: string,
    key = '',
    pushUrl = true,
    explicitRole?: 'FREELANCER' | 'CLIENT'
  ) => {
    setErrorBanner(null);
    try {
      const res = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}?k=${encodeURIComponent(
          key
        )}`
      );
      if (!res.ok) {
        throw new Error(t('errFindProjectLink'));
      }
      const data = await res.json();
      const loaded: ProjectData = data.project;

      const localSaved = loadSavedProjectsFromStorage().find(
        (p) => p.id === loaded.id
      );
      if (!loaded.clientKey && localSaved?.clientKey) {
        loaded.clientKey = localSaved.clientKey;
      }
      if (!loaded.freelancerKey && localSaved?.freelancerKey) {
        loaded.freelancerKey = localSaved.freelancerKey;
      }

      setProject(loaded);
      const targetRole: 'FREELANCER' | 'CLIENT' =
        explicitRole ||
        (key && key === loaded.clientKey
          ? 'CLIENT'
          : key && key === loaded.freelancerKey
          ? 'FREELANCER'
          : demoUser
          ? demoUser.role
          : data.role || 'CLIENT');

      setRole(targetRole);
      const effectiveKey =
        key ||
        (targetRole === 'FREELANCER'
          ? loaded.freelancerKey || loaded.clientKey
          : loaded.clientKey || loaded.freelancerKey);
      setActiveKey(effectiveKey);

      setIsAuthExpired(Boolean(data.isAuthorizationExpired));
      setFreelancerDisputeInput(loaded.freelancerDisputeNote || '');
      setClientDisputeInput(loaded.clientDisputeNote || '');
      saveProjectToStorage(loaded);
      refreshProjectsList();
      setScreen('PROJECT');

      if (pushUrl) {
        const nextUrl = `/p/${encodeURIComponent(
          projectId
        )}?k=${encodeURIComponent(effectiveKey)}`;
        window.history.pushState({}, '', nextUrl);
      }
    } catch (err: any) {
      setErrorBanner(err?.message || t('errLoadProject'));
    }
  };

  // Check `/api/health` with 6-second timeout and offline detection
  const checkPaymentHealth = async () => {
    setPaypalMode('loading');
    let settled = false;
    const timeoutId = window.setTimeout(() => {
      if (!settled) {
        settled = true;
        setPaypalMode((prev) => (prev === 'loading' ? 'offline' : prev));
      }
    }, 6000);

    try {
      const res = await fetch('/api/health');
      if (!res.ok) {
        throw new Error(`Health check failed (${res.status})`);
      }
      const d = await res.json();
      if (!d || d.status !== 'ok') {
        throw new Error('Invalid health check payload');
      }
      if (!settled) {
        settled = true;
        window.clearTimeout(timeoutId);
        setPaypalClientId(
          typeof d.paypalClientId === 'string' ? d.paypalClientId : ''
        );
        const mode: PayPalMode =
          d.paypalMode === 'live' ||
          d.paypalMode === 'mock' ||
          d.paypalMode === 'unconfigured'
            ? d.paypalMode
            : 'unconfigured';
        setPaypalMode(mode);
      }
    } catch {
      if (!settled) {
        settled = true;
        window.clearTimeout(timeoutId);
        setPaypalMode('offline');
      }
    }
  };

  // Initial load: check `/api/health` and URL route (`/login` or `/p/{id}?k={key}`)
  useEffect(() => {
    checkPaymentHealth();
    refreshProjectsList();

    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    if (path === '/login') {
      setScreen('LOGIN');
    } else {
      const match = path.match(/^\/p\/([^/]+)/);
      if (match) {
        const pid = decodeURIComponent(match[1]);
        const k = params.get('k') || '';
        openProjectByIdAndKey(pid, k, false);
      }
    }

    const handlePopState = () => {
      const p = window.location.pathname;
      const prm = new URLSearchParams(window.location.search);
      if (p === '/login') {
        setScreen('LOGIN');
        return;
      }
      const m = p.match(/^\/p\/([^/]+)/);
      if (m) {
        openProjectByIdAndKey(
          decodeURIComponent(m[1]),
          prm.get('k') || '',
          false
        );
      } else {
        setScreen('HOME');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle Demo Login Continue button
  const handleDemoLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedName = loginName.trim();
    const trimmedEmail = loginEmail.trim();

    if (!trimmedName || !trimmedEmail || !trimmedEmail.includes('@')) {
      setLoginError(t('errEnterNameEmail'));
      return;
    }

    const user: DemoUser = {
      name: trimmedName,
      email: trimmedEmail,
      role: loginRole,
    };

    setDemoUser(user);
    saveDemoUserToStorage(user);

    if (user.role === 'FREELANCER') {
      setFreelancerNameInput(user.name);
    }

    navigateTo('HOME');
  };

  // Handle Demo Log out button
  const handleDemoLogout = () => {
    setDemoUser(null);
    saveDemoUserToStorage(null);
    navigateTo('HOME');
  };

  // Load Demo Project ("TRY DEMO")
  const handleTryDemo = async () => {
    setErrorBanner(null);
    try {
      const res = await fetch('/api/projects/demo', { method: 'POST' });
      const data = await res.json();
      const demoProj: ProjectData = data.project;
      setWorkFiles(buildCompleteDemoDelivery().files);
      setWorkNote(
        'Uploaded all 3 college fest logo concepts in PNG and vector SVG formats.'
      );
      setSamplePreset('COMPLETE');
      await openProjectByIdAndKey(demoProj.id, demoProj.clientKey, true);
    } catch {
      setErrorBanner(t('errStartDemo'));
    }
  };

  // Safe JSON fence stripper & parser
  const parseJsonSafely = <T,>(rawText: string): T => {
    const cleaned = String(rawText || '')
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    if (!cleaned) {
      throw new Error('Empty response text from server');
    }
    return JSON.parse(cleaned) as T;
  };

  // Screen 2A: Click CONTINUE -> Generate 3-5 simple checklist points via Gemini in active language
  const handleGenerateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedBrief = jobText.trim();
    if (!trimmedBrief) {
      setErrorBanner(t('errDescribeJobFirst'));
      return;
    }

    setIsGeneratingChecklist(true);
    setErrorBanner(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const res = await fetch('/api/gemini/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: trimmedBrief,
          amountUsd: Number(amountUsdInput) || 200,
          language: lang,
        }),
        signal: controller.signal,
      });

      const rawText = await res.text();
      const data = parseJsonSafely<{
        checklist?: string[];
        items?: Array<{ text: string; isSubjective: boolean }>;
        error?: string;
      }>(rawText);

      if (!res.ok) {
        throw new Error(data.error || `Gemini checklist failed (${res.status})`);
      }

      if (Array.isArray(data.checklist) && data.checklist.length > 0) {
        const mapped = data.checklist
          .map((line) => String(line || '').trim())
          .filter((line) => line.length > 0)
          .slice(0, 5)
          .map((text) => ({
            text,
            isSubjective: /looks good|quality|vibe|style|taste|aesthetic/i.test(
              text
            ),
          }));

        if (mapped.length === 0) {
          throw new Error('Parsed checklist had 0 valid items');
        }
        setDraftChecklist(mapped);
      } else if (Array.isArray(data.items) && data.items.length > 0) {
        setDraftChecklist(data.items.slice(0, 5));
      } else {
        throw new Error('Invalid checklist response structure');
      }

      setNewStage('CHECKLIST');
    } catch (err: any) {
      console.error('Gemini checklist generation error:', err);

      const fallbackChecklist = getFallbackChecklistForTemplate(
        selectedTemplateId,
        trimmedBrief,
        lang
      );
      setDraftChecklist(fallbackChecklist);
      showToast(t('toastAiBusyChecklist'));
      setNewStage('CHECKLIST');
    } finally {
      window.clearTimeout(timeoutId);
      setIsGeneratingChecklist(false);
    }
  };

  // Screen 2B: Click "LOOKS GOOD" -> Create Project & Magic Links on Server
  const handleCreateProject = async () => {
    setIsSavingProject(true);
    setErrorBanner(null);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: jobText.trim().slice(0, 80),
          brief: jobText.trim(),
          clientName: clientNameInput.trim() || 'Client',
          freelancerName:
            freelancerNameInput.trim() ||
            (demoUser?.role === 'FREELANCER' ? demoUser.name : undefined),
          amountUsd: Math.max(1, Number(amountUsdInput) || 100),
          deadline: deadlineInput || '2026-11-25',
          checklist: draftChecklist.filter((c) => c.text.trim().length > 0),
        }),
      });
      if (!res.ok) throw new Error(t('errSaveProject'));
      const data = await res.json();
      const created: ProjectData = data.project;
      setProject(created);
      setActiveKey(created.freelancerKey);
      setRole('FREELANCER');
      saveProjectToStorage(created);
      refreshProjectsList();
      setNewStage('SHARE');
    } catch (err: any) {
      console.error('Create project error:', err);
      setErrorBanner(err?.message || t('errSaveProject'));
    } finally {
      setIsSavingProject(false);
    }
  };

  // Screen 3 (WORK): Handle File Drop / Upload
  const handleFilesSelected = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const uploaded: DeliveryFileData[] = [];
    for (let i = 0; i < list.length; i++) {
      uploaded.push(await readClientFile(list[i]));
    }
    setSamplePreset(undefined);
    setWorkFiles((prev) => [...prev, ...uploaded]);
  };

  // Screen 3 (WORK): Click "SUBMIT WORK" -> AI Review (CHECK) in active language
  const handleSubmitWork = async () => {
    if (!project) return;
    setIsSubmittingWork(true);
    setErrorBanner(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const filesToSend =
        workFiles.length > 0 ? workFiles : buildCompleteDemoDelivery().files;
      const res = await fetch(`/api/projects/${project.id}/submit-work`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: workNote,
          link: workLink,
          files: filesToSend,
          samplePreset,
          language: lang,
        }),
        signal: controller.signal,
      });

      const rawText = await res.text();
      const data = parseJsonSafely<{
        project?: ProjectData;
        usedFallback?: boolean;
        aiError?: string;
        error?: string;
      }>(rawText);

      if (!res.ok || !data.project) {
        throw new Error(data.error || `AI Review failed (${res.status})`);
      }

      if (data.usedFallback) {
        console.error('AI Review (CHECK) server fallback error:', data.aiError);
        showToast(t('toastAiBusyReview'));
      }

      setProject(data.project);
      saveProjectToStorage(data.project);
      refreshProjectsList();
    } catch (err: any) {
      console.error('AI Review (CHECK) error:', err);

      const fallbackChecklist: ChecklistItemData[] = project.checklist.map(
        (item) => {
          if (
            item.isSubjective ||
            /looks good|quality|vibe|style|taste|aesthetic/i.test(item.text)
          ) {
            return {
              ...item,
              status: 'ASK_HUMAN',
              clientDecision: undefined,
              reason: t('defaultCheckedReason'),
            };
          }
          return {
            ...item,
            status: 'PASS',
            clientDecision: undefined,
            reason: t('defaultCheckedReason'),
          };
        }
      );

      const fallbackProject: ProjectData = {
        ...project,
        step: 'CHECK',
        statusWord: 'CHECKING',
        checklist: fallbackChecklist,
      };

      setProject(fallbackProject);
      saveProjectToStorage(fallbackProject);
      showToast(t('toastAiBusyReview'));

      fetch(`/api/projects/${project.id}/step`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: 'CHECK' }),
      })
        .then(() => refreshProjectsList())
        .catch(() => {});
    } finally {
      window.clearTimeout(timeoutId);
      setIsSubmittingWork(false);
    }
  };

  // Screen 3 (CHECK): Click any checklist status badge to toggle PASS / FAIL
  const handleToggleHumanItem = async (item: ChecklistItemData) => {
    if (!project) return;
    const current = item.clientDecision || item.status;
    const nextDecision: 'PASS' | 'FAIL' = current === 'PASS' ? 'FAIL' : 'PASS';

    try {
      const res = await fetch(
        `/api/projects/${project.id}/client-item-decision`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            itemId: item.id,
            decision: nextDecision,
          }),
        }
      );
      const data = await res.json();
      if (data.project) {
        setProject(data.project);
        saveProjectToStorage(data.project);
      }
    } catch {
      // ignore
    }
  };

  // Screen 3 (CHECK): Execute Release Money after Confirmation Modal -> POST /api/paypal/capture
  const executeConfirmedRelease = async () => {
    if (!project || confirmReleaseAmount === null) return;
    const amountToCapture = confirmReleaseAmount;
    setConfirmReleaseAmount(null);
    setIsReleasing(true);
    setErrorBanner(null);

    try {
      const res = await fetch('/api/paypal/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          key: project.clientKey || activeKey,
          customAmountUsd: amountToCapture,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('errReleasePayment'));
      }
      setProject(data.project);
      saveProjectToStorage(data.project);
      refreshProjectsList();
    } catch (err: any) {
      setErrorBanner(err?.message || t('errReleasePayment'));
    } finally {
      setIsReleasing(false);
    }
  };

  // Screen 3 (CHECK): Click "ASK FOR FIXES"
  const handleSendFixRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;
    setErrorBanner(null);

    try {
      const res = await fetch(`/api/projects/${project.id}/ask-fixes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fixNote: fixMessageInput,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('errFixRequest'));
      }
      setProject(data.project);
      saveProjectToStorage(data.project);
      setShowFixBox(false);
      setFixMessageInput('');
      refreshProjectsList();
    } catch (err: any) {
      setErrorBanner(err?.message || t('errFixRequest'));
    }
  };

  // Screen 3 (CHECK): Dispute 5-Line Summary in active language
  const handleGenerateDisputeSummary = async () => {
    if (!project) return;
    setIsSummarizingDispute(true);
    setErrorBanner(null);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const res = await fetch(`/api/projects/${project.id}/dispute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          freelancerDisputeNote: freelancerDisputeInput,
          clientDisputeNote: clientDisputeInput,
          language: lang,
        }),
        signal: controller.signal,
      });
      const rawText = await res.text();
      const data = parseJsonSafely<{ project?: ProjectData; error?: string }>(
        rawText
      );
      if (!res.ok || !data.project) {
        throw new Error(data.error || 'Could not generate dispute summary');
      }
      setProject(data.project);
      saveProjectToStorage(data.project);
    } catch (err: any) {
      console.error('Gemini dispute summary error:', err);
      const payout = computeClientSidePayout(project);
      setProject({
        ...project,
        freelancerDisputeNote: freelancerDisputeInput,
        clientDisputeNote: clientDisputeInput,
        disputeSummary: [
          `1. Client put $${project.amountUsd} USD on hold via PayPal.`,
          `2. Freelancer submitted work files for review.`,
          `3. ${payout.passCount} checklist items passed and ${payout.failCount} failed.`,
          `4. Freelancer note: "${freelancerDisputeInput || 'Work delivered.'}"`,
          `5. Suggested fair settlement: Release $${payout.usd} USD to freelancer.`,
        ].join('\n'),
        disputeSuggestedUsd: payout.usd,
      });
      showToast(t('toastAiBusyChecklist'));
    } finally {
      window.clearTimeout(timeoutId);
      setIsSummarizingDispute(false);
    }
  };

  // Screen 3 (CHECK): Void Authorization
  const handleVoidHold = async () => {
    if (!project) return;
    setIsReleasing(true);
    setErrorBanner(null);

    try {
      const res = await fetch('/api/paypal/void', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          key: project.clientKey || activeKey,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || t('errCancelHold'));
      }
      setProject(data.project);
      saveProjectToStorage(data.project);
      refreshProjectsList();
    } catch (err: any) {
      setErrorBanner(err?.message || t('errCancelHold'));
    } finally {
      setIsReleasing(false);
    }
  };

  // Step bar click handler
  const handleStepBarClick = async (nextStep: ProjectStep) => {
    if (!project) return;
    const updated: ProjectData = { ...project, step: nextStep };
    setProject(updated);
    saveProjectToStorage(updated);
    try {
      await fetch(`/api/projects/${project.id}/step`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ step: nextStep }),
      });
      refreshProjectsList();
    } catch {
      // ignore
    }
  };

  // Build Magic URLs
  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : 'http://localhost:3000';
  const clientMagicFullUrl = project
    ? `${origin}/p/${project.id}?k=${project.clientKey}`
    : '';
  const freelancerMagicFullUrl = project
    ? `${origin}/p/${project.id}?k=${project.freelancerKey}`
    : '';
  const whatsappShareHref = project
    ? `https://wa.me/?text=${encodeURIComponent(
        `Hi ${project.clientName}, here is our Bharosa escrow link for "${project.title}" ($${project.amountUsd} USD). Your money stays safely on hold with PayPal until the work is done: ${clientMagicFullUrl}`
      )}`
    : 'https://wa.me/';

  const payoutInfo = project
    ? computeClientSidePayout(project)
    : { passCount: 0, failCount: 0, askHumanCount: 0, percent: 100, usd: 0 };

  // One plain-language line at the top of each page telling the user what to do next
  const getTopNextActionLine = (): string => {
    if (screen === 'LOGIN') return t('demoLoginNoPassword');
    if (screen === 'HOME') return t('topLineHome');
    if (screen === 'NEW_PROJECT') {
      if (newStage === 'FORM') return t('newProjectHint');
      if (newStage === 'CHECKLIST') return t('topLineNewProjectChecklist');
      return t('topLineNewProjectShare');
    }
    if (screen === 'MY_PROJECTS') return t('topLineMyProjects');
    if (screen === 'HOW_IT_WORKS') return t('topLineHowItWorks');
    if (screen === 'HELP') return t('topLineHelp');
    if (screen === 'PROJECT' && project) {
      if (project.step === 'PAY') {
        return role === 'CLIENT'
          ? t('statusLinePayClient')
          : t('statusLinePayFreelancer');
      }
      if (project.step === 'WORK') {
        return role === 'FREELANCER'
          ? t('statusFunded')
          : t('statusLineWorkClient');
      }
      if (project.step === 'CHECK') {
        return role === 'CLIENT'
          ? t('statusLineCheckClient')
          : t('statusLineCheckFreelancer');
      }
      return t('statusPaid');
    }
    return t('topLineHome');
  };

  const navigateTo = (target: ScreenId) => {
    setErrorBanner(null);
    if (target === 'NEW_PROJECT') {
      setNewStage('FORM');
      if (demoUser?.role === 'FREELANCER' && demoUser.name) {
        setFreelancerNameInput(demoUser.name);
      }
    }
    if (target === 'MY_PROJECTS') {
      refreshProjectsList();
    }
    if (target === 'LOGIN') {
      setLoginError(null);
      if (demoUser) {
        setLoginRole(demoUser.role);
        setLoginName(demoUser.name);
        setLoginEmail(demoUser.email);
      }
      window.history.pushState({}, '', '/login');
    } else if (target !== 'PROJECT') {
      window.history.pushState({}, '', '/');
    }
    setScreen(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div
      className={`min-h-screen bg-[#FAF8F3] text-[#08090B] font-body flex flex-col pb-20 md:pb-0 selection:bg-[#CDF22B] selection:text-[#08090B] ${
        lang === 'hi' ? 'lang-hi' : ''
      }`}
    >
      {/* Subtle 4% SVG feTurbulence Paper Grain Overlay */}
      <PaperGrainOverlay />

      {/* =====================================================================
          DESKTOP & MOBILE TOP NAVBAR
      ===================================================================== */}
      <header className="sticky top-0 z-40 w-full border-b-2 border-[#08090B] bg-[#FAF8F3]">
        <div className="max-w-[1380px] mx-auto px-4 sm:px-6 md:px-12 h-16 flex items-center justify-between gap-3">
          {/* Left: Bharosa Logo Lockup */}
          <button
            type="button"
            onClick={() => navigateTo('HOME')}
            className="inline-flex items-center gap-2.5 cursor-pointer shrink-0"
          >
            <img
              src="/assets/aistudio/bharosa-icon_9b6651f5.svg"
              alt="Bharosa"
              className="w-9 h-9 rounded-[10px] border-2 border-[#08090B] shrink-0"
            />
            <span className="inline-flex items-baseline font-display text-2xl md:text-[28px] text-[#08090B]">
              Bharosa
              <span
                className="inline-block w-2.5 h-2.5 rounded-full bg-[#FF9933] border border-[#08090B] ml-1"
                aria-hidden="true"
              />
            </span>
          </button>

          {/* Center/Right Desktop Navigation Links (sentence case, 14px, weight 500) */}
          <nav className="hidden md:flex items-center gap-6 studio-label text-[#08090B]">
            {(
              [
                { id: 'HOME', label: t('navHome') },
                { id: 'NEW_PROJECT', label: t('navNew') },
                { id: 'MY_PROJECTS', label: t('navProjects') },
                { id: 'HOW_IT_WORKS', label: t('navHow') },
                { id: 'HELP', label: t('navHelp') },
              ] as Array<{ id: ScreenId; label: string }>
            ).map((navItem) => {
              const isActive =
                screen === navItem.id ||
                (screen === 'PROJECT' && navItem.id === 'MY_PROJECTS');
              return (
                <button
                  key={navItem.id}
                  type="button"
                  onClick={() => navigateTo(navItem.id)}
                  className={`py-1 cursor-pointer transition-colors ${
                    isActive
                      ? 'text-[#08090B] font-semibold underline decoration-[#CDF22B] decoration-[3px] underline-offset-8'
                      : 'text-[#8A8780] hover:text-[#08090B]'
                  }`}
                >
                  {navItem.label}
                </button>
              );
            })}
          </nav>

          {/* Far Right: Demo User Status ("Log in" OR Name + Role Tag + "Log out") + Language Toggle + Help Button */}
          <div className="flex items-center gap-2.5 shrink-0">
            {demoUser ? (
              <div className="inline-flex items-center gap-2 rounded-[10px] border-2 border-[#08090B] bg-[#FAF8F3] px-2.5 py-1 studio-label">
                <span className="font-semibold text-[#08090B] max-w-[110px] truncate">
                  {demoUser.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-[6px] border border-[#08090B] font-money-id text-[11px] font-bold ${
                    demoUser.role === 'FREELANCER'
                      ? 'bg-[#CDF22B] text-[#08090B]'
                      : 'bg-[#FFC900] text-[#08090B]'
                  }`}
                >
                  {demoUser.role === 'FREELANCER'
                    ? t('roleTagFreelancer')
                    : t('roleTagClient')}
                </span>
                <button
                  type="button"
                  onClick={handleDemoLogout}
                  className="text-[#8A8780] hover:text-[#FF6845] underline cursor-pointer ml-0.5"
                >
                  {t('logoutBtn')}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigateTo('LOGIN')}
                className={`px-3.5 py-1.5 rounded-[10px] border-2 border-[#08090B] studio-label font-semibold cursor-pointer transition-colors ${
                  screen === 'LOGIN'
                    ? 'bg-[#CDF22B] text-[#08090B]'
                    : 'bg-[#FAF8F3] text-[#08090B] hover:bg-[#FFC900]/40'
                }`}
              >
                {t('loginBtn')}
              </button>
            )}

            <div className="hidden sm:inline-flex items-center rounded-[10px] border-2 border-[#08090B] bg-[#FAF8F3] px-2.5 py-1 studio-label">
              <button
                type="button"
                onClick={() => changeLanguage('en')}
                className={`cursor-pointer px-1 ${
                  lang === 'en'
                    ? 'font-bold text-[#08090B] underline decoration-[#CDF22B] decoration-2 underline-offset-4'
                    : 'text-[#8A8780] hover:text-[#08090B]'
                }`}
              >
                English
              </button>
              <span className="mx-1 text-[#8A8780]">·</span>
              <button
                type="button"
                onClick={() => changeLanguage('hi')}
                className={`cursor-pointer px-1 ${
                  lang === 'hi'
                    ? 'font-bold text-[#08090B] underline decoration-[#CDF22B] decoration-2 underline-offset-4'
                    : 'text-[#8A8780] hover:text-[#08090B]'
                }`}
              >
                हिन्दी
              </button>
              <span className="mx-1 text-[#8A8780]">·</span>
              <button
                type="button"
                onClick={() => changeLanguage('hinglish')}
                className={`cursor-pointer px-1 ${
                  lang === 'hinglish'
                    ? 'font-bold text-[#08090B] underline decoration-[#CDF22B] decoration-2 underline-offset-4'
                    : 'text-[#8A8780] hover:text-[#08090B]'
                }`}
              >
                Hinglish
              </button>
            </div>

            <button
              type="button"
              onClick={() => navigateTo('HELP')}
              aria-label={t('navHelp')}
              title={t('helpHeadline')}
              className={`w-8 h-8 rounded-[10px] border-2 border-[#08090B] inline-flex items-center justify-center studio-label font-bold transition-colors cursor-pointer ${
                screen === 'HELP'
                  ? 'bg-[#CDF22B] text-[#08090B]'
                  : 'bg-[#FAF8F3] text-[#08090B] hover:bg-[#FFC900]'
              }`}
            >
              ?
            </button>
          </div>
        </div>

        {/* Plain-language guidance line at the top of every page */}
        <div className="w-full border-t border-[#08090B]/20 bg-[#FAF8F3] px-4 sm:px-6 md:px-12 py-2">
          <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-4">
            <p className="studio-label text-[#08090B]">
              {getTopNextActionLine()}
            </p>
            <span className="hidden sm:inline-block font-hand text-sm text-[#8A8780]">
              {t('tagline')}
            </span>
          </div>
        </div>
      </header>

      {/* Plain-Language Error Banner */}
      {errorBanner && (
        <div className="w-full border-b-2 border-[#08090B] bg-[#FF6845] text-[#08090B] px-6 md:px-12 py-3">
          <div className="max-w-[1380px] mx-auto flex items-center justify-between studio-label font-semibold">
            <span>{errorBanner}</span>
            <button
              type="button"
              onClick={() => setErrorBanner(null)}
              className="underline cursor-pointer"
            >
              {t('btnGotIt')}
            </button>
          </div>
        </div>
      )}

      {/* Toast Notification (e.g. AI Fallback Notice) */}
      {toastMessage && (
        <div className="w-full border-b-2 border-[#08090B] bg-[#FFC900] text-[#08090B] px-6 md:px-12 py-3">
          <div className="max-w-[1380px] mx-auto flex items-center justify-between gap-4 studio-label font-semibold">
            <span>{toastMessage}</span>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="underline cursor-pointer shrink-0"
            >
              {t('btnOkay')}
            </button>
          </div>
        </div>
      )}

      {/* =====================================================================
          SCREEN: LOGIN (route /login) — DEMO LOGIN PAGE WITH TWO ROLES
      ===================================================================== */}
      {screen === 'LOGIN' && (
        <main
          key="screen-login"
          className="flex-1 max-w-[740px] w-full mx-auto px-6 md:px-12 pt-10 pb-24 animate-page-fade"
        >
          <div
            className="border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] p-6 sm:p-10 space-y-8"
            style={{ boxShadow: '6px 6px 0 #08090B' }}
          >
            {/* Headline: "Welcome to BHAROSA" with hand-drawn underline style */}
            <div className="space-y-2">
              <HeadlineWithSquiggle
                text={t('welcomeHeadline')}
                className="font-display text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[0.98] text-[#08090B]"
              />
            </div>

            {/* Two big role cards side by side (stack on mobile) */}
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setLoginRole('FREELANCER')}
                  className={`relative text-left border-2 border-[#08090B] rounded-[12px] p-5 transition-colors cursor-pointer ${
                    loginRole === 'FREELANCER'
                      ? 'bg-[#CDF22B] text-[#08090B]'
                      : 'bg-[#FAF8F3] text-[#08090B] hover:bg-[#FFC900]/25'
                  }`}
                  style={{
                    boxShadow:
                      loginRole === 'FREELANCER'
                        ? '4px 4px 0 #08090B'
                        : '2px 2px 0 #08090B',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-display text-2xl text-[#08090B]">
                      {t('roleFreelancerTitle')}
                    </span>
                    {loginRole === 'FREELANCER' && (
                      <span
                        className="w-7 h-7 rounded-full border-2 border-[#08090B] bg-[#FAF8F3] inline-flex items-center justify-center shrink-0"
                        aria-label="Selected"
                      >
                        <SketchCheckIcon className="w-4 h-4 text-[#08090B]" />
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-[#08090B]/85 mt-1.5">
                    {t('roleFreelancerDesc')}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setLoginRole('CLIENT')}
                  className={`relative text-left border-2 border-[#08090B] rounded-[12px] p-5 transition-colors cursor-pointer ${
                    loginRole === 'CLIENT'
                      ? 'bg-[#CDF22B] text-[#08090B]'
                      : 'bg-[#FAF8F3] text-[#08090B] hover:bg-[#FFC900]/25'
                  }`}
                  style={{
                    boxShadow:
                      loginRole === 'CLIENT'
                        ? '4px 4px 0 #08090B'
                        : '2px 2px 0 #08090B',
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="font-display text-2xl text-[#08090B]">
                      {t('roleClientTitle')}
                    </span>
                    {loginRole === 'CLIENT' && (
                      <span
                        className="w-7 h-7 rounded-full border-2 border-[#08090B] bg-[#FAF8F3] inline-flex items-center justify-center shrink-0"
                        aria-label="Selected"
                      >
                        <SketchCheckIcon className="w-4 h-4 text-[#08090B]" />
                      </span>
                    )}
                  </div>
                  <p className="font-body text-sm text-[#08090B]/85 mt-1.5">
                    {t('roleClientDesc')}
                  </p>
                </button>
              </div>

              {/* Small "What is the difference?" line */}
              <p className="studio-label text-[#8A8780]">
                <span className="font-semibold text-[#08090B]">
                  {t('whatsTheDiffLabel')}
                </span>{' '}
                {t('roleDiffHint')}
              </p>
            </div>

            {loginError && (
              <div className="border-2 border-[#08090B] rounded-[10px] bg-[#FF6845] px-4 py-3 studio-label font-semibold text-[#08090B]">
                {loginError}
              </div>
            )}

            {/* Demo Login Form: Name & Email only (NO password field) */}
            <form onSubmit={handleDemoLoginSubmit} className="space-y-5">
              <div>
                <label className="block studio-label text-[#08090B] mb-1.5">
                  {t('nameLabel')}
                </label>
                <input
                  type="text"
                  required
                  value={loginName}
                  onChange={(e) => setLoginName(e.target.value)}
                  placeholder={t('namePlaceholder')}
                  className="studio-input w-full px-4 py-3 text-base text-[#08090B]"
                />
              </div>

              <div>
                <label className="block studio-label text-[#08090B] mb-1.5">
                  {t('emailLabel')}
                </label>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder={t('emailPlaceholder')}
                  className="studio-input w-full px-4 py-3 text-base text-[#08090B]"
                />
              </div>

              {/* Small line: "Demo login. No password needed." */}
              <p className="studio-label text-[#8A8780]">
                {t('demoLoginNoPassword')}
              </p>

              {/* One big primary button: "Continue" */}
              <div className="pt-1 flex items-center gap-3">
                <HandDrawnCurvedArrow className="hidden sm:block" />
                <button
                  type="submit"
                  className="studio-btn studio-btn-primary w-full sm:w-auto inline-flex items-center justify-center px-10 py-4 font-body text-lg font-bold cursor-pointer"
                >
                  {t('continueBtn')}
                </button>
              </div>

              {/* Below: small link "Skip, try the demo" */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleTryDemo}
                  className="studio-label text-[#8A8780] hover:text-[#08090B] underline underline-offset-4 cursor-pointer"
                >
                  {t('skipTryDemoLink')}
                </button>
              </div>
            </form>
          </div>
        </main>
      )}

      {/* =====================================================================
          SCREEN 1: HOME
      ===================================================================== */}
      {screen === 'HOME' && (
        <main
          key="screen-home"
          className="flex-1 flex flex-col justify-between animate-page-fade"
        >
          {/* Subtle Truck-Art Jhalar/Zigzag Strip at Top of Home Page */}
          <TruckArtJhalarStrip />

          <section className="max-w-[1380px] w-full mx-auto px-6 md:px-12 pt-12 pb-20 md:pt-20 md:pb-28">
            <div className="max-w-4xl space-y-8 relative">
              {/* Slightly rotated (-3deg) Kalam sticker on yellow background */}
              <div>
                <NoLoginSticker text={t('noLoginSticker')} />
              </div>

              {/* Oversized Element on Home: Bricolage Grotesque 800 Headline with Squiggly Underline */}
              <HeadlineWithSquiggle
                text={t('tagline')}
                className="font-display text-[clamp(3.2rem,8vw,6.8rem)] leading-[0.96] text-[#08090B]"
              />

              <p className="font-body text-lg md:text-2xl text-[#08090B]/90 max-w-2xl leading-relaxed">
                {t('taglineSubtitle')}
              </p>

              {/* Primary CTA Button with Hand-Drawn Curved Arrow Pointing at It */}
              <div className="pt-4 flex flex-wrap items-center gap-5">
                <div className="relative inline-flex items-center gap-3">
                  <HandDrawnCurvedArrow className="hidden sm:block -mt-3" />
                  <button
                    type="button"
                    onClick={() => navigateTo('NEW_PROJECT')}
                    className="studio-btn studio-btn-primary px-9 py-4 font-body text-lg font-bold cursor-pointer"
                  >
                    {t('btnStart')}
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleTryDemo}
                  className="studio-btn studio-btn-secondary px-6 py-4 studio-label font-semibold cursor-pointer"
                >
                  {t('tryDemoBtn')}
                </button>
              </div>

              {/* Official PayPal Logo Badge on Home Hero */}
              <div className="inline-flex items-center gap-2.5 pt-1 studio-label text-[#8A8780]">
                <PayPalLogoMark className="h-6" />
                <span>· {t('securedByPaypal')}</span>
              </div>

              {/* Extra small line on Home when logged in as Client */}
              {demoUser?.role === 'CLIENT' && (
                <p className="studio-label text-[#8A8780] pt-1">
                  {t('gotLinkFromFreelancer')}
                </p>
              )}
            </div>
          </section>

          {/* 3 Simple Steps at Bottom with Varied Padding & Card Tilt */}
          <section className="w-full border-t-2 border-[#08090B] bg-[#FAF8F3] py-12 md:py-16 px-6 md:px-12">
            <div className="max-w-[1380px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
              <div
                className="studio-card-tilt border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] p-7 space-y-2.5"
                style={{ boxShadow: '4px 4px 0 #08090B' }}
              >
                <span className="font-hand text-base text-[#FF9933] font-bold">
                  {t('stepOneBadge')}
                </span>
                <h2 className="font-display text-3xl text-[#08090B]">
                  {t('step1Title')}
                </h2>
                <p className="font-body text-base text-[#08090B]/80 leading-relaxed">
                  {t('step1Desc')}
                </p>
              </div>

              <div
                className="studio-card-tilt border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] p-7 md:mt-3 space-y-2.5"
                style={{ boxShadow: '4px 4px 0 #08090B' }}
              >
                <span className="font-hand text-base text-[#08090B] font-bold">
                  {t('stepTwoBadge')}
                </span>
                <h2 className="font-display text-3xl text-[#08090B]">
                  {t('step2Title')}
                </h2>
                <p className="font-body text-base text-[#08090B]/80 leading-relaxed">
                  {t('step2Desc')}
                </p>
              </div>

              <div
                className="studio-card-tilt border-2 border-[#08090B] rounded-[12px] bg-[#CDF22B]/35 p-7 md:mt-6 space-y-2.5"
                style={{ boxShadow: '4px 4px 0 #08090B' }}
              >
                <span className="font-hand text-base text-[#08090B] font-bold">
                  {t('stepThreeBadge')}
                </span>
                <h2 className="font-display text-3xl text-[#08090B]">
                  {t('step3Title')}
                </h2>
                <p className="font-body text-base text-[#08090B]/85 leading-relaxed">
                  {t('step3Desc')}
                </p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* =====================================================================
          SCREEN: HOW IT WORKS
      ===================================================================== */}
      {screen === 'HOW_IT_WORKS' && (
        <main
          key="screen-how"
          className="flex-1 max-w-[1020px] w-full mx-auto px-6 md:px-12 pt-10 pb-24 space-y-12 animate-page-fade"
        >
          <div className="space-y-3">
            <NoLoginSticker text={t('noLoginSticker')} />
            <HeadlineWithSquiggle
              text={t('howHeadline')}
              className="font-display text-[clamp(2.8rem,6.5vw,5.2rem)] leading-[0.98] text-[#08090B]"
            />
          </div>

          <div className="space-y-6">
            <div
              className="studio-card-tilt border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] p-7 md:p-9 flex flex-col md:flex-row md:items-center justify-between gap-4"
              style={{ boxShadow: '4px 4px 0 #08090B' }}
            >
              <h2 className="font-display text-4xl md:text-5xl text-[#08090B] shrink-0">
                {t('howStep1Title')}
              </h2>
              <p className="font-body text-lg text-[#08090B]/85 max-w-xl leading-relaxed">
                {t('howStep1Line')}
              </p>
            </div>

            <div
              className="studio-card-tilt border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] p-7 md:p-9 md:ml-8 flex flex-col md:flex-row md:items-center justify-between gap-4"
              style={{ boxShadow: '4px 4px 0 #08090B' }}
            >
              <h2 className="font-display text-4xl md:text-5xl text-[#08090B] shrink-0">
                {t('howStep2Title')}
              </h2>
              <p className="font-body text-lg text-[#08090B]/85 max-w-xl leading-relaxed">
                {t('howStep2Line')}
              </p>
            </div>

            <div
              className="studio-card-tilt border-2 border-[#08090B] rounded-[12px] bg-[#CDF22B]/35 p-7 md:p-9 md:ml-16 flex flex-col md:flex-row md:items-center justify-between gap-4"
              style={{ boxShadow: '4px 4px 0 #08090B' }}
            >
              <h2 className="font-display text-4xl md:text-5xl text-[#08090B] shrink-0">
                {t('howStep3Title')}
              </h2>
              <p className="font-body text-lg text-[#08090B]/85 max-w-xl leading-relaxed">
                {t('howStep3Line')}
              </p>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-3">
            <HandDrawnCurvedArrow />
            <button
              type="button"
              onClick={() => navigateTo('NEW_PROJECT')}
              className="studio-btn studio-btn-primary px-9 py-4 font-body text-lg font-bold cursor-pointer"
            >
              {t('btnStart')}
            </button>
          </div>
        </main>
      )}

      {/* =====================================================================
          SCREEN: HELP
      ===================================================================== */}
      {screen === 'HELP' && (
        <main
          key="screen-help"
          className="flex-1 max-w-[900px] w-full mx-auto px-6 md:px-12 pt-12 pb-24 space-y-10 animate-page-fade"
        >
          <div className="space-y-3">
            <NoLoginSticker text={t('simpleSticker')} />
            <HeadlineWithSquiggle
              text={t('helpHeadline')}
              className="font-display text-[clamp(2.6rem,6vw,4.8rem)] leading-[0.98] text-[#08090B]"
            />
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIdx === idx;
              return (
                <div
                  key={idx}
                  className="border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] px-6 py-5"
                  style={{ boxShadow: '4px 4px 0 #08090B' }}
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIdx(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="font-body text-lg font-semibold text-[#08090B]">
                      {faq.q}
                    </span>
                    <SketchChevronIcon open={isOpen} />
                  </button>
                  {isOpen && (
                    <p className="mt-3 pt-3 border-t border-[#08090B]/15 font-body text-base text-[#08090B]/80 leading-relaxed max-w-2xl">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 flex items-center gap-3">
            <HandDrawnCurvedArrow />
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                t('whatsappHelpPrefill')
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="studio-btn studio-btn-primary inline-flex items-center gap-2.5 px-8 py-4 font-body text-base font-bold"
            >
              {t('chatOnWhatsappBtn')}
            </a>
          </div>
        </main>
      )}

      {/* =====================================================================
          SCREEN: MY PROJECTS
      ===================================================================== */}
      {screen === 'MY_PROJECTS' && (
        <main
          key="screen-my-projects"
          className="flex-1 max-w-[1000px] w-full mx-auto px-6 md:px-12 pt-10 pb-24 space-y-10 animate-page-fade"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <HeadlineWithSquiggle
              text={t('myProjectsHeadline')}
              className="font-display text-[clamp(2.8rem,6.5vw,5rem)] leading-[0.98] text-[#08090B]"
            />

            <button
              type="button"
              onClick={() => navigateTo('NEW_PROJECT')}
              className="studio-btn studio-btn-primary px-6 py-3 studio-label font-bold cursor-pointer"
            >
              {t('btnStart')}
            </button>
          </div>

          {myProjects.length === 0 ? (
            <div
              className="relative border-2 border-[#08090B] rounded-[12px] p-10 md:p-16 space-y-6 bg-[#FAF8F3] overflow-hidden"
              style={{ boxShadow: '5px 5px 0 #08090B' }}
            >
              {/* Rangoli-inspired Corner Ornaments on Empty State */}
              <RangoliCornerOrnament className="absolute top-2 left-2" />
              <RangoliCornerOrnament className="absolute top-2 right-2 rotate-90" />
              <RangoliCornerOrnament className="absolute bottom-2 left-2 -rotate-90" />
              <RangoliCornerOrnament className="absolute bottom-2 right-2 rotate-180" />

              <div className="font-display text-4xl md:text-5xl text-[#08090B] pt-2">
                {t('noProjectsYet')}
              </div>

              <div className="flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={() => navigateTo('NEW_PROJECT')}
                  className="studio-btn studio-btn-primary px-8 py-4 font-body text-base font-bold cursor-pointer"
                >
                  {t('startFirstOneBtn')}
                </button>

                <button
                  type="button"
                  onClick={handleTryDemo}
                  className="studio-label text-[#08090B] underline underline-offset-4 cursor-pointer"
                >
                  {t('tryDemoBtn')}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {myProjects.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    openProjectByIdAndKey(
                      item.id,
                      demoUser?.role === 'FREELANCER'
                        ? item.freelancerKey || item.clientKey
                        : item.clientKey || item.freelancerKey,
                      true
                    )
                  }
                  className="studio-card-tilt w-full border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] p-5 md:p-6 flex flex-wrap items-center justify-between gap-4 text-left cursor-pointer"
                  style={{ boxShadow: '4px 4px 0 #08090B' }}
                >
                  <div className="space-y-1">
                    <span className="font-body text-lg md:text-xl font-semibold text-[#08090B] block">
                      {item.title}
                    </span>
                    <span className="studio-label text-[#8A8780]">
                      {t('projectIdPrefix')}{' '}
                      <span className="font-money-id">{item.id}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-5 md:gap-8 shrink-0">
                    <div className="text-right">
                      <span className="font-money-id text-2xl font-bold text-[#08090B]">
                        {formatUsd(item.amountUsd)}
                      </span>
                      <span className="font-money-id text-sm text-[#8A8780] ml-2">
                        ({formatInrFromUsd(item.amountUsd)})
                      </span>
                    </div>

                    <span
                      className={`studio-label font-semibold px-3.5 py-1 rounded-[10px] border-2 border-[#08090B] ${
                        item.stepWord === 'PAID'
                          ? 'bg-[#CDF22B] text-[#08090B]'
                          : item.stepWord === 'PAY'
                          ? 'bg-[#FFC900] text-[#08090B]'
                          : item.stepWord === 'CHECK'
                          ? 'bg-[#FAF8F3] text-[#08090B]'
                          : 'bg-[#08090B] text-[#FAF8F3]'
                      }`}
                    >
                      {item.stepWord === 'PAID'
                        ? t('stepDone')
                        : item.stepWord === 'PAY'
                        ? t('stepPay')
                        : item.stepWord === 'CHECK'
                        ? t('stepCheck')
                        : t('stepWork')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </main>
      )}

      {/* =====================================================================
          SCREEN 2: NEW PROJECT (Works for everyone; prefills Freelancer name if logged in as Freelancer)
      ===================================================================== */}
      {screen === 'NEW_PROJECT' && (
        <main
          key="screen-new-project"
          className="flex-1 max-w-[920px] w-full mx-auto px-6 md:px-12 pt-10 pb-24 animate-page-fade"
        >
          {newStage === 'FORM' && (
            <form onSubmit={handleGenerateChecklist} className="space-y-9">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <HeadlineWithSquiggle
                  text={t('newProjectHeadline')}
                  className="font-display text-[clamp(2.6rem,6.2vw,4.8rem)] leading-[0.98] text-[#08090B]"
                />
                <NoLoginSticker text={t('noLoginSticker')} />
              </div>

              {/* Template Chips */}
              <div className="space-y-2.5">
                <div className="studio-label text-[#8A8780]">
                  {t('pickTemplateLabel')}
                </div>
                <div className="flex flex-wrap gap-2.5">
                  {JOB_TEMPLATES.map((tpl) => {
                    const tplText =
                      tpl.defaultTextByLang[lang] || tpl.defaultTextByLang.en;
                    const isSelected =
                      selectedTemplateId === tpl.id && jobText === tplText;
                    return (
                      <button
                        key={tpl.id}
                        type="button"
                        onClick={() => {
                          setSelectedTemplateId(tpl.id);
                          setJobText(tplText);
                          setAmountUsdInput(String(tpl.defaultAmountUsd));
                          setErrorBanner(null);
                        }}
                        className={`px-4 py-2 rounded-[10px] border-2 border-[#08090B] studio-label transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                          isSelected
                            ? 'bg-[#CDF22B] text-[#08090B] font-semibold'
                            : 'bg-[#FAF8F3] text-[#08090B] hover:bg-[#FFC900]/40'
                        }`}
                      >
                        {tpl.label[lang] || tpl.label.en}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 1. Job Description Box */}
              <div className="w-full md:w-[92%]">
                <label className="block studio-label text-[#08090B] mb-2">
                  {t('describeWorkLabel')}
                </label>
                <input
                  type="text"
                  value={jobText}
                  onChange={(e) => {
                    setJobText(e.target.value);
                    if (errorBanner) {
                      setErrorBanner(null);
                    }
                  }}
                  placeholder={t('describeWorkPlaceholder')}
                  className="studio-input w-full px-4 py-3.5 text-lg md:text-xl text-[#08090B]"
                />
              </div>

              {/* 2. Asymmetric widths for Amount in USD, Deadline, Freelancer Name (prefilled when logged in as Freelancer), and Client Name */}
              <div className="flex flex-wrap items-start gap-6 md:gap-8">
                <div className="w-full sm:w-[210px]">
                  <label className="block studio-label text-[#08090B] mb-2">
                    {t('amountLabel')}
                    <MoneyInfoTooltip
                      text={t('tooltipUsdInr')}
                      label={t('whatsThisLabel')}
                    />
                  </label>
                  <div className="studio-input flex items-baseline px-4 py-2.5">
                    <span className="font-money-id text-2xl font-bold text-[#08090B] mr-1.5">
                      $
                    </span>
                    <input
                      type="number"
                      required
                      min={1}
                      value={amountUsdInput}
                      onChange={(e) => setAmountUsdInput(e.target.value)}
                      className="w-full bg-transparent font-money-id text-2xl font-bold text-[#08090B] focus:outline-none"
                    />
                  </div>
                  <div className="studio-label text-[#8A8780] mt-2">
                    {t('freelancerGetsLabel')}{' '}
                    <span className="font-money-id font-bold text-[#08090B]">
                      ${Number(amountUsdInput) || 0} ≈{' '}
                      {formatInrFromUsd(Number(amountUsdInput) || 0)}
                    </span>
                  </div>
                </div>

                <div className="w-full sm:w-[200px]">
                  <label className="block studio-label text-[#08090B] mb-2">
                    {t('deadlineLabel')}
                  </label>
                  <input
                    type="date"
                    required
                    value={deadlineInput}
                    onChange={(e) => setDeadlineInput(e.target.value)}
                    className="studio-input w-full px-4 py-3 font-money-id text-base text-[#08090B]"
                  />
                </div>

                <div className="w-full sm:w-[220px]">
                  <label className="block studio-label text-[#08090B] mb-2">
                    {t('freelancerNameLabel')}
                  </label>
                  <input
                    type="text"
                    value={freelancerNameInput}
                    onChange={(e) => setFreelancerNameInput(e.target.value)}
                    placeholder={t('freelancerNamePlaceholder')}
                    className="studio-input w-full px-4 py-3 text-base text-[#08090B]"
                  />
                </div>

                <div className="w-full sm:w-[220px]">
                  <label className="block studio-label text-[#08090B] mb-2">
                    {t('clientNameLabel')}
                  </label>
                  <input
                    type="text"
                    required
                    value={clientNameInput}
                    onChange={(e) => setClientNameInput(e.target.value)}
                    placeholder={t('clientNamePlaceholder')}
                    className="studio-input w-full px-4 py-3 text-base text-[#08090B]"
                  />
                </div>
              </div>

              {/* ONE Primary Button */}
              <div className="pt-3 flex items-center gap-3">
                <HandDrawnCurvedArrow className="hidden sm:block" />
                <button
                  type="submit"
                  disabled={isGeneratingChecklist}
                  className="studio-btn studio-btn-primary inline-flex items-center justify-center gap-2.5 px-9 py-4 font-body text-lg font-bold cursor-pointer"
                >
                  {isGeneratingChecklist && <SketchSpinner />}
                  <span>
                    {isGeneratingChecklist ? t('aiWriting') : t('continueBtn')}
                  </span>
                </button>
              </div>
            </form>
          )}

          {newStage === 'CHECKLIST' && (
            <div className="space-y-9">
              <div className="space-y-2">
                <HeadlineWithSquiggle
                  text={t('checklistHeadline')}
                  className="font-display text-[clamp(2.6rem,6vw,4.5rem)] leading-[0.98] text-[#08090B]"
                />
                <p className="font-body text-lg text-[#8A8780]">
                  {t('checklistSubtitle')}
                </p>
              </div>

              <div className="space-y-3">
                {draftChecklist.map((item, idx) => (
                  <div
                    key={idx}
                    className="border-2 border-[#08090B] rounded-[10px] bg-[#FAF8F3] px-4 py-3.5 flex items-center justify-between gap-3"
                  >
                    <span className="font-money-id text-sm font-bold text-[#8A8780] shrink-0">
                      {idx + 1}.
                    </span>
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDraftChecklist((prev) =>
                          prev.map((c, i) =>
                            i === idx ? { ...c, text: val } : c
                          )
                        );
                      }}
                      className="w-full bg-transparent font-body text-lg text-[#08090B] focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setDraftChecklist((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      className="studio-label text-[#8A8780] hover:text-[#FF6845] px-2 cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Add extra checklist point */}
              <div className="flex flex-wrap sm:flex-nowrap gap-3 max-w-xl">
                <input
                  type="text"
                  value={newPointInput}
                  onChange={(e) => setNewPointInput(e.target.value)}
                  placeholder={t('addPointPlaceholder')}
                  className="studio-input flex-1 px-4 py-2.5 text-base"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!newPointInput.trim()) return;
                    setDraftChecklist((prev) => [
                      ...prev,
                      { text: newPointInput.trim(), isSubjective: false },
                    ]);
                    setNewPointInput('');
                  }}
                  className="studio-btn studio-btn-secondary px-5 py-2.5 studio-label font-semibold cursor-pointer"
                >
                  {t('addPointBtn')}
                </button>
              </div>

              {/* ONE Primary Lime Button */}
              <div className="pt-2 flex items-center gap-3">
                <HandDrawnCurvedArrow className="hidden sm:block" />
                <button
                  type="button"
                  disabled={isSavingProject}
                  onClick={handleCreateProject}
                  className="studio-btn studio-btn-primary inline-flex items-center justify-center gap-2.5 px-9 py-4 font-body text-lg font-bold cursor-pointer"
                >
                  {isSavingProject && <SketchSpinner />}
                  <span>
                    {isSavingProject
                      ? t('savingProjectBtn')
                      : t('looksGoodBtn')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {newStage === 'SHARE' && project && (
            <div
              className="space-y-8 border-2 border-[#08090B] rounded-[12px] p-7 md:p-12 bg-[#FAF8F3]"
              style={{ boxShadow: '6px 6px 0 #08090B' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="space-y-2">
                  <HeadlineWithSquiggle
                    text={t('shareHeadline')}
                    className="font-display text-[clamp(2.3rem,5vw,4rem)] leading-[0.98] text-[#08090B]"
                  />
                  <p className="font-body text-lg text-[#08090B]/80">
                    {t('shareSubtitle')}
                  </p>
                </div>
                <NoLoginSticker text={t('noLoginSticker')} />
              </div>

              {/* Magic Links Display */}
              <div className="space-y-4 border-t-2 border-b-2 border-[#08090B] py-6">
                <div>
                  <div className="studio-label text-[#8A8780] mb-1.5">
                    {t('clientMagicLinkLabel')}
                  </div>
                  <div className="font-money-id text-xs md:text-sm text-[#08090B] break-all bg-[#FFC900]/35 p-3.5 rounded-[10px] border-2 border-[#08090B]">
                    {clientMagicFullUrl}
                  </div>
                </div>

                <div>
                  <div className="studio-label text-[#8A8780] mb-1.5">
                    {t('yourPrivateLinkLabel')}
                  </div>
                  <div className="font-money-id text-xs text-[#8A8780] break-all">
                    {freelancerMagicFullUrl}
                  </div>
                </div>
              </div>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <a
                  href={whatsappShareHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="studio-btn studio-btn-primary px-8 py-4 font-body text-base font-bold"
                >
                  {t('shareWhatsappBtn')}
                </a>

                <button
                  type="button"
                  onClick={() => {
                    safeCopyToClipboard(clientMagicFullUrl);
                    setCopiedLink(true);
                    setTimeout(() => setCopiedLink(false), 2500);
                  }}
                  className="studio-btn studio-btn-secondary px-6 py-4 studio-label font-semibold cursor-pointer"
                >
                  {copiedLink ? t('copiedLabel') : t('copyClientLinkBtn')}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openProjectByIdAndKey(
                      project.id,
                      project.freelancerKey,
                      true,
                      'FREELANCER'
                    )
                  }
                  className="studio-btn studio-btn-secondary px-6 py-4 studio-label font-semibold cursor-pointer"
                >
                  {t('openFreelancerLinkBtn')}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    openProjectByIdAndKey(
                      project.id,
                      project.clientKey,
                      true,
                      'CLIENT'
                    )
                  }
                  className="studio-btn studio-btn-secondary px-6 py-4 studio-label font-semibold cursor-pointer"
                >
                  {t('openClientLinkBtn')} →
                </button>
              </div>
            </div>
          )}
        </main>
      )}

      {/* =====================================================================
          SCREEN 3: PROJECT PAGE (/p/{id})
          4-Step Bar: Pay – Work – Check – Done
      ===================================================================== */}
      {screen === 'PROJECT' && project && (
        <main
          key={`screen-project-${project.step}`}
          className="flex-1 max-w-[920px] w-full mx-auto px-6 md:px-12 pt-8 pb-24 space-y-8 animate-page-fade"
        >
          {/* Top Context & Role Switcher */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b-2 border-[#08090B]">
            <div>
              <div className="font-body text-lg font-bold text-[#08090B]">
                {project.title} ·{' '}
                <span className="font-normal text-[#8A8780]">
                  {project.clientName}
                </span>
              </div>
              <div className="studio-label text-[#08090B] mt-0.5">
                <span className="font-money-id font-bold">
                  {formatUsd(project.amountUsd)} USD ≈{' '}
                  {formatInrFromUsd(project.amountUsd)}
                </span>
                <MoneyInfoTooltip
                  text={t('tooltipUsdInr')}
                  label={t('whatsThisLabel')}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 studio-label">
              <span className="text-[#8A8780]">{t('switchRoleToTest')}</span>
              <button
                type="button"
                onClick={() =>
                  openProjectByIdAndKey(
                    project.id,
                    project.clientKey,
                    true,
                    'CLIENT'
                  )
                }
                className={`px-3 py-1 rounded-[10px] border-2 border-[#08090B] cursor-pointer ${
                  role === 'CLIENT'
                    ? 'bg-[#CDF22B] text-[#08090B] font-semibold'
                    : 'bg-[#FAF8F3] text-[#08090B]'
                }`}
              >
                {t('viewingAsClient')}
              </button>
              <button
                type="button"
                onClick={() =>
                  openProjectByIdAndKey(
                    project.id,
                    project.freelancerKey,
                    true,
                    'FREELANCER'
                  )
                }
                className={`px-3 py-1 rounded-[10px] border-2 border-[#08090B] cursor-pointer ${
                  role === 'FREELANCER'
                    ? 'bg-[#CDF22B] text-[#08090B] font-semibold'
                    : 'bg-[#FAF8F3] text-[#08090B]'
                }`}
              >
                {t('viewingAsFreelancer')}
              </button>
            </div>
          </div>

          {/* 4-Step Progress Bar: Pay – Work – Check – Done (Lime dot ONLY on the active step) */}
          <div
            className="grid grid-cols-4 border-2 border-[#08090B] rounded-[12px] overflow-hidden divide-x-2 divide-[#08090B] bg-[#FAF8F3]"
            style={{ boxShadow: '4px 4px 0 #08090B' }}
          >
            {(
              [
                { id: 'PAY', label: t('stepPay') },
                { id: 'WORK', label: t('stepWork') },
                { id: 'CHECK', label: t('stepCheck') },
                { id: 'DONE', label: t('stepDone') },
              ] as Array<{ id: ProjectStep; label: string }>
            ).map((s) => {
              const isCurrent = project.step === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStepBarClick(s.id)}
                  className={`py-3.5 px-2 studio-label flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                    isCurrent
                      ? 'bg-[#08090B] text-[#FAF8F3] font-semibold'
                      : 'bg-[#FAF8F3] text-[#08090B] hover:bg-[#FFC900]/25'
                  }`}
                >
                  {isCurrent && (
                    <span className="w-2.5 h-2.5 rounded-full bg-[#CDF22B] shrink-0" />
                  )}
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* PayPal 29-Day Authorization Expiry Warning */}
          {isAuthExpired && project.step !== 'DONE' && (
            <div className="border-2 border-[#08090B] rounded-[12px] bg-[#FFC900] p-4 flex flex-wrap items-center justify-between gap-4">
              <span className="font-body text-sm font-medium text-[#08090B]">
                {t('authExpiryWarning')}
              </span>
              <button
                type="button"
                onClick={() => handleStepBarClick('PAY')}
                className="studio-btn studio-btn-secondary px-4 py-1.5 studio-label font-semibold cursor-pointer"
              >
                {t('reauthorizeBtn')}
              </button>
            </div>
          )}

          {/* ---------------- STEP 1: PAY ---------------- */}
          {project.step === 'PAY' && (
            <div
              className="border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] p-8 md:p-12 space-y-9"
              style={{ boxShadow: '6px 6px 0 #08090B' }}
            >
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="inline-flex items-center flex-wrap gap-1">
                    <span className="inline-flex items-center px-3.5 py-1 rounded-[10px] border-2 border-[#08090B] bg-[#FFC900] text-[#08090B] studio-label font-semibold">
                      {t('held')}
                    </span>
                    <MoneyInfoTooltip
                      text={t('tooltipHeldNotCharged')}
                      label={t('whatsThisLabel')}
                    />
                  </div>
                  <NoLoginSticker text={t('safeEscrowSticker')} />
                </div>

                {/* Oversized Element on PAY step: Hand-drawn circle around the amount */}
                <div className="pt-2">
                  <HandDrawnCircle>
                    <div className="font-money-id text-[clamp(3.6rem,10vw,6.8rem)] font-bold leading-none text-[#08090B]">
                      {formatUsd(project.amountUsd)}
                    </div>
                  </HandDrawnCircle>
                </div>

                <div className="studio-label text-[#8A8780]">
                  <span className="font-money-id text-[#08090B] font-semibold">
                    {formatUsd(project.amountUsd)} USD ≈{' '}
                    {formatInrFromUsd(project.amountUsd)}
                  </span>
                  <MoneyInfoTooltip
                    text={t('tooltipUsdInr')}
                    label={t('whatsThisLabel')}
                  />
                </div>
              </div>

              <div className="flex items-start gap-3">
                <HandDrawnCurvedArrow className="hidden sm:block mt-3" />
                <PayPalOfficialButtons
                  projectId={project.id}
                  amountUsd={project.amountUsd}
                  paypalClientId={paypalClientId}
                  paypalMode={paypalMode}
                  buttonLabel={t('btnPay')}
                  loadingLabel={t('authorizingHoldBtn')}
                  securedByText={t('securedByPaypal')}
                  t={t}
                  onAuthorizedSuccess={() =>
                    openProjectByIdAndKey(project.id, activeKey, false)
                  }
                  onError={(msg) => setErrorBanner(msg)}
                  onRetryHealth={checkPaymentHealth}
                />
              </div>

              <div className="pt-4 border-t border-[#08090B]/20 flex flex-wrap items-center justify-between gap-4">
                <span className="studio-label text-[#8A8780]">
                  {t('waitingForClientPay')}
                </span>
                <a
                  href={whatsappShareHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="studio-label font-semibold text-[#08090B] underline cursor-pointer"
                >
                  {t('reshareWhatsappBtn')}
                </a>
              </div>
            </div>
          )}

          {/* ---------------- STEP 2: WORK ---------------- */}
          {project.step === 'WORK' && (
            <div
              className="border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] p-8 md:p-12 space-y-8"
              style={{ boxShadow: '6px 6px 0 #08090B' }}
            >
              {project.clientFixNote && (
                <div className="border-2 border-[#08090B] rounded-[10px] bg-[#FFC900] p-4 space-y-1">
                  <div className="studio-label font-bold text-[#08090B]">
                    {t('fixRequestedBanner')} ({project.revisionRound}/2)
                  </div>
                  <p className="font-body text-sm text-[#08090B]">
                    {project.clientFixNote}
                  </p>
                </div>
              )}

              {/* Oversized Dropzone Card */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleFilesSelected(e.dataTransfer.files);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="studio-card-tilt border-2 border-dashed border-[#08090B] rounded-[12px] p-9 md:p-12 text-center cursor-pointer bg-[#FAF8F3] hover:bg-[#FFC900]/10 transition-colors space-y-3"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFilesSelected(e.target.files)}
                />
                <HeadlineWithSquiggle
                  text={t('dropWorkHeadline')}
                  className="font-display text-3xl md:text-4xl text-[#08090B]"
                />
                <p className="studio-label text-[#8A8780]">
                  {workFiles.length > 0
                    ? `${workFiles.length} ${t('filesReadySuffix')} ${workFiles
                        .map((f) => f.name)
                        .join(', ')}`
                    : t('dropWorkSub')}
                </p>

                <div
                  onClick={(e) => e.stopPropagation()}
                  className="pt-4 flex flex-wrap items-center justify-center gap-3"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setWorkFiles(buildCompleteDemoDelivery().files);
                      setSamplePreset('COMPLETE');
                    }}
                    className={`px-4 py-1.5 rounded-[10px] border-2 border-[#08090B] studio-label cursor-pointer ${
                      samplePreset === 'COMPLETE'
                        ? 'bg-[#CDF22B] text-[#08090B] font-semibold'
                        : 'bg-[#FAF8F3] text-[#08090B]'
                    }`}
                  >
                    {t('demoSampleCompleteBtn')}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWorkFiles(buildIncompleteDemoDelivery().files);
                      setSamplePreset('INCOMPLETE');
                    }}
                    className={`px-4 py-1.5 rounded-[10px] border-2 border-[#08090B] studio-label cursor-pointer ${
                      samplePreset === 'INCOMPLETE'
                        ? 'bg-[#FFC900] text-[#08090B] font-semibold'
                        : 'bg-[#FAF8F3] text-[#08090B]'
                    }`}
                  >
                    {t('demoSampleIncompleteBtn')}
                  </button>
                </div>
              </div>

              {/* Varied widths for link and note inputs */}
              <div className="space-y-6">
                <div className="w-full md:w-[82%]">
                  <label className="block studio-label text-[#08090B] mb-2">
                    {t('pasteLinkLabel')}
                  </label>
                  <input
                    type="url"
                    value={workLink}
                    onChange={(e) => setWorkLink(e.target.value)}
                    placeholder="https://..."
                    className="studio-input w-full px-4 py-3 text-base text-[#08090B]"
                  />
                </div>

                <div className="w-full md:w-[94%]">
                  <label className="block studio-label text-[#08090B] mb-2">
                    {t('optionalNoteLabel')}
                  </label>
                  <input
                    type="text"
                    value={workNote}
                    onChange={(e) => setWorkNote(e.target.value)}
                    placeholder={t('optionalNotePlaceholder')}
                    className="studio-input w-full px-4 py-3 text-base text-[#08090B]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <HandDrawnCurvedArrow className="hidden sm:block" />
                <button
                  type="button"
                  disabled={isSubmittingWork}
                  onClick={handleSubmitWork}
                  className="studio-btn studio-btn-primary w-full md:w-auto inline-flex items-center justify-center gap-2.5 px-10 py-4 font-body text-lg font-bold cursor-pointer"
                >
                  {isSubmittingWork && <SketchSpinner />}
                  <span>
                    {isSubmittingWork
                      ? t('submittingWorkBtn')
                      : t('btnSubmitWork')}
                  </span>
                </button>
              </div>
            </div>
          )}

          {/* ---------------- STEP 3: CHECK ---------------- */}
          {project.step === 'CHECK' && (
            <div
              className="border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] overflow-hidden"
              style={{ boxShadow: '6px 6px 0 #08090B' }}
            >
              <div className="divide-y-2 divide-[#08090B]">
                {project.checklist.map((item) => {
                  const effective = item.clientDecision || item.status;
                  return (
                    <div
                      key={item.id}
                      className="p-6 md:p-7 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="font-body text-lg md:text-xl font-semibold text-[#08090B]">
                          {item.text}
                        </div>
                        <div className="font-body text-sm text-[#8A8780]">
                          {item.reason || t('defaultCheckedReason')}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleHumanItem(item)}
                        title={t('toggleStatusHint')}
                        className={`self-start md:self-center inline-flex items-center gap-2 px-4 py-1.5 rounded-[10px] border-2 border-[#08090B] studio-label font-semibold cursor-pointer shrink-0 ${
                          effective === 'PASS'
                            ? 'bg-[#CDF22B] text-[#08090B]'
                            : effective === 'FAIL'
                            ? 'bg-[#FF6845] text-[#08090B]'
                            : 'bg-[#FFC900] text-[#08090B]'
                        }`}
                      >
                        {effective === 'PASS'
                          ? t('passWord')
                          : effective === 'FAIL'
                          ? t('failWord')
                          : t('askHumanWord')}
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Release Section */}
              <div className="border-t-2 border-[#08090B] bg-[#FAF8F3] text-[#08090B] p-8 md:p-11 space-y-6">
                <div className="space-y-2">
                  <span className="font-hand text-lg text-[#FF9933] font-bold block">
                    {t('verdictReadyBadge')}
                  </span>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="font-display text-[clamp(2.4rem,5.5vw,4.2rem)] leading-tight text-[#08090B]">
                      {t('releaseBoxTitle')}{' '}
                      <span className="font-money-id">
                        {payoutInfo.percent}%
                      </span>{' '}
                      =
                    </div>
                    <HandDrawnCircle>
                      <span className="font-money-id text-[clamp(2.2rem,5vw,3.8rem)] font-bold text-[#08090B]">
                        {formatUsd(payoutInfo.usd)}
                      </span>
                    </HandDrawnCircle>
                    <MoneyInfoTooltip
                      text={t('tooltipReleaseCalc')}
                      label={t('whatsThisLabel')}
                    />
                  </div>
                  <div className="studio-label text-[#8A8780]">
                    <span className="font-money-id font-semibold text-[#08090B]">
                      {formatUsd(payoutInfo.usd)} USD ≈{' '}
                      {formatInrFromUsd(payoutInfo.usd)}
                    </span>
                    <MoneyInfoTooltip
                      text={t('tooltipUsdInr')}
                      label={t('whatsThisLabel')}
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <HandDrawnCurvedArrow className="hidden sm:block" />
                  <button
                    type="button"
                    disabled={isReleasing}
                    onClick={() => setConfirmReleaseAmount(payoutInfo.usd)}
                    className="studio-btn studio-btn-primary inline-flex items-center justify-center gap-2.5 px-9 py-4 font-body text-lg font-bold cursor-pointer"
                  >
                    {isReleasing && <SketchSpinner />}
                    <span>
                      {isReleasing ? t('releasingMoneyBtn') : t('btnRelease')}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={project.revisionRound >= 2}
                    onClick={() => setShowFixBox((v) => !v)}
                    className="studio-btn studio-btn-secondary inline-flex items-center justify-center gap-2 px-6 py-4 studio-label font-semibold cursor-pointer"
                  >
                    {project.revisionRound >= 2
                      ? t('maxRevisionsReached')
                      : `${t('btnFixes')} (${project.revisionRound}/2)`}
                  </button>
                </div>

                {showFixBox && (
                  <form
                    onSubmit={handleSendFixRequest}
                    className="pt-4 border-t border-[#08090B]/20 flex flex-col sm:flex-row gap-3"
                  >
                    <input
                      type="text"
                      required
                      value={fixMessageInput}
                      onChange={(e) => setFixMessageInput(e.target.value)}
                      placeholder={t('fixInputPlaceholder')}
                      className="studio-input flex-1 px-4 py-3 text-sm"
                    />
                    <button
                      type="submit"
                      className="studio-btn studio-btn-primary px-6 py-3 studio-label font-bold cursor-pointer"
                    >
                      {t('sendToFreelancerBtn')}
                    </button>
                  </form>
                )}

                <div className="pt-4 border-t border-[#08090B]/20 flex flex-wrap items-center justify-between gap-4 studio-label text-[#8A8780]">
                  <span>
                    {t('autoReleaseNote')}
                    <MoneyInfoTooltip
                      text={t('tooltipAutoRelease')}
                      label={t('whatsThisLabel')}
                    />
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowDisputeBox((v) => !v)}
                    className="underline text-[#08090B] font-semibold cursor-pointer"
                  >
                    {t('somethingWrongLink')}
                  </button>
                </div>
              </div>

              {showDisputeBox && (
                <div className="border-t-2 border-[#08090B] bg-[#FAF8F3] p-8 md:p-10 space-y-6">
                  <div className="font-display text-2xl text-[#08090B]">
                    {t('disputeTitle')}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block studio-label text-[#08090B] mb-1.5">
                        {t('freelancerSideLabel')}
                      </label>
                      <textarea
                        rows={3}
                        value={freelancerDisputeInput}
                        onChange={(e) =>
                          setFreelancerDisputeInput(e.target.value)
                        }
                        placeholder={t('freelancerSidePlaceholder')}
                        className="studio-input w-full p-3.5 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block studio-label text-[#08090B] mb-1.5">
                        {t('clientSideLabel')}
                      </label>
                      <textarea
                        rows={3}
                        value={clientDisputeInput}
                        onChange={(e) => setClientDisputeInput(e.target.value)}
                        placeholder={t('clientSidePlaceholder')}
                        className="studio-input w-full p-3.5 text-sm"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isSummarizingDispute}
                    onClick={handleGenerateDisputeSummary}
                    className="studio-btn studio-btn-primary inline-flex items-center gap-2 px-6 py-3 studio-label font-bold cursor-pointer"
                  >
                    {isSummarizingDispute && <SketchSpinner />}
                    <span>
                      {isSummarizingDispute
                        ? t('writingSummaryBtn')
                        : t('getAiDisputeSummaryBtn')}
                    </span>
                  </button>

                  {project.disputeSummary && (
                    <div className="border-2 border-[#08090B] rounded-[12px] bg-[#08090B] text-[#FAF8F3] p-6 space-y-4">
                      <pre className="font-body text-sm whitespace-pre-wrap leading-relaxed">
                        {project.disputeSummary}
                      </pre>

                      <div className="pt-3 border-t border-[#FAF8F3]/20 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            setConfirmReleaseAmount(
                              project.disputeSuggestedUsd ?? payoutInfo.usd
                            )
                          }
                          className="studio-btn studio-btn-primary px-6 py-2.5 studio-label font-bold cursor-pointer"
                        >
                          {t('btnRelease')} (
                          <span className="font-money-id">
                            ${project.disputeSuggestedUsd ?? payoutInfo.usd}
                          </span>
                          )
                        </button>

                        <button
                          type="button"
                          onClick={handleVoidHold}
                          className="px-5 py-2.5 rounded-[10px] border-2 border-[#08090B] bg-[#FF6845] text-[#08090B] studio-label font-bold cursor-pointer"
                        >
                          {t('voidAndCancelBtn')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ---------------- STEP 4: DONE ---------------- */}
          {project.step === 'DONE' && (
            <div
              className="border-2 border-[#08090B] rounded-[12px] bg-[#08090B] text-[#FAF8F3] p-9 md:p-14 space-y-8"
              style={{ boxShadow: '6px 6px 0 #CDF22B' }}
            >
              <NoLoginSticker text={t('tagline')} />

              <HeadlineWithSquiggle
                text={
                  project.statusWord === 'VOIDED'
                    ? t('voidedHeadline')
                    : `${t('paidHeadline')}.`
                }
                className="font-display text-[clamp(3.2rem,9vw,6.5rem)] leading-[0.95] text-[#CDF22B]"
                squiggleColor="#FFC900"
              />

              <div className="space-y-2">
                <div className="font-money-id text-3xl md:text-5xl font-bold text-[#FAF8F3]">
                  {formatUsd(project.paidAmountUsd ?? payoutInfo.usd)} ≈{' '}
                  {formatInrFromUsd(project.paidAmountUsd ?? payoutInfo.usd)}
                </div>
                <div className="studio-label text-[#8A8780]">
                  {t('rateLabel')}{' '}
                  <span className="font-money-id">$1 = ₹{USD_INR_RATE}</span> ·{' '}
                  {t('paypalCaptureIdLabel')}{' '}
                  <span className="font-money-id text-[#FAF8F3]">
                    {project.paypalCaptureId || 'CAP-SANDBOX-VERIFIED'}
                  </span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    downloadProjectReceiptPdf({
                      projectId: project.id,
                      title: project.title,
                      clientName: project.clientName,
                      paidAmountUsd: project.paidAmountUsd ?? payoutInfo.usd,
                      paypalAuthorizationId: project.paypalAuthorizationId,
                      paypalCaptureId: project.paypalCaptureId,
                      completedDate: new Date().toISOString().slice(0, 10),
                    })
                  }
                  className="studio-btn studio-btn-primary px-8 py-4 studio-label font-bold cursor-pointer"
                >
                  {t('downloadReceiptBtn')}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(
                    `Payment of $${
                      project.paidAmountUsd ?? payoutInfo.usd
                    } USD (${formatInrFromUsd(
                      project.paidAmountUsd ?? payoutInfo.usd
                    )}) released via Bharosa for "${project.title}"! ${origin}/p/${project.id}?k=${project.clientKey}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="studio-btn studio-btn-secondary px-7 py-4 studio-label font-semibold"
                >
                  {t('shareReceiptWhatsappBtn')}
                </a>
              </div>
            </div>
          )}
        </main>
      )}

      {/* =====================================================================
          CONFIRMATION MODAL WITH BIG BUTTONS BEFORE RELEASING MONEY
      ===================================================================== */}
      {confirmReleaseAmount !== null && project && (
        <div className="fixed inset-0 z-50 bg-[#08090B]/75 flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] text-[#08090B] p-8 md:p-10 space-y-6"
            style={{ boxShadow: '6px 6px 0 #08090B' }}
          >
            <h2 className="font-display text-3xl md:text-4xl leading-tight">
              {t('confirmModalTitle')}
            </h2>

            <div className="py-4 border-t-2 border-b-2 border-[#08090B]">
              <HandDrawnCircle>
                <div className="font-money-id text-4xl md:text-5xl font-bold text-[#08090B]">
                  {formatUsd(confirmReleaseAmount)}
                </div>
              </HandDrawnCircle>
              <div className="studio-label text-[#8A8780] mt-2">
                ≈{' '}
                <span className="font-money-id font-semibold text-[#08090B]">
                  {formatInrFromUsd(confirmReleaseAmount)}
                </span>{' '}
                {t('confirmModalToFreelancer')}
              </div>
            </div>

            <p className="font-body text-base text-[#08090B]/80 leading-relaxed">
              {t('confirmModalDesc')}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={executeConfirmedRelease}
                className="studio-btn studio-btn-primary flex-1 inline-flex items-center justify-center gap-2 px-7 py-4 font-body text-base font-bold cursor-pointer"
              >
                {t('confirmReleaseYesBtn')} (
                <span className="font-money-id">
                  {formatUsd(confirmReleaseAmount)}
                </span>
                )
              </button>

              <button
                type="button"
                onClick={() => setConfirmReleaseAmount(null)}
                className="studio-btn studio-btn-secondary inline-flex items-center justify-center px-6 py-4 studio-label font-semibold cursor-pointer"
              >
                {t('confirmReleaseBackBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =====================================================================
          FOOTER
      ===================================================================== */}
      <footer className="w-full border-t-2 border-[#08090B] bg-[#FAF8F3] px-6 md:px-12 py-6">
        <div className="max-w-[1380px] mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="inline-flex items-center gap-2.5">
            <img
              src="/assets/aistudio/bharosa-icon_9b6651f5.svg"
              alt="Bharosa"
              className="w-6 h-6 rounded-[6px] border border-[#08090B]"
            />
            <span className="studio-label text-[#08090B] font-semibold">
              Bharosa — {t('tagline')}
            </span>
          </div>

          <div className="inline-flex items-center gap-2.5 text-[#08090B]">
            <span className="studio-label text-[#8A8780]">
              {t('footerEscrowPoweredBy')}
            </span>
            <PayPalLogoMark className="h-5" />
          </div>
        </div>
      </footer>

      {/* =====================================================================
          MOBILE BOTTOM TAB BAR (Includes Home, New, My projects, Help, Log in)
          Lime dot ONLY on the active tab
      ===================================================================== */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-[#FAF8F3] border-t-2 border-[#08090B] grid grid-cols-5 h-16">
        {(
          [
            { id: 'HOME', label: t('navHome'), Icon: SketchHomeIcon },
            { id: 'NEW_PROJECT', label: t('navNewShort'), Icon: SketchPlusIcon },
            {
              id: 'MY_PROJECTS',
              label: t('navProjects'),
              Icon: SketchFolderIcon,
            },
            { id: 'HELP', label: t('navHelp'), Icon: SketchHelpIcon },
            { id: 'LOGIN', label: t('loginBtn'), Icon: SketchUserIcon },
          ] as Array<{
            id: ScreenId;
            label: string;
            Icon: React.FC<{ className?: string }>;
          }>
        ).map((tab) => {
          const isActive =
            screen === tab.id ||
            (screen === 'PROJECT' && tab.id === 'MY_PROJECTS');
          const IconComp = tab.Icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigateTo(tab.id)}
              className="flex flex-col items-center justify-center gap-0.5 cursor-pointer relative"
            >
              {isActive && (
                <span className="w-2 h-2 rounded-full bg-[#CDF22B] border border-[#08090B] absolute top-1" />
              )}
              <IconComp
                className={`w-5 h-5 mt-1 ${
                  isActive ? 'text-[#08090B]' : 'text-[#8A8780]'
                }`}
              />
              <span
                className={`text-[11px] leading-none ${
                  isActive
                    ? 'text-[#08090B] font-semibold'
                    : 'text-[#8A8780] font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
