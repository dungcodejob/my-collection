# Code Review Prompt Template

## 📋 Context
**Project**: My Collection - Bookmark Management System
**Standards**: Angular 20+, NgRx Signals, NestJS, TypeScript Strict
**Focus**: Code Quality, Performance, Security, Maintainability

## 🔍 Template Usage

### 📝 General Code Review Template

```
Context: My Collection - Code Review Request

Review Type: [Feature/Bug Fix/Refactoring/Performance/Security]

Changes Overview:
- Feature/Component: [What was changed]
- Files Modified: [List of modified files]
- Lines Changed: [Approximate line count]
- Type of Changes: [New feature/Bug fix/Refactoring/etc.]

Code Changes:
[Paste relevant code snippets or describe changes]

Review Focus Areas:
1. Architecture & Design Patterns
   - Compliance với established patterns
   - SOLID principles adherence
   - Separation of concerns
   - Component/service boundaries

2. Code Quality
   - TypeScript strict mode compliance
   - Naming conventions
   - Code readability
   - Documentation quality
   - Error handling

3. Performance Implications
   - Change detection strategy
   - Bundle size impact
   - Memory usage
   - Database query efficiency
   - HTTP request optimization

4. Security Considerations
   - Input validation
   - XSS prevention
   - Authentication/authorization
   - Data sanitization
   - Secure coding practices

5. Testing Coverage
   - Unit test quality
   - Integration test needs
   - E2E test coverage
   - Test maintainability

6. Documentation
   - Code comments
   - API documentation
   - README updates
   - Architecture docs

Specific Concerns:
- [Any specific areas you want reviewed]
- [Known issues or trade-offs]
- [Performance considerations]

Reference Standards:
- Tham khảo coding-standards.md
- Follow existing patterns trong codebase
- Maintain consistency với team conventions

Review Questions:
1. Does this follow our established patterns?
2. Are there any potential performance issues?
3. Is the error handling comprehensive?
4. Are there security vulnerabilities?
5. Is the code testable and maintainable?
6. Does it need additional documentation?
```

### 🎨 Frontend Code Review Template

```
Context: My Collection - Frontend Code Review

Component/Feature: [Component name]
Type: [Component/Service/Store/Directive/Pipe]

Frontend-Specific Review Areas:

1. Angular Best Practices
   - Standalone components usage
   - OnPush change detection strategy
   - Signal-based reactivity
   - Proper lifecycle hooks
   - Input/Output signal patterns

2. NgRx Signals Implementation
   - Store structure và naming
   - State immutability
   - Computed signal dependencies
   - Effect implementations
   - Service integration

3. UI/UX Implementation
   - Spartan UI component usage
   - Tailwind CSS best practices
   - Responsive design
   - Accessibility compliance
   - Theme support (dark/light)

4. Performance Optimization
   - OnPush strategy implementation
   - Lazy loading usage
   - Bundle size considerations
   - Image optimization
   - HTTP request efficiency

5. Type Safety
   - TypeScript strict mode
   - Proper type definitions
   - Generic usage
   - Interface definitions
   - DTO type safety

Code Snippet:
[Paste component/service code]

Specific Questions:
- Is the component properly optimized for change detection?
- Are signals used correctly?
- Is the UI accessible and responsive?
- Does it follow our design system?
- Are there any performance bottlenecks?

Reference: Compare với existing components trong codebase
```

### 🔧 Backend Code Review Template

```
Context: My Collection - Backend Code Review

Module/Service: [Module name]
Type: [Controller/Service/Entity/DTO/Guard/Interceptor]

Backend-Specific Review Areas:

1. NestJS Best Practices
   - Module organization
   - Dependency injection
   - Decorator usage
   - Exception handling
   - Logging implementation

2. Database & ORM
   - Entity definitions
   - Relationship mappings
   - Query optimization
   - Migration scripts
   - Transaction handling

3. API Design
   - RESTful conventions
   - Swagger documentation
   - Input validation
   - Response formatting
   - Error responses

4. Security Implementation
   - Authentication guards
   - Authorization logic
   - Input sanitization
   - SQL injection prevention
   - Rate limiting

5. Performance Considerations
   - Database query efficiency
   - Caching strategy
   - Connection pooling
   - Memory usage
   - Response time

Code Snippet:
[Paste controller/service code]

Specific Questions:
- Are database queries optimized?
- Is input validation comprehensive?
- Are security measures adequate?
- Is error handling consistent?
- Does it follow CQRS patterns?

Reference: Compare với existing modules trong codebase
```

### 🧪 Testing Code Review Template

