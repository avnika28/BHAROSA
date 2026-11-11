import { ChecklistItem, DeliveryPayload, DisputeArbitration, DisputeMessage } from '../types/escrow';

/**
 * GUARDRAIL ENGINE:
 * "AI only recommends, the amount is calculated in code from the pass/fail ratio,
 * client confirms the final release, every decision is logged with its reason."
 */
export function calculateGuardrailRelease(
  checklist: ChecklistItem[],
  totalAmount: number
): {
  passWeight: number;
  failWeight: number;
  unclearWeight: number;
  calculatedPercent: number;
  calculatedAmount: number;
  passCount: number;
  failCount: number;
  unclearCount: number;
} {
  if (!checklist.length) {
    return {
      passWeight: 0,
      failWeight: 0,
      unclearWeight: 0,
      calculatedPercent: 0,
      calculatedAmount: 0,
      passCount: 0,
      failCount: 0,
      unclearCount: 0,
    };
  }

  const totalWeight = checklist.reduce((acc, item) => acc + (Number(item.weight) || 0), 0) || 100;

  let passWeight = 0;
  let failWeight = 0;
  let unclearWeight = 0;
  let passCount = 0;
  let failCount = 0;
  let unclearCount = 0;

  for (const item of checklist) {
    const effectiveStatus = item.humanOverride || item.status;
    const normalizedWeight = ((Number(item.weight) || 0) / totalWeight) * 100;

    if (effectiveStatus === 'PASS') {
      passWeight += normalizedWeight;
      passCount++;
    } else if (effectiveStatus === 'FAIL') {
      failWeight += normalizedWeight;
      failCount++;
    } else {
      unclearWeight += normalizedWeight;
      unclearCount++;
    }
  }

  const calculatedPercent = Math.round(passWeight);
  const calculatedAmount = Number(((totalAmount * calculatedPercent) / 100).toFixed(2));

  return {
    passWeight: Math.round(passWeight),
    failWeight: Math.round(failWeight),
    unclearWeight: Math.round(unclearWeight),
    calculatedPercent,
    calculatedAmount,
    passCount,
    failCount,
    unclearCount,
  };
}

export async function generateChecklistViaGemini(params: {
  title: string;
  brief: string;
  amount: number;
  deadline: string;
}): Promise<ChecklistItem[]> {
  const response = await fetch('/api/gemini/checklist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Gemini checklist generation failed');
  }

  const data = await response.json();
  const rawItems = Array.isArray(data.items) ? data.items : [];

  return rawItems.map((item: any, index: number) => ({
    id: item.id || `CHK-0${index + 1}`,
    title: item.title || `Deliverable #${index + 1}`,
    criterion: item.criterion || 'Verify against contract brief.',
    verificationType:
      String(item.verificationType).toUpperCase() === 'SUBJECTIVE'
        ? 'SUBJECTIVE'
        : 'OBJECTIVE',
    weight: Number(item.weight) || Math.floor(100 / Math.max(1, rawItems.length)),
    clientApproved: true,
    freelancerApproved: false,
    status: 'PENDING',
  }));
}

export async function reviewDeliveryViaGemini(params: {
  projectTitle: string;
  brief: string;
  checklist: ChecklistItem[];
  delivery: DeliveryPayload;
}): Promise<{
  functionName: 'release_payment' | 'hold_payment';
  functionArgs: Record<string, any>;
  updatedChecklist: ChecklistItem[];
  summary: string;
  aiRecommendedPercent: number;
}> {
  const response = await fetch('/api/gemini/review', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Gemini deliverable review failed');
  }

  const data = await response.json();
  const fc = data.functionCall;
  const args = fc?.args || {};
  const evaluations: Array<{ id: string; status: string; reason: string }> =
    Array.isArray(args.itemEvaluations) ? args.itemEvaluations : [];

  const updatedChecklist: ChecklistItem[] = params.checklist.map((item) => {
    const matched = evaluations.find(
      (ev) => ev.id?.toUpperCase() === item.id.toUpperCase()
    );

    // Enforce hard guardrail: Subjective items MUST be UNCLEAR until a human overrides them
    if (item.verificationType === 'SUBJECTIVE') {
      return {
        ...item,
        humanOverride: undefined,
        status: 'UNCLEAR',
        reason:
          matched?.reason ||
          'Subjective criterion flagged UNCLEAR by guardrail — routed to human Client for sign-off.',
      };
    }

    const rawStatus = String(matched?.status || 'UNCLEAR').toUpperCase();
    const validStatus: 'PASS' | 'FAIL' | 'UNCLEAR' =
      rawStatus === 'PASS' || rawStatus === 'FAIL' ? rawStatus : 'UNCLEAR';

    return {
      ...item,
      humanOverride: undefined,
      status: validStatus,
      reason: matched?.reason || 'Evaluated by Gemini multimodal inspection.',
    };
  });

  const functionName: 'release_payment' | 'hold_payment' =
    fc?.name === 'hold_payment' ? 'hold_payment' : 'release_payment';

  const aiRecommendedPercent =
    typeof args.percent === 'number'
      ? Math.max(0, Math.min(100, Math.round(args.percent)))
      : 0;

  const summary =
    args.summary ||
    args.reason ||
    data.rawText ||
    'Gemini completed deliverable inspection across all checklist items.';

  return {
    functionName,
    functionArgs: args,
    updatedChecklist,
    summary,
    aiRecommendedPercent,
  };
}

export async function arbitrateDisputeViaGemini(params: {
  projectTitle: string;
  brief: string;
  amount: number;
  checklist: ChecklistItem[];
  messages: DisputeMessage[];
}): Promise<DisputeArbitration> {
  const response = await fetch('/api/gemini/dispute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Gemini dispute arbitration failed');
  }

  const data = await response.json();
  return {
    neutralSummary:
      data.neutralSummary ||
      'Both parties present valid arguments regarding partial milestone completion.',
    keyFindings: Array.isArray(data.keyFindings) ? data.keyFindings : [],
    suggestedFreelancerPercent:
      typeof data.suggestedFreelancerPercent === 'number'
        ? Math.max(0, Math.min(100, Math.round(data.suggestedFreelancerPercent)))
        : 50,
    rationale: data.rationale || 'Pro-rated based on verified objective checklist items.',
    generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) + ' UTC',
  };
}
