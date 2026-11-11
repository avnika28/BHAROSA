/**
 * PayPal Sandbox Escrow Service (Orders v2 + Payments v2 Authorization/Capture/Void)
 *
 * ARCHITECTURE NOTE FOR PRODUCTION BACKEND:
 * All PayPal calls are isolated in this module (`createOrder`, `authorizeOrder`, `capture`, `voidOrder`).
 * To switch from the deterministic sandbox simulator to a live PayPal backend:
 * 1. Obtain an OAuth2 access token on your server via `POST https://api-m.sandbox.paypal.com/v1/oauth2/token`
 * 2. Replace the simulated latencies below with `fetch('/api/paypal/...')` calls forwarding to PayPal REST endpoints.
 */

export interface PayPalOrderResponse {
  id: string;
  intent: 'AUTHORIZE';
  status: 'CREATED';
  purchase_units: Array<{
    reference_id: string;
    amount: {
      currency_code: string;
      value: string;
    };
    description: string;
  }>;
  create_time: string;
  links: Array<{ href: string; rel: string; method: string }>;
  _requestPayload: Record<string, unknown>;
}

export interface PayPalAuthorizeResponse {
  id: string;
  status: 'COMPLETED';
  authorizationId: string;
  authorizationStatus: 'CREATED';
  amount: {
    currency_code: string;
    value: string;
  };
  payer: {
    email_address: string;
    payer_id: string;
  };
  expiration_time: string;
  create_time: string;
  _endpoint: string;
  _requestPayload: Record<string, unknown>;
}

export interface PayPalCaptureResponse {
  id: string;
  authorization_id: string;
  status: 'COMPLETED';
  final_capture: boolean;
  amount: {
    currency_code: string;
    value: string;
  };
  seller_protection: {
    status: 'ELIGIBLE';
  };
  create_time: string;
  _endpoint: string;
  _requestPayload: Record<string, unknown>;
}

export interface PayPalVoidResponse {
  authorization_id: string;
  status: 'VOIDED';
  voided_time: string;
  _endpoint: string;
  _requestPayload: Record<string, unknown>;
}

function randomHex(len = 10): string {
  const chars = '0123456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let out = '';
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export const paypalService = {
  /**
   * Step 1: Create an Order with `intent: "AUTHORIZE"`
   * Real endpoint: POST https://api-m.sandbox.paypal.com/v2/checkout/orders
   */
  async createOrder(params: {
    projectId: string;
    amount: number;
    description: string;
  }): Promise<PayPalOrderResponse> {
    await new Promise((r) => setTimeout(r, 450));

    const orderId = `ORD-${randomHex(12)}`;
    const now = new Date().toISOString();

    const requestPayload = {
      intent: 'AUTHORIZE',
      purchase_units: [
        {
          reference_id: params.projectId,
          description: params.description,
          amount: {
            currency_code: 'USD',
            value: params.amount.toFixed(2),
          },
        },
      ],
      application_context: {
        brand_name: 'ESCROW AGENT',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'PAY_NOW',
      },
    };

    return {
      id: orderId,
      intent: 'AUTHORIZE',
      status: 'CREATED',
      purchase_units: requestPayload.purchase_units,
      create_time: now,
      links: [
        {
          href: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}`,
          rel: 'self',
          method: 'GET',
        },
        {
          href: `https://api-m.sandbox.paypal.com/v2/checkout/orders/${orderId}/authorize`,
          rel: 'authorize',
          method: 'POST',
        },
      ],
      _requestPayload: requestPayload,
    };
  },

  /**
   * Step 2: Authorize Order (places a hold on funds without capturing)
   * Real endpoint: POST https://api-m.sandbox.paypal.com/v2/checkout/orders/{order_id}/authorize
   * Status becomes HELD, NOT CAPTURED.
   */
  async authorizeOrder(params: {
    orderId: string;
    amount: number;
    payerEmail?: string;
  }): Promise<PayPalAuthorizeResponse> {
    await new Promise((r) => setTimeout(r, 550));

    const authId = `AUTH-${randomHex(12)}`;
    const now = new Date();
    const exp = new Date(now.getTime() + 29 * 24 * 60 * 60 * 1000); // 29-day PayPal authorization hold window

    const endpoint = `POST /v2/checkout/orders/${params.orderId}/authorize`;
    const requestPayload = {
      payment_source: {
        paypal: {
          email_address: params.payerEmail || 'client.treasury@sandbox.paypal.com',
        },
      },
    };

    return {
      id: params.orderId,
      status: 'COMPLETED',
      authorizationId: authId,
      authorizationStatus: 'CREATED',
      amount: {
        currency_code: 'USD',
        value: params.amount.toFixed(2),
      },
      payer: {
        email_address: params.payerEmail || 'client.treasury@sandbox.paypal.com',
        payer_id: `PYR-${randomHex(8)}`,
      },
      expiration_time: exp.toISOString(),
      create_time: now.toISOString(),
      _endpoint: endpoint,
      _requestPayload: requestPayload,
    };
  },

  /**
   * Step 3A: Capture Authorized Funds (Full or Partial)
   * Real endpoint: POST https://api-m.sandbox.paypal.com/v2/payments/authorizations/{authorization_id}/capture
   * When `final_capture: true` on a partial amount, PayPal automatically releases the remaining hold back to the buyer.
   */
  async capture(params: {
    authorizationId: string;
    amount: number;
    finalCapture: boolean;
    noteToPayer?: string;
  }): Promise<PayPalCaptureResponse> {
    await new Promise((r) => setTimeout(r, 500));

    const captureId = `CAP-${randomHex(12)}`;
    const endpoint = `POST /v2/payments/authorizations/${params.authorizationId}/capture`;
    const requestPayload = {
      amount: {
        currency_code: 'USD',
        value: params.amount.toFixed(2),
      },
      final_capture: params.finalCapture,
      note_to_payer:
        params.noteToPayer ||
        'Escrow release verified by ESCROW AGENT and confirmed by Client.',
    };

    return {
      id: captureId,
      authorization_id: params.authorizationId,
      status: 'COMPLETED',
      final_capture: params.finalCapture,
      amount: {
        currency_code: 'USD',
        value: params.amount.toFixed(2),
      },
      seller_protection: {
        status: 'ELIGIBLE',
      },
      create_time: new Date().toISOString(),
      _endpoint: endpoint,
      _requestPayload: requestPayload,
    };
  },

  /**
   * Step 3B: Void an Authorization (Cancels the hold, 100% returned to Client)
   * Real endpoint: POST https://api-m.sandbox.paypal.com/v2/payments/authorizations/{authorization_id}/void
   */
  async voidOrder(params: {
    authorizationId: string;
    reason?: string;
  }): Promise<PayPalVoidResponse> {
    await new Promise((r) => setTimeout(r, 450));

    const endpoint = `POST /v2/payments/authorizations/${params.authorizationId}/void`;
    const requestPayload = {
      note: params.reason || 'Authorization voided by escrow agreement.',
    };

    return {
      authorization_id: params.authorizationId,
      status: 'VOIDED',
      voided_time: new Date().toISOString(),
      _endpoint: endpoint,
      _requestPayload: requestPayload,
    };
  },
};
