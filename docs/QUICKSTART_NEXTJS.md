# Quick Start: n8n Frontend with Next.js

This is a condensed guide to get you started quickly with running n8n frontend in Next.js while keeping the backend separate.

## Prerequisites

- Node.js >= 22.16
- pnpm >= 10.18.3
- A Next.js application (or create one with `npx create-next-app@latest`)

## Step-by-Step Setup (5 minutes)

### 1. Start the n8n Backend

**Using Docker (Easiest):**

```bash
docker run -d \
  --name n8n-backend \
  -p 5678:5678 \
  -e N8N_EDITOR_BASE_URL=http://localhost:3000 \
  -e N8N_PUSH_BACKEND=websocket \
  docker.n8n.io/n8nio/n8n
```

**OR using npm:**

```bash
N8N_EDITOR_BASE_URL=http://localhost:3000 npx n8n@latest
# Backend runs on http://localhost:5678
```

### 2. Clone n8n and Build Frontend

```bash
# Clone n8n repository
git clone https://github.com/n8n-io/n8n.git
cd n8n

# Install dependencies
pnpm install

# Build the frontend
cd packages/frontend/editor-ui
cross-env VUE_APP_URL_BASE_API=http://localhost:5678/ pnpm build
```

### 3. Copy to Your Next.js Project

```bash
# From the n8n/packages/frontend/editor-ui directory
cp -r dist /path/to/your/nextjs/public/n8n-editor
```

### 4. Create a Page in Next.js

**For Pages Router** (`pages/workflow-editor.tsx`):

```tsx
export default function WorkflowEditor() {
  return (
    <iframe
      src="/n8n-editor/index.html"
      style={{ width: '100%', height: '100vh', border: 'none' }}
      title="n8n Workflow Editor"
    />
  );
}
```

**For App Router** (`app/workflow-editor/page.tsx`):

```tsx
export default function WorkflowEditor() {
  return (
    <iframe
      src="/n8n-editor/index.html"
      style={{ width: '100%', height: '100vh', border: 'none' }}
      title="n8n Workflow Editor"
    />
  );
}
```

### 5. Run Your Next.js App

```bash
cd /path/to/your/nextjs
npm run dev
```

Visit: **http://localhost:3000/workflow-editor**

## Done! 🎉

You now have:
- ✅ n8n backend running on port 5678
- ✅ n8n frontend embedded in your Next.js app on port 3000
- ✅ Complete workflow editor functionality

## Development Workflow

For active development with hot reload:

1. **Terminal 1** - Backend:
```bash
docker run -p 5678:5678 -e N8N_EDITOR_BASE_URL=http://localhost:3000 docker.n8n.io/n8nio/n8n
```

2. **Terminal 2** - Frontend (Vite dev server):
```bash
cd n8n/packages/frontend/editor-ui
pnpm serve
# Runs on http://localhost:8080
```

3. **Terminal 3** - Next.js:
```bash
cd your-nextjs-app
npm run dev
```

Then point your iframe to `http://localhost:8080` during development.

## Production Deployment

1. **Build with production backend URL:**
```bash
cd n8n/packages/frontend/editor-ui
cross-env VUE_APP_URL_BASE_API=https://api.yourdomain.com/ pnpm build
cp -r dist /path/to/nextjs/public/n8n-editor
```

2. **Deploy backend separately:**
```bash
docker run -d \
  -p 5678:5678 \
  -e WEBHOOK_URL=https://api.yourdomain.com/ \
  -e N8N_EDITOR_BASE_URL=https://yourdomain.com \
  -e N8N_PUSH_BACKEND=websocket \
  docker.n8n.io/n8nio/n8n
```

3. **Deploy Next.js as usual:**
```bash
npm run build
npm start
```

## Troubleshooting

**Frontend can't connect to backend?**
- Check backend is running: `curl http://localhost:5678/healthz`
- Verify `VUE_APP_URL_BASE_API` was set during build

**CORS errors?**
- Ensure `N8N_EDITOR_BASE_URL` is set in backend

**WebSocket not working?**
- Set `N8N_PUSH_BACKEND=websocket` in backend environment

## Next Steps

- 📖 Read the [full documentation](./FRONTEND_NEXTJS_INTEGRATION.md)
- 🔍 Check out the [examples](./examples/)
- 🚀 Customize and extend your setup

## Need Help?

- [n8n Community Forum](https://community.n8n.io)
- [n8n Documentation](https://docs.n8n.io)
- [GitHub Issues](https://github.com/n8n-io/n8n/issues)
