# n8n Frontend Integration Examples

This directory contains example files and configurations for integrating the n8n frontend with Next.js while keeping the backend isolated.

## Files in This Directory

### Configuration Files

- **`.env.example`** - Example environment variables for both Next.js and n8n backend
- **`next.config.example.js`** - Example Next.js configuration with proxy and header settings
- **`docker-compose.yml`** - Docker Compose setup for running n8n backend in isolation

### Next.js Page Examples

- **`workflow-editor-iframe.tsx`** - Simple iframe embedding approach (recommended for production)
- **`workflow-editor-dev.tsx`** - Development setup with Vite dev server proxy

### Build Scripts

- **`build-n8n-frontend.sh`** - Unix/Linux/macOS build script
- **`build-n8n-frontend.bat`** - Windows build script

## Quick Start Guide

### 1. Set Up the Backend

**Option A: Using Docker (Recommended)**

```bash
# Copy the docker-compose.yml to your project
cp docker-compose.yml /path/to/your/project/

# Start the backend
docker-compose up -d

# Backend will be available at http://localhost:5678
```

**Option B: Using npm**

```bash
npm install n8n -g
N8N_EDITOR_BASE_URL=http://localhost:3000 n8n start
```

### 2. Build the Frontend

**On Unix/Linux/macOS:**

```bash
# Make the script executable (first time only)
chmod +x build-n8n-frontend.sh

# Run the build script
./build-n8n-frontend.sh http://localhost:5678/ /path/to/nextjs/public/n8n-editor
```

**On Windows:**

```cmd
build-n8n-frontend.bat http://localhost:5678/ C:\path\to\nextjs\public\n8n-editor
```

### 3. Configure Your Next.js Application

1. Copy the Next.js configuration:

```bash
cp next.config.example.js /path/to/nextjs/next.config.js
```

2. Set up environment variables:

```bash
cp .env.example /path/to/nextjs/.env.local
```

3. Edit `.env.local` to match your setup:

```bash
N8N_BACKEND_URL=http://localhost:5678
```

### 4. Add a Workflow Editor Page

Copy one of the page examples to your Next.js project:

**For Pages Router:**

```bash
cp workflow-editor-iframe.tsx /path/to/nextjs/pages/workflow-editor.tsx
```

**For App Router (Next.js 13+):**

```bash
mkdir -p /path/to/nextjs/app/workflow-editor
cp workflow-editor-iframe.tsx /path/to/nextjs/app/workflow-editor/page.tsx
```

### 5. Start Your Next.js Application

```bash
cd /path/to/nextjs
npm run dev
```

Visit `http://localhost:3000/workflow-editor` to see the n8n editor.

## Integration Approaches

### Approach 1: Static Build (Production)

**Best for:** Production deployments

1. Build the frontend with production backend URL
2. Copy built files to Next.js public directory
3. Serve via iframe in Next.js page

**Pros:**
- Simple deployment
- No build tool conflicts
- Clear separation of concerns

**Cons:**
- Need to rebuild frontend for backend URL changes
- No hot module replacement during development

### Approach 2: Dev Server Proxy (Development)

**Best for:** Active development

1. Run Vite dev server separately
2. Configure Next.js to proxy requests
3. Embed via iframe pointing to proxy endpoint

**Pros:**
- Hot module replacement
- Easy debugging
- Quick iteration

**Cons:**
- More complex setup
- Requires multiple processes running

## Customization

### Changing the Backend URL

To point to a different backend:

1. Rebuild the frontend with the new URL:

```bash
./build-n8n-frontend.sh https://api.yourdomain.com/ /path/to/nextjs/public/n8n-editor
```

2. Update your Next.js environment variables:

```bash
# In .env.local
N8N_BACKEND_URL=https://api.yourdomain.com
```

### Custom Styling

The n8n frontend can be customized by:

1. Modifying the source code in `n8n/packages/frontend/editor-ui/src`
2. Rebuilding the frontend
3. Copying to your Next.js project

See the main documentation at `../FRONTEND_NEXTJS_INTEGRATION.md` for more details.

### Security Considerations

When deploying to production:

1. **Use HTTPS** for both frontend and backend
2. **Configure CORS** properly in the backend
3. **Set up authentication** between your Next.js app and n8n
4. **Use environment variables** for all configuration
5. **Restrict access** to the workflow editor based on your requirements

## Troubleshooting

### Issue: Frontend can't connect to backend

**Solution:**
- Check that backend is running: `curl http://localhost:5678/healthz`
- Verify `VUE_APP_URL_BASE_API` was set correctly during build
- Check browser console and network tab for errors

### Issue: CORS errors in browser

**Solution:**
- Ensure `N8N_EDITOR_BASE_URL` is set in backend to your Next.js URL
- Verify backend is configured to allow your frontend domain

### Issue: WebSocket connection fails

**Solution:**
- Ensure `N8N_PUSH_BACKEND=websocket` is set in backend
- Check that your infrastructure supports WebSocket upgrades
- Verify firewall/proxy settings allow WebSocket connections

### Issue: Assets not loading correctly

**Solution:**
- Verify all files were copied from `dist/` directory
- Check Next.js public folder structure
- Inspect browser network tab for 404 errors on assets

## Additional Resources

- [Main Documentation](../FRONTEND_NEXTJS_INTEGRATION.md)
- [n8n Documentation](https://docs.n8n.io)
- [Next.js Documentation](https://nextjs.org/docs)
- [n8n GitHub Repository](https://github.com/n8n-io/n8n)

## License

These examples are provided as-is for demonstration purposes. n8n is [fair-code](http://faircode.io) distributed under the [Sustainable Use License](https://github.com/n8n-io/n8n/blob/master/LICENSE.md).
