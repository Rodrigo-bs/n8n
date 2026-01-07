/**
 * Example Next.js page with proxy to Vite dev server
 * 
 * This approach is useful during development when you want to run
 * the n8n frontend with hot module replacement (HMR).
 * 
 * Prerequisites:
 * 1. Run the n8n frontend dev server: cd packages/frontend/editor-ui && pnpm serve
 * 2. Configure next.config.js with the rewrite rule (see next.config.example.js)
 * 
 * Location: pages/workflow-editor-dev.tsx (Pages Router)
 * or app/workflow-editor-dev/page.tsx (App Router)
 */

import React from 'react';

export default function WorkflowEditorDev() {
  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
      <iframe
        src="/workflow-editor/"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
        }}
        title="n8n Workflow Editor (Development)"
        allow="clipboard-read clipboard-write"
      />
    </div>
  );
}

/**
 * This component could also be enhanced with development-only features:
 */
export function WorkflowEditorDevWithControls() {
  const [showDebug, setShowDebug] = React.useState(false);

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Development toolbar */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ padding: '10px', backgroundColor: '#f0f0f0', borderBottom: '1px solid #ccc' }}>
          <button onClick={() => setShowDebug(!showDebug)}>
            Toggle Debug Info
          </button>
          {showDebug && (
            <div style={{ marginTop: '10px', fontSize: '12px' }}>
              <p>Frontend: http://localhost:8080</p>
              <p>Backend: {process.env.N8N_BACKEND_URL}</p>
              <p>Proxied through: /workflow-editor/</p>
            </div>
          )}
        </div>
      )}
      
      {/* Editor iframe */}
      <div style={{ flex: 1 }}>
        <iframe
          src="/workflow-editor/"
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            margin: 0,
            padding: 0,
          }}
          title="n8n Workflow Editor (Development)"
          allow="clipboard-read clipboard-write"
        />
      </div>
    </div>
  );
}
