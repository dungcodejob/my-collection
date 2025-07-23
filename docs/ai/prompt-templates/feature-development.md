# Feature Development Prompt Template

## 🎯 Context
**Project**: My Collection - Bookmark Management System
**Architecture**: Nx Monorepo, Angular 20+, NgRx Signals, NestJS
**UI Library**: Spartan UI + Tailwind CSS

## 📋 Template Usage

### 🎨 Frontend Feature Development

```
Context: My Collection Angular 20+ app with NgRx Signals and Spartan UI

Task: Create [FEATURE_NAME] feature with complete implementation

Requirements:
Frontend Components:
- [FEATURE_NAME]ListComponent:
* Display list with pagination
* Search and filter functionality
* Sorting options
* Loading states
* Empty states
* Error handling

- [FEATURE_NAME]DetailComponent:

* Form validation
* Save/Cancel actions
* Delete confirmation
* Loading states

- [FEATURE_NAME]CreateComponent:
* Creation form
* Validation
* Success/Error feedback

State Management:
- [FEATURE_NAME]Store with NgRx Signals:
* State: items[], loading, error, selectedItem, filters
* Computed: filteredItems, itemCount, hasItems
* Methods: load, create, update, delete, setFilter

Service Layer:
- [FEATURE_NAME]Service:
* HTTP calls with proper error handling
* Response mapping
* Type safety with DTOs

Architecture Requirements:
- Standalone components with OnPush

- Spartan UI components
- Tailwind CSS styling
- Accessibility compliance
- TypeScript strict mode
- Proper error boundaries

Integration:
- Routing configuration
- Navigation integration
- Permission checks (if needed)
- API integration

Reference Patterns:
- Reference bookmark feature structure
- Use existing UI patterns


Testing:
- Component tests with Angular Testing Library
- Service tests with HttpClientTestingModule
- Store tests with NgRx Signals testing
- E2E tests outline

Documentation:
- Component documentation
- API integration docs
- Usage examples
```

### 🔧 Backend Feature Development

```
Context: My Collection NestJS backend với MikroORM và CQRS

Task: Tạo [FEATURE_NAME] backend module với complete implementation

Requirements:
Database Layer:
- [FEATURE_NAME] Entity:
  * MikroORM decorators
  * Proper field types
  * Relationships với existing entities
  * Validation constraints
  * Timestamps
  * Soft delete (nếu cần)

DTOs:
- Create[FEATURE_NAME]Dto
- Update[FEATURE_NAME]Dto
- [FEATURE_NAME]ResponseDto
- [FEATURE_NAME]QueryDto (cho filtering/pagination)

Controller Layer:
- [FEATURE_NAME]Controller:
  * RESTful endpoints
  * Swagger documentation
  * JWT authentication
  * Input validation
  * Error handling
  * Proper HTTP status codes

Service Layer:
- [FEATURE_NAME]Service:
  * CRUD operations
  * Business logic
  * Error handling với proper exceptions
  * Logging với NestJS Logger
  * Transaction support

API Endpoints:
- GET /[feature-name] - List với pagination, search, filter
- GET /[feature-name]/:id - Get by ID
- POST /[feature-name] - Create
- PUT /[feature-name]/:id - Update
- DELETE /[feature-name]/:id - Delete
- [Additional endpoints nếu cần]

Architecture Requirements:
- CQRS pattern compliance
- Proper dependency injection
- Error handling strategy
- Logging strategy
- Validation pipes
- Guards (nếu cần)

Integration:
- Database migrations
- Seeding data (nếu cần)
- API documentation
- Error response format

Reference Patterns:
- Tham khảo bookmark module structure
- Follow existing naming conventions
- Use established patterns

Testing:
- Unit tests cho service
- Integration tests cho controller
- E2E tests cho API endpoints

Documentation:
- API documentation
- Database schema docs
- Business logic documentation
```

## 🎨 Component-Specific Templates

### 📱 UI Component Template

```
Context: My Collection UI component với Spartan UI

Task: Tạo [COMPONENT_NAME] component

Specifications:
- Component Type: [Presentational/Container/Feature]
- Input Signals: [list inputs với types]
- Output Signals: [list outputs với types]
- Computed Properties: [derived state]

UI Requirements:
- Spartan UI components: [specific components]
- Tailwind CSS classes
- Responsive design
- Dark/Light theme support
- Accessibility features (ARIA labels, keyboard navigation)

Functionality:
- [Specific behaviors]
- [User interactions]
- [State changes]

Integration:
- Parent component integration
- Service dependencies
- Store integration (nếu cần)

Reference: Tham khảo [SIMILAR_COMPONENT] pattern
```

### 🗄️ Service Template

```
Context: My Collection service layer

Task: Tạo [SERVICE_NAME] service

Type: [Frontend Angular Service / Backend NestJS Service]

Frontend Service (nếu Angular):
- Injectable với providedIn: 'root'
- HTTP client integration
- API endpoints: [list endpoints]
- Error handling strategy
- Response mapping
- Type safety với DTOs
- Caching strategy (nếu cần)

Backend Service (nếu NestJS):
- Injectable decorator
- Repository dependencies
- Business logic methods
- Error handling với exceptions
- Logging integration
- Transaction support
- Validation logic

Methods:
- [List methods với signatures]
- [Error scenarios]
- [Return types]

Integration:
- Dependencies: [list dependencies]
- Used by: [list consumers]

Reference: Tham khảo [SIMILAR_SERVICE] implementation
```

## 🧪 Testing Templates

### 🔬 Component Testing Template

```
Context: My Collection component testing

Task: Tạo comprehensive tests cho [COMPONENT_NAME]

Test Categories:
1. Rendering Tests:
   - Component renders correctly
   - Input signals display properly
   - Computed properties work
   - Conditional rendering

2. Interaction Tests:
   - User events trigger outputs
   - Form interactions
   - Button clicks
   - Keyboard navigation

3. Integration Tests:
   - Service integration
   - Store integration
   - Router integration

4. Accessibility Tests:
   - ARIA attributes
   - Keyboard navigation
   - Screen reader compatibility

Test Setup:
- TestBed configuration
- Mock dependencies
- Test data setup
- Utility functions

Reference: Tham khảo [SIMILAR_COMPONENT] test patterns
```

### 🔧 Service Testing Template

```
Context: My Collection service testing

Task: Tạo tests cho [SERVICE_NAME]

Frontend Service Tests (Angular):
- HTTP client mocking
- Success scenarios
- Error scenarios
- Response mapping
- Cache behavior (nếu có)

Backend Service Tests (NestJS):
- Repository mocking
- Business logic validation
- Error handling
- Transaction behavior
- Logging verification

Test Structure:
- Setup và teardown
- Mock configurations
- Test data
- Assertion patterns

Reference: Tham khảo [SIMILAR_SERVICE] test implementation
```

## 📝 Usage Instructions

1. **Copy Template**: Chọn template phù hợp
2. **Replace Placeholders**: Thay thế [PLACEHOLDERS] bằng values cụ thể
3. **Customize Requirements**: Điều chỉnh requirements theo needs
4. **Add Context**: Thêm project-specific context
5. **Execute**: Sử dụng với Trae AI

## 🎯 Best Practices

- **Be Specific**: Càng chi tiết càng tốt
- **Reference Existing**: Luôn reference similar implementations
- **Include Testing**: Đừng quên testing requirements
- **Document Integration**: Specify how components integrate
- **Consider Performance**: Include performance considerations

---

**Cập nhật lần cuối**: $(date)
**Template Version**: 1.0.0