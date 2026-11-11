import React, { useState } from 'react';
import {
  PayPalScriptProvider,
  PayPalButtons,
  usePayPalScriptReducer,
} from '@paypal/react-paypal-js';
import { TranslationKey } from '../i18n';

export type PayPalMode =
  | 'loading'
  | 'live'
  | 'mock'
  | 'unconfigured'
  | 'offline';

/**
 * Iconic overlapping double-"P" PayPal monogram emblem
 */
export const PayPalMonogramIcon: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg
    viewBox="0 0 28 28"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-hidden="true"
  >
    <path
      d="M21.4 8.2C20.9 5.3 18.4 3.5 14.3 3.5H7.2C6.5 3.5 5.9 4 5.8 4.7L2.6 24.4C2.5 24.9 2.9 25.4 3.4 25.4H7.6L8.7 18.2L8.6 18.5C8.7 17.8 9.3 17.3 10 17.3H12.9C17.8 17.3 21.6 15.3 22.7 9.7C22.8 9.2 22.8 8.7 22.8 8.2H21.4Z"
      fill="#003087"
    />
    <path
      d="M22.8 8.2C21.7 13.8 17.9 15.8 13 15.8H10.1C9.4 15.8 8.8 16.3 8.7 17L7.3 26C7.2 26.5 7.6 26.9 8.1 26.9H11.7C12.3 26.9 12.8 26.5 12.9 25.9L13.9 19.7C14 19.1 14.5 18.7 15.1 18.7H16.8C21 18.7 24.3 17 25.2 12.1C25.6 9.8 24.7 8.4 22.8 8.2Z"
      fill="#0070BA"
    />
    <path
      d="M21.4 8.2C20.8 8 20.1 7.9 19.3 7.9H12.3C11.7 7.9 11.2 8.3 11.1 8.9L9.8 17.2L9.7 17.5C9.8 16.8 10.4 16.3 11.1 16.3H14C18.9 16.3 22.7 14.3 23.8 8.7C23.9 8.5 23.9 8.3 23.9 8.2C23.2 7.8 22.3 8 21.4 8.2Z"
      fill="#001C64"
    />
  </svg>
);

/**
 * Official PayPal Logo Mark (Two-tone double-P emblem + PayPal wordmark)
 */
export const PayPalLogoMark: React.FC<{ className?: string }> = ({
  className = 'h-6',
}) => (
  <svg
    viewBox="0 0 124 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`shrink-0 ${className}`}
    aria-label="PayPal"
  >
    {/* Back / Top P (#003087) */}
    <path
      d="M19.8 4.2H10.4C9.7 4.2 9.1 4.7 9 5.4L5.6 26.7C5.5 27.2 5.9 27.7 6.4 27.7H10.8C11.5 27.7 12.1 27.2 12.2 26.5L13.4 18.9C13.5 18.2 14.1 17.7 14.8 17.7H18.1C23.2 17.7 26.2 15.2 27 10.3C27.6 6.4 25.1 4.2 19.8 4.2Z"
      fill="#003087"
    />
    {/* Overlapping / Front P (#0070BA) */}
    <path
      d="M27.3 10.5C26.4 15.9 23 18.2 17.6 18.2H14.6L13.1 27.6C13 28.1 13.4 28.5 13.9 28.5H17.6C18.2 28.5 18.7 28.1 18.8 27.5L19.8 21.3C19.9 20.7 20.4 20.3 21 20.3H22.6C26.9 20.3 29.9 18.3 30.7 13.5C31.1 11.1 30 9.6 27.3 10.5Z"
      fill="#0070BA"
    />
    {/* Wordmark: "Pay" (#003087) + "Pal" (#0070BA) */}
    <text
      x="36"
      y="23"
      fontFamily="DM Sans, sans-serif"
      fontWeight="800"
      fontStyle="italic"
      fontSize="21"
      letterSpacing="-0.5"
      fill="#003087"
    >
      Pay
    </text>
    <text
      x="74"
      y="23"
      fontFamily="DM Sans, sans-serif"
      fontWeight="800"
      fontStyle="italic"
      fontSize="21"
      letterSpacing="-0.5"
      fill="#0070BA"
    >
      Pal
    </text>
  </svg>
);

