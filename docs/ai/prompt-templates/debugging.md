# Debugging & Troubleshooting Prompt Template

## 🐛 Context
**Project**: My Collection - Bookmark Management System
**Stack**: Angular 20+, NgRx Signals, NestJS, MikroORM
**Environment**: Development/Production

## 🔍 Template Usage

### 🚨 Error Analysis Template

```
Context: My Collection - Error Analysis

Issue Description:
- Error Type: [Runtime/Compile/Build/Network/Database]
- Component/Service: [Affected component/service]
- User Action: [What user was doing when error occurred]
- Environment: [Development/Staging/Production]
- Browser/Node Version: [Version info]

Error Details:
- Error Message: [Exact error message]
- Stack Trace: [Full stack trace]
- Console Logs: [Relevant console output]
- Network Requests: [Failed requests if any]

Reproduction Steps:
1. [Step 1]
2. [Step 2]
3. [Step 3]
4. [Error occurs]

Expected Behavior:
[What should happen instead]

Analysis Request:
1. Identify root cause trong codebase
2. Kiểm tra related components/services
3. Suggest immediate fix
4. Recommend prevention measures
5. Identify similar potential issues

Context Files:
- [List relevant files to examine]
- [Related components/services]

Reference: Tham khảo similar issues đã resolved
```

### 🔧 Performance Issue Template

```
Context: My Collection - Performance Analysis

Performance Issue:
- Type: [Loading/Rendering/Memory/Bundle Size/Database]
- Affected Feature: [Specific feature/page]
- Metrics: [Load time/Memory usage/Bundle size]
- User Impact: [How users are affected]

Current Measurements:
- Page Load Time: [X seconds]
- Bundle Size: [X MB]
- Memory Usage: [X MB]
- Database Query Time: [X ms]
- API Response Time: [X ms]

Analysis Areas:
Frontend Performance:
1. Component change detection strategy
2. Bundle size analysis
3. Lazy loading implementation
4. Image optimization
5. HTTP request optimization
6. Memory leaks

Backend Performance:
1. Database query optimization
2. API response time
3. Memory usage
4. Caching strategy
5. Connection pooling

Optimization Request:
1. Analyze current implementation
2. Identify bottlenecks
3. Suggest specific optimizations
4. Provide measurable improvements
5. Implementation priority

Tools Available:
- Angular DevTools
- Chrome DevTools
- Bundle Analyzer
- Database query profiler

Reference: Tham khảo existing optimization patterns
```

### 🌐 Network/API Issue Template

```
Context: My Collection - Network/API Debugging

Issue Type: [HTTP Error/Timeout/CORS/Authentication/Data Format]

Request Details:
- Endpoint: [API endpoint]
- Method: [GET/POST/PUT/DELETE]
- Headers: [Request headers]
- Body: [Request body if applicable]
- Expected Response: [What should be returned]

Error Information:
- Status Code: [HTTP status code]
- Error Message: [Server error message]
- Network Tab: [Browser network tab info]
- Server Logs: [Backend logs if available]

Frontend Investigation:
1. HTTP service implementation
2. Error handling logic
3. Request interceptors
4. Response mapping
5. State management updates

Backend Investigation:
1. Controller implementation
2. Service logic
3. Database queries
4. Validation rules
5. Error handling

Analysis Request:
1. Trace request flow từ frontend đến backend
2. Identify failure point
3. Check data validation
4. Verify authentication/authorization
5. Suggest fix với proper error handling

Reference: Tham khảo working API implementations
```

### 🎨 UI/UX Issue Template

```
Context: My Collection - UI/UX Debugging

Issue Category: [Layout/Styling/Responsiveness/Accessibility/User Flow]

Problem Description:
- Component: [Affected component]
- Browser: [Browser and version]
- Screen Size: [Desktop/Tablet/Mobile]
- Theme: [Light/Dark mode]

Visual Issues:
- Layout Problems: [Describe layout issues]
- Styling Issues: [CSS/Tailwind problems]
- Responsive Issues: [Mobile/tablet problems]
- Accessibility Issues: [A11y problems]

Expected vs Actual:
- Expected: [How it should look/behave]
- Actual: [Current behavior]
- Screenshots: [If available]

Investigation Areas:
1. Component template structure
2. CSS/Tailwind classes
3. Spartan UI component usage
4. Responsive design implementation
5. Accessibility attributes

Analysis Request:
1. Review component implementation
2. Check CSS specificity issues
3. Verify responsive breakpoints
4. Test accessibility compliance
5. Suggest improvements

Reference: Tham khảo similar working components
```

