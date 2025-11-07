# Research: Add Bookmark Dialog

**Feature**: 001-add-bookmark-dialog  
**Date**: 2025-01-06  
**Phase**: 0 - Technical Research

## Overview

This document captures technical decisions, best practices research, and alternatives considered for implementing the Add Bookmark Dialog feature.

## 1. Metadata Extraction Strategy

### Decision: Server-Side Extraction with Cheerio

**Rationale**:
- **Security**: Client-side extraction would require CORS, exposing users to security risks
- **Reliability**: Server-side avoids browser limitations and ad-blockers
- **Performance**: Centralized caching of metadata reduces redundant fetches
- **Consistency**: Uniform extraction logic across all users

**Implementation**:
- Use Cheerio (lightweight jQuery-like library) for HTML parsing
- Extract Open Graph tags (`og:title`, `og:description`, `og:image`)
- Fallback to standard HTML meta tags and `<title>` element
- Axios for HTTP requests with timeout configuration

**Alternatives Considered**:
- **Puppeteer/Playwright**: Rejected due to high resource usage and complexity
- **Third-party APIs** (Embed.ly, Microlink): Rejected to avoid external dependencies and costs
- **Client-side extraction**: Rejected due to CORS and security concerns

### Best Practices:
- Implement request caching (Redis) with 24-hour TTL to reduce load
- Set user-agent header to identify bot requests properly
- Handle redirects (301/302) automatically with Axios
- Implement rate limiting per user to prevent abuse
- Timeout requests after 10 seconds to prevent hanging

---

## 2. Image Upload & Storage

### Decision: Direct Upload to Cloud Storage with Database URL Reference

**Rationale**:
- **Scalability**: Cloud storage (AWS S3/Azure Blob) handles large volumes
- **Performance**: CDN integration for fast image delivery
- **Cost-effective**: Pay-per-use model, no server storage management
- **Reliability**: Built-in redundancy and backup

**Implementation**:
- Frontend: Direct upload to presigned URL (no server proxy)
- Backend: Generate presigned URLs with 15-minute expiration
- Database: Store only the final image URL (not binary data)
- Image processing: Resize/optimize on upload (max 1920x1080, WebP format)

**Alternatives Considered**:
- **Database BLOB storage**: Rejected due to poor performance at scale
- **Server filesystem**: Rejected due to backup complexity and scalability issues
- **Base64 encoding**: Rejected due to database size bloat

### Best Practices:
- Validate file type on both client and server (whitelist: JPEG, PNG, GIF, WebP)
- Scan uploaded files for malware using ClamAV or cloud service
- Generate unique filenames using UUID to prevent collisions
- Implement image optimization pipeline (compression, format conversion)
- Set appropriate CORS headers for cross-origin uploads
- Clean up abandoned uploads (presigned URLs not used within 24 hours)

---

## 3. Duplicate URL Detection

### Decision: Database Query with Exact URL Match

**Rationale**:
- **Accuracy**: Exact match prevents false positives
- **Performance**: Indexed URL column enables fast lookups
- **User Control**: Confirmation dialog allows intentional duplicates

**Implementation**:
- Create unique index on `(user_id, url)` columns
- Query before save: `SELECT id, title FROM bookmarks WHERE user_id = ? AND url = ?`
- Return existing bookmark details in confirmation dialog
- Allow user to proceed (creates duplicate) or cancel

**Alternatives Considered**:
- **URL normalization**: Rejected as too complex (query parameters, fragments, www vs non-www)
- **Fuzzy matching**: Rejected due to performance cost and false positives
- **Block duplicates entirely**: Rejected to allow user flexibility

### Best Practices:
- Create composite index on `(user_id, url)` for optimal query performance
- Display existing bookmark metadata in confirmation (title, created date)
- Provide "View Existing" link in confirmation dialog
- Log duplicate attempts for analytics
- Consider URL canonicalization for future enhancement

---

## 4. Form State Management

### Decision: NgRx Signals with Local Component State

**Rationale**:
- **Modern**: NgRx Signals is the latest recommended approach
- **Performance**: Signals provide fine-grained reactivity
- **Simplicity**: Less boilerplate than traditional NgRx Store
- **Type Safety**: Full TypeScript support with computed signals

**Implementation**:
- Create `AddBookmarkDialogStore` using `signalStore()`
- State: `url`, `metadata`, `selectedImage`, `formData`, `loading`, `error`
- Computed signals: `isValid`, `hasChanges`, `canSave`
- Effects: `fetchMetadata$`, `uploadImage$`, `saveBookmark$`
- Use `rxMethod()` for async operations

**Alternatives Considered**:
- **Traditional NgRx Store**: Rejected due to excessive boilerplate for dialog state
- **Local component state only**: Rejected due to lack of testability and reusability
- **RxJS BehaviorSubject**: Rejected in favor of modern Signals approach

