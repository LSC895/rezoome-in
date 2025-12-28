import React from 'react';
import RoastClientExample from '@/client/RoastClientExample';

export default function DevRoastDemo() {
  return (
    <div style={{ padding: 24 }}>
      <h2>Dev Roast Demo</h2>
      <p>This page is for local development only — it demonstrates the `/api/roast` integration.</p>
      <RoastClientExample />
    </div>
  );
}
