# FAQ: n8n Frontend Integration with Next.js

Frequently asked questions about running n8n frontend in Next.js with isolated backend.

## General Questions

### Q: Why would I want to separate the n8n frontend from the backend?

**A:** There are several reasons:

1. **Existing Infrastructure**: You already have a Next.js application and want to integrate n8n's workflow capabilities
2. **Custom Authentication**: Easier to integrate with your existing auth system
3. **Custom Styling**: More control over the UI presentation layer
4. **Separate Scaling**: Scale frontend and backend independently based on traffic
5. **Multi-tenant Setup**: Run multiple frontends with different branding pointing to the same backend
6. **Edge Deployment**: Deploy frontend to edge locations (CDN) for better performance

### Q: Is this an officially supported configuration?

**A:** While n8n is designed as an integrated application, the architecture allows for separation. The frontend communicates with the backend via REST API and WebSocket, making this separation possible. However, this is an advanced setup and requires careful configuration.

### Q: Will this work with the latest version of n8n?

**A:** This approach should work with recent versions of n8n. However:
- Always test with your specific version
- Check for breaking changes in release notes
- The configuration may need adjustments as n8n evolves

## Setup Questions

### Q: Do I need to clone the entire n8n repository?

**A:** Yes, for the initial setup. You need the source to build the frontend. However:
- You only need to build the frontend package
- After building, you can copy just the `dist` folder to your Next.js project
- For updates, you'll need to rebuild from the source

### Q: Can I use the published npm package instead?

**A:** The `n8n` and `n8n-editor-ui` npm packages are designed for different use cases:
- `n8n`: The full application (backend + frontend)
- `n8n-editor-ui`: Internal package, not meant for standalone use

For this integration, building from source gives you the most control.

### Q: What version of Next.js do I need?

**A:** The integration works with:
- Next.js 12.x and later (Pages Router)
- Next.js 13.x and later (App Router)

The examples provided work with both routing patterns.

### Q: Can I use this with other frameworks (Nuxt, SvelteKit, etc.)?

**A:** Yes! The principles are the same:
1. Build the n8n frontend with the backend API URL
2. Serve the static files from your framework
3. Ensure proper CORS configuration

The examples are for Next.js, but can be adapted to other frameworks.

## Configuration Questions

### Q: How do I change the backend URL after building the frontend?

**A:** The backend URL is embedded at build time. To change it:
1. Rebuild the frontend with the new URL:
   ```bash
   cross-env VUE_APP_URL_BASE_API=https://new-backend.com/ pnpm build
   ```
2. Copy the new build to your Next.js project

**Alternative**: Use environment variable substitution at runtime (advanced):
- Configure your web server to replace placeholders in the built files
- Not recommended as it's more complex and error-prone

### Q: Can I use different backends for different users/tenants?

**A:** Yes, but it requires a more advanced setup:
- Create different builds with different backend URLs
- Route users to the appropriate build based on their tenant
- Or implement a proxy layer that routes requests to the correct backend

### Q: What WebSocket configuration is needed?

**A:** The backend needs:
```bash
N8N_PUSH_BACKEND=websocket
```

Your infrastructure must support WebSocket upgrades:
- nginx: Add WebSocket proxy headers
- Cloud providers: Ensure ALB/load balancer supports WebSocket
- Cloudflare: Enable WebSocket in settings

### Q: Do I need Redis for this setup?

**A:** Redis is optional and depends on your execution mode:
- **Regular mode** (single instance): No Redis needed
- **Queue mode** (multiple workers): Redis required for job queue

Queue mode is recommended for production/scalable deployments.

## Development Questions

### Q: Can I use hot module replacement (HMR) during development?

**A:** Yes! Use the Vite dev server approach:
1. Run the Vite dev server: `pnpm serve` in `packages/frontend/editor-ui`
2. Configure Next.js to proxy to the Vite server
3. Changes to the frontend will hot-reload

See the [Quick Start Guide](./QUICKSTART_NEXTJS.md) for setup details.

### Q: How do I debug the frontend?

**A:** Several approaches:
1. **Browser DevTools**: Standard debugging in the browser
2. **Vue DevTools**: Install the browser extension for Vue-specific debugging
3. **Network Tab**: Monitor API calls to the backend
4. **Source Maps**: Available in development builds for stepping through code

### Q: Can I modify the n8n frontend source code?

**A:** Yes, but:
- Fork the n8n repository
- Make your changes in `packages/frontend/editor-ui`
- Rebuild and redeploy
- Be aware of licensing (n8n uses Sustainable Use License)
- Maintaining custom changes requires ongoing effort when upgrading

## Deployment Questions

### Q: Can I deploy the frontend to Vercel/Netlify?

**A:** Yes! The built n8n frontend is just static files:
1. Build the frontend
2. Copy to your Next.js `public/` directory
3. Deploy Next.js to Vercel/Netlify as usual
4. Ensure backend is accessible from the deployed frontend

### Q: How do I handle HTTPS/SSL?

**A:** For production:
1. **Frontend**: Deploy Next.js with HTTPS (Vercel handles this automatically)
2. **Backend**: Use a reverse proxy (nginx) with SSL certificates
3. **Configuration**: Use HTTPS URLs in all environment variables

Example:
```bash
VUE_APP_URL_BASE_API=https://api.yourdomain.com/
N8N_EDITOR_BASE_URL=https://app.yourdomain.com
```

### Q: What about authentication?

**A:** Several approaches:

**Option 1: Use n8n's built-in auth**
- n8n handles authentication
- Users log in through the n8n UI
- Session cookies manage auth state

