# n8n Scaling Quick Reference

Quick reference for running n8n in queue mode with isolated workers.

## Quick Start

```bash
# 1. Generate encryption key
openssl rand -base64 32

# 2. Download docker-compose file
curl -o docker-compose.queue-mode.yml \
  https://raw.githubusercontent.com/n8n-io/n8n/master/docker/docker-compose.queue-mode.yml

# 3. Update N8N_ENCRYPTION_KEY in docker-compose.queue-mode.yml

# 4. Start services
docker compose -f docker-compose.queue-mode.yml up -d

# 5. Access n8n
open http://localhost:5678
```

## Common Commands

### Start/Stop

```bash
# Start all services
docker compose -f docker-compose.queue-mode.yml up -d

# Stop all services
docker compose -f docker-compose.queue-mode.yml down

# Restart a specific service
docker compose -f docker-compose.queue-mode.yml restart n8n_worker
```

### Scaling Workers

```bash
# Scale to 5 workers
docker compose -f docker-compose.queue-mode.yml up -d --scale n8n_worker=5

# Scale to 10 workers
docker compose -f docker-compose.queue-mode.yml up -d --scale n8n_worker=10
```

### Logs

```bash
# View all logs
docker compose -f docker-compose.queue-mode.yml logs -f

# View main instance logs
docker compose -f docker-compose.queue-mode.yml logs -f n8n_main

# View worker logs
docker compose -f docker-compose.queue-mode.yml logs -f n8n_worker

# View last 100 lines
docker compose -f docker-compose.queue-mode.yml logs --tail=100 n8n_worker
```

### Health Checks

```bash
# Check main instance health
curl http://localhost:5678/healthz

# Check worker health (if QUEUE_HEALTH_CHECK_ACTIVE=true)
docker exec <worker-container-id> wget -q -O- http://localhost:5678/healthz

# List running containers
docker compose -f docker-compose.queue-mode.yml ps
```

### Monitoring Queue

```bash
# Connect to Redis
docker exec -it <redis-container> redis-cli

# Check queue status
LLEN bull:jobs:active
LLEN bull:jobs:waiting
LLEN bull:jobs:completed
LLEN bull:jobs:failed

# View all queue keys
KEYS bull:*
```

### Database

```bash
# Connect to PostgreSQL
docker exec -it <postgres-container> psql -U n8n

# List workflows
SELECT id, name, active FROM workflow_entity;

# List recent executions
SELECT id, workflow_id, finished, mode FROM execution_entity 
ORDER BY started_at DESC LIMIT 10;
```

## Essential Environment Variables

### Must Set

```yaml
N8N_ENCRYPTION_KEY: "your-encryption-key"  # Same across all instances!
EXECUTIONS_MODE: "queue"                    # Enable queue mode
```

### Queue Configuration

```yaml
QUEUE_BULL_REDIS_HOST: "redis"
QUEUE_BULL_REDIS_PORT: "6379"
QUEUE_BULL_REDIS_DB: "0"
```

### Worker Configuration

```yaml
N8N_CONCURRENCY_PRODUCTION_LIMIT: "10"    # Jobs per worker
QUEUE_HEALTH_CHECK_ACTIVE: "true"         # Enable health checks
```

### Database Configuration

```yaml
DB_TYPE: "postgresdb"
DB_POSTGRESDB_HOST: "postgres"
DB_POSTGRESDB_DATABASE: "n8n"
DB_POSTGRESDB_USER: "n8n"
DB_POSTGRESDB_PASSWORD: "password"
```

## Architecture Patterns

### Pattern 1: Small Team
```
1 Main + 1-2 Workers
├── n8n_main (UI/API)
├── n8n_worker_1
├── n8n_worker_2
├── postgres
└── redis
```

### Pattern 2: Medium Team
```
1 Main + 3-5 Workers + Task Runners
├── n8n_main (UI/API)
├── n8n_worker_1 + runners
├── n8n_worker_2 + runners
├── n8n_worker_3 + runners
├── postgres (managed)
└── redis (managed)
```

### Pattern 3: Enterprise
```
2-3 Mains (HA) + 5-10 Workers + Task Runners
├── nginx (load balancer)
│   ├── n8n_main_1
│   ├── n8n_main_2
│   └── n8n_main_3
├── n8n_worker_1..10 + runners
├── postgres (cluster)
└── redis (cluster)
```

## Troubleshooting

### Workers not processing jobs

```bash
# 1. Check Redis connectivity
docker compose logs redis

# 2. Verify encryption key matches
docker compose config | grep N8N_ENCRYPTION_KEY

# 3. Check worker logs
docker compose logs n8n_worker

# 4. Verify EXECUTIONS_MODE is set
docker compose config | grep EXECUTIONS_MODE
```

### Jobs stuck in queue

```bash
# 1. Check active jobs
docker exec <redis> redis-cli LLEN bull:jobs:active

# 2. Check worker health
curl http://worker:5678/healthz

# 3. Increase concurrency or add workers
docker compose up -d --scale n8n_worker=5
```

### Database connection errors

```bash
# 1. Check database is running
docker compose ps postgres

# 2. Test connection
docker exec <postgres> pg_isready -U n8n

# 3. Verify credentials
docker compose config | grep DB_POSTGRESDB
```

## Security Checklist

- [ ] Strong encryption key (32+ characters, base64)
- [ ] Secure database password
- [ ] Redis password (if exposed)
- [ ] Task runner auth token (if using runners)
- [ ] Network isolation (backend network)
- [ ] Resource limits on workers
- [ ] Regular backups of database and encryption key
- [ ] HTTPS for production (reverse proxy)

## Performance Tuning

### Worker Concurrency
```yaml
# Start conservative
N8N_CONCURRENCY_PRODUCTION_LIMIT: "10"

# Monitor CPU/Memory, then increase
N8N_CONCURRENCY_PRODUCTION_LIMIT: "20"

# Or add more workers instead
docker compose up -d --scale n8n_worker=4
```

### Database Connection Pool
```yaml
# For many workers
DB_POSTGRESDB_POOL_SIZE: "20"
```

### Graceful Shutdown
```yaml
# Allow time for jobs to complete
N8N_GRACEFUL_SHUTDOWN_TIMEOUT: "60"
```

## Useful Links

- [Complete Scaling Guide](./SCALING.md)
- [Basic Queue Mode Example](../docker-compose.queue-mode.yml)
- [Queue Mode with Runners](../docker-compose.queue-mode-with-runners.yml)
- [n8n Documentation](https://docs.n8n.io)
- [Environment Variables](https://docs.n8n.io/hosting/configuration/environment-variables/)

---

**Need help?** Check the [complete scaling guide](./SCALING.md) or visit [community.n8n.io](https://community.n8n.io)
