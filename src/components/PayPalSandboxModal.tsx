import React, { useState } from 'react';
import { X, ArrowUpRight, Check, Lock } from 'lucide-react';
import {
  paypalService,
  PayPalOrderResponse,
  PayPalAuthorizeResponse,
} from '../services/paypalService';

interface PayPalSandboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  projectTitle: string;
  amount: number;
  onAuthorized: (result: {
    order: PayPalOrderResponse;
    authorization: PayPalAuthorizeResponse;
  }) => void;
}

export const PayPalSandboxModal: React.FC<PayPalSandboxModalProps> = ({
  isOpen,
  onClose,
  projectId,
  projectTitle,
  amount,
  onAuthorized,
}) => {
  const [payerEmail, setPayerEmail] = useState('client.treasury@sandbox.paypal.com');
  const [step, setStep] = useState<'INIT' | 'ORDER_CREATED' | 'AUTHORIZED'>('INIT');
  const [loading, setLoading] = useState(false);
  const [orderRes, setOrderRes] = useState<PayPalOrderResponse | null>(null);
  const [authRes, setAuthRes] = useState<PayPalAuthorizeResponse | null>(null);

  if (!isOpen) return null;

  const handleCreateOrder = async () => {
    setLoading(true);
    try {
      const order = await paypalService.createOrder({
        projectId,
        amount,
        description: `Escrow Hold: ${projectTitle}`,
      });
      setOrderRes(order);
      setStep('ORDER_CREATED');
    } finally {
      setLoading(false);
    }
  };

  const handleAuthorizeOrder = async () => {
    if (!orderRes) return;
    setLoading(true);
    try {
      const auth = await paypalService.authorizeOrder({
        orderId: orderRes.id,
        amount,
        payerEmail,
      });
      setAuthRes(auth);
      setStep('AUTHORIZED');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteAndClose = () => {
    if (orderRes && authRes) {
      onAuthorized({ order: orderRes, authorization: authRes });
    }
    setStep('INIT');
    setOrderRes(null);
    setAuthRes(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#08090B]/85 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-[#08090B] text-[#FAF8F3] border-2 border-[#FAF8F3] p-6 md:p-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#FAF8F3]/20">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#FFC900]" />
            <span className="font-mono-tech text-xs text-[#FAF8F3]">
              PAYPAL SANDBOX ESCROW GATEWAY // ORDERS V2 (INTENT=AUTHORIZE)
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 border border-[#FAF8F3]/30 hover:bg-[#FAF8F3] hover:text-[#08090B] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main Split Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 py-6 border-b border-[#FAF8F3]/20">
          <div className="md:col-span-5 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[#FAF8F3]/15 pb-6 md:pb-0 md:pr-6">
            <div>
              <p className="font-mono-tech text-[10px] text-[#8A8780] mb-1">
                CUSTODY AMOUNT TO HOLD
              </p>
              <div className="font-anton text-6xl text-[#FFC900] leading-none tracking-wide mb-4">
                ${amount.toFixed(2)}
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#FFC900] text-[#FFC900] font-mono-tech text-[10px] mb-6">
                <Lock className="w-3 h-3" />
                HELD, NOT CAPTURED
              </div>

              <div className="space-y-3 text-xs text-[#FAF8F3]/80 font-inter">
                <p>
                  Funds are reserved on the buyer&apos;s funding instrument via{' '}
                  <span className="font-mono-tech text-[#FAF8F3]">intent: &quot;AUTHORIZE&quot;</span>.
                </p>
                <p>
                  Zero money moves to the freelancer until AI deliverable verification and Client
                  release confirmation trigger{' '}
                  <span className="font-mono-tech text-[#CDF22B]">/capture</span>.
                </p>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#FAF8F3]/15">
              <label className="block font-mono-tech text-[10px] text-[#8A8780] mb-1.5">
                SANDBOX PAYER ACCOUNT
              </label>
              <input
                type="email"
                value={payerEmail}
                onChange={(e) => setPayerEmail(e.target.value)}
                disabled={step !== 'INIT'}
                className="w-full bg-transparent border-b-2 border-[#FAF8F3] py-1.5 text-xs font-mono-tech text-[#FAF8F3] focus:outline-none focus:border-[#CDF22B]"
              />
            </div>
          </div>

          {/* Right API Execution Stepper & Live Payload Inspector */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-4">
            {/* Step 1 Box */}
            <div
              className={`p-4 border ${
                step === 'INIT'
                  ? 'border-[#CDF22B] bg-[#FAF8F3]/5'
                  : 'border-[#FAF8F3]/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono-tech text-[11px] text-[#FAF8F3]">
                  STEP 01. POST /v2/checkout/orders
                </span>
                {orderRes ? (
                  <span className="inline-flex items-center gap-1 font-mono-tech text-[10px] text-[#CDF22B]">
                    <Check className="w-3 h-3" /> {orderRes.id}
                  </span>
                ) : (
                  <span className="font-mono-tech text-[10px] text-[#8A8780]">
                    INTENT: AUTHORIZE
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8A8780] mb-3">
                Creates the PayPal order container with explicit authorization intent.
              </p>
              {step === 'INIT' && (
                <button
                  type="button"
                  onClick={handleCreateOrder}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#CDF22B] bg-[#CDF22B] text-[#08090B] font-mono-tech text-[11px] font-bold hover:bg-[#FAF8F3] transition-colors whitespace-nowrap shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#08090B]" />
                  {loading ? 'CREATING ORDER...' : '1. EXECUTE CREATE ORDER'}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Step 2 Box */}
            <div
              className={`p-4 border ${
                step === 'ORDER_CREATED'
                  ? 'border-[#FFC900] bg-[#FAF8F3]/5'
                  : 'border-[#FAF8F3]/20'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono-tech text-[11px] text-[#FAF8F3]">
                  STEP 02. POST /v2/checkout/orders/{orderRes ? orderRes.id : '{id}'}/authorize
                </span>
                {authRes ? (
                  <span className="inline-flex items-center gap-1 font-mono-tech text-[10px] text-[#FFC900]">
                    <Check className="w-3 h-3" /> {authRes.authorizationId}
                  </span>
                ) : (
                  <span className="font-mono-tech text-[10px] text-[#8A8780]">
                    29-DAY HONOR PERIOD
                  </span>
                )}
              </div>
              <p className="text-xs text-[#8A8780] mb-3">
                Places an immutable hold on ${amount.toFixed(2)} USD. Status becomes HELD, NOT CAPTURED.
              </p>
              {step === 'ORDER_CREATED' && (
                <button
                  type="button"
                  onClick={handleAuthorizeOrder}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-[#FFC900] bg-[#FFC900] text-[#08090B] font-mono-tech text-[11px] font-bold hover:bg-[#FAF8F3] transition-colors whitespace-nowrap shrink-0"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#08090B]" />
                  {loading ? 'AUTHORIZING HOLD...' : '2. AUTHORIZE & LOCK FUNDS'}
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* JSON Telemetry Output */}
            <div className="border border-[#FAF8F3]/15 bg-[#08090B] p-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono-tech text-[10px] text-[#8A8780]">
                  SANDBOX REST PAYLOAD TELEMETRY
                </span>
                <span className="font-mono-tech text-[10px] text-[#CDF22B]">
                  {step === 'AUTHORIZED'
                    ? '201 CREATED // HELD, NOT CAPTURED'
                    : step === 'ORDER_CREATED'
                    ? '201 ORDER CREATED'
                    : 'READY'}
                </span>
              </div>
              <pre className="font-mono-tech text-[10px] text-[#FAF8F3]/80 overflow-x-auto max-h-36 leading-relaxed">
                {authRes
                  ? JSON.stringify(
                      {
                        endpoint: authRes._endpoint,
                        authorization_id: authRes.authorizationId,
                        status: 'HELD_NOT_CAPTURED',
                        amount: authRes.amount,
                        expiration_time: authRes.expiration_time,
                      },
                      null,
                      2
                    )
                  : orderRes
                  ? JSON.stringify(
                      {
                        order_id: orderRes.id,
                        intent: orderRes.intent,
                        status: orderRes.status,
                        purchase_units: orderRes.purchase_units,
                      },
                      null,
                      2
                    )
                  : `{
  "intent": "AUTHORIZE",
  "purchase_units": [
    { "reference_id": "${projectId}", "amount": { "currency_code": "USD", "value": "${amount.toFixed(2)}" } }
  ]
}`}
              </pre>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="pt-5 flex items-center justify-between">
          <span className="font-mono-tech text-[10px] text-[#8A8780]">
            SERVICE: src/services/paypalService.ts
          </span>
          {step === 'AUTHORIZED' ? (
            <button
              type="button"
              onClick={handleCompleteAndClose}
              className="inline-flex items-center gap-2.5 px-6 py-3 rounded-full border border-[#CDF22B] bg-[#CDF22B] text-[#08090B] font-mono-tech text-xs font-bold hover:bg-[#FAF8F3] transition-colors whitespace-nowrap shrink-0"
            >
              <span className="w-2 h-2 rounded-full bg-[#08090B]" />
              CONFIRM ESCROW CUSTODY ($
              {amount.toFixed(2)} HELD)
            </button>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#FAF8F3]/30 font-mono-tech text-[11px] text-[#FAF8F3] hover:bg-[#FAF8F3] hover:text-[#08090B] transition-colors whitespace-nowrap shrink-0"
            >
              CANCEL
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
