<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0
- Modified principles: Added new Principle VIII (Styling Best Practices)
- Added sections: New styling principle for Tailwind CSS usage
- Removed sections: None
- Templates requiring updates:
  - ✅ plan-template.md: Updated to include styling checks
  - ✅ spec-template.md: Aligned with styling requirements
  - ✅ tasks-template.md: Added styling validation tasks
- Follow-up TODOs: None
- Date: 2025-01-08
-->

# My Collection Constitution

## Core Principles

### I. Monorepo Architecture (NON-NEGOTIABLE)
The project MUST maintain a clear monorepo structure with strict separation between frontend (Angular/Nx) and backend (NestJS) codebases. All code organization follows domain-driven design with feature-based modules.

**Rules:**
- Frontend code resides in `client/` with Nx workspace structure
- Backend code resides in `server/` with NestJS modular architecture
- Each feature module MUST have clear boundaries: `data-access`, `feature`, `ui`, and `utils` layers
- Shared code MUST be extracted to appropriate shared libraries
- No circular dependencies between modules
- Library boundaries enforced through Nx dependency graph

**Rationale:** Monorepo enables code sharing, consistent tooling, and atomic changes across frontend/backend while maintaining clear separation of concerns.

### II. TypeScript-First Development (NON-NEGOTIABLE)
All code MUST be written in TypeScript with strict type checking enabled. No `any` types except when interfacing with untyped third-party libraries (must be documented).

**Rules:**
- `strict: true` in all `tsconfig.json` files
- Explicit return types for all public methods and functions
- Interface definitions for all data structures
- Type guards for runtime type validation
- No implicit `any` types
- Proper generic types for reusable components

**Rationale:** Type safety prevents runtime errors, improves developer experience, enables better refactoring, and serves as living documentation.

### III. Testing Requirements
All new features MUST include appropriate tests before merge. Test coverage MUST be maintained above 80% for critical paths.

**Rules:**
- **Unit Tests**: Required for all services, utilities, and business logic
- **Component Tests**: Required for all Angular components with user interactions
- **Integration Tests**: Required for API endpoints and database operations
- **E2E Tests**: Required for critical user journeys (authentication, bookmark CRUD)
- Tests MUST pass before PR approval
- No skipped tests in main branch without documented justification
- Mock external dependencies appropriately

**Rationale:** Comprehensive testing ensures reliability, prevents regressions, and enables confident refactoring.

### IV. Code Quality & Consistency (NON-NEGOTIABLE)
All code MUST pass linting, formatting, and quality checks before commit. Pre-commit hooks enforce these standards automatically.