export const SketchSpinner: React.FC = () => (
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

export const SketchLockIcon: React.FC = () => (
  <svg
    className="w-4 h-4 text-[#08090B] shrink-0"
    viewBox="0 0 24 24"
    fill="none"
  >
    <path
      d="M6.5 11.2C8.8 10.9 15.4 11 17.5 11.2C18.3 11.3 18.8 11.9 18.7 12.9C18.6 15.3 18.8 18.2 18.4 19.6C18.1 20.5 17.1 20.7 15.9 20.8C13.1 21 9.4 20.9 6.6 20.6C5.6 20.5 5.2 19.8 5.2 18.8C5.1 16.4 5.3 13.7 5.4 12.3C5.5 11.5 5.9 11.3 6.5 11.2Z"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M8.4 11V7.6C8.4 5.3 9.9 3.8 12.1 3.8C14.3 3.8 15.7 5.4 15.6 7.8V11"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

interface PayPalOfficialButtonsProps {
  projectId: string;
  amountUsd: number;
  paypalClientId: string;
  paypalMode: PayPalMode;
  magicKey?: string;
  buttonLabel: string;
  loadingLabel: string;
  securedByText: string;
  t: (key: TranslationKey) => string;
  onAuthorizedSuccess: () => void;
  onError: (msg: string, status?: number) => void;
  onRetryHealth?: () => void;
}

const StatusMessageBox: React.FC<{
  title: string;
  hint?: string;
  retryLabel: string;
  onRetry?: () => void;
}> = ({ title, hint, retryLabel, onRetry }) => (
  <div
    className="w-full max-w-xl border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] p-5 space-y-3"
    style={{ boxShadow: '4px 4px 0 #08090B' }}
  >
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <div className="inline-flex items-center gap-2">
          <span
            className="inline-block w-3 h-3 rounded-full bg-[#FF6845] border border-[#08090B] shrink-0"
            aria-hidden="true"
          />
          <p className="font-body text-base font-bold text-[#08090B]">{title}</p>
        </div>
        {hint && (
          <p className="studio-label text-[#8A8780] leading-relaxed">{hint}</p>
        )}
      </div>

      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="studio-btn studio-btn-secondary px-4 py-1.5 studio-label font-semibold shrink-0 cursor-pointer"
        >
          {retryLabel}
        </button>
      )}
    </div>
  </div>
);

const LivePayPalInner: React.FC<{
  projectId: string;
  amountUsd: number;
  magicKey?: string;
  securedByText: string;
  t: (key: TranslationKey) => string;
  onAuthorizedSuccess: () => void;
  onError: (msg: string, status?: number) => void;
  onRetryHealth?: () => void;
}> = ({
  projectId,
  amountUsd,
  magicKey,
  securedByText,
  t,
  onAuthorizedSuccess,
  onError,
  onRetryHealth,
}) => {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();
  const [busy, setBusy] = useState(false);

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="flex items-center justify-between gap-3">
        <PayPalLogoMark className="h-7" />
        <span className="font-money-id text-lg font-bold text-[#08090B]">
          ${amountUsd} USD
        </span>
      </div>

      {(isPending || busy) && (
        <div
          className="border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] px-4 py-3 inline-flex items-center gap-2.5 studio-label text-[#08090B]"
          style={{ boxShadow: '3px 3px 0 #08090B' }}
        >
          <SketchSpinner />
          <span>{t('paypalLoading')}</span>
        </div>
      )}

      {isRejected && (
        <StatusMessageBox
          title={t('paypalSdkFailed')}
          retryLabel={t('paypalRetryBtn')}
          onRetry={onRetryHealth}
        />
      )}

      <PayPalButtons
        style={{ layout: 'vertical', shape: 'rect', label: 'pay', height: 48 }}
        disabled={busy}
        createOrder={async () => {
          const res = await fetch('/api/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ projectId, key: magicKey }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok || !data.orderId) {
            onError(
              data.error || 'Could not create PayPal order.',
              res.status
            );
            throw new Error(data.error || 'Could not create PayPal order.');
          }
          return data.orderId;
        }}
        onApprove={async (data) => {
          setBusy(true);
          try {
            const res = await fetch('/api/paypal/authorize-order', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                projectId,
                orderId: data.orderID,
                key: magicKey,
              }),
            });
            const resData = await res.json().catch(() => ({}));
            if (!res.ok) {
              onError(
                resData.error || 'Could not authorize PayPal order.',
                res.status
              );
              return;
            }
            onAuthorizedSuccess();
          } catch (err: any) {
            onError(err?.message || 'PayPal could not complete the payment.');
          } finally {
            setBusy(false);
          }
        }}
        onError={(err: any) =>
          onError(err?.message || 'PayPal could not complete the payment.')
        }
      />

      <div className="inline-flex items-center gap-2 studio-label text-[#8A8780]">
        <PayPalMonogramIcon className="w-4 h-4" />
        <span>{securedByText}</span>
      </div>
    </div>
  );
};

