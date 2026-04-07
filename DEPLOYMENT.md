# Deployment Guide

This guide covers how to deploy and use CuratedMCP Sentinel in various environments.

## Installation

### From npm (Recommended)
```bash
npm install -g @curatedmcp/sentinel
```

### From Source
```bash
git clone https://github.com/curatedmcp/sentinel.git
cd sentinel
npm install --ignore-scripts
npm run build
npm install -g ./
```

## Quick Start

### 1. Proxy Mode (Recommended)

Start Sentinel as a proxy wrapping your MCP server:

```bash
sentinel proxy -- npx my-mcp-server
```

This will:
- Intercept all tool calls from the MCP server
- Evaluate them against active policies
- Log actions to SQLite
- Start the dashboard at http://localhost:4242
- Allow/block calls based on rules

### 2. Configuration

Configure Sentinel using the CLI:

```bash
# View active policies
sentinel policy list

# Add a blocking rule
sentinel policy add \
  --name "Block Dangerous Tool" \
  --tool "*exec*" \
  --action BLOCK \
  --severity CRITICAL

# Set log retention (24 hours)
sentinel retention 1440
```

### 3. Dashboard

Access the dashboard in your browser:
```
http://localhost:4242
```

Features:
- **Overview**: Summary statistics
- **Recent Actions**: Last N actions logged
- **Pending Approvals**: Actions awaiting approval
- **Policies**: View and manage rules

### 4. API Integration

Use Sentinel as an npm library:

```typescript
import { SentinelProxy, PolicyEngine, ActionLogger } from '@curatedmcp/sentinel';

// Initialize components
const engine = new PolicyEngine('./policies/default.json');
const logger = new ActionLogger('./actions.db');
const proxy = new SentinelProxy(
  './policies/default.json',
  './actions.db',
  'npx my-mcp-server'
);

// Start proxy
await proxy.start();

// Evaluate tool calls
const result = proxy.evaluateRequest('toolName', 'serverId', {
  arg1: 'value1'
});
```

## Environment Variables

```bash
# License key for CuratedMCP integration
export CURATEDMCP_KEY=your-license-key

# Sentinel port (default: 4242)
export SENTINEL_PORT=4242

# Activity log retention (minutes, default: 1440)
export SENTINEL_RETENTION=2880

# Configuration directory (default: ~/.sentinel)
export SENTINEL_CONFIG_DIR=/path/to/config
```

## Configuration Directory

Sentinel stores all configuration in `~/.sentinel/` by default:

```
~/.sentinel/
├── policy.json          # Active policies
├── actions.db           # SQLite action log
└── config.json          # Settings and preferences
```

To use a custom directory:
```bash
export SENTINEL_CONFIG_DIR=/custom/path
sentinel proxy -- npx my-mcp-server
```

## Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine

WORKDIR /app

# Install Sentinel globally
RUN npm install -g @curatedmcp/sentinel

# Create config directory
RUN mkdir -p /root/.sentinel

# Expose dashboard port
EXPOSE 4242

# Run Sentinel proxy
ENTRYPOINT ["sentinel", "proxy", "--"]
CMD []
```

Build and run:
```bash
docker build -t curatedmcp-sentinel .
docker run -p 4242:4242 curatedmcp-sentinel npx my-mcp-server
```

## Kubernetes Deployment

Create `sentinel-deployment.yaml`:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sentinel-proxy
  labels:
    app: sentinel
spec:
  replicas: 1
  selector:
    matchLabels:
      app: sentinel
  template:
    metadata:
      labels:
        app: sentinel
    spec:
      containers:
      - name: sentinel
        image: curatedmcp/sentinel:latest
        ports:
        - containerPort: 4242
        env:
        - name: SENTINEL_PORT
          value: "4242"
        - name: CURATEDMCP_KEY
          valueFrom:
            secretKeyRef:
              name: sentinel-secrets
              key: license-key
        volumeMounts:
        - name: sentinel-config
          mountPath: /root/.sentinel
      volumes:
      - name: sentinel-config
        emptyDir: {}
```

Deploy:
```bash
kubectl apply -f sentinel-deployment.yaml
kubectl expose deployment sentinel-proxy --type=LoadBalancer --port=4242
```

## Production Checklist

- [ ] Set `CURATEDMCP_KEY` environment variable
- [ ] Configure appropriate retention period
- [ ] Review and customize default policies
- [ ] Test policy evaluation with sample tool calls
- [ ] Set up log rotation or cleanup
- [ ] Configure firewall rules for dashboard access
- [ ] Enable HTTPS for dashboard (if exposed externally)
- [ ] Set up monitoring and alerts
- [ ] Document approval process for team
- [ ] Create backup strategy for policies

## Monitoring

### Check Status
```bash
sentinel policy list
```

### View Recent Actions
```bash
# Query SQLite database directly
sqlite3 ~/.sentinel/actions.db "SELECT * FROM action_logs ORDER BY timestamp DESC LIMIT 10"
```

### Dashboard API
```bash
curl http://localhost:4242/api/status
```

Response:
```json
{
  "summary": {
    "totalLogs": 42,
    "blockedCount": 5,
    "approvedCount": 3,
    "rejectedCount": 1
  },
  "recentActions": [...],
  "pendingApprovals": [...],
  "activePolicies": [...]
}
```

## Troubleshooting

### Dashboard Not Accessible
```bash
# Check if service is running
lsof -i :4242

# View logs
echo "Check terminal output where Sentinel was started"
```

### Policy Not Applied
```bash
# Verify policies are loaded
sentinel policy list

# Check policy syntax
cat ~/.sentinel/policy.json | jq .
```

### Database Errors
```bash
# Backup and reset database
mv ~/.sentinel/actions.db ~/.sentinel/actions.db.bak
sentinel policy list  # Creates new database
```

## Support & Documentation

- **GitHub**: https://github.com/curatedmcp/sentinel
- **Documentation**: https://docs.curatedmcp.com/sentinel
- **Issues**: https://github.com/curatedmcp/sentinel/issues
- **Email**: sentinel@curatedmcp.com

---

For more information, see [README.md](README.md) and [IMPLEMENTATION.md](IMPLEMENTATION.md).