**Rules:**
- **ESLint**: All code must pass ESLint checks (frontend and backend)
- **Prettier**: Code must be formatted with Prettier
- **Naming Conventions**:
  - Files: `kebab-case` (e.g., `bookmark-card.component.ts`)
  - Classes: `PascalCase` (e.g., `BookmarkService`)
  - Variables/Functions: `camelCase` (e.g., `getUserBookmarks`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`)
- **Git Hooks**: Husky pre-commit hooks run lint and format checks
- **Commit Messages**: Follow Conventional Commits format (`type(scope): message`)
- **Code Reviews**: Minimum 1 approval required for PR merge

**Rationale:** Consistent code quality improves maintainability, reduces bugs, and enhances collaboration.

### V. State Management Pattern
Frontend state MUST be managed using NgRx Signals. Backend state MUST follow CQRS pattern where appropriate.

**Rules:**
- **Frontend**:
  - Use `signalStore()` for feature state management
  - Computed signals for derived state
  - `rxMethod()` for side effects and API calls
  - No direct state mutation (immutable updates only)
  - State organized by feature domain
- **Backend**:
  - CQRS for complex business logic (commands for writes, queries for reads)
  - Event-driven architecture for cross-module communication
  - Repository pattern for data access
  - Service layer for business logic

**Rationale:** Structured state management ensures predictable data flow, easier debugging, and better scalability.

### VI. API Design & Documentation
All backend APIs MUST follow RESTful principles and be fully documented with Swagger/OpenAPI specifications.

**Rules:**
- **REST Conventions**:
  - GET for reads, POST for creates, PUT/PATCH for updates, DELETE for deletes
  - Proper HTTP status codes (200, 201, 400, 401, 403, 404, 500)
  - Consistent URL structure (`/api/v1/resource`)
- **Documentation**:
  - Swagger decorators on all endpoints (`@ApiOperation`, `@ApiResponse`)
  - Request/response DTOs with validation decorators
  - Example requests and responses
  - Error response documentation
- **Validation**:
  - Input validation using `class-validator`
  - DTO transformation using `class-transformer`
  - Proper error messages for validation failures
- **Versioning**: API versioning through URL path (`/api/v1/`, `/api/v2/`)

**Rationale:** Well-documented APIs improve developer experience, enable API consumers, and serve as contracts between frontend and backend.

### VII. Security & Authentication
Security MUST be implemented at every layer. Authentication and authorization are NON-NEGOTIABLE for protected resources.

**Rules:**
- **Authentication**:
  - JWT-based authentication with refresh tokens
  - Secure password hashing using bcrypt (min 10 rounds)
  - Token expiration and refresh mechanism
  - HTTP-only cookies for token storage (where applicable)
- **Authorization**:
  - Role-based access control (RBAC)
  - Guards on all protected routes (frontend and backend)
  - Resource-level permissions
- **Input Validation**:
  - Sanitize all user inputs
  - Validate data types and formats
  - Prevent SQL injection, XSS, CSRF
- **Security Headers**:
  - CORS configuration
  - Content Security Policy (CSP)
  - Helmet.js for security headers
- **Secrets Management**:
  - Environment variables for sensitive data
  - No secrets in code or version control
  - Separate configs for dev/staging/production

**Rationale:** Security is fundamental to user trust and data protection. Defense in depth prevents vulnerabilities.

### VIII. Styling Best Practices
Frontend styling MUST follow Tailwind CSS utility-first approach with minimal use of `@apply` directive. Custom CSS should be component-scoped and semantic.

**Rules:**
- **Tailwind CSS Usage**:
  - Prefer utility classes directly in templates over `@apply` in CSS files
  - Use `@apply` ONLY for:
    - Base styles (typography, resets)
    - Complex component states that require multiple utilities
    - Third-party component overrides where inline utilities are not possible
  - Maximum 3-5 `@apply` directives per CSS class
  - Document rationale when using `@apply` for complex patterns
- **Component Styling**:
  - Use component-scoped CSS files (`.component.css`)
  - Prefer Tailwind utilities in templates for maintainability
  - Extract repeated utility patterns to reusable components, not CSS classes
  - Use CSS custom properties (variables) for theming
- **Performance**:
  - Minimize custom CSS to reduce bundle size
  - Leverage Tailwind's JIT mode for optimal purging
  - Avoid deep selector nesting (max 3 levels)
- **Consistency**:
  - Follow Tailwind's naming conventions
  - Use design tokens from Tailwind config
  - Maintain consistent spacing scale (4px base)

**Rationale:** Limiting `@apply` usage keeps styles maintainable, leverages Tailwind's optimization, prevents CSS bloat, and ensures consistency across the codebase. Utility-first approach in templates provides better visibility of applied styles and easier debugging.

## Development Workflow

### Branch Strategy
- **main**: Production-ready code, protected branch
- **develop**: Integration branch for features
- **feature/***: Feature development branches (from develop)
- **hotfix/***: Critical fixes (from main, merge to main and develop)

### Pull Request Process
1. Create feature branch from `develop`
2. Implement changes with tests
3. Run local checks: `npm run lint`, `npm run test`, `npm run build`
4. Create PR with descriptive title and description
5. Automated CI checks must pass
6. Code review approval required (minimum 1 reviewer)
7. Squash and merge to `develop`
8. Delete feature branch after merge

### Code Review Checklist
- [ ] Code follows style guidelines and naming conventions
- [ ] Tests included and passing
- [ ] No security vulnerabilities introduced
- [ ] Documentation updated (if needed)
- [ ] No breaking changes (or properly documented)
- [ ] Performance impact considered
- [ ] Accessibility requirements met (for UI changes)
- [ ] Styling follows Tailwind best practices (minimal `@apply` usage)

## Architecture Constraints

### Frontend Constraints
- **Framework**: Angular 20+ with standalone components
- **Build Tool**: Nx for monorepo management
- **State**: NgRx Signals for reactive state
- **UI Library**: Spartan UI (Radix primitives)
- **Styling**: Tailwind CSS utility-first approach (limit `@apply` usage)
- **Testing**: Jest for unit tests, Playwright for E2E
- **Bundle Size**: Keep main bundle < 500KB gzipped
- **Performance**: First Contentful Paint < 1.5s, Cumulative Layout Shift < 0.1

### Backend Constraints
- **Framework**: NestJS with modular architecture
- **Database**: PostgreSQL 15+ with MikroORM
- **Caching**: Redis for session and data caching
- **Authentication**: Passport.js with JWT strategy
- **Documentation**: Swagger/OpenAPI auto-generated
- **Testing**: Jest for unit/integration tests
- **Response Time**: API endpoints < 500ms (p95)
- **Scalability**: Support 10k+ concurrent users

### Database Constraints
- **Migrations**: All schema changes through MikroORM migrations
- **Indexing**: Proper indexes on frequently queried columns
- **Relationships**: Use foreign keys and proper constraints
- **Naming**: `snake_case` for tables and columns
- **Backups**: Automated daily backups with point-in-time recovery
- **Transactions**: Use transactions for multi-step operations

## Quality Gates

### Pre-Commit
- Linting passes (ESLint)
- Formatting passes (Prettier)
- Stylelint passes (for CSS/SCSS)
- No TypeScript errors
- Styling follows Tailwind best practices

### Pre-Push
- All tests pass
- Build succeeds
- No security vulnerabilities (Snyk/npm audit)

### Pre-Merge
- CI pipeline passes
- Code review approved
- Test coverage maintained or improved
- Documentation updated
- No merge conflicts
- Styling patterns reviewed

## Performance Standards

### Frontend Performance
- **Lighthouse Score**: > 90 for Performance, Accessibility, Best Practices, SEO
- **Core Web Vitals**:
  - Largest Contentful Paint (LCP): < 2.5s
  - First Input Delay (FID): < 100ms
  - Cumulative Layout Shift (CLS): < 0.1
- **Bundle Size**: Main bundle < 500KB gzipped
- **Image Optimization**: WebP format, lazy loading, responsive images
- **CSS Size**: Minimize custom CSS, leverage Tailwind purging

### Backend Performance
- **API Response Time**: < 500ms (p95), < 200ms (p50)
- **Database Queries**: < 100ms for simple queries, < 500ms for complex
- **Throughput**: Support 1000 requests/second
- **Memory Usage**: < 512MB per instance under normal load
- **Error Rate**: < 0.1% of all requests

## Accessibility Requirements

### WCAG 2.1 AA Compliance (NON-NEGOTIABLE)
- **Keyboard Navigation**: All interactive elements accessible via keyboard
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Focus Indicators**: Visible focus states for all interactive elements
- **Alternative Text**: Alt text for all images and icons
- **Form Labels**: Proper labels for all form inputs
- **Error Messages**: Clear, descriptive error messages

## Documentation Requirements

### Code Documentation
- **JSDoc Comments**: For all public APIs, complex functions, and classes
- **README Files**: For each major module explaining purpose and usage
- **API Documentation**: Swagger/OpenAPI for all endpoints
- **Architecture Diagrams**: Updated with major architectural changes
- **Styling Patterns**: Document complex `@apply` usage with rationale

### User Documentation
- **Setup Guide**: Clear instructions for local development
- **Deployment Guide**: Step-by-step deployment instructions
- **Troubleshooting**: Common issues and solutions
- **Contributing Guide**: How to contribute to the project
- **Style Guide**: Tailwind CSS usage patterns and best practices

## Governance

### Constitution Authority
This constitution supersedes all other development practices and guidelines. All team members MUST adhere to these principles.

### Amendment Process
1. Propose amendment with justification
2. Team discussion and feedback
3. Approval from tech lead and product owner
4. Update constitution with version bump
5. Communicate changes to all team members
6. Update dependent templates and documentation

### Compliance Review
- **Code Reviews**: All PRs verified for constitution compliance
- **Monthly Audits**: Review codebase for adherence to principles
- **Metrics Tracking**: Monitor quality gates and performance standards
- **Continuous Improvement**: Regular retrospectives to identify improvements
- **Styling Audits**: Review CSS files for excessive `@apply` usage

### Versioning Policy
- **MAJOR**: Backward-incompatible principle changes or removals
- **MINOR**: New principles added or material expansions
- **PATCH**: Clarifications, wording improvements, typo fixes

### Exceptions
Exceptions to these principles MUST be:
1. Documented with clear justification
2. Approved by tech lead
3. Time-bound with plan to resolve
4. Tracked in technical debt backlog

**Version**: 1.1.0 | **Ratified**: 2025-01-06 | **Last Amended**: 2025-01-08
