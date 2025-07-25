# Trae AI Workflows - My Collection

## 🤖 Overview

This document describes optimal workflows with Trae AI for the My Collection project. Trae AI provides project context understanding and intelligent development support.

## 🎯 Trae AI Features for My Collection

### 🔍 Semantic Search
- **Codebase Understanding**: Trae AI understands Nx monorepo structure
- **Cross-language Search**: Search across Angular TypeScript and NestJS
- **Pattern Recognition**: Recognizes NgRx Signals patterns, Spartan UI components

### 🧠 Context-Aware Development
- **Architecture Awareness**: Understands CQRS architecture, NgRx Signals
- **Framework Knowledge**: Angular 20+, NestJS best practices
- **Project-specific Patterns**: Bookmark management, authentication flows

### 🚀 Code Generation
- **Component Generation**: Create Angular components with signals
- **Service Generation**: NestJS services with proper patterns
- **Test Generation**: Unit tests and integration tests

## 📋 Development Workflows

### 🎨 Frontend Development Workflow

#### 1. Feature Planning Phase
```
Prompt: "I need to create a new collection management feature. Please analyze:
- Current folder structure in libs/web/
- Patterns used in bookmark feature
- NgRx Signals store patterns
- Available Spartan UI components

Suggest structure for collection feature with:
- Collection list component
- Collection detail component  
- Collection store with NgRx Signals
- Collection service with HTTP calls"
```

#### 2. Component Development
```
Prompt: "Create CollectionCardComponent with:
- Input signal for collection data
- Output signal for edit/delete actions
- Use Spartan UI components (card, button, menu)
- OnPush change detection
- Tailwind CSS styling
- Accessibility support

Reference existing BookmarkCardComponent pattern."
```

#### 3. State Management
```
Prompt: "Create CollectionStore with NgRx Signals:
- State: collections[], loading, error, selectedCollection
- Computed: collectionCount, hasCollections, filteredCollections
- Methods: loadCollections, createCollection, updateCollection, deleteCollection
- HTTP integration with CollectionService
- Error handling patterns

Reference BookmarkStore pattern."
```

### 🔧 Backend Development Workflow

#### 1. Module Planning
```
Prompt: "Create Collection module for NestJS with:
- CQRS pattern like bookmark module
- Entity with MikroORM decorators
- DTOs with validation
- Controller with Swagger docs
- Service with error handling
- Repository pattern

Analyze bookmark module to ensure consistency."
```

#### 2. API Development
```
Prompt: "Create Collection API endpoints:
- GET /collections - list with pagination, search, filter
- POST /collections - create with validation
- PUT /collections/:id - update
- DELETE /collections/:id - delete
- GET /collections/:id/bookmarks - get bookmarks in collection

Use patterns from bookmark controller."
```

### 🧪 Testing Workflow

#### 1. Test Planning
```
Prompt: "Create test strategy for Collection feature:
- Component tests with Angular Testing Library
- Service tests with HttpClientTestingModule
- Store tests with NgRx Signals testing
- E2E tests with Cypress
- Backend tests with NestJS testing

Reference existing test patterns."
```

#### 2. Test Implementation
```
Prompt: "Create unit tests for CollectionCardComponent:
- Test input signals
- Test output emissions
- Test computed properties
- Test user interactions
- Mock dependencies properly

Use pattern from BookmarkCardComponent tests."
```

## 🎨 Prompt Templates

### 📱 Component Development

#### Basic Component Template
```
Context: My Collection Angular 20+ app with NgRx Signals and Spartan UI

Task: Create [ComponentName] component with:
- Standalone component with OnPush
- Input/output signals
- Computed properties for derived state
- Spartan UI components
- Tailwind CSS styling
- Accessibility features
- TypeScript strict mode

Requirements:
- [Specific requirements]
- [Integration needs]
- [Styling requirements]

Reference: Reference [ExistingComponent] pattern
```

#### Feature Component Template
```
Context: My Collection - [Feature] management

Task: Create complete [Feature] feature with:

Frontend:
- [Feature]ListComponent with pagination, search, filter
- [Feature]DetailComponent with CRUD operations
- [Feature]Store with NgRx Signals
- [Feature]Service with HTTP calls
- Routing configuration

Backend:
- [Feature] module with CQRS
- Entity, DTOs, Controller, Service
- API endpoints with Swagger docs
- Validation and error handling

Architecture: Follow patterns from bookmark feature
```