## 🔬 Specific Debugging Scenarios

### 🔄 NgRx Signals Issues

```
Context: My Collection - NgRx Signals Store Debugging

Store: [Store name]
Issue: [State not updating/Computed not working/Method not triggering]

State Investigation:
- Current State: [Current state values]
- Expected State: [Expected state values]
- Action Triggered: [What action was called]
- Method Called: [Store method called]

Debug Areas:
1. Signal definitions
2. Computed signal dependencies
3. State mutation logic
4. Effect implementations
5. Service integration

Analysis Request:
1. Trace state flow
2. Check signal reactivity
3. Verify computed dependencies
4. Debug method implementations
5. Suggest fixes

Reference: Tham khảo working store implementations
```

### 🗄️ Database Issues

```
Context: My Collection - Database/MikroORM Debugging

Issue Type: [Query Error/Migration/Relationship/Performance]

Database Details:
- Entity: [Entity name]
- Operation: [Create/Read/Update/Delete]
- Query: [SQL query if available]
- Error: [Database error message]

Investigation Areas:
1. Entity definitions
2. Relationship mappings
3. Migration files
4. Repository methods
5. Query optimization

Analysis Request:
1. Review entity structure
2. Check relationship definitions
3. Verify migration scripts
4. Optimize queries
5. Suggest improvements

Reference: Tham khảo working entity implementations
```

### 🔐 Authentication Issues

```
Context: My Collection - Authentication Debugging

Issue: [Login Failed/Token Expired/Permission Denied/Session Issues]

Auth Flow:
- Step: [Where in auth flow issue occurs]
- Token: [JWT token status]
- User Role: [User permissions]
- Endpoint: [Protected endpoint]

Investigation:
1. JWT token validation
2. Guard implementations
3. Interceptor logic
4. Session management
5. Permission checks

Analysis Request:
1. Trace authentication flow
2. Verify token handling
3. Check guard logic
4. Debug permission system
5. Suggest security improvements

Reference: Tham khảo working auth implementations
```

## 🛠️ Debugging Tools & Commands

### 🔍 Frontend Debugging

```
# Angular DevTools
ng.getComponent($0) // Get component instance
ng.getContext($0)   // Get component context
ng.getInjector($0)  // Get injector

# Console Debugging
console.log('Signal value:', signal())
console.log('Computed value:', computed())

# Performance Profiling
ng.profiler.timeChangeDetection()
```

### 🔧 Backend Debugging

```
# NestJS Debugging
this.logger.debug('Debug info', context)
this.logger.error('Error info', trace, context)

# Database Debugging
console.log(qb.getQuery()) // MikroORM query
console.log(qb.getParams()) // Query parameters
```

## 📋 Debugging Checklist

### ✅ Frontend Checklist
- [ ] Check browser console for errors
- [ ] Verify network requests in DevTools
- [ ] Test component inputs/outputs
- [ ] Check signal reactivity
- [ ] Verify computed dependencies
- [ ] Test error boundaries
- [ ] Check accessibility

### ✅ Backend Checklist
- [ ] Check server logs
- [ ] Verify database connections
- [ ] Test API endpoints
- [ ] Check authentication
- [ ] Verify data validation
- [ ] Test error handling
- [ ] Check performance metrics

## 🎯 Best Practices

1. **Provide Context**: Include relevant code snippets
2. **Be Specific**: Exact error messages and steps
3. **Include Environment**: Browser, versions, etc.
4. **Reference Working Code**: Point to similar working features
5. **Request Explanations**: Ask for root cause analysis
6. **Think Prevention**: Ask for prevention strategies

---

**Cập nhật lần cuối**: $(date)
**Template Version**: 1.0.0