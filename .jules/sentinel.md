## 2025-02-14 - Use validated environment variables

**Vulnerability:** Use of process.env for sensitive keys (e.g. `process.env.RECAPTCHA_SECRET_KEY`) bypasses central validation mechanisms, potentially leading to missing secrets or malformed configurations in production.
**Learning:** Security-critical environment variables must always be accessed through a centralized, validated environment object (e.g. `src/lib/env.ts` using Zod).
**Prevention:** Replace direct accesses to `process.env` with imports from the centralized validation module (`@/lib/env`).
