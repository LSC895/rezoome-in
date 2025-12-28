// Vercel API adapter — forwards to the server-side handler implemented under src/server/roast
// This file is intentionally tiny so Vercel can pick it up as an API route.
import handler from '../src/server/roast/handler';

export default async function vercelHandler(req: any, res: any) {
  // The handler expects Node/Express-like req/res; simply forward the call.
  return handler(req, res);
}
