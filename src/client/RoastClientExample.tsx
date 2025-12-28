import React, { useState } from 'react';

export default function RoastClientExample() {
  // Note: the demo UI is intentionally minimal — this component shows how to call /api/roast from the client
  const [resumeText, setResumeText] = useState('Built two React projects and familiar with Node.js.');
  const [tone, setTone] = useState<'friendly' | 'hr' | 'senior' | 'dark'>('friendly');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeText, tone, language: 'english' }),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err?.message ?? String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <h3>Roast API demo</h3>
      <textarea value={resumeText} onChange={(e) => setResumeText(e.target.value)} rows={6} style={{ width: '100%' }} />
      <div style={{ marginTop: 8 }}>
        <label>
          Tone:{' '}
          <select value={tone} onChange={(e) => setTone(e.target.value as any)}>
            <option value='friendly'>friendly</option>
            <option value='hr'>hr</option>
            <option value='senior'>senior</option>
            <option value='dark'>dark</option>
          </select>
        </label>
      </div>
      <div style={{ marginTop: 8 }}>
        <button onClick={submit} disabled={loading}>{loading ? 'Roasting…' : 'Roast Resume'}</button>
      </div>

      {error && (
        <div style={{ marginTop: 12, color: 'crimson' }}>Error: {error}</div>
      )}

      {result && (
        <pre style={{ marginTop: 12, background: '#f6f8fa', padding: 12, borderRadius: 6 }}>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}
