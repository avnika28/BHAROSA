# BHAROSA — "Kaam pura, paisa pura."

BHAROSA is an AI-verified freelance escrow web application built for Indian freelancers working with international clients. The client's payment is held safely in USD via **PayPal Orders v2 (`intent=AUTHORIZE`)** and the official **PayPal JS SDK (`@paypal/react-paypal-js`)**, **Gemini API** verifies delivered files against a plain-language checklist, and the client releases the funds (`POST /v2/payments/authorizations/{id}/capture`).

---

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   - `GEMINI_API_KEY`: Your Google Gemini API key from Google AI Studio.
   - `PAYPAL_CLIENT_ID` & `PAYPAL_CLIENT_SECRET`: Your PayPal Sandbox REST API credentials from the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/applications/sandbox). The server provides `paypalClientId` to the browser via `/api/health`.
   - `PAYPAL_WEBHOOK_ID`: Your PayPal Sandbox Webhook ID (used to verify webhook signatures).
   - `PAYPAL_ALLOW_MOCK`: Keep `"false"` for real PayPal Sandbox checkout; set `"true"` only for local offline demos.

3. **Start the development server (Port 3000):**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000`.

---

## Data Storage Note

Users, sessions, projects, and event logs are persisted in a JSON file at `data/bharosa.db.json` (or `${DATA_DIR}/bharosa.db.json` when `DATA_DIR` is configured). Any `prisma/` directory is unused.

---

## Accounts and Roles

BHAROSA supports simple accounts with two distinct roles: **`FREELANCER`** and **`CLIENT`**.

- **Authentication & Sessions**:
  - Passwords (minimum 8 characters) are hashed using Node's `crypto.scrypt` with a unique random 16-byte salt; plain passwords are never stored or logged.
  - On login or signup (`POST /api/auth/login`, `POST /api/auth/signup`), the server issues a 32-byte random token in an `HttpOnly`, `SameSite=Lax` cookie named `bharosa_session` (`Secure` in production) and stores only its SHA-256 hash (`tokenHash`) with a 7-day expiry.
  - Rate limiting enforces a maximum of 10 login/signup attempts per IP per 10 minutes (`429` when exceeded).
- **Freelancer Flow**:
  - Sign up or log in as **`FREELANCER`** to create new projects (`POST /api/projects` stores `freelancerUserId = user.id`).
  - Share the generated **Client Payment Link** (`/p/{id}?k={clientKey}`) with the client.
  - Only the project's Freelancer can upload and submit work (`POST /api/projects/:id/submit-work`).
- **Client Flow**:
  - When opening a Client Payment Link (`/p/{id}?k={clientKey}`), the client logs in or creates a **`CLIENT`** account and claims the project via `POST /api/projects/:id/claim-client` (setting `clientUserId = user.id`).
  - Only the project's Client can create/authorize PayPal holds (`POST /api/paypal/create-order`, `POST /api/paypal/authorize-order`), approve/reject subjective items (`POST /api/projects/:id/client-item-decision`), request fixes (`POST /api/projects/:id/ask-fixes`), or release/void money (`POST /api/paypal/capture`, `POST /api/paypal/void`).
- **Try Demo**:
  - The sample project (`isDemo: true`) remains accessible via magic keys so visitors can test the flow immediately without creating an account.

---

## How to Test with PayPal Sandbox Accounts

1. Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Go to **Testing Tools > Sandbox Accounts**:
   - Locate or create a **Personal (Buyer)** account (e.g. `sb-buyer@personal.example.com`) — use this account to authorize the escrow hold as the Client.
   - Locate or create a **Business (Merchant)** account (e.g. `sb-merchant@business.example.com`) — use this account's REST App credentials for `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET`.
3. Go to **Apps & Credentials** (toggle **Sandbox** on):
   - Create an App linked to your Business Sandbox account.
   - Copy the **Client ID** into `PAYPAL_CLIENT_ID` in `.env`.
   - Copy the **Secret** into `PAYPAL_CLIENT_SECRET` in `.env`.
4. Start a project in **BHAROSA** as a **Freelancer** (or click **Try sample project** on the home screen):
   - Copy the **Client Payment Link** (`/p/{id}?k={clientKey}`) and open it in an incognito window as a **Client**.
   - On the **PAY** step, click the official **PayPal JS SDK button** to open the real PayPal Sandbox checkout popup and sign in with your **Personal (Buyer)** sandbox credentials.
   - Upon approval, BHAROSA calls:
     - `POST https://api-m.sandbox.paypal.com/v2/checkout/orders` (`intent: "AUTHORIZE"`)
     - `POST https://api-m.sandbox.paypal.com/v2/checkout/orders/{id}/authorize`
   - The funds are now **Held, not charged** (`authorization_id` stored on the project).
5. As the **Freelancer**:
   - Upload your work files (PNG/JPG images for Gemini Vision, or PDF/DOCX/TXT documents for text extraction) and click **Submit work**.
6. On the **CHECK** step:
   - Gemini evaluates each checklist item as `PASS`, `FAIL`, or `ASK_HUMAN` (subjective criteria are always routed to `ASK_HUMAN`).
   - Payout is calculated deterministically in code from `pass / (pass + fail)`.
   - As the **Client**, click **Release money** to execute `POST /v2/payments/authorizations/{authorization_id}/capture` (`final_capture: true`), or click **Something wrong?** for a neutral 5-line AI dispute summary and partial/void settlement.

---

## Security & Permission Rules

- **Fail-Closed Payment Modes**: When `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` are not set (and `PAYPAL_ALLOW_MOCK` is not `"true"`), all PayPal endpoints return `503` and never fake a payment.
- **Role-Based Access Control (`isProjectClient` & `isProjectFreelancer`)**:
  - Real projects require an authenticated session (`401` if not logged in) and check `project.clientUserId === user.id` or `project.freelancerUserId === user.id` (`403` if logged in as a different user or role).
  - `GET /api/my-projects` returns only projects belonging to the logged-in user (sorted newest first) with secret keys stripped.
  - `GET /api/projects` returns `404` in `live` mode so keys are never exposed publicly.
- **Order & Hold Validation**:
  - `POST /api/paypal/authorize-order` verifies the `orderId` format and confirms it matches `project.paypalOrderId`, and verifies the PayPal authorization status is `CREATED` for the exact project USD amount.
  - `POST /api/paypal/webhook` is fail-closed in `live` mode: requires `PAYPAL_WEBHOOK_ID` and verifies signatures via `POST /v1/notifications/verify-webhook-signature` before processing any event idempotently.

---

## Deploying

1. **Host**: Deploy on a Node.js host such as **Render** or **Railway**.
2. **Build Command**:
   ```bash
   npm install && npm run build
   ```
3. **Start Command**:
   ```bash
   npm start
   ```
   (Runs `NODE_ENV=production tsx server.ts` on `PORT`.)
4. **Persistent Disk**: Mount a persistent volume and set `DATA_DIR` (for example `/var/data`) so `bharosa.db.json` persists across deploys.
5. **Verify Live PayPal Mode**: Visit `/api/health` on your deployed URL and confirm it returns `"paypalMode": "live"` and `"paypalConfigured": true`.
6. **Configure Webhook**: In the PayPal Developer Dashboard, add `https://<your-domain>/api/paypal/webhook` as your Webhook URL and set `PAYPAL_WEBHOOK_ID` in your environment variables.
