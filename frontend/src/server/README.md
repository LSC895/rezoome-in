Roast API (server)

This folder contains a minimal server implementation for the POST /api/roast endpoint.

Environment variables required:
- GEMINI_API_KEY - Your Gemini API key (server-side only)
- GEMINI_API_URL - The Gemini endpoint URL you use (for example, your model endpoint)
- NODE_ENV - optional

How to run locally (dev):
- Install dependencies: `npm i` (make sure you have `express` and `zod` installed)
- Run: `node -r ts-node/register src/server/express.ts` or use `ts-node-dev`

Notes:
- The code is intentionally minimal and framework-agnostic. The `roastHandler` function is an Express-compatible handler, and can be adapted to serverless functions on Vercel or Railway.
- The Gemini client uses a 20s timeout and expects a JSON-only response from the model.
- When `GEMINI_API_URL` or `GEMINI_API_KEY` are missing, the server will use a local dev mock response so you can test `/api/roast` without real API keys. The mock returns realistic placeholder values and adheres to the API schema.

## Running locally (Windows-friendly)

1) Install dependencies locally: `npm i`
2) Start the dev server (recommended): `npm run dev:server`
   - This runs `tsx watch src/server/express.ts` (fast, robust ESM-aware runner). It launches `src/server/express.ts` directly using ESM imports.
3) Alternative with ts-node-dev: `npm run dev:server:ts-node` (if you prefer ts-node-dev) or fallback to node: `npm run dev:server:node`

The server listens on port 8787 by default and exposes:
- POST http://localhost:8787/api/roast
- GET  http://localhost:8787/_health

Test script:
- `npm run test:dev` — runs a POST request against `/api/roast` (at http://localhost:8787 by default) and validates the response schema. Use `TEST_BASE_URL` env var to target another host.

Frontend dev preview:
- A local dev-only page is available at `/dev/roast` (only when `import.meta.env.DEV` is true). It mounts the `RoastClientExample` component which calls `/api/roast`.

Note: Provide `GEMINI_API_KEY` and `GEMINI_API_URL` to test with real Gemini; otherwise the local mock will be used.

Local .env usage (dev only):
- Create a `.env.local` file in the project root and add:

```text
GEMINI_API_KEY=your_real_gemini_key
GEMINI_API_URL=https://your.gemini.endpoint
DEV_MOCK_GEMINI=false
```

- In development `import('dotenv/config')` is loaded automatically to pick this up. To force the dev mock regardless of keys set, set `DEV_MOCK_GEMINI=true`.

- For best dev UX, the frontend dev server proxies `/api` to `http://localhost:8787` so you can use the `/dev/roast` page without configuring cross-origin calls.

- For production, replace the in-memory rate limiter with a Redis-backed system (Upstash recommended) and enable robust logging/error tracking.

## API Contract

POST /api/roast
- Request JSON:

```json
{
  "resumeText": "string",
  "jobDescription": "optional string",
  "tone": "friendly|hr|senior|dark",
  "language": "english|hinglish"
}
```

- Response JSON (exact schema):

```json
{
  "score": number,
  "verdict": "Apply" | "Don't Apply" | "High Risk",
  "roast": { "summary": string, "skills": string, "projects": string, "experience": string, "formatting": string },
  "atsMatch": { "percentage": number, "missingSkills": string[] },
  "fixes": { "summaryFix": string, "bulletFixes": string[] }
}
```

## Security & operational notes
- Keep `GEMINI_API_KEY` secret and only on server.
- Input size limited to prevent abuse (50k chars by default).
- The model is instructed to return JSON only and not to invent facts; server-side validation enforces the schema.

## Local testing
- You can run the small Express app at `src/server/express.ts` for local testing.
- The server exposes `/api/roast` and `/_health` endpoints.