```
Context: My Collection - Test Code Review

Test Type: [Unit/Integration/E2E]
Component/Service: [What is being tested]

Testing Review Areas:

1. Test Coverage
   - All public methods tested
   - Edge cases covered
   - Error scenarios tested
   - Integration points verified

2. Test Quality
   - Clear test descriptions
   - Proper setup/teardown
   - Mock usage
   - Assertion quality

3. Test Maintainability
   - Test data management
   - Helper functions
   - Test organization
   - Documentation

Frontend Testing:
- Component testing với Angular Testing Library
- Service testing với HttpClientTestingModule
- Store testing với NgRx Signals
- Accessibility testing

Backend Testing:
- Controller testing với supertest
- Service testing với mocked dependencies
- Repository testing
- Integration testing

Test Code:
[Paste test code]

Review Questions:
- Are tests comprehensive and meaningful?
- Is test setup clean and maintainable?
- Are mocks used appropriately?
- Do tests follow AAA pattern?
- Are edge cases covered?

Reference: Follow existing test patterns
```

## 🔍 Specific Review Scenarios

### 🚀 Performance Review Template

```
Context: My Collection - Performance Code Review

Performance Focus: [Loading/Rendering/Memory/Bundle/Database]

Performance Checklist:

Frontend Performance:
- [ ] OnPush change detection implemented
- [ ] Lazy loading for routes/components
- [ ] Optimized bundle size
- [ ] Efficient HTTP requests
- [ ] Proper image optimization
- [ ] Memory leak prevention

Backend Performance:
- [ ] Database query optimization
- [ ] Proper indexing
- [ ] Caching implementation
- [ ] Connection pooling
- [ ] Response compression
- [ ] Rate limiting

Code Analysis:
[Paste performance-critical code]

Metrics to Consider:
- Bundle size impact
- Load time changes
- Memory usage
- Database query time
- API response time

Questions:
1. What is the performance impact?
2. Are there optimization opportunities?
3. How does this scale?
4. Are there memory leaks?
5. Can we cache anything?
```

### 🔐 Security Review Template

```
Context: My Collection - Security Code Review

Security Focus: [Authentication/Authorization/Input Validation/XSS/CSRF]

Security Checklist:

Input Validation:
- [ ] All inputs validated
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] File upload security
- [ ] Data sanitization

Authentication/Authorization:
- [ ] Proper JWT handling
- [ ] Role-based access control
- [ ] Session management
- [ ] Password security
- [ ] Token expiration

API Security:
- [ ] Rate limiting
- [ ] CORS configuration
- [ ] HTTPS enforcement
- [ ] Security headers
- [ ] Error message security

Code Analysis:
[Paste security-relevant code]

Security Questions:
1. Are all inputs properly validated?
2. Is authentication/authorization correct?
3. Are there any injection vulnerabilities?
4. Is sensitive data properly handled?
5. Are security headers configured?
```

## 📋 Review Checklist

### ✅ Code Quality Checklist
- [ ] Follows coding standards
- [ ] Proper naming conventions
- [ ] Clear and concise code
- [ ] Adequate documentation
- [ ] Error handling implemented
- [ ] TypeScript strict compliance

### ✅ Architecture Checklist
- [ ] Follows established patterns
- [ ] Proper separation of concerns
- [ ] SOLID principles applied
- [ ] Consistent với existing code
- [ ] Scalable design
- [ ] Maintainable structure

### ✅ Performance Checklist
- [ ] Optimized for performance
- [ ] No memory leaks
- [ ] Efficient algorithms
- [ ] Proper caching
- [ ] Bundle size considered
- [ ] Database queries optimized

### ✅ Security Checklist
- [ ] Input validation
- [ ] Authentication/authorization
- [ ] No security vulnerabilities
- [ ] Secure data handling
- [ ] Proper error messages
- [ ] Security best practices

## 🎯 Review Best Practices

1. **Be Constructive**: Focus on improvement, not criticism
2. **Provide Examples**: Show better alternatives
3. **Explain Reasoning**: Why changes are needed
4. **Consider Context**: Understand the full picture
5. **Reference Standards**: Point to established patterns
6. **Suggest Learning**: Recommend resources for improvement

## 📝 Review Response Template

```
Review Summary for [Feature/Component]:

✅ Strengths:
- [List positive aspects]
- [Good practices followed]
- [Well-implemented features]

⚠️ Areas for Improvement:
- [Specific issues found]
- [Suggested improvements]
- [Alternative approaches]

🔧 Required Changes:
- [Critical issues that must be fixed]
- [Security vulnerabilities]
- [Performance problems]

💡 Suggestions:
- [Optional improvements]
- [Future considerations]
- [Learning opportunities]

📚 References:
- [Relevant documentation]
- [Similar implementations]
- [Best practice resources]

Overall Assessment: [Approved/Needs Changes/Major Revision Required]
```

---

**Cập nhật lần cuối**: $(date)
**Template Version**: 1.0.0