### Best Practices:
- Keep dialog state isolated (don't pollute global store)
- Use computed signals for derived state (validation, UI flags)
- Implement optimistic updates for better UX
- Clear state on dialog close to prevent stale data
- Handle race conditions (user clicks fetch multiple times)

---

## 5. API Design

### Decision: RESTful Endpoints with Clear Separation

**Rationale**:
- **Clarity**: Separate endpoints for distinct operations
- **Cacheability**: GET requests can be cached
- **Standard**: Follows REST conventions

**Endpoints**:
1. `GET /api/v1/metadata?url={url}` - Fetch website metadata
2. `POST /api/v1/bookmarks` - Create new bookmark
3. `POST /api/v1/bookmarks/images/upload` - Get presigned URL for image upload
4. `GET /api/v1/bookmarks/check-duplicate?url={url}` - Check for duplicates

**Alternatives Considered**:
- **GraphQL**: Rejected as overkill for simple CRUD operations
- **Single endpoint**: Rejected to maintain clear separation of concerns
- **WebSocket**: Rejected as real-time updates not required

### Best Practices:
- Use DTOs for request/response validation
- Implement proper HTTP status codes (200, 201, 400, 409, 500)
- Add Swagger/OpenAPI documentation
- Version APIs (`/api/v1/`) for future compatibility
- Implement request/response logging for debugging
- Add rate limiting per endpoint (metadata fetch: 60/min, bookmark create: 30/min)

---

## 6. Error Handling Strategy

### Decision: Layered Error Handling with User-Friendly Messages

**Rationale**:
- **User Experience**: Clear, actionable error messages
- **Debugging**: Detailed logs for developers
- **Resilience**: Graceful degradation on failures

**Implementation**:
- **Frontend**: Try-catch with user-friendly error toasts
- **Backend**: Global exception filter with error codes
- **Network**: Retry logic with exponential backoff (max 3 attempts)
- **Validation**: Field-level error messages

**Error Categories**:
1. **Network Errors**: "Unable to connect. Please check your internet connection."
2. **Validation Errors**: "URL is invalid. Please enter a valid web address."
3. **Server Errors**: "Something went wrong. Please try again later."
4. **Timeout Errors**: "Request timed out. The website may be slow or unavailable."

### Best Practices:
- Never expose internal error details to users
- Log full error stack traces server-side
- Implement error tracking (Sentry integration)
- Provide retry mechanisms for transient failures
- Show loading states during operations
- Implement circuit breaker pattern for metadata fetch

---

## 7. Performance Optimization

### Decisions:

**Lazy Loading**:
- Load dialog component only when needed (not in main bundle)
- Use Angular's lazy loading with dynamic imports

**Image Optimization**:
- Compress images on upload (80% quality JPEG, WebP format)
- Generate thumbnails (200x200) for gallery view
- Lazy load images in gallery (IntersectionObserver)

**Caching**:
- Cache metadata responses (Redis, 24-hour TTL)
- Cache duplicate check results (5-minute TTL)
- Use HTTP caching headers for image URLs

**Database**:
- Index on `user_id`, `url`, `created_at` columns
- Use connection pooling (max 20 connections)
- Implement query timeout (5 seconds)

### Best Practices:
- Monitor API response times (target: <500ms p95)
- Implement database query logging in development
- Use CDN for static assets and images
- Minimize bundle size (tree-shaking, code splitting)
- Implement virtual scrolling for large image galleries

---

## 8. Testing Strategy

### Unit Tests:
- **Frontend**: Component logic, store actions, validators
- **Backend**: Services, DTOs, validators, utilities

### Integration Tests:
- **API**: Metadata fetch, bookmark creation, duplicate detection
- **Database**: Entity relationships, queries, transactions

### E2E Tests:
- **Critical Flow**: Open dialog → Enter URL → Fetch metadata → Edit → Save
- **Error Scenarios**: Invalid URL, network failure, duplicate URL
- **Image Upload**: Select file → Upload → Preview → Save

### Test Data:
- Mock metadata responses for consistent tests
- Use test database with seed data
- Mock external HTTP requests (Axios)

### Best Practices:
- Aim for 80%+ code coverage
- Test error paths, not just happy paths
- Use test fixtures for consistent data
- Implement visual regression tests for UI
- Run E2E tests in CI/CD pipeline

---

## 9. Accessibility Considerations

### Decisions:
- **Keyboard Navigation**: Full keyboard support (Tab, Enter, Esc)
- **Screen Readers**: ARIA labels on all interactive elements
- **Focus Management**: Trap focus within dialog, restore on close
- **Color Contrast**: WCAG 2.1 AA compliance (4.5:1 ratio)

### Implementation:
- Use Spartan UI Dialog component (built-in accessibility)
- Add `role="dialog"` and `aria-labelledby` attributes
- Implement focus trap using CDK FocusTrap
- Provide keyboard shortcuts (Ctrl+S to save, Esc to close)
- Add loading announcements for screen readers

### Best Practices:
- Test with screen readers (NVDA, JAWS, VoiceOver)
- Ensure all form fields have labels
- Provide error messages in accessible format
- Use semantic HTML elements
- Test keyboard-only navigation

---

## 10. Security Considerations

### Decisions:
- **Input Sanitization**: Sanitize all user inputs (URL, title, description, notes)
- **XSS Prevention**: Escape HTML in metadata responses
- **CSRF Protection**: Use CSRF tokens for state-changing operations
- **Rate Limiting**: Prevent abuse of metadata fetch and upload endpoints
- **File Validation**: Whitelist file types, scan for malware

### Implementation:
- Use `class-validator` for DTO validation
- Implement `helmet.js` for security headers
- Use `express-rate-limit` for API rate limiting
- Validate image files on both client and server
- Implement JWT authentication on all endpoints

### Best Practices:
- Never trust client-side validation alone
- Log suspicious activity (rapid requests, invalid inputs)
- Implement CAPTCHA for high-volume users
- Use HTTPS for all communications
- Regular security audits and dependency updates

---

## Summary

All technical decisions have been researched and documented. Key technologies selected:
- **Metadata Extraction**: Cheerio + Axios (server-side)
- **Image Storage**: Cloud storage with presigned URLs
- **State Management**: NgRx Signals
- **API Design**: RESTful with clear separation
- **Testing**: Jest + Playwright with 80%+ coverage

**Next Phase**: Proceed to Phase 1 (Design) to create data models and API contracts.

