import React, { useEffect, useState } from 'react';
import { ArrowUpRight, Sparkles, Clock, FastForward, ShieldAlert, Check, X } from 'lucide-react';
import {
  ChecklistItem,
  EscrowState,
  GeminiFunctionCallLog,
  UserRole,
} from '../types/escrow';
import { calculateGuardrailRelease } from '../services/geminiClient';
import { CountUpAmount } from './CountUpAmount';

interface TheVerdictPanelProps {
  checklist: ChecklistItem[];
  totalAmount: number;
  verdict?: GeminiFunctionCallLog;
  projectState: EscrowState;
  role: UserRole;
  isReviewing: boolean;
  onRunGeminiReview: () => void;
  onHumanOverrideItem: (itemId: string, decision: 'PASS' | 'FAIL' | undefined) => void;
  onConfirmCapture: (captureAmount: number, capturePercent: number, isAutoRelease?: boolean) => void;
  onVoidAuthorization: () => void;
  onOpenDispute: () => void;
}

export const TheVerdictPanel: React.FC<TheVerdictPanelProps> = ({
  checklist,
  totalAmount,
  verdict,
  projectState,
  role,
  isReviewing,
  onRunGeminiReview,
  onHumanOverrideItem,
  onConfirmCapture,
  onVoidAuthorization,
  onOpenDispute,
}) => {
  const guardrail = calculateGuardrailRelease(checklist, totalAmount);

  // Simulated Auto-Release Countdown Timer (starts at 48 hours = 172800s)
  const [secondsLeft, setSecondsLeft] = useState<number>(172785);

  useEffect(() => {
    if (
      projectState === 'Released' ||
      projectState === 'Partially released' ||
      projectState === 'Voided'
    ) {
      return;
    }
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [projectState]);

  const formatCountdown = (totalSec: number) => {
    const hrs = Math.floor(totalSec / 3600);
    const mins = Math.floor((totalSec % 3600) / 60);
    const secs = totalSec % 60;
    return `${String(hrs).padStart(2, '0')}H : ${String(mins).padStart(2, '0')}M : ${String(
      secs
    ).padStart(2, '0')}S`;
  };

  const isSettled =
    projectState === 'Released' ||
    projectState === 'Partially released' ||
    projectState === 'Voided';

  return (
    <section
      id="verdict-section"
      className="bg-[#08090B] text-[#FAF8F3] border border-[#08090B]"
    >
      {/* Top Banner of THE VERDICT */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 md:px-10 py-6 border-b border-[#FAF8F3]/15">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#CDF22B]" />
            <span className="font-mono-tech text-[11px] text-[#8A8780]">
              GEMINI MULTIMODAL + FUNCTION CALLING AUDITOR // GUARDRAIL ENFORCED
            </span>
          </div>
          <h2 className="font-anton text-5xl md:text-7xl leading-none tracking-wide text-[#FAF8F3]">
            THE VERDICT
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={onRunGeminiReview}
            disabled={isReviewing}
            className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-[#CDF22B] text-[#CDF22B] hover:bg-[#CDF22B] hover:text-[#08090B] font-mono-tech text-xs transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <span className="w-2 h-2 rounded-full bg-current" />
            {isReviewing ? 'INSPECTING DELIVERABLES...' : 'RUN GEMINI AI REVIEW'}
            <Sparkles className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Skeleton Loader when Gemini Function Calling is in flight */}
      {isReviewing ? (
        <div className="p-6 md:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
          <div className="lg:col-span-8 space-y-4">
            <div className="h-6 w-72 bg-[#FAF8F3]/10" />
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="p-5 border border-[#FAF8F3]/15 flex items-center justify-between"
              >
                <div className="space-y-2 w-2/3">
                  <div className="h-3 w-32 bg-[#FAF8F3]/15" />
                  <div className="h-5 w-3/4 bg-[#FAF8F3]/20" />
                  <div className="h-3 w-full bg-[#FAF8F3]/10" />
                </div>
                <div className="h-8 w-24 bg-[#FAF8F3]/15" />
              </div>
            ))}
          </div>
          <div className="lg:col-span-4 h-96 bg-[#CDF22B]/20 border border-[#CDF22B]/40 p-6 flex flex-col justify-between">
            <div className="h-4 w-40 bg-[#FAF8F3]/20" />
            <div className="h-24 w-full bg-[#FAF8F3]/20" />
            <div className="h-12 w-full bg-[#FAF8F3]/20" />
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left 8 Columns: Per-Item Checklist Verdict Rows + Function Call Telemetry */}
          <div className="lg:col-span-8 border-b lg:border-b-0 lg:border-r border-[#FAF8F3]/15">
            {/* Function Call Telemetry Bar */}
            <div className="px-6 md:px-10 py-4 border-b border-[#FAF8F3]/15 bg-[#FAF8F3]/[0.03] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-mono-tech text-[11px] text-[#8A8780]">
                  GEMINI FUNCTION INVOCATION:
                </span>
                <code className="font-mono-tech text-xs px-2.5 py-0.5 border border-[#FAF8F3]/20 text-[#CDF22B]">
                  {verdict?.name === 'hold_payment'
                    ? `hold_payment(reason="${String(
                        verdict?.args?.reason || 'Incomplete criteria'
                      ).slice(0, 42)}...")`
                    : `release_payment(percent=${guardrail.calculatedPercent})`}
                </code>
              </div>
              <div className="font-mono-tech text-[11px] text-[#8A8780]">
                PASS: <span className="text-[#CDF22B]">{guardrail.passWeight}%</span> · FAIL:{' '}
                <span className="text-[#FF6845]">{guardrail.failWeight}%</span> · UNCLEAR:{' '}
                <span className="text-[#8A8780]">{guardrail.unclearWeight}%</span>
              </div>
            </div>

            {/* Per-Item Rows */}
            <div className="divide-y divide-[#FAF8F3]/15">
              {checklist.map((item) => {
                const effectiveStatus = item.humanOverride || item.status;
                const isSubjective = item.verificationType === 'SUBJECTIVE';

                return (
                  <div
                    key={item.id}
                    className="px-6 md:px-10 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF8F3]/[0.02] transition-colors"
                  >
                    <div className="space-y-1.5 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2 font-mono-tech text-[10px]">
                        <span className="text-[#FAF8F3]">{item.id}</span>
                        <span className="text-[#8A8780]">·</span>
                        <span className="text-[#8A8780]">WEIGHT {item.weight}%</span>
                        <span className="text-[#8A8780]">·</span>
                        <span
                          className={
                            isSubjective ? 'text-[#FFC900]' : 'text-[#8A8780]'
                          }
                        >
                          {item.verificationType}
                          {isSubjective ? ' (HUMAN GUARDRAIL)' : ''}
                        </span>
                        {item.humanOverride && (
                          <>
                            <span className="text-[#8A8780]">·</span>
                            <span className="text-[#CDF22B]">
                              HUMAN OVERRIDE: {item.humanOverride}
                            </span>
                          </>
                        )}
                      </div>

                      <div className="text-base font-medium text-[#FAF8F3] font-inter">
                        {item.title}
                      </div>

                      <p className="text-xs text-[#8A8780] font-inter leading-relaxed">
                        {item.reason || item.criterion}
                      </p>

                      {/* Human Guardrail Controls for UNCLEAR or Subjective items */}
                      {(item.status === 'UNCLEAR' || isSubjective) && !isSettled && (
                        <div className="pt-2 flex flex-wrap items-center gap-2">
                          <span className="font-mono-tech text-[10px] text-[#FFC900]">
                            SUBJECTIVE ITEM → HUMAN CLIENT DECISION:
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              onHumanOverrideItem(
                                item.id,
                                item.humanOverride === 'PASS' ? undefined : 'PASS'
                              )
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono-tech text-[10px] transition-colors whitespace-nowrap shrink-0 ${
                              item.humanOverride === 'PASS'
                                ? 'bg-[#CDF22B] text-[#08090B] border-[#CDF22B] font-bold'
                                : 'border-[#CDF22B]/50 text-[#CDF22B] hover:bg-[#CDF22B] hover:text-[#08090B]'
                            }`}
                          >
                            <Check className="w-3 h-3" />
                            APPROVE (+{item.weight}%)
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onHumanOverrideItem(
                                item.id,
                                item.humanOverride === 'FAIL' ? undefined : 'FAIL'
                              )
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border font-mono-tech text-[10px] transition-colors whitespace-nowrap shrink-0 ${
                              item.humanOverride === 'FAIL'
                                ? 'bg-[#FF6845] text-[#08090B] border-[#FF6845] font-bold'
                                : 'border-[#FF6845]/50 text-[#FF6845] hover:bg-[#FF6845] hover:text-[#08090B]'
                            }`}
                          >
                            <X className="w-3 h-3" />
                            REJECT (0%)
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Right Status Word in Space Mono Caps: PASS / FAIL / UNCLEAR */}
                    <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                      {effectiveStatus === 'PASS' && (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#CDF22B] font-mono-tech text-sm font-bold text-[#CDF22B]">
                          <span className="w-2 h-2 rounded-full bg-[#CDF22B]" />
                          PASS
                        </span>
                      )}
                      {effectiveStatus === 'FAIL' && (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#FF6845] font-mono-tech text-sm font-bold text-[#FF6845]">
                          <span className="w-2 h-2 rounded-full bg-[#FF6845]" />
                          FAIL
                        </span>
                      )}
                      {(effectiveStatus === 'UNCLEAR' || effectiveStatus === 'PENDING') && (
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#8A8780] font-mono-tech text-sm font-bold text-[#8A8780]">
                          <span className="w-2 h-2 rounded-full bg-[#8A8780]" />
                          UNCLEAR
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Guardrail Executive Summary Footer */}
            <div className="px-6 md:px-10 py-5 border-t border-[#FAF8F3]/15 bg-[#FAF8F3]/[0.02]">
              <div className="font-mono-tech text-[10px] text-[#8A8780] mb-1">
                GUARDRAIL AUDIT NOTE (CODE-COMPUTED RATIO)
              </div>
              <p className="text-sm text-[#FAF8F3]/90 font-inter leading-relaxed">
                {verdict?.summary ||
                  'AI only recommends per-item status. The release percentage and dollar payout are deterministically computed in code from the verified PASS/FAIL weight ratio.'}
              </p>
            </div>
          </div>

          {/* Right 4 Columns: Big Neon Lime "RELEASE 80%" Block */}
          <div className="lg:col-span-4 flex flex-col justify-between bg-[#CDF22B] text-[#08090B] p-6 md:p-8">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-[#08090B]/20 mb-6">
                <span className="font-mono-tech text-[10px] font-bold text-[#08090B]">
                  DETERMINISTIC PAYOUT BLOCK
                </span>
                <span className="font-mono-tech text-[10px] px-2 py-0.5 border border-[#08090B] text-[#08090B]">
                  CODE GUARDRAIL
                </span>
              </div>

              {/* Giant RELEASE XX% Headline in Anton */}
              <div className="font-anton text-[clamp(3.5rem,6vw,5.75rem)] leading-[0.9] tracking-tight text-[#08090B] mb-3">
                RELEASE{' '}
                <CountUpAmount
                  value={guardrail.calculatedPercent}
                  decimals={0}
                  suffix="%"
                />
              </div>

              {/* Computed Capture Dollar Value */}
              <div className="flex items-baseline gap-2 mb-6 pb-6 border-b border-[#08090B]/20">
                <span className="font-anton text-4xl text-[#08090B]">
                  <CountUpAmount
                    value={guardrail.calculatedAmount}
                    prefix="$"
                    decimals={2}
                  />
                </span>
                <span className="font-mono-tech text-xs text-[#08090B]/75">
                  OF ${totalAmount.toFixed(2)} USD HELD
                </span>
              </div>

              {/* Mathematical Breakdown Table */}
              <div className="space-y-2 font-mono-tech text-[11px] mb-6">
                <div className="flex justify-between">
                  <span>CAPTURE TO FREELANCER:</span>
                  <span className="font-bold">${guardrail.calculatedAmount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>RELEASED BACK TO CLIENT:</span>
                  <span className="font-bold">
                    ${(totalAmount - guardrail.calculatedAmount).toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>PAYPAL FINAL_CAPTURE FLAG:</span>
                  <span className="font-bold">TRUE</span>
                </div>
              </div>

              {/* Auto-Release Countdown Guardrail Box */}
              <div className="p-3.5 border border-[#08090B] bg-[#08090B] text-[#FAF8F3] mb-6">
                <div className="flex items-center justify-between mb-1">
                  <span className="inline-flex items-center gap-1.5 font-mono-tech text-[10px] text-[#FFC900]">
                    <Clock className="w-3 h-3" />
                    AUTO-RELEASE GUARDRAIL TIMER
                  </span>
                  {!isSettled && (
                    <button
                      type="button"
                      onClick={() => {
                        setSecondsLeft(0);
                        onConfirmCapture(
                          guardrail.calculatedAmount,
                          guardrail.calculatedPercent,
                          true
                        );
                      }}
                      className="inline-flex items-center gap-1 font-mono-tech text-[10px] text-[#CDF22B] hover:underline"
                      title="Simulate 48h timer expiration"
                    >
                      <FastForward className="w-3 h-3" />
                      SIMULATE EXPIRY
                    </button>
                  )}
                </div>
                <div className="font-mono-tech text-base text-[#FAF8F3] tracking-wider">
                  {isSettled ? 'SETTLED // TIMER HALTED' : formatCountdown(secondsLeft)}
                </div>
                <p className="text-[11px] text-[#8A8780] mt-1 font-inter">
                  If Client takes no action within 48h of AI review,{' '}
                  {guardrail.calculatedPercent}% (${guardrail.calculatedAmount.toFixed(2)}) auto-captures.
                </p>
              </div>
            </div>

            {/* Client Confirmation / Void / Dispute CTAs */}
            <div className="space-y-2.5">
              {role === 'FREELANCER' && !isSettled && (
                <div className="p-2.5 border border-[#08090B]/30 font-mono-tech text-[10px] text-[#08090B]">
                  VIEWING AS FREELANCER — SWITCH TO CLIENT ROLE OR CLICK BELOW TO SIMULATE CLIENT CONFIRMATION.
                </div>
              )}

              <button
                type="button"
                disabled={isSettled || guardrail.calculatedAmount <= 0}
                onClick={() =>
                  onConfirmCapture(
                    guardrail.calculatedAmount,
                    guardrail.calculatedPercent,
                    false
                  )
                }
                className="w-full inline-flex items-center justify-between px-5 py-3.5 rounded-full border-2 border-[#08090B] bg-[#08090B] text-[#FAF8F3] hover:bg-[#FAF8F3] hover:text-[#08090B] font-mono-tech text-xs font-bold transition-colors disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#CDF22B]" />
                  {isSettled
                    ? `SETTLED (${projectState.toUpperCase()})`
                    : `CONFIRM & CAPTURE $${guardrail.calculatedAmount.toFixed(2)}`}
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isSettled}
                  onClick={onVoidAuthorization}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full border border-[#08090B] bg-transparent text-[#08090B] hover:bg-[#FF6845] hover:border-[#FF6845] hover:text-[#08090B] font-mono-tech text-[11px] font-bold transition-colors disabled:opacity-40 whitespace-nowrap shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6845]" />
                  VOID HOLD (100%)
                </button>

                <button
                  type="button"
                  disabled={isSettled}
                  onClick={onOpenDispute}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-full border border-[#08090B] bg-transparent text-[#08090B] hover:bg-[#08090B] hover:text-[#FAF8F3] font-mono-tech text-[11px] font-bold transition-colors disabled:opacity-40 whitespace-nowrap shrink-0"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  DISPUTE SPLIT
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
