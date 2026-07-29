# Security Policy

## Reporting a vulnerability

Email **sam@curatedmcp.com** with the details (a proof-of-concept helps).
Please don't open a public issue for anything exploitable — give us a chance
to ship a fix first. You'll get an acknowledgement within 2 business days and
a status update at least weekly until it's resolved. We'll credit you in the
release notes unless you'd rather stay anonymous.

## Supported versions

Only the latest published version of `@curatedmcp/sentinel` on npm receives
security fixes.

## What this software does and doesn't touch

- **Local-first by design.** Sentinel intercepts MCP tool calls before
  execution, evaluates them against your local JSON policy rules, and logs
  every action to a local SQLite database on your machine — no account or
  API key required, no network egress in local mode.
- **Cloud identity and audit features are opt-in**, used only by teams on the
  CuratedMCP Governance Control Plane. Local mode works fully standalone
  without them.

## Supply chain

- Published from this public repository — what's on npm is built from the
  source you can read here.
- `package-lock.json` is committed.
