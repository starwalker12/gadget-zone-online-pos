# QA E2E Testing with Playwright

We have added a Playwright smoke-test suite to automate end-to-end (E2E) testing for SaleDock POS, invoice generation, return processing, and reports pages.

## Installation

First, install the browser binaries needed by Playwright:

```bash
npx playwright install chromium
```

## Running the Tests

To run E2E tests locally or against a preview URL, you must provide your test environment variables:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 \
PLAYWRIGHT_TEST_EMAIL=test@saledock.site \
PLAYWRIGHT_TEST_PASSWORD=your_secure_password \
npm run qa:e2e
```

### Headed Mode (Visual execution)
To watch the tests execute visually in a browser window:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 \
PLAYWRIGHT_TEST_EMAIL=test@saledock.site \
PLAYWRIGHT_TEST_PASSWORD=your_secure_password \
npm run qa:e2e:headed
```

### Playwright UI Mode (Interactive debugger)
To open the interactive UI runner:

```bash
PLAYWRIGHT_BASE_URL=http://localhost:3000 \
PLAYWRIGHT_TEST_EMAIL=test@saledock.site \
PLAYWRIGHT_TEST_PASSWORD=your_secure_password \
npm run qa:e2e:ui
```

---

## Important Testing Rules & Safety

1. **Target Previews/Staging Only**: Never run mutating tests against a live production database with real shop data by default. The config defaults to `http://localhost:3000`.
2. **Production Mutation Guard**: If the `PLAYWRIGHT_BASE_URL` contains `saledock.site` or `saledock-cloud-pos.vercel.app`, any POS checkouts or returns (mutations) will be **blocked by default** and skip automatically. To override this guard (e.g. on a dedicated test account on production), set `PLAYWRIGHT_ALLOW_PRODUCTION_MUTATIONS=true`.
3. **Read-Only vs. Mutating Tests**:
   - **Read-only tests** (navigation, checking lists, view-only detail pages, and generating reports summary) are completely safe to run against a production account because they do not modify any data.
   - **Mutating tests** (POS checkout and return/refund processing) will create real records in the shop database. They should be run on production only for controlled, rare validation runs on a dedicated test account.
4. **Credential Security**:
   - **Never commit credentials** or passwords to the repository (in code, `.env` files, or documentation).
   - All credentials must be passed dynamically as local environment variables (`PLAYWRIGHT_TEST_EMAIL` and `PLAYWRIGHT_TEST_PASSWORD`) at the command line.
   - If you ever share a password in a chat window or a shared screen during a support session, **change the password immediately** after the session to keep the account secure.
5. **Missing Credentials (Skip Behavior)**: If `PLAYWRIGHT_TEST_EMAIL` or `PLAYWRIGHT_TEST_PASSWORD` are missing from the environment, the tests will skip automatically and print a warning message instead of failing the run.
6. **Data Mutation Warnings**: The POS sale and return smoke test will add a test transaction to the active shop and process a refund/return item. Always run tests using a **staging, sandbox, or test account** to avoid cluttering real business reports. Test transactions will be automatically tagged in the invoice note with a `TEST-PLAYWRIGHT-` prefix.
7. **Serial Execution**: Tests run serially with a single worker (`workers: 1`) to prevent checkout collision when executing on a single test account/shop.
8. **Zero Impact on Production**: The E2E tests are external scripts that interact with the UI. They do not change any of the application business logic, calculations, database triggers, or Supabase configurations.
