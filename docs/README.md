# n8n Frontend Integration Documentation

Complete documentation for integrating the n8n workflow automation frontend with Next.js while keeping the backend isolated.

## 📚 Documentation Index

### Getting Started

1. **[Quick Start Guide](./QUICKSTART_NEXTJS.md)** ⚡
   - 5-minute setup guide
   - Fastest way to get running
   - Perfect for trying out the integration

2. **[Main Integration Guide](./FRONTEND_NEXTJS_INTEGRATION.md)** 📖
   - Comprehensive setup instructions
   - Detailed configuration options
   - Production deployment guide
   - Troubleshooting section

### Visual Resources

3. **[Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md)** 🏗️
   - Visual system architecture
   - Data flow diagrams
   - Deployment scenarios
   - Security layers

### Practical Examples

4. **[Examples Directory](./examples/)** 💡
   - Ready-to-use configuration files
   - Next.js page templates
   - Build scripts (Unix/Windows)
   - Docker Compose setup
   - API proxy examples

### Reference

5. **[FAQ](./FAQ_NEXTJS_INTEGRATION.md)** ❓
   - Common questions and answers
   - Troubleshooting tips
   - Best practices
   - Advanced scenarios

## 🎯 Choose Your Path

### I want to quickly test this out
→ Start with [Quick Start Guide](./QUICKSTART_NEXTJS.md)

### I need detailed implementation guidance
→ Read [Main Integration Guide](./FRONTEND_NEXTJS_INTEGRATION.md)

### I'm planning production deployment
→ Review [Architecture Diagrams](./ARCHITECTURE_DIAGRAMS.md) and [Main Guide](./FRONTEND_NEXTJS_INTEGRATION.md)

### I have specific questions
→ Check the [FAQ](./FAQ_NEXTJS_INTEGRATION.md)

### I need working examples
→ Explore the [Examples Directory](./examples/)

## 📋 What's Included

### Documentation Files

| File | Purpose | Audience |
|------|---------|----------|
| `QUICKSTART_NEXTJS.md` | Rapid setup guide | Developers wanting quick results |
| `FRONTEND_NEXTJS_INTEGRATION.md` | Complete integration guide | All users |
| `ARCHITECTURE_DIAGRAMS.md` | Visual architecture reference | Technical architects, DevOps |
| `FAQ_NEXTJS_INTEGRATION.md` | Questions and answers | All users |
| `examples/README.md` | Examples overview | Developers implementing |

### Example Files

| File | Purpose |
|------|---------|
| `.env.example` | Environment variables template |
| `next.config.example.js` | Next.js configuration |
| `docker-compose.yml` | Backend Docker setup |
| `build-n8n-frontend.sh` | Unix/Linux/macOS build script |
| `build-n8n-frontend.bat` | Windows build script |
| `workflow-editor-iframe.tsx` | Production iframe example |
| `workflow-editor-dev.tsx` | Development proxy example |
| `api-proxy-advanced.ts` | Advanced API proxy pattern |

## 🚀 Quick Reference

### Essential Environment Variables

**Frontend Build:**
```bash
VUE_APP_URL_BASE_API=http://localhost:5678/
```

**Backend Runtime:**
```bash
N8N_EDITOR_BASE_URL=http://localhost:3000
N8N_PUSH_BACKEND=websocket
WEBHOOK_URL=http://localhost:5678/
```

### Build Commands

**Build Frontend:**
```bash
cd n8n/packages/frontend/editor-ui
cross-env VUE_APP_URL_BASE_API=http://localhost:5678/ pnpm build
```

**Start Backend:**
```bash
docker run -p 5678:5678 \
  -e N8N_EDITOR_BASE_URL=http://localhost:3000 \
  -e N8N_PUSH_BACKEND=websocket \
  docker.n8n.io/n8nio/n8n
```

### Common Paths

**Frontend build output:**
```
n8n/packages/frontend/editor-ui/dist/
```

**Next.js public destination:**
```
your-nextjs-app/public/n8n-editor/
```

**Access in browser:**
```
http://localhost:3000/workflow-editor
```

## 🔗 Related Resources

### Official n8n Resources

- [n8n Documentation](https://docs.n8n.io) - Official n8n docs
- [n8n GitHub](https://github.com/n8n-io/n8n) - Source repository
- [n8n Community](https://community.n8n.io) - Community forum
- [n8n Workflows](https://n8n.io/workflows) - Workflow templates

### Next.js Resources

- [Next.js Documentation](https://nextjs.org/docs) - Official Next.js docs
- [Next.js GitHub](https://github.com/vercel/next.js) - Source repository

### Technical Background

- [Vite Documentation](https://vitejs.dev) - Frontend build tool
- [Vue.js Documentation](https://vuejs.org) - Frontend framework
- [Express.js Documentation](https://expressjs.com) - Backend framework

## 🤝 Contributing

Found an issue or want to improve this documentation?

1. Fork the [n8n repository](https://github.com/n8n-io/n8n)
2. Make your changes in the `docs/` directory
3. Test your changes thoroughly
4. Submit a pull request
5. Follow n8n's [contribution guidelines](https://github.com/n8n-io/n8n/blob/master/CONTRIBUTING.md)

## 📝 License

n8n is distributed under the [Sustainable Use License](https://github.com/n8n-io/n8n/blob/master/LICENSE.md) and [n8n Enterprise License](https://github.com/n8n-io/n8n/blob/master/LICENSE_EE.md).

### Key Points

- ✅ Self-hosting for your own company is free
- ✅ You can modify the code
- ✅ Source code is always available
- ❌ Cannot offer n8n as a service to third parties without commercial license

See the [license documentation](https://docs.n8n.io/sustainable-use-license/) for full details.

## 🆘 Support

### Getting Help

1. **Documentation**: Start with these guides
2. **FAQ**: Check the [FAQ document](./FAQ_NEXTJS_INTEGRATION.md)
3. **Search**: Look through existing [GitHub issues](https://github.com/n8n-io/n8n/issues)
4. **Community**: Ask in the [n8n forum](https://community.n8n.io)
5. **Debug**: Check browser console and network tab

### Reporting Issues

If you find a bug in these integration docs:

1. Verify it's specific to the Next.js integration
2. Check if it's already reported
3. Create a detailed issue report
4. Include your environment details

For general n8n issues, use the main n8n repository.

## 📅 Version Information

This documentation was created for:
- **n8n**: Version 1.x and later
- **Next.js**: Version 12.x and later
- **Node.js**: >= 22.16
- **pnpm**: >= 10.18.3

Always verify compatibility with your specific versions.

## 🔄 Updates

This documentation is maintained alongside the n8n repository. For the latest version:

1. Check the [n8n releases](https://github.com/n8n-io/n8n/releases)
2. Review the [CHANGELOG](https://github.com/n8n-io/n8n/blob/master/CHANGELOG.md)
3. Update your setup accordingly

---

**Ready to get started?** → [Quick Start Guide](./QUICKSTART_NEXTJS.md)

**Need more details?** → [Main Integration Guide](./FRONTEND_NEXTJS_INTEGRATION.md)

**Have questions?** → [FAQ](./FAQ_NEXTJS_INTEGRATION.md)
