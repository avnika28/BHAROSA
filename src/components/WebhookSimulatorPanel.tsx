import React from 'react';
import { Radio, ArrowUpRight } from 'lucide-react';

export type WebhookEventType =
  | 'PAYMENT.AUTHORIZATION.CREATED'
  | 'PAYMENT.CAPTURE.COMPLETED'
  | 'PAYMENT.AUTHORIZATION.VOIDED';

interface WebhookSimulatorPanelProps {
  onFireWebhook: (eventType: WebhookEventType) => void;
  authorizationId?: string;
  captureId?: string;
  amount: number;
  recommendedAmount: number;
}

export const WebhookSimulatorPanel: React.FC<WebhookSimulatorPanelProps> = ({
  onFireWebhook,
  authorizationId = 'AUTH-SIMULATED-991',
  captureId = 'CAP-SIMULATED-882',
  amount,
  recommendedAmount,
}) => {
  const events: Array<{
    type: WebhookEventType;
    label: string;
    description: string;
    colorHex: string;
    borderClass: string;
    dotClass: string;
    sampleSummary: string;
  }> = [
    {
      type: 'PAYMENT.AUTHORIZATION.CREATED',
      label: 'PAYMENT.AUTHORIZATION.CREATED',
      description: `Simulates PayPal webhook confirming $${amount.toFixed(2)} USD is HELD, NOT CAPTURED (${authorizationId}).`,
      colorHex: '#FFC900',
      borderClass: 'border-[#FFC900] text-[#FFC900] hover:bg-[#FFC900] hover:text-[#08090B]',
      dotClass: 'bg-[#FFC900]',
      sampleSummary: `resource.status = "CREATED" // Hold $${amount.toFixed(2)}`,
    },
    {
      type: 'PAYMENT.CAPTURE.COMPLETED',
      label: 'PAYMENT.CAPTURE.COMPLETED',
      description: `Simulates PayPal webhook confirming capture of $${(recommendedAmount || amount).toFixed(2)} USD (${captureId}) to Freelancer.`,
      colorHex: '#CDF22B',
      borderClass: 'border-[#CDF22B] text-[#CDF22B] hover:bg-[#CDF22B] hover:text-[#08090B]',
      dotClass: 'bg-[#CDF22B]',
      sampleSummary: `resource.final_capture = true // Capture $${(recommendedAmount || amount).toFixed(2)}`,
    },
    {
      type: 'PAYMENT.AUTHORIZATION.VOIDED',
      label: 'PAYMENT.AUTHORIZATION.VOIDED',
      description: `Simulates PayPal webhook voiding authorization ${authorizationId} and returning 100% ($${amount.toFixed(2)}) to Client.`,
      colorHex: '#FF6845',
      borderClass: 'border-[#FF6845] text-[#FF6845] hover:bg-[#FF6845] hover:text-[#08090B]',
      dotClass: 'bg-[#FF6845]',
      sampleSummary: `resource.status = "VOIDED" // Released hold to buyer`,
    },
  ];

  return (
    <section className="border border-[#08090B] bg-[#08090B] text-[#FAF8F3]">
      <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-b border-[#FAF8F3]/15">
        <div className="flex items-center gap-2.5">
          <Radio className="w-4 h-4 text-[#CDF22B]" />
          <span className="font-mono-tech text-xs text-[#FAF8F3]">
            PAYPAL WEBHOOK SIMULATOR PANEL // LIVE EVENT DISPATCHER
          </span>
        </div>
        <span className="font-mono-tech text-[10px] text-[#8A8780]">
          POST /api/webhooks/paypal-sandbox
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-[#FAF8F3]/15">
        {events.map((ev) => (
          <div key={ev.type} className="p-6 flex flex-col justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${ev.dotClass}`} />
                <span className="font-mono-tech text-xs text-[#FAF8F3] break-all">
                  {ev.label}
                </span>
              </div>
              <p className="text-xs text-[#8A8780] font-inter leading-relaxed mb-3">
                {ev.description}
              </p>
              <div className="px-3 py-2 border border-[#FAF8F3]/15 font-mono-tech text-[10px] text-[#FAF8F3]/75">
                {ev.sampleSummary}
              </div>
            </div>

            <button
              type="button"
              onClick={() => onFireWebhook(ev.type)}
              className={`w-full inline-flex items-center justify-between px-4 py-2.5 rounded-full border font-mono-tech text-[11px] transition-colors whitespace-nowrap shrink-0 ${ev.borderClass}`}
            >
              <span className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                FIRE WEBHOOK EVENT
              </span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