### 🔧 Service Development

#### Frontend Service Template
```
Context: My Collection Angular service

Task: Create [ServiceName] service with:
- Injectable with providedIn: 'root'
- HTTP client integration
- Error handling with proper types
- Response mapping
- Loading states
- Cache strategy (if needed)

Integration:
- API endpoints: [list endpoints]
- Error handling: [error patterns]
- Type safety: [DTO types]

Reference: Reference BookmarkService pattern
```

#### Backend Service Template
```
Context: My Collection NestJS service

Task: Create [ServiceName] service with:
- Injectable decorator
- Repository injection
- CRUD operations
- Error handling with proper exceptions
- Logging with NestJS Logger
- Transaction support (if needed)

Database:
- Entity: [EntityName]
- Relations: [relationships]
- Queries: [specific query needs]

Reference: Reference BookmarkService pattern
```

### 🗄️ Database & API

#### Entity Development Template
```
Context: My Collection MikroORM entity

Task: Create [EntityName] entity with:
- MikroORM decorators
- Proper relationships
- Validation constraints
- Timestamps (createdAt, updatedAt)
- Soft delete (if needed)

Schema:
- Fields: [list fields with types]
- Relations: [relationships with other entities]
- Indexes: [performance indexes]

Reference: Reference Bookmark entity
```

#### API Endpoint Template
```
Context: My Collection NestJS API

Task: Create [Resource] API endpoints:
- GET /[resource] - list with query params
- GET /[resource]/:id - get by id
- POST /[resource] - create
- PUT /[resource]/:id - update
- DELETE /[resource]/:id - delete

Features:
- Swagger documentation
- JWT authentication
- Input validation
- Error responses
- Pagination (for list)

Reference: Reference bookmark endpoints
```

## 🐛 Debugging Workflows

### 🔍 Issue Analysis
```
Prompt: "Analyze error in [Component/Service]:

Error: [error message]
Context: [what user was doing]
Environment: [dev/prod]

Please:
1. Find root cause in codebase
2. Check related components/services
3. Suggest fix with proper testing
4. Suggest prevention measures

Reference similar issues already fixed."
```

### 🚀 Performance Optimization
```
Prompt: "Optimize performance for [Feature]:

Issues:
- [performance problems]
- [metrics/measurements]

Analyze:
1. Component change detection
2. HTTP calls optimization
3. Bundle size impact
4. Memory usage
5. Database queries (if backend)

Suggest improvements with measurable impact."
```

## 🔄 Code Review Workflow

### 📝 Review Request Template
```
Prompt: "Code review for [Feature/Component]:

Changes:
- [list of changes]
- [files modified]

Please review:
1. Architecture compliance
2. Coding standards adherence
3. Performance implications
4. Security considerations
5. Test coverage
6. Documentation needs

Focus areas: [specific concerns]
```

### 🧹 Refactoring Workflow
```
Prompt: "Refactor [Component/Service] to:

Goals:
- [improvement goals]
- [performance targets]
- [maintainability improvements]

Constraints:
- [backward compatibility]
- [existing integrations]

Plan:
1. Analyze current implementation
2. Identify improvement opportunities
3. Propose refactoring steps
4. Ensure test coverage
5. Migration strategy

Reference: [similar refactoring examples]
```

## 🎯 Best Practices with Trae AI

### 💡 Effective Prompting
1. **Provide Context**: Always mention "My Collection project"
2. **Reference Existing Code**: Point to similar implementations
3. **Specify Patterns**: Mention NgRx Signals, Spartan UI, etc.
4. **Include Requirements**: Be specific about needs
5. **Ask for Explanations**: Request reasoning behind suggestions

### 🔧 Iterative Development
1. **Start Small**: Begin with basic implementation
2. **Iterate**: Refine based on feedback
3. **Test Early**: Generate tests alongside code
4. **Document**: Update docs as you go
5. **Review**: Use AI for code review

### 📚 Learning & Improvement
1. **Pattern Recognition**: Learn from AI suggestions
2. **Best Practices**: Ask for explanations
3. **Architecture Guidance**: Get architectural advice
4. **Code Quality**: Continuous improvement suggestions

---

**Last updated**: $(date)
**Version**: 1.0.0