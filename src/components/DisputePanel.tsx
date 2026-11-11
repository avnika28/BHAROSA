import React, { useState } from 'react';
import { Scale, Send, Sparkles, ArrowUpRight } from 'lucide-react';
import {
  DisputeArbitration,
  DisputeMessage,
  EscrowState,
  UserRole,
} from '../types/escrow';
import { CountUpAmount } from './CountUpAmount';

interface DisputePanelProps {
  totalAmount: number;
  role: UserRole;
  projectState: EscrowState;
  messages: DisputeMessage[];
  arbitration?: DisputeArbitration;
  sliderPercent: number;
  isArbitrating: boolean;
  onSliderChange: (percent: number) => void;
  onSendMessage: (sender: UserRole, text: string) => void;
  onRunGeminiArbitration: () => void;
  onExecuteSettlement: (freelancerAmount: number, freelancerPercent: number) => void;
}

export const DisputePanel: React.FC<DisputePanelProps> = ({
  totalAmount,
  role,
  projectState,
  messages,
  arbitration,
  sliderPercent,
  isArbitrating,
  onSliderChange,
  onSendMessage,
  onRunGeminiArbitration,
  onExecuteSettlement,
}) => {
  const [draftText, setDraftText] = useState('');
  const [activeSender, setActiveSender] = useState<UserRole>(role);

  const freelancerPayout = Number(((totalAmount * sliderPercent) / 100).toFixed(2));
  const clientRefund = Number((totalAmount - freelancerPayout).toFixed(2));

  const isSettled =
    projectState === 'Released' ||
    projectState === 'Partially released' ||
    projectState === 'Voided';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftText.trim()) return;
    onSendMessage(activeSender, draftText.trim());
    setDraftText('');
  };

  return (
    <section
      id="dispute-section"
      className="border border-[#08090B] bg-[#FAF8F3] text-[#08090B]"
    >
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 md:px-10 py-6 border-b border-[#08090B]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-[#FF6845]" />
            <span className="font-mono-tech text-[11px] text-[#8A8780]">
               BILATERAL DISPUTE RESOLUTION // GEMINI NEUTRAL ARBITRATION
            </span>
          </div>
          <h3 className="font-anton text-4xl md:text-5xl leading-none text-[#08090B]">
            DISPUTE &amp; SETTLEMENT TRIBUNAL
          </h3>
        </div>

        <button
          type="button"
          onClick={onRunGeminiArbitration}
          disabled={isArbitrating}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-[#08090B] bg-[#08090B] text-[#FAF8F3] hover:bg-[#CDF22B] hover:text-[#08090B] font-mono-tech text-xs font-bold transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
        >
          <span className="w-2 h-2 rounded-full bg-[#CDF22B]" />
          {isArbitrating ? 'SYNTHESIZING EVIDENCE...' : 'GENERATE AI ARBITRATION SUMMARY'}
          <Sparkles className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12">
        {/* Left 6 Columns: Bilateral Statement Ledger */}
        <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-[#08090B] p-6 md:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="font-mono-tech text-xs text-[#08090B]">
                CHRONOLOGICAL STATEMENTS ({messages.length})
              </span>
              <span className="font-mono-tech text-[10px] text-[#8A8780]">
                BOTH PARTIES LOGGED
              </span>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1 mb-6">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-4 border ${
                    msg.sender === 'CLIENT'
                      ? 'border-[#08090B] bg-[#FAF8F3]'
                      : 'border-[#08090B] bg-[#08090B] text-[#FAF8F3]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5 font-mono-tech text-[10px]">
                    <span
                      className={
                        msg.sender === 'CLIENT' ? 'text-[#08090B] font-bold' : 'text-[#CDF22B]'
                      }
                    >
                      {msg.sender} // {msg.authorName}
                    </span>
                    <span className="text-[#8A8780]">{msg.timestamp}</span>
                  </div>
                  <p className="text-sm font-inter leading-relaxed">{msg.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Add Statement Form */}
          <form onSubmit={handleSubmit} className="pt-4 border-t border-[#08090B]/20 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono-tech text-[10px] text-[#8A8780]">
                SUBMIT EVIDENCE AS:
              </span>
              <div className="flex items-center gap-2">
                {(['CLIENT', 'FREELANCER'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setActiveSender(r)}
                    className={`px-3 py-1 rounded-full border font-mono-tech text-[10px] transition-colors whitespace-nowrap shrink-0 ${
                      activeSender === r
                        ? 'bg-[#08090B] text-[#FAF8F3] border-[#08090B]'
                        : 'border-[#08090B]/30 text-[#08090B] hover:border-[#08090B]'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder={`Enter ${activeSender.toLowerCase()} dispute statement or evidence...`}
                className="flex-1 bg-transparent border-b-2 border-[#08090B] py-2 px-1 text-sm font-inter text-[#08090B] placeholder:text-[#8A8780] focus:outline-none focus:border-[#CDF22B]"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#08090B] bg-[#FAF8F3] hover:bg-[#08090B] hover:text-[#FAF8F3] font-mono-tech text-xs transition-colors whitespace-nowrap shrink-0"
              >
                <Send className="w-3 h-3" />
                LOG STATEMENT
              </button>
            </div>
          </form>
        </div>

        {/* Right 6 Columns: Gemini Neutral Summary + Interactive Settlement Slider */}
        <div className="lg:col-span-6 p-6 md:p-8 flex flex-col justify-between space-y-6">
          {isArbitrating ? (
            <div className="space-y-4 animate-pulse p-5 border border-[#08090B]/20">
              <div className="h-4 w-48 bg-[#08090B]/15" />
              <div className="h-16 w-full bg-[#08090B]/10" />
              <div className="h-4 w-3/4 bg-[#08090B]/10" />
            </div>
          ) : (
            <div className="p-5 border border-[#08090B] bg-[#08090B] text-[#FAF8F3]">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 font-mono-tech text-[10px] text-[#CDF22B]">
                  <Scale className="w-3.5 h-3.5" />
                  GEMINI NEUTRAL ARBITRATION BRIEF
                </span>
                <span className="font-mono-tech text-[10px] text-[#8A8780]">
                  {arbitration?.generatedAt || 'READY'}
                </span>
              </div>

              <p className="text-sm text-[#FAF8F3]/90 font-inter leading-relaxed mb-4">
                {arbitration?.neutralSummary ||
                  'Click "GENERATE AI ARBITRATION SUMMARY" above to have Gemini evaluate both sides against the contract checklist and recommend a mathematical split.'}
              </p>

              {arbitration?.keyFindings && arbitration.keyFindings.length > 0 && (
                <ul className="space-y-1.5 border-t border-[#FAF8F3]/15 pt-3 mb-3">
                  {arbitration.keyFindings.map((finding, idx) => (
                    <li
                      key={idx}
                      className="text-xs text-[#FAF8F3]/80 font-inter flex items-start gap-2"
                    >
                      <span className="font-mono-tech text-[10px] text-[#FFC900] mt-0.5">
                        0{idx + 1}.
                      </span>
                      <span>{finding}</span>
                    </li>
                  ))}
                </ul>
              )}

              {arbitration && (
                <div className="pt-2 border-t border-[#FAF8F3]/15 flex items-center justify-between font-mono-tech text-[11px]">
                  <span className="text-[#8A8780]">AI SUGGESTED SETTLEMENT:</span>
                  <span className="text-[#CDF22B] font-bold">
                    {arbitration.suggestedFreelancerPercent}% TO FREELANCER ($
                    {((totalAmount * arbitration.suggestedFreelancerPercent) / 100).toFixed(2)})
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Settlement Slider Block */}
          <div className="p-6 border border-[#08090B] bg-[#FAF8F3]">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono-tech text-xs font-bold text-[#08090B]">
                INTERACTIVE SETTLEMENT SLIDER
              </span>
              <span className="font-mono-tech text-xs text-[#8A8780]">
                TOTAL CUSTODY: ${totalAmount.toFixed(2)} USD
              </span>
            </div>

            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={sliderPercent}
              onChange={(e) => onSliderChange(Number(e.target.value))}
              className="w-full escrow-slider my-4"
            />

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#08090B]/15">
              <div>
                <div className="font-mono-tech text-[10px] text-[#8A8780]">
                  FREELANCER CAPTURE ({sliderPercent}%)
                </div>
                <div className="font-anton text-4xl text-[#08090B]">
                  <CountUpAmount value={freelancerPayout} prefix="$" decimals={2} />
                </div>
              </div>

              <div className="text-right">
                <div className="font-mono-tech text-[10px] text-[#8A8780]">
                  CLIENT VOID / RETURN ({100 - sliderPercent}%)
                </div>
                <div className="font-anton text-4xl text-[#8A8780]">
                  <CountUpAmount value={clientRefund} prefix="$" decimals={2} />
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                disabled={isSettled}
                onClick={() => onExecuteSettlement(freelancerPayout, sliderPercent)}
                className="w-full inline-flex items-center justify-between px-5 py-3.5 rounded-full border border-[#08090B] bg-[#08090B] text-[#FAF8F3] hover:bg-[#CDF22B] hover:text-[#08090B] font-mono-tech text-xs font-bold transition-colors disabled:opacity-40 whitespace-nowrap shrink-0"
              >
                <span className="inline-flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#CDF22B]" />
                  EXECUTE SETTLEMENT SPLIT (CAPTURE ${freelancerPayout.toFixed(2)} / VOID $
                  {clientRefund.toFixed(2)})
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
