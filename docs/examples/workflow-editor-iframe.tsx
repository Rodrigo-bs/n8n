/**
 * Example Next.js page for embedding n8n workflow editor using iframe
 * 
 * This is the simplest approach - embedding the built n8n frontend in an iframe.
 * Works well for production deployments.
 * 
 * Location: pages/workflow-editor.tsx (Pages Router)
 * or app/workflow-editor/page.tsx (App Router)
 */

import React from 'react';

export default function WorkflowEditor() {
  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0 }}>
      <iframe
        src="/n8n-editor/index.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          margin: 0,
          padding: 0,
        }}
        title="n8n Workflow Editor"
        allow="clipboard-read clipboard-write"
      />
    </div>
  );
}

/**
 * For App Router (Next.js 13+), add metadata:
 */
export const metadata = {
  title: 'Workflow Editor | n8n',
  description: 'Create and manage automation workflows',
};
