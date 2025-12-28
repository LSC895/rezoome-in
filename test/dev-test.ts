import { RoastResponseSchema } from '../src/server/roast/validation';

const BASE = process.env.TEST_BASE_URL ?? 'http://localhost:8787';

async function main() {
  console.log(`Testing /api/roast at ${BASE}`);
  const payload = {
    resumeText: 'Built two React projects and familiar with Node.js.',
    tone: 'friendly',
    language: 'english',
  };

  const res = await fetch(`${BASE}/api/roast`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    console.error(`Request failed: ${res.status} ${res.statusText}`);
    const txt = await res.text();
    console.error('Body:', txt);
    process.exit(2);
  }

  const data = await res.json();

  const parsed = RoastResponseSchema.safeParse(data);
  if (!parsed.success) {
    console.error('Schema validation failed:');
    console.error(parsed.error.format());
    process.exit(3);
  }

  console.log('Schema validation passed ✅');
  console.log(JSON.stringify(parsed.data, null, 2));
  process.exit(0);
}

main().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
