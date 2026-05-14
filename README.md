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

## Cloud Identity & Audit (Control Plane)

Connect Sentinel to your org's [CuratedMCP registry](https://curatedmcp.com/registry) to get:

- **Per-agent identity** — each Sentinel instance registers a stable identity with your org
- **JIT scoped tokens** — short-lived (1hr) credentials replace long-lived secrets in `.env` files
- **Cloud audit log** — every tool call logged with `(agent, server, tool, argsHash, outcome)` — args stored as a hash only, no PII leaves your machine
- **Cross-IDE enforcement** — same allowlist applies across Claude Code, Cursor, Windsurf, Copilot

### Setup

```bash
# 1. Create an API key in your CuratedMCP registry dashboard
#    → https://curatedmcp.com/registry/<your-slug>/settings

# 2. Set env vars (or use CLI flags)
export CURATED_REGISTRY_KEY="cmcp_reg_..."
export CURATED_REGISTRY_SLUG="acme-corp"

# 3. Run Sentinel — it auto-registers on first start
sentinel proxy -- npx @modelcontextprotocol/server-github
```

Or pass flags directly:

```bash
sentinel proxy \
  --registry-key cmcp_reg_... \
  --registry-slug acme-corp \
  -- npx @modelcontextprotocol/server-github
```

### Environment Variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `CURATED_REGISTRY_KEY` | Yes* | — | API key from registry dashboard (`cmcp_reg_…`) |
| `CURATED_REGISTRY_SLUG` | Yes* | — | Your org's slug, e.g. `acme-corp` |
| `CURATED_REGISTRY_URL` | No | `https://curatedmcp.com` | Override for self-hosted control plane |
| `CURATED_MACHINE_ID` | No | auto | Stable ID for this machine (used to derive agent fingerprint) |

*Required only for cloud mode. Omit both to run in local-only mode.

### How it works

```
Claude Code / Cursor / Windsurf
    ↓
Sentinel Proxy
    ├── Local PolicyEngine  (always runs, fast)
    │       ↓ BLOCK → throws immediately
    │       ↓ ALLOW → continue
    └── CuratedMCP Broker   (when CURATED_REGISTRY_KEY is set)
            ├── POST /identity      → register machine on startup
            ├── POST /jit-token     → get 1hr scoped token per server
            ├── POST /jit-token/verify → verify before each tool call
            └── POST /tool-invocations → log outcome (fire-and-forget)
    ↓
MCP Server
```

Local policy always takes precedence. If the broker is unreachable, Sentinel falls back to local-only mode automatically (fail-open).

### What's Always Free

- Local policy enforcement
- SQLite action log
- Approval workflows
- Local dashboard

### What Requires a Registry Plan

- Cloud audit log (searchable, exportable)
- Cross-IDE allowlist push
- Per-agent identity & JIT tokens
- SSO / RBAC for teams

See [curatedmcp.com/registry](https://curatedmcp.com/registry) for pricing.

## Architecture

```
Client (Claude, Cursor, etc.)
    ↓
Sentinel Proxy ← Local PolicyEngine
    ↓               ↕ (optional)
MCP Server      CuratedMCP Control Plane
```

Every `CallToolRequest` is:
1. Intercepted by Sentinel
2. Evaluated against local policies (fast, offline)
3. Verified against the cloud registry (when connected)
4. Logged locally to SQLite + cloud audit log
5. Either allowed, blocked, or held for approval
6. Forwarded to downstream server (if allowed)

## License

MIT

---

**Made with ❤️ by CuratedMCP**  
[Visit CuratedMCP](https://curatedmcp.com) | [Join Community](https://discord.gg/curatedmcp)
