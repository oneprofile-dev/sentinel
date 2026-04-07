# Contributing to CuratedMCP Sentinel

Thank you for your interest in contributing to Sentinel! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions. We are committed to providing a welcoming and inspiring community.

## Getting Started

### Prerequisites
- Node.js >= 18.0.0
- npm or yarn
- TypeScript knowledge

### Setup

1. Clone the repository
```bash
git clone https://github.com/curatedmcp/sentinel.git
cd sentinel
```

2. Install dependencies
```bash
npm install --ignore-scripts
```

3. Build the project
```bash
npm run build
```

4. Run tests
```bash
npm test
```

## Development Workflow

### Branch Naming
- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation updates
- `chore/description` - Maintenance tasks

### Commit Message Format

```
[type]: Brief description (50 chars max)

Detailed explanation (if needed)

Fixes #123
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Making Changes

1. Create a feature branch
```bash
git checkout -b feature/your-feature-name
```

2. Make your changes and test thoroughly
```bash
npm run build
npm test
```

3. Keep commits atomic and focused
4. Write clear commit messages

### Style Guide

- Use TypeScript with strict mode enabled
- Follow ESLint/Prettier conventions
- Write JSDoc comments for public APIs
- Use meaningful variable names
- Keep functions focused and testable

## Testing

All changes should include appropriate tests:

```bash
# Run all tests
npm test

# Watch mode during development
npm run dev
```

## Documentation

Update documentation for any user-facing changes:

- Update `README.md` for user-facing features
- Update `IMPLEMENTATION.md` for technical details
- Add entries to `CHANGELOG.md` under "Unreleased"

## Submitting Changes

1. Push your branch
```bash
git push origin feature/your-feature-name
```

2. Create a Pull Request with:
   - Clear description of changes
   - Related issue numbers (Fixes #123)
   - Test results
   - Documentation updates

3. Ensure CI/CD checks pass
4. Address review feedback
5. Squash commits if requested

## Performance Considerations

- Policy evaluation should remain <1ms
- Dashboard API responses should be <50ms
- Database queries should use existing indexes
- No unnecessary cloud calls in core runtime

## Security

- Use parameterized queries to prevent SQL injection
- Validate all user input
- Never commit secrets or credentials
- Follow OWASP guidelines
- Report security issues privately to security@curatedmcp.com

## Release Process

1. Update version in `package.json`
2. Update `CHANGELOG.md` with release notes
3. Tag release: `git tag v0.1.0`
4. Push to npm: `npm publish`

## Questions?

- Open a GitHub issue for bugs
- Start a discussion for features
- Email: sentinel@curatedmcp.com

---

Thank you for contributing to Sentinel! 🎉
