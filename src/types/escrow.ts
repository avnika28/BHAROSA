export type EscrowState =
  | 'Created'
  | 'Funded'
  | 'Delivered'
  | 'Reviewed'
  | 'Released'
  | 'Partially released'
  | 'Voided'
  | 'Disputed';

export type UserRole = 'CLIENT' | 'FREELANCER';

export type VerificationType = 'OBJECTIVE' | 'SUBJECTIVE';

export type VerdictItemStatus = 'PENDING' | 'PASS' | 'FAIL' | 'UNCLEAR';

export interface ChecklistItem {
  id: string;
  title: string;
  criterion: string;
  verificationType: VerificationType;
  weight: number;
  clientApproved: boolean;
  freelancerApproved: boolean;
  status: VerdictItemStatus;
  reason?: string;
  humanOverride?: 'PASS' | 'FAIL';
}

export interface DeliveredFile {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  extractedText?: string;
  base64Data?: string;
}

export interface DeliveryPayload {
  submittedAt: string;
  note: string;
  links: string[];
  files: DeliveredFile[];
}

export interface PayPalLedgerState {
  orderId?: string;
  authorizationId?: string;
  captureId?: string;
  status: 'UNFUNDED' | 'CREATED' | 'AUTHORIZED' | 'CAPTURED' | 'PARTIALLY_CAPTURED' | 'VOIDED';
  authorizedAmount: number;
  capturedAmount: number;
  refundedOrVoidedAmount: number;
  currency: string;
  payerEmail?: string;
  payeeEmail?: string;
  createdAt?: string;
  authorizedAt?: string;
  capturedAt?: string;
  voidedAt?: string;
  lastRawRequest?: Record<string, unknown>;
  lastRawResponse?: Record<string, unknown>;
}

export interface GeminiFunctionCallLog {
  name: 'release_payment' | 'hold_payment' | string;
  args: Record<string, unknown>;
  timestamp: string;
  aiRecommendedPercent: number;
  codeCalculatedPercent: number;
  codeCalculatedAmount: number;
  summary: string;
}

export interface DisputeMessage {
  id: string;
  sender: UserRole;
  authorName: string;
  text: string;
  timestamp: string;
}

export interface DisputeArbitration {
  neutralSummary: string;
  keyFindings: string[];
  suggestedFreelancerPercent: number;
  rationale: string;
  generatedAt: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: 'SYSTEM' | 'CLIENT' | 'FREELANCER' | 'GEMINI_VERDICT' | 'PAYPAL_WEBHOOK';
  action: string;
  reason: string;
  amountDelta?: string;
  badgeColor: 'LIME' | 'YELLOW' | 'CORAL' | 'GREY';
  rawPayload?: Record<string, unknown>;
}

export interface EscrowProject {
  id: string;
  title: string;
  brief: string;
  amount: number;
  deadline: string;
  clientName: string;
  freelancerName: string;
  state: EscrowState;
  checklist: ChecklistItem[];
  paypal: PayPalLedgerState;
  delivery?: DeliveryPayload;
  verdict?: GeminiFunctionCallLog;
  autoReleaseSecondsRemaining?: number;
  disputeMessages: DisputeMessage[];
  disputeArbitration?: DisputeArbitration;
  settlementSliderPercent: number;
  auditLog: AuditLogEntry[];
}
