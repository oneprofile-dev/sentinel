# CuratedMCP Sentinel

**Local-first action firewall for MCP servers.**

Sentinel is CuratedMCP's enforcement layer that intercepts MCP tool calls before execution, evaluates them against JSON policy rules, logs all actions locally in SQLite, and optionally requires approval before continuing.

## Installation

```bash
npm install -g @curatedmcp/sentinel
```

## Quick Start

### 1. Run as a Proxy

```bash
sentinel proxy -- npx some-mcp-server
```

This wraps your MCP server and starts the dashboard at http://localhost:4242.

### 2. Visit the Dashboard

Open **http://localhost:4242** in your browser to:
- View recent actions
- Approve/reject pending tool calls
- Manage policy rules
- See blocked actions

## CLI Commands

### Policy Management

```bash
# List all active policies
sentinel policy list

# Add a blocking rule
sentinel policy add --name "Block Dangerous Tools" --tool "*exec*" --action BLOCK --severity CRITICAL

# Remove a rule
sentinel policy remove rule-id-here
```

### Configuration

```bash
# Set log retention (in minutes)
sentinel retention 1440  # 24 hours

# Open dashboard standalone
sentinel dashboard --port 4242
```

## Policy Rules

Policies match on three criteria:

- **serverName** — Glob pattern (e.g., `*stripe*`, `exact-name`)
- **toolName** — Glob pattern (e.g., `*delete*`, `run_*`)
- **argumentContains** — String array (optional, block if any match in args)

### Actions

- **ALLOW** — Pass through immediately
- **BLOCK** — Reject with error message
- **REQUIRE_APPROVAL** — Pause and wait for dashboard approval

### Severity Levels

- **CRITICAL** — Security-sensitive action
- **WARNING** — Elevated permission action
- **INFO** — Informational only

## Example Policies

```bash
# Block shell tool
sentinel policy add --name "No Shell" --tool "*shell*" --action BLOCK

# Require approval for file operations
sentinel policy add --name "File Ops Approval" --tool "*file*" --action REQUIRE_APPROVAL --severity WARNING

# Allow verified stripe tool
sentinel policy add --name "Stripe Allowed" --server stripe-mcp --tool "*" --action ALLOW
```

## Local Storage

All data remains local by default:

- **~/.sentinel/policy.json** — Policy rules
- **~/.sentinel/actions.db** — SQLite action log
- **~/.sentinel/config.json** — Configuration

No cloud sync happens without explicit opt-in (via `--key`).

## License Integration

Sentinel integrates with CuratedMCP licensing for optional features:

```bash
# Provide your CuratedMCP license key
sentinel proxy --key cmcp_xxxx
```

### What's Included

- ✅ Local policy enforcement
- ✅ Action logging & audit trail
- ✅ Approval workflows
- ✅ Local dashboard

### Premium Features (with License)

- 📊 Cloud sync to CuratedMCP dashboard
- 📧 Email alerts for blocked actions
- 🔔 Slack/webhook notifications
- 📈 Advanced analytics

See [CuratedMCP Pricing](https://curatedmcp.com/pricing) for details.

## Roadmap

- [ ] Remote policy distribution
- [ ] Team collaboration & approval chains
- [ ] Cloud sync with encryption
- [ ] Slack/webhook integrations
- [ ] Advanced anomaly detection
- [ ] Multi-MCP orchestration

## Architecture

```
Client (Claude, Cursor, etc.)
    ↓
Sentinel Proxy ← Policy Engine
    ↓
MCP Server
```

Every `CallToolRequest` is:
1. Intercepted by Sentinel
2. Evaluated against policies
3. Logged to SQLite
4. Either allowed, blocked, or held for approval
5. Forwarded to downstream server (if allowed)

## License

MIT

---

**Made with ❤️ by CuratedMCP**  
[Visit CuratedMCP](https://curatedmcp.com) | [Join Community](https://discord.gg/curatedmcp)
