# Architecture Diagrams for n8n Frontend + Next.js Integration

This document contains ASCII diagrams to help visualize different deployment architectures.

## Basic Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User's Browser                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Server                            │
│                  (Port 3000 / HTTPS)                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Your Next.js Application                       │ │
│  │                                                         │ │
│  │  /workflow-editor → iframe to n8n frontend            │ │
│  │  /other-pages     → Your app pages                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         n8n Frontend (Static Files)                    │ │
│  │         Located in: public/n8n-editor/                 │ │
│  │                                                         │ │
│  │  - index.html                                           │ │
│  │  - JavaScript bundles                                   │ │
│  │  - CSS files                                            │ │
│  │  - Assets                                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/HTTPS + WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    n8n Backend Server                        │
│                  (Port 5678 / Separate Host)                 │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Express.js REST API                            │ │
│  │         - /rest/* endpoints                             │ │
│  │         - WebSocket connection                          │ │
│  │         - Authentication                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Workflow Execution Engine                       │ │
│  │         - Run workflows                                 │ │
│  │         - Handle webhooks                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         Database (PostgreSQL/SQLite/MySQL)             │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Development Setup

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer Machine                         │
│                                                              │
│  Terminal 1: Next.js Dev Server (Port 3000)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  $ npm run dev                                          │ │
│  │  Next.js at http://localhost:3000                      │ │
│  │  - Proxy /workflow-editor/* → http://localhost:8080    │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              │ Proxy                         │
│                              ▼                               │
│  Terminal 2: Vite Dev Server (Port 8080)                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  $ cd n8n/packages/frontend/editor-ui                  │ │
│  │  $ pnpm serve                                           │ │
│  │  Vite at http://localhost:8080                         │ │
│  │  - Hot Module Replacement (HMR)                         │ │
│  │  - Vue DevTools support                                 │ │
│  └────────────────────────────────────────────────────────┘ │
│                              │                               │
│                              │ HTTP + WebSocket              │
│                              ▼                               │
│  Terminal 3: n8n Backend (Port 5678)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  $ docker run -p 5678:5678 ...                         │ │
│  │  OR                                                      │ │
│  │  $ cd n8n/packages/cli && pnpm dev                     │ │
│  │  Backend at http://localhost:5678                      │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Production Deployment (Single Server)

```
                         Internet
                            │
                            ▼
              ┌─────────────────────────┐
              │   Reverse Proxy         │
              │   (nginx/Apache)        │
              │   Port 80/443           │
              └─────────────────────────┘
                      │         │
         ┌────────────┘         └────────────┐
         ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│   Next.js        │              │   n8n Backend    │
│   Port 3000      │              │   Port 5678      │
│                  │              │                  │
│ Frontend served  │──── HTTP ───▶│  REST API        │
│ from public/     │◀─ WebSocket ─│  + Execution     │
└──────────────────┘              └──────────────────┘
                                           │
                                           ▼
                                  ┌──────────────────┐
                                  │   PostgreSQL     │
                                  │   Port 5432      │
                                  └──────────────────┘

nginx.conf:
  app.example.com     → localhost:3000  (Next.js)
  api.example.com     → localhost:5678  (n8n Backend)
```

## Production Deployment (Multi-Server / Scalable)

```
                         Internet
                            │
                            ▼
              ┌─────────────────────────┐
              │   Load Balancer         │
              │   (AWS ALB/nginx)       │
              └─────────────────────────┘
                      │         │
         ┌────────────┘         └────────────┐
         ▼                                   ▼
┌──────────────────┐              ┌──────────────────┐
│   Frontend CDN   │              │   Backend LB     │
│   (CloudFront/   │              │                  │
│    Vercel/       │              └──────────────────┘
│    Netlify)      │                       │
│                  │         ┌─────────────┼─────────────┐
│  Serves built    │         ▼             ▼             ▼
│  n8n frontend    │    ┌────────┐    ┌────────┐    ┌────────┐
└──────────────────┘    │ n8n    │    │ n8n    │    │ n8n    │
         │              │ Main   │    │Worker  │    │Worker  │
         │              │Instance│    │   1    │    │   2    │
         │              └────────┘    └────────┘    └────────┘
         │                   │             │             │
         │                   └─────────────┼─────────────┘
         │                                 │
         │              ┌──────────────────┴──────────────┐
         │              ▼                                 ▼
         │    ┌──────────────────┐           ┌──────────────────┐
         └───▶│   PostgreSQL     │           │   Redis Queue    │
              │   (RDS)          │           │   (ElastiCache)  │
              └──────────────────┘           └──────────────────┘
```

## Data Flow Diagram

```
User Action (Click button in workflow editor)
    │
    ▼
┌────────────────────────────────────┐
│  Frontend JavaScript (Vue 3)       │
│  Running in browser                │
└────────────────────────────────────┘
    │
    │ HTTP POST /rest/workflows/create
    ▼
┌────────────────────────────────────┐
│  n8n Backend REST API              │
│  Express.js endpoint               │
└────────────────────────────────────┘
    │
    │ Validate & Process
    ▼
┌────────────────────────────────────┐
│  Database Layer (TypeORM)          │
│  Save workflow data                │
└────────────────────────────────────┘
    │
    │ Workflow saved
    ▼
┌────────────────────────────────────┐
│  Backend sends response            │
│  + WebSocket notification          │
└────────────────────────────────────┘
    │
    │ WebSocket message
    ▼
┌────────────────────────────────────┐
│  Frontend receives update          │
│  UI refreshes automatically        │
└────────────────────────────────────┘
```

## Environment Variables Flow

```
Build Time (Frontend):
┌────────────────────────────────────┐
│  VUE_APP_URL_BASE_API              │
│  = https://api.example.com/        │
└────────────────────────────────────┘
           │
           │ Embedded in compiled JavaScript
           ▼
┌────────────────────────────────────┐
│  Built frontend knows where to     │
│  send API requests                 │
└────────────────────────────────────┘

Runtime (Backend):
┌────────────────────────────────────┐
│  N8N_EDITOR_BASE_URL               │
│  = https://app.example.com         │
│                                    │
│  Used for CORS configuration       │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  N8N_PUSH_BACKEND=websocket        │
│                                    │
│  Enables WebSocket for real-time   │
│  updates                            │
└────────────────────────────────────┘

┌────────────────────────────────────┐
│  WEBHOOK_URL                        │
│  = https://api.example.com/        │
│                                    │
│  Base URL for webhook endpoints    │
└────────────────────────────────────┘
```

## Request Flow with Next.js API Proxy (Optional Advanced Pattern)

```
Browser
  │
  │ POST /api/n8n/workflows
  ▼
Next.js API Route (pages/api/n8n/[...path].ts)
  │
  │ Custom middleware:
  │ - Authentication
  │ - Rate limiting
  │ - Request transformation
  ▼
Forward to n8n Backend (http://localhost:5678/workflows)
  │
  ▼
n8n Backend processes request
  │
  ▼
Response flows back through Next.js API
  │
  │ Response transformation (optional)
  ▼
Browser receives response
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────┐
│                    Security Boundaries                       │
│                                                              │
│  1. TLS/SSL Termination                                     │
│     ┌────────────────────────────────────────────────┐      │
│     │  HTTPS connections only in production          │      │
│     └────────────────────────────────────────────────┘      │
│                          ▼                                   │
│  2. Next.js Authentication                                  │
│     ┌────────────────────────────────────────────────┐      │
│     │  Your app's auth layer (NextAuth, etc.)       │      │
│     └────────────────────────────────────────────────┘      │
│                          ▼                                   │
│  3. CORS Configuration                                      │
│     ┌────────────────────────────────────────────────┐      │
│     │  Backend allows only your Next.js domain       │      │
│     │  N8N_EDITOR_BASE_URL=https://app.example.com  │      │
│     └────────────────────────────────────────────────┘      │
│                          ▼                                   │
│  4. n8n Authentication                                      │
│     ┌────────────────────────────────────────────────┐      │
│     │  n8n's built-in user management               │      │
│     │  OR Basic Auth                                  │      │
│     └────────────────────────────────────────────────┘      │
│                          ▼                                   │
│  5. API Rate Limiting                                       │
│     ┌────────────────────────────────────────────────┐      │
│     │  Protect against abuse                         │      │
│     └────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────┘
```
