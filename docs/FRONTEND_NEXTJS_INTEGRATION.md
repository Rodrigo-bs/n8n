# Running n8n Frontend with Next.js

This guide explains how to run the n8n frontend within a Next.js application while isolating the backend in a separate repository.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
- [Troubleshooting](#troubleshooting)

## Overview

n8n is structured as a monorepo with separate frontend and backend packages. The frontend (`n8n-editor-ui`) is a Vue 3 application built with Vite, while the backend (`n8n`) is a Node.js/Express application. This guide shows you how to integrate the frontend into a Next.js application while keeping the backend separate.

### Why This Approach?

- **Flexibility**: Run the frontend in your existing Next.js infrastructure
- **Isolation**: Keep backend logic and frontend presentation layer separated
- **Scalability**: Deploy frontend and backend independently
- **Customization**: Easier to customize the frontend within your Next.js ecosystem

## Architecture

```
┌─────────────────────────────────────┐
│      Next.js Application            │
│  ┌───────────────────────────────┐  │
│  │   n8n Frontend (Vue 3/Vite)   │  │
│  │   - Workflow Editor UI         │  │
│  │   - User Interface Components │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
              ↓ HTTP/WebSocket
┌─────────────────────────────────────┐
│   Separate Backend Repository       │
│  ┌───────────────────────────────┐  │
│  │   n8n Backend (Express)       │  │
│  │   - REST API                   │  │
│  │   - Workflow Execution         │  │
│  │   - Database Management        │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Prerequisites

- **Node.js**: >= 22.16
- **pnpm**: >= 10.18.3
- **Next.js**: Compatible version (recommended: 14.x or later)
- **Separate backend deployment** of n8n

## Setup Instructions

### Step 1: Extract the Frontend Package

1. Clone the n8n repository in your Next.js project or a separate location:

```bash
git clone https://github.com/n8n-io/n8n.git
cd n8n
```

2. Install dependencies:

```bash
pnpm install
```

3. Build only the necessary packages for the frontend:

```bash
# Build all frontend dependencies
pnpm --filter=n8n-editor-ui... build
```

### Step 2: Integrate with Next.js

#### Option A: Using the Built Frontend (Recommended for Production)

1. Build the frontend package:

```bash
cd packages/frontend/editor-ui
pnpm build
```

2. Copy the built files to your Next.js project:

```bash
# From the n8n root directory
cp -r packages/frontend/editor-ui/dist /path/to/your/nextjs-project/public/n8n-editor
```

3. In your Next.js application, create a page to serve the frontend:

```typescript
// pages/workflow-editor.tsx or app/workflow-editor/page.tsx
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

#### Option B: Development Setup with Vite Dev Server

For development, you can run the Vite dev server alongside your Next.js application:

1. Start the n8n frontend dev server:

```bash
cd packages/frontend/editor-ui
pnpm serve
# This starts on http://localhost:8080
```

2. Configure your Next.js to proxy requests:

```javascript
// next.config.js
module.exports = {
  async rewrites() {
    return [
      {
        source: '/workflow-editor/:path*',
        destination: 'http://localhost:8080/:path*',
      },
    ];
  },
};
```

#### Option C: Embedding as a Module (Advanced)

For more control, you can integrate the frontend as a module within Next.js. This requires setting up Vite within Next.js or using webpack configurations to handle Vue components.

**Note**: This approach is more complex and requires careful configuration of build tools.

## Configuration

### Environment Variables

The n8n frontend needs to know where the backend API is located. Configure this through environment variables:

#### For the Frontend

Create a `.env.local` file in your Next.js project or configure the frontend build:

```bash
# Backend API URL
VUE_APP_URL_BASE_API=https://your-backend-domain.com/

# Or for development
VUE_APP_URL_BASE_API=http://localhost:5678/
```

When building the frontend, use:

```bash
cross-env VUE_APP_URL_BASE_API=https://your-backend-domain.com/ pnpm build
```

#### Key Configuration Points

The frontend uses these configuration values (defined in `packages/frontend/@n8n/stores/src/useRootStore.ts`):

- **baseUrl**: Base URL for API requests (from `VUE_APP_URL_BASE_API`)
- **restEndpoint**: REST API endpoint path (default: 'rest')
- **urlBaseWebhook**: Base URL for webhooks
- **urlBaseEditor**: Base URL for the editor

### Backend CORS Configuration

Your backend must allow requests from your Next.js domain. Configure CORS in your backend deployment:

```javascript
// In your backend n8n instance configuration
// Set these environment variables:
N8N_EDITOR_BASE_URL=https://your-nextjs-domain.com
WEBHOOK_URL=https://your-backend-domain.com/
```

For n8n backend, you may need to configure CORS headers. If using the standard n8n backend, it should handle CORS automatically when properly configured.

### WebSocket Configuration

The frontend uses WebSockets for real-time updates. Ensure your infrastructure supports WebSocket connections from the frontend to the backend:

```bash
# Backend WebSocket configuration
N8N_PUSH_BACKEND=websocket
```

## Development Workflow

### Local Development Setup

1. **Backend**: Run the backend separately on port 5678:

```bash
# In backend repository
cd packages/cli
pnpm dev
# Backend runs on http://localhost:5678
```

2. **Frontend**: Run the frontend dev server:

```bash
# In n8n repository
cd packages/frontend/editor-ui
pnpm serve
# Frontend runs on http://localhost:8080
# Configured to connect to backend at http://localhost:5678
```

3. **Next.js**: Run your Next.js application:

```bash
# In your Next.js project
npm run dev
# Next.js runs on http://localhost:3000
```

4. Access the workflow editor through your Next.js app or directly:
   - Via Next.js: `http://localhost:3000/workflow-editor`
   - Directly: `http://localhost:8080`

### Recommended Monorepo Structure

If you want to manage both frontend and backend in separate repositories:

```
your-project/
├── nextjs-app/              # Your Next.js application
│   ├── public/
│   │   └── n8n-editor/      # Built n8n frontend (optional)
│   └── pages/
├── n8n-frontend/            # n8n frontend source (clone of n8n)
│   └── packages/
│       └── frontend/
│           └── editor-ui/
└── n8n-backend/             # n8n backend (separate deployment)
    └── packages/
        └── cli/
```

## Production Deployment

### Deploying the Frontend

1. **Build the frontend** with production API URL:

```bash
cd n8n-frontend/packages/frontend/editor-ui
cross-env VUE_APP_URL_BASE_API=https://api.your-domain.com/ pnpm build
```

2. **Copy to Next.js public folder** or serve via CDN:

```bash
cp -r dist/* /path/to/nextjs-project/public/n8n-editor/
```

3. **Deploy Next.js** as usual:

```bash
cd nextjs-project
npm run build
npm start
# or deploy to Vercel, Netlify, etc.
```

### Deploying the Backend

Deploy the n8n backend separately using one of these methods:

1. **Docker** (Recommended):

```bash
docker run -d \
  -p 5678:5678 \
  -e WEBHOOK_URL=https://api.your-domain.com/ \
  -e N8N_EDITOR_BASE_URL=https://your-nextjs-domain.com \
  -v ~/.n8n:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

2. **npm package**:

```bash
npm install n8n -g
n8n start
```

3. **From source**:

```bash
cd n8n-backend/packages/cli
pnpm build
pnpm start
```

### Infrastructure Considerations

- **Reverse Proxy**: Use nginx or similar to handle SSL/TLS termination
- **WebSocket Support**: Ensure your proxy supports WebSocket upgrades
- **CORS**: Configure proper CORS headers in your backend
- **Authentication**: Implement shared authentication between Next.js and n8n backend

### Example nginx Configuration

```nginx
# Frontend (Next.js)
server {
    listen 443 ssl;
    server_name your-nextjs-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Backend (n8n API)
server {
    listen 443 ssl;
    server_name api.your-domain.com;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

## Troubleshooting

### Common Issues

#### 1. CORS Errors

**Problem**: Browser shows CORS policy errors when frontend tries to connect to backend.

**Solution**:
- Ensure backend environment variable `N8N_EDITOR_BASE_URL` is set to your Next.js domain
- Check that backend is running and accessible
- Verify network tab in browser DevTools for actual error

#### 2. WebSocket Connection Failures

**Problem**: Real-time updates not working, WebSocket connection fails.

**Solution**:
- Ensure `N8N_PUSH_BACKEND=websocket` is set in backend
- Check that your infrastructure supports WebSocket upgrades
- Verify reverse proxy configuration allows WebSocket connections

#### 3. Assets Not Loading

**Problem**: CSS, JavaScript, or other assets fail to load.

**Solution**:
- Check `BASE_PATH` configuration in built frontend
- Ensure all assets are copied to Next.js public folder
- Verify path configuration in Next.js matches the frontend build

#### 4. API Requests Failing

**Problem**: Frontend can't communicate with backend API.

**Solution**:
- Verify `VUE_APP_URL_BASE_API` was set correctly during build
- Check browser network tab for the actual API URLs being called
- Ensure backend is running and accessible from the frontend domain
- Check for typos in environment variables (trailing slashes matter!)

#### 5. Authentication Issues

**Problem**: Users can't log in or stay logged in.

**Solution**:
- Ensure cookies are configured for the correct domain
- Check SameSite cookie policies
- Verify authentication tokens are shared correctly between Next.js and n8n

### Debug Mode

Enable debug logging in the frontend by setting:

```bash
NODE_ENV=development
```

In the browser console, you can inspect:
- Network requests to the backend
- WebSocket connection status
- Store state (using Vue DevTools)

### Getting Help

If you encounter issues:

1. Check the [n8n documentation](https://docs.n8n.io)
2. Search the [n8n community forum](https://community.n8n.io)
3. Review backend logs for API errors
4. Check browser console for frontend errors

## Additional Resources

- [n8n Documentation](https://docs.n8n.io)
- [n8n GitHub Repository](https://github.com/n8n-io/n8n)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vite Documentation](https://vitejs.dev)

## Security Considerations

When running the frontend separately from the backend:

1. **HTTPS**: Always use HTTPS in production for both frontend and backend
2. **Authentication**: Implement proper authentication and authorization
3. **CORS**: Configure CORS restrictively - only allow your specific domains
4. **API Keys**: Never expose backend API keys in frontend code
5. **Content Security Policy**: Configure CSP headers appropriately
6. **Rate Limiting**: Implement rate limiting on the backend API

## License

n8n is [fair-code](http://faircode.io) distributed under the [Sustainable Use License](https://github.com/n8n-io/n8n/blob/master/LICENSE.md) and [n8n Enterprise License](https://github.com/n8n-io/n8n/blob/master/LICENSE_EE.md).

Ensure you comply with the license terms when deploying n8n in your infrastructure.
