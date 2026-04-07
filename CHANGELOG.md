# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-04-06

### Added
- Initial release of CuratedMCP Sentinel
- Policy engine with glob pattern matching for MCP server and tool names
- Local SQLite action logging with indexed queries
- Approval workflow for sensitive operations
- Express dashboard on localhost:4242 with real-time monitoring
- Command-line interface for policy management
- Support for three policy actions: ALLOW, BLOCK, REQUIRE_APPROVAL
- Support for three severity levels: INFO, WARNING, CRITICAL
- Default blocking rules for shell execution, file deletion, and secret access
- Type-safe TypeScript implementation with strict mode
- Source maps and declaration files for debugging and IDE support
- Configuration storage in ~/.sentinel/
- Security features: SQL injection protection, parameterized queries, type safety

### Features
- **Proxy Mode**: Wrap MCP servers and intercept tool calls
- **Policy Engine**: JSON-based rules with glob matching
- **Logging**: SQLite database with audit trail
- **Approvals**: Manual review workflow for sensitive actions
- **Dashboard**: Real-time monitoring and approval interface
- **CLI**: Complete command-line management interface

### Security
- Full TypeScript strict mode compilation
- Parameterized SQL queries preventing injection attacks
- Deterministic glob matching for reproducible policy evaluation
- Local-first architecture with optional cloud integration

## Future Releases

### Planned for 0.2.0
- Cloud sync to CuratedMCP platform
- Email alerts via Resend
- Slack webhook notifications
- Team collaboration features
- Approval chains with multiple reviewers
- Policy templates library

### Planned for 1.0.0
- Production-ready MCP SDK transport
- npm registry publishing
- Global CLI installation
- Enterprise features
- Advanced analytics

---

## Migration Guide

### From Pre-Release to 0.1.0
This is the first release. No migration needed.
