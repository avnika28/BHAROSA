import { ChecklistItem, DeliveredFile, DeliveryPayload, EscrowProject } from '../types/escrow';

/**
 * Generates a real PNG base64 data URL in the browser using an offscreen canvas
 * so Gemini Vision can inspect actual visual logo concepts during deliverable review.
 */
export function generateLogoConceptPng(
  conceptNumber: number,
  title: string,
  accentHex: string
): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 480;
  canvas.height = 320;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#08090B';
  ctx.fillRect(0, 0, 480, 320);

  // Structural hairline grid
  ctx.strokeStyle = 'rgba(250, 248, 243, 0.16)';
  ctx.lineWidth = 1;
  ctx.strokeRect(20, 20, 440, 280);
  ctx.beginPath();
  ctx.moveTo(20, 70);
  ctx.lineTo(460, 70);
  ctx.stroke();

  // Top metadata
  ctx.fillStyle = '#8A8780';
  ctx.font = '12px monospace';
  ctx.fillText(`COLLEGE FEST 2026 // CONCEPT 0${conceptNumber}`, 36, 50);

  // Geometric emblem
  ctx.fillStyle = accentHex;
  if (conceptNumber === 1) {
    // Brutalist Starburst
    ctx.fillRect(60, 110, 90, 90);
    ctx.fillStyle = '#08090B';
    ctx.fillRect(85, 135, 40, 40);
  } else if (conceptNumber === 2) {
    // Kinetic Soundwave Rings
    ctx.beginPath();
    ctx.arc(105, 155, 48, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#08090B';
    ctx.beginPath();
    ctx.arc(105, 155, 22, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Architectural Monogram
    ctx.beginPath();
    ctx.moveTo(60, 200);
    ctx.lineTo(105, 105);
    ctx.lineTo(150, 200);
    ctx.closePath();
    ctx.fill();
  }

  // Main Typography
  ctx.fillStyle = '#FAF8F3';
  ctx.font = 'bold 34px sans-serif';
  ctx.fillText(title.toUpperCase(), 180, 150);

  ctx.fillStyle = accentHex;
  ctx.font = '14px monospace';
  ctx.fillText('ANNUAL COLLEGIATE FESTIVAL', 180, 182);

  ctx.fillStyle = '#8A8780';
  ctx.font = '11px monospace';
  ctx.fillText('2400x1600 PX // RGB // PNG EXPORT', 36, 278);

  return canvas.toDataURL('image/png');
}

export const DEMO_CHECKLIST: ChecklistItem[] = [
  {
    id: 'CHK-01',
    title: '3 Distinct Logo Concepts',
    criterion: 'Deliver 3 unique logo concept variations for the college fest brand identity.',
    verificationType: 'OBJECTIVE',
    weight: 30,
    clientApproved: true,
    freelancerApproved: true,
    status: 'PASS',
    reason: 'Verified 3 distinct logo concept image assets (Concept 01, 02, and 03) in delivery.',
  },
  {
    id: 'CHK-02',
    title: 'High-Resolution PNG Exports',
    criterion: 'Provide raster PNG files for all delivered logo concepts.',
    verificationType: 'OBJECTIVE',
    weight: 25,
    clientApproved: true,
    freelancerApproved: true,
    status: 'PASS',
    reason: 'All 3 logo concept PNG exports verified with valid image/png MIME headers.',
  },
  {
    id: 'CHK-03',
    title: 'Scalable Vector SVG Source Files',
    criterion: 'Include editable .svg vector files with outlined typography paths.',
    verificationType: 'OBJECTIVE',
    weight: 25,
    clientApproved: true,
    freelancerApproved: true,
    status: 'PASS',
    reason: 'Verified vector .svg source files containing valid <svg> path geometry.',
  },
  {
    id: 'CHK-04',
    title: 'Fest Aesthetic Direction & 2 Revisions Sign-off',
    criterion: 'Creative alignment with college fest energy and client sign-off on 2 revision rounds.',
    verificationType: 'SUBJECTIVE',
    weight: 20,
    clientApproved: true,
    freelancerApproved: true,
    status: 'UNCLEAR',
    reason: 'Subjective aesthetic direction and client satisfaction require human client confirmation.',
  },
];

export function buildCompleteDemoDelivery(): DeliveryPayload {
  const png1 = generateLogoConceptPng(1, 'AURA FEST 26', '#CDF22B');
  const png2 = generateLogoConceptPng(2, 'PULSE CAMPUS', '#FFC900');
  const png3 = generateLogoConceptPng(3, 'VORTEX 2026', '#FAF8F3');

  const files: DeliveredFile[] = [
    {
      id: 'FILE-01',
      name: 'concept-01-aura-brutalist.png',
      mimeType: 'image/png',
      sizeBytes: 184320,
      base64Data: png1,
    },
    {
      id: 'FILE-02',
      name: 'concept-02-pulse-kinetic.png',
      mimeType: 'image/png',
      sizeBytes: 192400,
      base64Data: png2,
    },
    {
      id: 'FILE-03',
      name: 'concept-03-vortex-monogram.png',
      mimeType: 'image/png',
      sizeBytes: 176110,
      base64Data: png3,
    },
    {
      id: 'FILE-04',
      name: 'college-fest-master-vectors.svg',
      mimeType: 'image/svg+xml',
      sizeBytes: 42800,
      extractedText:
        '<svg viewBox="0 0 1200 800" xmlns="http://www.w3.org/2000/svg"><!-- Outlined vectors for Concept 1, Concept 2, Concept 3 --></svg>',
    },
    {
      id: 'FILE-05',
      name: 'revision-log-v1-v2.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 68400,
      extractedText:
        'REVISION LOG - COLLEGE FEST LOGO DESIGN\nRevision 1: Adjusted kerning on primary wordmark and tested high-contrast Neon Lime on Midnight Black.\nRevision 2: Finalized 3 logo concepts in both PNG and SVG vector master packages.',
    },
  ];

  return {
    submittedAt: '2026-11-10T22:45:00Z',
    note: 'Delivered all 3 college fest logo concepts (Aura Brutalist, Pulse Kinetic, Vortex Monogram) in high-res PNG + master scalable SVG vectors, incorporating both requested revision rounds.',
    links: [
      'https://figma.com/file/college-fest-2026-logo-system',
      'https://github.com/studio-kuro/college-fest-svg-kit',
    ],
    files,
  };
}

export function buildIncompleteDemoDelivery(): DeliveryPayload {
  const png1 = generateLogoConceptPng(1, 'AURA FEST 26', '#CDF22B');
  const png2 = generateLogoConceptPng(2, 'PULSE CAMPUS', '#FFC900');

  const files: DeliveredFile[] = [
    {
      id: 'FILE-INC-01',
      name: 'concept-01-aura-brutalist.png',
      mimeType: 'image/png',
      sizeBytes: 184320,
      base64Data: png1,
    },
    {
      id: 'FILE-INC-02',
      name: 'concept-02-pulse-kinetic.png',
      mimeType: 'image/png',
      sizeBytes: 192400,
      base64Data: png2,
    },
    {
      id: 'FILE-INC-03',
      name: 'delivery-notes-draft.txt',
      mimeType: 'text/plain',
      sizeBytes: 1240,
      extractedText:
        'Attached 2 initial logo concepts in PNG format. Concept 3 and the SVG vector files are not included in this package.',
    },
  ];

  return {
    submittedAt: '2026-11-10T22:48:00Z',
    note: 'Uploading 2 logo concepts in PNG format. Did not finish the 3rd concept or SVG vector outlines before the deadline.',
    links: ['https://figma.com/file/college-fest-draft-v1'],
    files,
  };
}

export function createSeedDemoProject(mode: 'COMPLETE' | 'INCOMPLETE' = 'COMPLETE'): EscrowProject {
  const isComplete = mode === 'COMPLETE';
  const checklist: ChecklistItem[] = isComplete
    ? DEMO_CHECKLIST.map((item) => ({ ...item }))
    : [
        {
          id: 'CHK-01',
          title: '3 Distinct Logo Concepts',
          criterion: 'Deliver 3 unique logo concept variations for the college fest brand identity.',
          verificationType: 'OBJECTIVE',
          weight: 30,
          clientApproved: true,
          freelancerApproved: true,
          status: 'FAIL',
          reason: 'Only 2 logo concepts were delivered (concept-01 and concept-02); Concept #3 is missing.',
        },
        {
          id: 'CHK-02',
          title: 'High-Resolution PNG Exports',
          criterion: 'Provide raster PNG files for delivered logo concepts.',
          verificationType: 'OBJECTIVE',
          weight: 25,
          clientApproved: true,
          freelancerApproved: true,
          status: 'PASS',
          reason: 'Delivered concepts include valid high-resolution raster PNG exports.',
        },
        {
          id: 'CHK-03',
          title: 'Scalable Vector SVG Source Files',
          criterion: 'Include editable .svg vector files with outlined typography paths.',
          verificationType: 'OBJECTIVE',
          weight: 25,
          clientApproved: true,
          freelancerApproved: true,
          status: 'FAIL',
          reason: 'Zero .svg vector files found in the delivery payload.',
        },
        {
          id: 'CHK-04',
          title: 'Fest Aesthetic Direction & 2 Revisions Sign-off',
          criterion: 'Creative alignment with college fest energy and client sign-off on 2 revision rounds.',
          verificationType: 'SUBJECTIVE',
          weight: 20,
          clientApproved: true,
          freelancerApproved: true,
          status: 'UNCLEAR',
          reason: 'Subjective aesthetic quality and revision satisfaction require human client decision.',
        },
      ];

  const codeCalculatedPercent = isComplete ? 80 : 25;
  const codeCalculatedAmount = Number(((200 * codeCalculatedPercent) / 100).toFixed(2));

  return {
    id: 'ESC-2026-8841',
    title: 'LOGO DESIGN FOR A COLLEGE FEST',
    brief:
      'Logo design for a college fest, $200, 3 logo concepts, PNG + SVG, 2 revisions. High-impact editorial identity suitable for stage banners, merch, and digital wristbands.',
    amount: 200,
    deadline: '2026-11-18',
    clientName: 'Aarav Mehta (Fest Committee Chair)',
    freelancerName: 'Studio Kuro (Lead Designer)',
    state: 'Reviewed',
    checklist,
    paypal: {
      orderId: 'ORD-99281AX402KL',
      authorizationId: 'AUTH-77410PL908ZX',
      status: 'AUTHORIZED',
      authorizedAmount: 200,
      capturedAmount: 0,
      refundedOrVoidedAmount: 0,
      currency: 'USD',
      payerEmail: 'fest.treasury@college.edu',
      payeeEmail: 'payouts@studiokuro.design',
      createdAt: '2026-11-10T21:10:00Z',
      authorizedAt: '2026-11-10T21:12:00Z',
    },
    delivery: isComplete ? buildCompleteDemoDelivery() : buildIncompleteDemoDelivery(),
    verdict: {
      name: isComplete ? 'release_payment' : 'hold_payment',
      args: isComplete
        ? {
            percent: 80,
            summary:
              'All 3 objective deliverables (3 concepts, PNG exports, SVG vectors) passed inspection. Subjective aesthetic item (20% weight) routed to human Client — approve CHK-04 for 100% full release ($200.00) or release 80% ($160.00) immediately.',
          }
        : {
            reason:
              'Incomplete delivery: only 2 of 3 logo concepts provided and SVG source vectors are completely missing.',
            summary:
              'Only PNG export format passed (25% weight). Missing 3rd logo concept (-30%) and missing SVG vector files (-25%). Recommend partial release of 25% ($50.00) or human client revision.',
          },
      timestamp: '2026-11-10T22:50:12Z',
      aiRecommendedPercent: codeCalculatedPercent,
      codeCalculatedPercent,
      codeCalculatedAmount,
      summary: isComplete
        ? 'All 3 objective deliverables (3 concepts, PNG exports, SVG vectors) passed Gemini Vision + File inspection (80% weight). Subjective item CHK-04 (20% weight) awaits human confirmation for 100% full release.'
        : 'Incomplete delivery detected: 2 of 3 concepts delivered, no SVG files attached. Deterministic guardrail computed 25% partial release ($50.00 of $200.00).',
    },
    autoReleaseSecondsRemaining: 172800, // 48h auto-release guardrail countdown
    disputeMessages: [
      {
        id: 'MSG-01',
        sender: 'FREELANCER',
        authorName: 'Studio Kuro (Freelancer)',
        text: isComplete
          ? 'Submitted all 3 logo concepts in PNG and SVG formats along with the 2 revision round notes.'
          : 'We delivered 2 polished PNG concepts that took 80% of our studio time; requesting 60% partial settlement even though SVG and Concept 3 were delayed.',
        timestamp: '2026-11-10 22:51 UTC',
      },
      {
        id: 'MSG-02',
        sender: 'CLIENT',
        authorName: 'Aarav Mehta (Client)',
        text: isComplete
          ? 'Checking the 3 concepts and SVG files now before confirming final capture.'
          : 'Our printing vendor strictly requires SVG vectors for the main stage backdrop, and the contract specified 3 concepts. Willing to settle fairly for the 2 PNGs.',
        timestamp: '2026-11-10 22:54 UTC',
      },
    ],
    settlementSliderPercent: isComplete ? 80 : 45,
    auditLog: [
      {
        id: 'LOG-01',
        timestamp: '21:10:04 UTC',
        actor: 'CLIENT',
        action: 'CONTRACT_CREATED',
        reason: 'Created project "Logo design for a college fest" ($200.00 USD) with 4 Gemini-structured checklist items.',
        amountDelta: '$200.00',
        badgeColor: 'GREY',
      },
      {
        id: 'LOG-02',
        timestamp: '21:11:19 UTC',
        actor: 'FREELANCER',
        action: 'CHECKLIST_LOCKED',
        reason: 'Both Client and Freelancer approved the 4 testable milestone criteria.',
        badgeColor: 'GREY',
      },
      {
        id: 'LOG-03',
        timestamp: '21:12:00 UTC',
        actor: 'PAYPAL_WEBHOOK',
        action: 'PAYMENT.AUTHORIZATION.CREATED',
        reason: 'PayPal Order ORD-99281AX402KL authorized via AUTH-77410PL908ZX. Status: HELD, NOT CAPTURED.',
        amountDelta: '$200.00 HELD',
        badgeColor: 'YELLOW',
      },
      {
        id: 'LOG-04',
        timestamp: '22:45:00 UTC',
        actor: 'FREELANCER',
        action: 'DELIVERABLES_SUBMITTED',
        reason: isComplete
          ? 'Uploaded 5 files (3 PNG concepts, 1 master SVG vector file, 1 revision PDF) + 2 repository links.'
          : 'Uploaded 3 files (2 PNG concepts, 1 draft note). Missing 3rd concept and SVG vectors.',
        badgeColor: 'YELLOW',
      },
      {
        id: 'LOG-05',
        timestamp: '22:50:12 UTC',
        actor: 'GEMINI_VERDICT',
        action: isComplete ? 'TOOL_CALL: release_payment(80)' : 'TOOL_CALL: hold_payment("Missing SVG & 3rd concept")',
        reason: isComplete
          ? 'Objective ratio: 80% PASS, 0% FAIL, 20% UNCLEAR (routed to human). Deterministic guardrail payout: $160.00 (or $200.00 upon human approval of CHK-04).'
          : 'Objective ratio: 25% PASS, 55% FAIL, 20% UNCLEAR. Deterministic guardrail partial release: 25% ($50.00).',
        amountDelta: isComplete ? '80% ($160.00)' : '25% ($50.00)',
        badgeColor: isComplete ? 'LIME' : 'CORAL',
      },
    ],
  };
}
