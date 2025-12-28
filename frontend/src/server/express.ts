// Load local .env in development for easy testing of Gemini and other secrets
if (process.env.NODE_ENV !== 'production') {
  // import dotenv config dynamically so production builds don't depend on it
  void import('dotenv/config');
  // eslint-disable-next-line no-console
  console.log('Loaded .env (if present)');
}

import express from 'express';
import bodyParser from 'body-parser';
import { createRoastRouter } from './roast/handler';

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 8787;

app.use(bodyParser.json({ limit: '100kb' }));

app.use('/api/roast', createRoastRouter());

app.get('/_health', (_req, res) => res.json({ ok: true }));

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Roast API server listening on http://localhost:${port}`);
});

export default app;