**Option 2: Custom authentication wrapper**
- Wrap the n8n frontend in your Next.js auth
- Proxy API requests through Next.js API routes
- Add your auth headers to backend requests

**Option 3: SSO integration**
- Configure n8n for SAML/LDAP/OIDC
- Integrate with your identity provider

### Q: How do I handle database migrations?

**A:** Database management stays with the backend:
- Run migrations using n8n CLI: `n8n db:migrate`
- Or let n8n auto-migrate on startup
- Frontend doesn't need to know about database schema

## Troubleshooting Questions

### Q: Why am I getting CORS errors?

**A:** Common causes:
1. `N8N_EDITOR_BASE_URL` not set in backend
2. Backend URL includes port but frontend doesn't (or vice versa)
3. HTTP vs HTTPS mismatch
4. Trailing slashes inconsistency

**Solution**: Ensure exact match between frontend domain and `N8N_EDITOR_BASE_URL`.

### Q: WebSocket connection keeps failing?

**A:** Check:
1. `N8N_PUSH_BACKEND=websocket` is set
2. Proxy/load balancer supports WebSocket upgrades
3. No firewall blocking WebSocket connections
4. Browser console shows the actual WebSocket URL being attempted

### Q: Frontend loads but appears broken/styled incorrectly?

**A:** Possible issues:
1. Assets not copied correctly - verify all files in `dist/` were copied
2. Base path mismatch - check `VUE_APP_PUBLIC_PATH` during build
3. Browser caching old version - hard refresh (Ctrl+Shift+R)
4. Missing CSS files - check network tab for 404s

### Q: API calls return 404 errors?

**A:** Verify:
1. Backend is running and accessible
2. `VUE_APP_URL_BASE_API` was set correctly during build
3. Backend URL is reachable from where frontend is deployed
4. Check browser network tab for the actual URL being called

### Q: How do I check if it's working correctly?

**A:** Verification steps:
1. Backend health check: `curl http://backend:5678/healthz`
2. Frontend loads: Access `/n8n-editor/index.html` in browser
3. API connectivity: Check browser network tab for successful API calls
4. WebSocket: Look for WebSocket connection in network tab (ws:// or wss://)
5. Create a test workflow to verify end-to-end functionality

## Performance Questions

### Q: Will this setup be slower than the standard n8n?

**A:** Performance considerations:
- **Frontend**: Similar performance - it's the same Vue application
- **Network**: Potential latency if frontend and backend are geographically separated
- **WebSocket**: Real-time updates work the same way
- **CDN**: Can actually be faster if frontend is served from CDN

**Best practices**:
- Deploy backend close to your database
- Use CDN for static frontend assets
- Enable HTTP/2 and compression

### Q: How many users can this support?

**A:** Scalability depends on:
- Backend configuration (queue mode vs regular)
- Database capacity (PostgreSQL recommended for production)
- Server resources
- Execution mode setup

The frontend separation doesn't significantly impact capacity - it's the same frontend code.

## Advanced Questions

### Q: Can I white-label or rebrand the frontend?

**A:** Yes, by modifying the source:
1. Fork n8n repository
2. Modify branding in `packages/frontend/editor-ui/src`
3. Update colors, logos, text
4. Rebuild and deploy
5. Ensure compliance with n8n license

### Q: Can I integrate the frontend components directly into Next.js?

**A:** Technically possible but very complex:
- Would need to configure webpack/vite to handle Vue components
- Manage dependency conflicts between Next.js (React) and n8n (Vue)
- Significant ongoing maintenance effort

**Recommendation**: Use the iframe/static files approach for simplicity.

### Q: How do I handle updates to n8n?

**A:** Update process:
1. Pull latest n8n code
2. Review changelog for breaking changes
3. Rebuild frontend with your backend URL
4. Test in staging environment
5. Deploy to production
6. Update backend separately (can be independent)

### Q: Can I run multiple frontend instances with one backend?

**A:** Yes! This is a valid architecture:
- Multiple Next.js instances (different regions, tenants)
- All pointing to the same backend
- Useful for multi-region deployments or A/B testing

Configure each frontend build with the same backend URL.

## Getting Help

### Q: Where can I get help if something doesn't work?

**A:** Resources:
1. Check the [troubleshooting guide](./FRONTEND_NEXTJS_INTEGRATION.md#troubleshooting)
2. Review [architecture diagrams](./ARCHITECTURE_DIAGRAMS.md)
3. Search [n8n community forum](https://community.n8n.io)
4. Check [GitHub issues](https://github.com/n8n-io/n8n/issues)
5. Review browser console and network tab for specific errors

### Q: Can I contribute improvements to this documentation?

**A:** Yes! Contributions are welcome:
1. Fork the n8n repository
2. Update documentation in `docs/` directory
3. Test your changes
4. Submit a pull request
5. Follow n8n's contribution guidelines

## License Questions

### Q: Can I use this setup commercially?

**A:** n8n uses the Sustainable Use License:
- Self-hosting is allowed, even for commercial use
- You cannot offer n8n as a service to third parties without a commercial license
- Review the full license: https://github.com/n8n-io/n8n/blob/master/LICENSE.md

### Q: Do I need a special license for this setup?

**A:** The same license terms apply as regular n8n:
- Self-hosted for your own company: Free
- Offering as a service: Requires commercial license
- Contact n8n for enterprise licensing

---

**Have a question not answered here?** 
- Check the [main documentation](./FRONTEND_NEXTJS_INTEGRATION.md)
- Visit the [n8n community forum](https://community.n8n.io)
- Review [n8n documentation](https://docs.n8n.io)
