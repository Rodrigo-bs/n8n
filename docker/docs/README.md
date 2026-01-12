# n8n Docker Documentation

Documentation for deploying and scaling n8n with Docker.

## Documentation Files

### Scaling and Production Deployment

- **[SCALING.md](./SCALING.md)** - Complete guide for running workflows in isolation
  - 750 lines of comprehensive documentation
  - Architecture diagrams and explanations
  - Queue mode setup with workers
  - Multi-main high availability setup
  - Task runner isolation
  - 40+ environment variable reference
  - Infrastructure requirements
  - Best practices and troubleshooting

- **[SCALING-QUICK-REFERENCE.md](./SCALING-QUICK-REFERENCE.md)** - Quick reference and cheat sheet
  - Quick start commands
  - Common operations
  - Troubleshooting steps
  - Security checklist
  - Performance tuning tips

## Example Configurations

Located in the parent `docker/` directory:

- **[docker-compose.queue-mode.yml](../docker-compose.queue-mode.yml)** - Basic queue mode setup
  - 1 main instance + 2 workers
  - PostgreSQL database
  - Redis queue
  - Ready to use with minimal configuration

- **[docker-compose.queue-mode-with-runners.yml](../docker-compose.queue-mode-with-runners.yml)** - Advanced setup
  - Workers with task runners
  - Full isolation for code execution
  - JavaScript and Python support

## Quick Links

- [n8n Official Documentation](https://docs.n8n.io)
- [Task Runners Documentation](../images/runners/README.md)
- [n8n Docker Image Documentation](../images/n8n/README.md)
- [Environment Variables](https://docs.n8n.io/hosting/configuration/environment-variables/)
- [Community Forum](https://community.n8n.io)

## Getting Started

### For Development/Testing
Use the basic single-container setup from the [main Docker README](../images/n8n/README.md).

### For Production Scaling
1. Review the [Scaling Guide](./SCALING.md)
2. Use the [Quick Reference](./SCALING-QUICK-REFERENCE.md) for common commands
3. Start with [docker-compose.queue-mode.yml](../docker-compose.queue-mode.yml)
4. Scale as needed

## Architecture Overview

```
┌─────────────┐
│  Main       │  ◄─── UI, API, Webhooks
│  Instance   │       Queues workflow executions
└──────┬──────┘
       │
   ┌───▼────┐
   │ Redis  │  ◄─── Job Queue (Bull)
   └───┬────┘
       │
   ┌───┴────┐
   │        │
┌──▼───┐ ┌─▼────┐
│Worker│ │Worker│  ◄─── Execute workflows
│  #1  │ │  #2  │       Process jobs from queue
└──┬───┘ └──┬───┘
   │        │
┌──▼────────▼──┐
│  PostgreSQL  │  ◄─── Shared database
└──────────────┘
```

For more details, see the [complete scaling guide](./SCALING.md).
