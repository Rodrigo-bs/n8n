# Running Workflows in Isolation for Scalability

This guide explains how to run n8n workflows in isolation using separate Docker containers to increase scalability and performance. By separating the main n8n instance from workflow execution workers, you can scale your infrastructure horizontally based on workload demands.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Scaling Modes](#scaling-modes)
- [Queue Mode Setup](#queue-mode-setup)
- [Multi-Main Setup](#multi-main-setup)
- [Task Runner Isolation](#task-runner-isolation)
- [Environment Variables Reference](#environment-variables-reference)
- [Infrastructure Requirements](#infrastructure-requirements)
- [Best Practices](#best-practices)
- [Monitoring and Health Checks](#monitoring-and-health-checks)

## Architecture Overview

n8n supports two execution modes:

1. **Regular Mode** (default): All workflows execute in-process within the main n8n instance
2. **Queue Mode**: Workflows are queued and executed by separate worker processes/containers

In **Queue Mode**, the architecture consists of:

- **Main Instance(s)**: Handles the web UI, API, and webhooks. Queues workflow executions.
- **Worker Instance(s)**: Processes queued workflow executions from Redis.
- **Redis**: Message broker for the job queue (using Bull queue).
- **Database**: Shared database (PostgreSQL, MySQL, or MariaDB) for workflow definitions, credentials, and execution data.
- **Task Runners** (optional): Isolated containers for executing user code from Code nodes.

```
┌─────────────────┐
│   Load Balancer │
│    (optional)   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼──┐  ┌──▼───┐
│ Main │  │ Main │  ◄─── Handles UI, API, Webhooks
│  #1  │  │  #2  │       Queues workflow executions
└───┬──┘  └──┬───┘
    │        │
    └────┬───┘
         │
    ┌────▼─────┐
    │  Redis   │  ◄─── Message queue (Bull)
    └────┬─────┘
         │
    ┌────┴────┐
    │         │
┌───▼────┐ ┌─▼──────┐
│ Worker │ │ Worker │  ◄─── Executes workflows
│   #1   │ │   #2   │       Processes jobs from queue
└───┬────┘ └───┬────┘
    │          │
    │      ┌───▼────────┐
    │      │ Task       │  ◄─── Executes Code node scripts
    │      │ Runners    │       (JavaScript/Python isolation)
    │      └────────────┘
    │
┌───▼──────────┐
│  PostgreSQL  │  ◄─── Shared database
│   Database   │       Workflows, credentials, executions
└──────────────┘
```

## Scaling Modes

### Single Main + Multiple Workers (Recommended for Most Users)

This is the most common scaling setup:
- One main instance handling UI/API
- Multiple worker instances processing workflows
- Horizontal scaling by adding more workers

**Use Case**: When you need to scale workflow execution capacity while maintaining a simple architecture.

### Multi-Main + Multiple Workers (High Availability)

Advanced setup with multiple main instances:
- Multiple main instances behind a load balancer
- Multiple worker instances
- High availability for the web interface and API

**Use Case**: When you need zero-downtime deployments and high availability for the UI/API.

## Queue Mode Setup

### Basic Setup (Single Main + Workers)

Here's a complete docker-compose configuration for running n8n in queue mode:

```yaml
version: '3.8'

services:
  redis:
    image: redis:6-alpine
    restart: always
    ports:
      - '6379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 3s
      retries: 10

  postgres:
    image: postgres:16
    restart: always
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U n8n']
      interval: 5s
      timeout: 5s
      retries: 10

  n8n_main:
    image: docker.n8n.io/n8nio/n8n:latest
    restart: always
    ports:
      - '5678:5678'
    environment:
      # Database configuration
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n_password
      
      # Queue mode configuration
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_DB=0
      
      # Encryption key (generate with: openssl rand -base64 32)
      - N8N_ENCRYPTION_KEY=your-encryption-key-here
      
      # Other settings
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy

  n8n_worker_1:
    image: docker.n8n.io/n8nio/n8n:latest
    restart: always
    command: worker
    environment:
      # Database configuration
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n_password
      
      # Queue mode configuration
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_DB=0
      
      # Worker configuration
      - N8N_CONCURRENCY_PRODUCTION_LIMIT=10
      - QUEUE_HEALTH_CHECK_ACTIVE=true
      - QUEUE_HEALTH_CHECK_PORT=5678
      
      # Encryption key (must match main instance)
      - N8N_ENCRYPTION_KEY=your-encryption-key-here
    volumes:
      - n8n_worker_1_data:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ['CMD-SHELL', 'wget --spider -q http://localhost:5678/healthz || exit 1']
      interval: 10s
      timeout: 5s
      retries: 3

  n8n_worker_2:
    image: docker.n8n.io/n8nio/n8n:latest
    restart: always
    command: worker
    environment:
      # Database configuration
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n_password
      
      # Queue mode configuration
      - EXECUTIONS_MODE=queue
      - QUEUE_BULL_REDIS_HOST=redis
      - QUEUE_BULL_REDIS_PORT=6379
      - QUEUE_BULL_REDIS_DB=0
      
      # Worker configuration
      - N8N_CONCURRENCY_PRODUCTION_LIMIT=10
      - QUEUE_HEALTH_CHECK_ACTIVE=true
      - QUEUE_HEALTH_CHECK_PORT=5678
      
      # Encryption key (must match main instance)
      - N8N_ENCRYPTION_KEY=your-encryption-key-here
    volumes:
      - n8n_worker_2_data:/home/node/.n8n
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    healthcheck:
      test: ['CMD-SHELL', 'wget --spider -q http://localhost:5678/healthz || exit 1']
      interval: 10s
      timeout: 5s
      retries: 3

volumes:
  postgres_data:
  n8n_data:
  n8n_worker_1_data:
  n8n_worker_2_data:
```

### Starting the Stack

```bash
# Generate an encryption key (save this securely!)
openssl rand -base64 32

# Update docker-compose.yml with the encryption key

# Start the services
docker compose up -d

# View logs
docker compose logs -f n8n_main
docker compose logs -f n8n_worker_1
docker compose logs -f n8n_worker_2

# Scale workers dynamically
docker compose up -d --scale n8n_worker=5
```

## Multi-Main Setup

For high availability, you can run multiple main instances behind a load balancer:

```yaml
version: '3.8'

services:
  redis:
    image: redis:6-alpine
    restart: always
    # ... (same as above)

  postgres:
    image: postgres:16
    restart: always
    # ... (same as above)

  n8n_main_1:
    image: docker.n8n.io/n8nio/n8n:latest
    restart: always
    environment:
      # ... (database and queue config)
      - N8N_MULTI_MAIN_SETUP_ENABLED=true
      - N8N_PROXY_HOPS=1  # Required when behind load balancer
    # ... (volumes and depends_on)

  n8n_main_2:
    image: docker.n8n.io/n8nio/n8n:latest
    restart: always
    environment:
      # ... (same as n8n_main_1)
      - N8N_MULTI_MAIN_SETUP_ENABLED=true
      - N8N_PROXY_HOPS=1

  nginx:
    image: nginx:latest
    ports:
      - '80:80'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
    depends_on:
      - n8n_main_1
      - n8n_main_2

  # Workers...
  # ... (same as above)
```

**nginx.conf example:**

```nginx
events {
    worker_connections 1024;
}

http {
    upstream n8n_backend {
        least_conn;
        server n8n_main_1:5678;
        server n8n_main_2:5678;
    }

    server {
        listen 80;
        
        location / {
            proxy_pass http://n8n_backend;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # WebSocket support
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
        }
    }
}
```

## Task Runner Isolation

Task runners provide an additional layer of isolation for executing user-provided code in Code nodes. This is especially important for security and resource isolation.

### Enabling Task Runners

```yaml
version: '3.8'

services:
  # ... (redis, postgres, main instance)

  n8n_worker_1:
    image: docker.n8n.io/n8nio/n8n:latest
    restart: always
    command: worker
    environment:
      # ... (database and queue config)
      
      # Task Runner configuration
      - N8N_RUNNERS_ENABLED=true
      - N8N_RUNNERS_MODE=external
      - N8N_RUNNERS_BROKER_LISTEN_ADDRESS=0.0.0.0
      - N8N_RUNNERS_AUTH_TOKEN=your-secure-token-here
      - N8N_NATIVE_PYTHON_RUNNER=true
    # ... (volumes and depends_on)

  n8n_worker_1_runners:
    image: docker.n8n.io/n8nio/runners:latest
    restart: always
    environment:
      - N8N_RUNNERS_TASK_BROKER_URI=http://n8n_worker_1:5679
      - N8N_RUNNERS_AUTH_TOKEN=your-secure-token-here
    depends_on:
      n8n_worker_1:
        condition: service_healthy
```

For more details about task runners, see the [task runners documentation](../images/runners/README.md).

## Environment Variables Reference

### Execution Mode

| Variable | Default | Description |
|----------|---------|-------------|
| `EXECUTIONS_MODE` | `regular` | Set to `queue` to enable queue mode |
| `N8N_MULTI_MAIN_SETUP_ENABLED` | `false` | Enable multi-main setup for high availability |

### Queue Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `QUEUE_BULL_REDIS_HOST` | `localhost` | Redis host for Bull queue |
| `QUEUE_BULL_REDIS_PORT` | `6379` | Redis port |
| `QUEUE_BULL_REDIS_DB` | `0` | Redis database number |
| `QUEUE_BULL_REDIS_PASSWORD` | - | Redis password |
| `QUEUE_BULL_REDIS_USERNAME` | - | Redis username (Redis 6.0+) |
| `QUEUE_BULL_REDIS_TLS` | `false` | Enable TLS for Redis connection |
| `QUEUE_BULL_REDIS_CLUSTER_NODES` | - | Redis cluster nodes (comma-separated `host:port` pairs) |
| `QUEUE_BULL_PREFIX` | `bull` | Prefix for Bull keys in Redis |

### Worker Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `N8N_CONCURRENCY_PRODUCTION_LIMIT` | `-1` (unlimited) | Max concurrent workflow executions per worker. Recommended: 10-50 |
| `QUEUE_HEALTH_CHECK_ACTIVE` | `false` | Enable worker health check endpoints |
| `QUEUE_HEALTH_CHECK_PORT` | `5678` | Port for worker health checks |
| `N8N_WORKER_SERVER_ADDRESS` | `::` | IP address for worker server to listen on |
| `QUEUE_WORKER_LOCK_DURATION` | `60000` | Lock duration in milliseconds |
| `QUEUE_WORKER_LOCK_RENEW_TIME` | `10000` | Lock renewal interval in milliseconds |
| `QUEUE_WORKER_STALLED_INTERVAL` | `30000` | Stalled job check interval in milliseconds |
| `QUEUE_WORKER_MAX_STALLED_COUNT` | `1` | Max times a stalled job is re-processed |

### Database Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_TYPE` | `sqlite` | Database type: `postgresdb`, `mysqldb`, `mariadb`, or `sqlite` |
| `DB_POSTGRESDB_HOST` | `localhost` | PostgreSQL host |
| `DB_POSTGRESDB_PORT` | `5432` | PostgreSQL port |
| `DB_POSTGRESDB_DATABASE` | `n8n` | PostgreSQL database name |
| `DB_POSTGRESDB_USER` | `postgres` | PostgreSQL user |
| `DB_POSTGRESDB_PASSWORD` | - | PostgreSQL password |
| `DB_POSTGRESDB_SCHEMA` | `public` | PostgreSQL schema |

### Task Runner Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `N8N_RUNNERS_ENABLED` | `false` | Enable task runners |
| `N8N_RUNNERS_MODE` | `internal` | `internal` or `external` |
| `N8N_RUNNERS_BROKER_LISTEN_ADDRESS` | `127.0.0.1` | Task broker listen address |
| `N8N_RUNNERS_AUTH_TOKEN` | - | Authentication token for task runners |
| `N8N_RUNNERS_TASK_BROKER_URI` | - | Task broker URI (for runner container) |
| `N8N_NATIVE_PYTHON_RUNNER` | `false` | Enable native Python runner |

### General Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `N8N_ENCRYPTION_KEY` | - | Encryption key for credentials (must be same across all instances) |
| `N8N_HOST` | `localhost` | Host name for n8n |
| `N8N_PORT` | `5678` | Port for n8n |
| `N8N_PROTOCOL` | `http` | Protocol: `http` or `https` |
| `WEBHOOK_URL` | - | Webhook URL for external access |
| `N8N_PROXY_HOPS` | `0` | Number of proxy hops (set to 1 when behind load balancer) |
| `N8N_GRACEFUL_SHUTDOWN_TIMEOUT` | `30` | Graceful shutdown timeout in seconds |

## Infrastructure Requirements

### Minimum Requirements

**Main Instance:**
- CPU: 2 cores
- RAM: 2GB
- Storage: 10GB (for logs and temporary files)

**Worker Instance:**
- CPU: 2 cores
- RAM: 2GB per worker
- Storage: 5GB

**Redis:**
- CPU: 1 core
- RAM: 512MB-1GB
- Storage: Minimal (queue data is ephemeral)

**PostgreSQL:**
- CPU: 2 cores
- RAM: 2GB
- Storage: Depends on workflow execution history (start with 20GB)

### Scaling Considerations

1. **Horizontal Scaling:**
   - Add more worker containers to handle increased workflow execution load
   - Each worker can handle `N8N_CONCURRENCY_PRODUCTION_LIMIT` concurrent executions

2. **Vertical Scaling:**
   - Increase CPU/RAM for workers if workflows are resource-intensive
   - Increase database resources for large execution history or many workflows

3. **Network:**
   - Ensure low latency between workers and Redis/database
   - Workers and main instances should be on the same network

4. **Storage:**
   - Use persistent volumes for `/home/node/.n8n` directory
   - Regularly backup database and encryption key

## Best Practices

### 1. Encryption Key Management

```bash
# Generate a secure encryption key
openssl rand -base64 32

# Store it securely (e.g., in a secrets manager)
# Use the same key across all instances (main and workers)
```

**Important:** If you lose the encryption key, all credentials become unrecoverable.

### 2. Worker Concurrency

- Start with `N8N_CONCURRENCY_PRODUCTION_LIMIT=10`
- Monitor CPU and memory usage
- Increase gradually based on your workflows' resource requirements
- Don't set too high (>50) on a single worker; instead, add more workers

### 3. Database Connection Pooling

For large deployments, configure connection pooling:

```yaml
environment:
  - DB_POSTGRESDB_POOL_SIZE=20  # Adjust based on number of workers
```

### 4. Redis High Availability

For production, consider Redis Sentinel or Redis Cluster:

```yaml
environment:
  - QUEUE_BULL_REDIS_CLUSTER_NODES=redis-1:6379,redis-2:6379,redis-3:6379
```

### 5. Health Checks and Monitoring

Enable health checks on all workers:

```yaml
environment:
  - QUEUE_HEALTH_CHECK_ACTIVE=true
healthcheck:
  test: ['CMD-SHELL', 'wget --spider -q http://localhost:5678/healthz || exit 1']
  interval: 10s
  timeout: 5s
  retries: 3
```

### 6. Graceful Shutdown

Set appropriate timeout for graceful shutdown:

```yaml
environment:
  - N8N_GRACEFUL_SHUTDOWN_TIMEOUT=60  # seconds
```

This allows in-flight workflows to complete before the container stops.

### 7. Separate Networks

Use Docker networks to isolate components:

```yaml
networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge

services:
  n8n_main:
    networks:
      - frontend
      - backend
  
  n8n_worker:
    networks:
      - backend
  
  postgres:
    networks:
      - backend
  
  redis:
    networks:
      - backend
```

### 8. Resource Limits

Set resource limits to prevent one worker from consuming all resources:

```yaml
services:
  n8n_worker:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
        reservations:
          cpus: '1'
          memory: 2G
```

## Monitoring and Health Checks

### Health Check Endpoints

**Main Instance:**
- `http://main:5678/healthz` - Overall health
- `http://main:5678/healthz/readiness` - Ready to accept requests

**Worker Instance (when `QUEUE_HEALTH_CHECK_ACTIVE=true`):**
- `http://worker:5678/healthz` - Worker is alive
- `http://worker:5678/healthz/readiness` - Worker is connected to database and Redis

### Metrics

Enable Prometheus metrics for monitoring:

```yaml
environment:
  - N8N_METRICS=true
  - N8N_METRICS_PREFIX=n8n_
```

Metrics endpoint: `http://instance:5678/metrics`

### Queue Monitoring

Monitor the Bull queue directly in Redis:

```bash
# Connect to Redis
docker exec -it <redis-container> redis-cli

# Check queue length
LLEN bull:jobs:active
LLEN bull:jobs:waiting
LLEN bull:jobs:completed
LLEN bull:jobs:failed

# Get job details
HGETALL bull:jobs:<job-id>
```

### Logging

Configure logging for better observability:

```yaml
environment:
  - N8N_LOG_LEVEL=info  # debug, info, warn, error
  - N8N_LOG_OUTPUT=console  # console, file
```

### Common Issues and Troubleshooting

**Issue:** Workers not processing jobs

**Solution:**
- Check Redis connectivity: `docker compose logs redis`
- Verify `EXECUTIONS_MODE=queue` is set on both main and workers
- Ensure encryption key is the same across all instances
- Check worker logs for errors

**Issue:** Jobs stuck in queue

**Solution:**
- Check worker health: `curl http://worker:5678/healthz`
- Increase worker concurrency or add more workers
- Check for stalled jobs in Redis

**Issue:** Database connection errors

**Solution:**
- Verify database credentials
- Check database connectivity from worker containers
- Increase database connection pool size

## Additional Resources

- [n8n Official Documentation](https://docs.n8n.io)
- [Task Runners Documentation](../images/runners/README.md)
- [n8n Docker Documentation](../images/n8n/README.md)
- [Scaling Examples](../../packages/@n8n/benchmark/scripts/n8n-setups/)
- [Environment Variables Documentation](https://docs.n8n.io/hosting/configuration/environment-variables/)

## Example Deployment Scenarios

### Scenario 1: Small Team (1-10 users, <1000 executions/day)

```yaml
# 1 main + 1 worker
# PostgreSQL + Redis
# Suitable for: Small teams, development/staging
```

### Scenario 2: Medium Team (10-50 users, 1000-10000 executions/day)

```yaml
# 1 main + 3-5 workers
# PostgreSQL (managed service) + Redis (managed service)
# Task runners enabled
# Suitable for: Growing teams, production workloads
```

### Scenario 3: Large Enterprise (50+ users, 10000+ executions/day)

```yaml
# 2-3 main instances (behind load balancer)
# 5-10+ workers (auto-scaling enabled)
# PostgreSQL cluster (HA)
# Redis cluster (HA)
# Task runners enabled with resource limits
# Suitable for: Large organizations, mission-critical workloads
```

## Getting Started Checklist

- [ ] Choose appropriate scaling mode (queue mode vs multi-main)
- [ ] Set up shared PostgreSQL database
- [ ] Set up Redis instance
- [ ] Generate and securely store encryption key
- [ ] Configure main instance with queue mode
- [ ] Configure worker instances
- [ ] Set appropriate concurrency limits
- [ ] Enable health checks
- [ ] Set up monitoring and logging
- [ ] Test failover scenarios
- [ ] Document your specific configuration
- [ ] Set up backups for database and encryption key

## Conclusion

Running n8n in queue mode with isolated workers provides:

✅ **Horizontal Scalability**: Add workers as needed  
✅ **Fault Isolation**: Worker failures don't affect the UI  
✅ **Resource Optimization**: Separate resources for UI and execution  
✅ **High Availability**: Multi-main setup with load balancing  
✅ **Security**: Task runner isolation for code execution  

Start with a simple setup (1 main + 1-2 workers) and scale as your needs grow.