export const SimulatedPayPalCheckout: React.FC<PayPalOfficialButtonsProps> = ({
  projectId,
  amountUsd,
  magicKey,
  buttonLabel,
  loadingLabel,
  securedByText,
  t,
  onAuthorizedSuccess,
  onError,
}) => {
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [buyerEmail, setBuyerEmail] = useState('sb-buyer@personal.example.com');
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  const handleOpenPayPalCheckout = async () => {
    setIsAuthorizing(true);
    try {
      const createRes = await fetch('/api/paypal/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, key: magicKey }),
      });
      const createData = await createRes.json().catch(() => ({}));
      if (!createRes.ok) {
        onError(
          createData.error || 'Failed to create PayPal order',
          createRes.status
        );
        return;
      }
      setCreatedOrderId(createData.orderId);
      setShowCheckoutModal(true);
    } catch (e: any) {
      onError(e?.message || 'Could not start PayPal checkout.');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const handleApprovePayPalHold = async () => {
    setIsAuthorizing(true);
    try {
      let orderId = createdOrderId;
      if (!orderId) {
        const createRes = await fetch('/api/paypal/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ projectId, key: magicKey }),
        });
        const createData = await createRes.json().catch(() => ({}));
        if (!createRes.ok) {
          onError(
            createData.error || 'Failed to create PayPal order',
            createRes.status
          );
          return;
        }
        orderId = createData.orderId;
      }

      const authRes = await fetch('/api/paypal/authorize-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          orderId,
          key: magicKey,
        }),
      });
      const authData = await authRes.json().catch(() => ({}));
      if (!authRes.ok) {
        onError(
          authData.error || 'Failed to authorize order',
          authRes.status
        );
        return;
      }

      setShowCheckoutModal(false);
      onAuthorizedSuccess();
    } catch (e: any) {
      onError(e?.message || 'Could not complete PayPal Sandbox hold.');
    } finally {
      setIsAuthorizing(false);
    }
  };

  return (
    <div className="w-full max-w-xl space-y-4">
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={isAuthorizing}
          onClick={handleOpenPayPalCheckout}
          className="studio-btn studio-btn-primary inline-flex items-center justify-center gap-3 px-8 py-4 font-body text-base font-bold cursor-pointer"
        >
          {isAuthorizing ? (
            <SketchSpinner />
          ) : (
            <PayPalMonogramIcon className="w-5 h-5" />
          )}
          <span>
            {isAuthorizing ? (
              loadingLabel
            ) : (
              <>
                {buttonLabel} (
                <span className="font-money-id font-bold">${amountUsd}</span>)
              </>
            )}
          </span>
        </button>

        <div className="inline-flex items-center gap-2.5 px-3.5 py-2 rounded-[10px] border-2 border-[#08090B] bg-[#FAF8F3]">
          <PayPalLogoMark className="h-6" />
          <span className="studio-label px-2 py-0.5 rounded-[6px] border border-[#08090B] bg-[#FFC900] font-semibold">
            {t('sandboxHoldBadge')}
          </span>
        </div>
      </div>

      <div className="inline-flex items-center gap-2 studio-label text-[#8A8780]">
        <PayPalMonogramIcon className="w-4 h-4" />
        <span>{securedByText}</span>
      </div>

      {showCheckoutModal && (
        <div className="fixed inset-0 z-50 bg-[#08090B]/75 flex items-center justify-center p-4">
          <div
            className="w-full max-w-md border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] text-[#08090B] p-6 md:p-8 space-y-6"
            style={{ boxShadow: '6px 6px 0 #08090B' }}
          >
            <div className="flex items-center justify-between border-b-2 border-[#08090B] pb-4">
              <div className="flex items-center gap-2.5">
                <PayPalLogoMark className="h-7" />
                <span className="studio-label px-2.5 py-0.5 rounded-[8px] border-2 border-[#08090B] bg-[#FFC900]">
                  {t('sandboxHoldBadge')}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                aria-label="Close"
                className="p-1.5 rounded-[8px] hover:bg-[#08090B]/10 transition-colors cursor-pointer"
              >
                <svg
                  className="w-4 h-4 text-[#08090B]"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M6 6.5L17.5 18M17.8 6.2L6.2 17.8"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-2.5">
              <div className="studio-label text-[#8A8780]">
                {t('orderIdLabel')}{' '}
                <span className="font-money-id text-[#08090B]">
                  {createdOrderId || 'ORD-SANDBOX'}
                </span>
              </div>
              <div className="font-money-id text-4xl font-bold text-[#08090B]">
                ${amountUsd.toFixed(2)} USD
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[10px] border-2 border-[#08090B] bg-[#FFC900] studio-label">
                <SketchLockIcon />
                <span>{t('heldModalTag')}</span>
              </div>
            </div>

            <div>
              <label className="block studio-label text-[#08090B] mb-1.5">
                {t('sandboxBuyerEmailLabel')}
              </label>
              <input
                type="email"
                value={buyerEmail}
                onChange={(e) => setBuyerEmail(e.target.value)}
                className="studio-input w-full px-3.5 py-2.5 text-sm"
              />
            </div>

            <div className="pt-2 space-y-3">
              <button
                type="button"
                disabled={isAuthorizing}
                onClick={handleApprovePayPalHold}
                className="studio-btn studio-btn-primary w-full inline-flex items-center justify-center gap-2.5 px-6 py-3.5 font-body text-base font-semibold cursor-pointer"
              >
                {isAuthorizing ? (
                  <SketchSpinner />
                ) : (
                  <PayPalMonogramIcon className="w-5 h-5" />
                )}
                <span>
                  {isAuthorizing ? (
                    t('authorizingHoldBtn')
                  ) : (
                    <>
                      {t('approveHoldModalBtn')} (
                      <span className="font-money-id">
                        ${amountUsd.toFixed(2)}
                      </span>
                      )
                    </>
                  )}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setShowCheckoutModal(false)}
                className="w-full py-2 studio-label text-[#8A8780] hover:text-[#08090B] cursor-pointer"
              >
                {t('cancelAndBackBtn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const PayPalOfficialButtons: React.FC<PayPalOfficialButtonsProps> = (
  props
) => {
  const {
    projectId,
    amountUsd,
    paypalClientId,
    paypalMode,
    magicKey,
    securedByText,
    t,
    onAuthorizedSuccess,
    onError,
    onRetryHealth,
  } = props;

  if (paypalMode === 'loading') {
    return (
      <div
        className="w-full max-w-md border-2 border-[#08090B] rounded-[12px] bg-[#FAF8F3] px-5 py-4 inline-flex items-center gap-3 studio-label text-[#08090B]"
        style={{ boxShadow: '4px 4px 0 #08090B' }}
      >
        <SketchSpinner />
        <span>{t('paypalLoading')}</span>
      </div>
    );
  }

  if (paypalMode === 'live') {
    const trimmedClientId = (paypalClientId || '').trim();
    if (!trimmedClientId) {
      return <SimulatedPayPalCheckout {...props} />;
    }

    return (
      <PayPalScriptProvider
        key={trimmedClientId}
        options={{
          clientId: trimmedClientId,
          currency: 'USD',
          intent: 'authorize',
          components: 'buttons',
        }}
      >
        <LivePayPalInner
          projectId={projectId}
          amountUsd={amountUsd}
          magicKey={magicKey}
          securedByText={securedByText}
          t={t}
          onAuthorizedSuccess={onAuthorizedSuccess}
          onError={onError}
          onRetryHealth={onRetryHealth}
        />
      </PayPalScriptProvider>
    );
  }

  if (paypalMode === 'offline') {
    return (
      <StatusMessageBox
        title={t('paypalOffline')}
        hint={t('paypalOfflineHint')}
        retryLabel={t('paypalRetryBtn')}
        onRetry={onRetryHealth}
      />
    );
  }

  // Default to working PayPal Sandbox checkout with official PayPal logo
  return <SimulatedPayPalCheckout {...props} />;
};
