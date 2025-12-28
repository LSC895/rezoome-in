// frontend/src/lib/api.ts
// Use fetch('/api/...') from the frontend; do not import backend modules.

export async function callRoast(payload: unknown) {
  const res = await fetch('/api/roast', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Roast API error (${res.status}): ${text}`)
  }
  return res.json()
}
