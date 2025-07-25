# Contributing Guide - Hướng dẫn Đóng góp

## 📋 Mục lục

1. [Tổng quan](#tổng-quan)
2. [Code of Conduct](#code-of-conduct)
3. [Getting Started](#getting-started)
4. [Development Workflow](#development-workflow)
5. [Coding Standards](#coding-standards)
6. [Commit Guidelines](#commit-guidelines)
7. [Pull Request Process](#pull-request-process)
8. [Documentation Guidelines](#documentation-guidelines)

## 🎯 Tổng quan

Chào mừng bạn đến với My Collection project! Chúng tôi rất vui khi bạn muốn đóng góp vào dự án. Tài liệu này sẽ hướng dẫn bạn quy trình đóng góp một cách hiệu quả và chuyên nghiệp.

### Các loại đóng góp

- 🐛 **Bug Reports**: Báo cáo lỗi và vấn đề
- 💡 **Feature Requests**: Đề xuất tính năng mới
- 📝 **Documentation**: Cải thiện tài liệu
- 🔧 **Code Contributions**: Sửa lỗi và phát triển tính năng
- 🧪 **Testing**: Viết và cải thiện tests
- 🎨 **UI/UX**: Cải thiện giao diện người dùng

## 📜 Code of Conduct

### Cam kết của chúng tôi

Chúng tôi cam kết tạo ra một môi trường mở và thân thiện cho tất cả mọi người, bất kể:
- Tuổi tác, giới tính, bản dạng giới tính
- Khuyết tật, ngoại hình
- Dân tộc, quốc tịch
- Tôn giáo, quan điểm chính trị
- Kinh nghiệm và trình độ

### Hành vi được khuyến khích

- ✅ Sử dụng ngôn ngữ chào đón và bao dung
- ✅ Tôn trọng quan điểm và kinh nghiệm khác nhau
- ✅ Chấp nhận phản hồi xây dựng một cách nhã nhặn
- ✅ Tập trung vào điều tốt nhất cho cộng đồng
- ✅ Thể hiện sự đồng cảm với các thành viên khác

### Hành vi không được chấp nhận

- ❌ Sử dụng ngôn ngữ hoặc hình ảnh khiêu dâm
- ❌ Trolling, bình luận xúc phạm hoặc tấn công cá nhân
- ❌ Quấy rối công khai hoặc riêng tư
- ❌ Công bố thông tin riêng tư của người khác
- ❌ Hành vi không phù hợp khác trong môi trường chuyên nghiệp

## 🚀 Getting Started

### Prerequisites

Đảm bảo bạn đã cài đặt:

```bash
# Node.js (version 18 hoặc cao hơn)
node --version

# npm (version 9 hoặc cao hơn)
npm --version

# Git
git --version

# Angular CLI
npm install -g @angular/cli
ng version
```

### Fork và Clone Repository

```bash
# 1. Fork repository trên GitHub
# Nhấn nút "Fork" trên trang GitHub của dự án

# 2. Clone fork của bạn
git clone https://github.com/YOUR_USERNAME/my-collection.git
cd my-collection

# 3. Thêm upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/my-collection.git

# 4. Verify remotes
git remote -v
```

### Setup Development Environment

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.example .env

# 3. Setup database
npm run db:setup

# 4. Run development server
npm run dev

# 5. Verify setup
npm run test
npm run lint
```

## 🔄 Development Workflow

### Branch Strategy

Chúng tôi sử dụng **Git Flow** workflow:

```
main
├── develop
│   ├── feature/bookmark-search
│   ├── feature/collection-sharing
│   └── feature/tag-management
├── release/v1.2.0
└── hotfix/critical-bug-fix
```

### Branch Naming Convention

```bash
# Feature branches
feature/short-description
feature/bookmark-search
feature/user-authentication

# Bug fix branches
bugfix/short-description
bugfix/login-validation
bugfix/memory-leak

# Hotfix branches
hotfix/critical-issue
hotfix/security-patch

# Release branches
release/v1.2.0
release/v2.0.0-beta
```

### Development Process

```bash
# 1. Sync với upstream
git checkout develop
git pull upstream develop

# 2. Tạo feature branch
git checkout -b feature/bookmark-search

# 3. Develop và commit changes
git add .
git commit -m "feat: implement bookmark search functionality"

# 4. Push branch
git push origin feature/bookmark-search

# 5. Tạo Pull Request trên GitHub
```

### Keeping Your Fork Updated

```bash
# Sync với upstream thường xuyên
git checkout develop
git pull upstream develop
git push origin develop

# Rebase feature branch
git checkout feature/your-feature
git rebase develop
```

## 📏 Coding Standards

### TypeScript/JavaScript Standards

```typescript
// ✅ Good: Proper typing và naming
interface BookmarkCreateRequest {
  title: string;
  url: string;
  description?: string;
  tags: string[];
}

class BookmarkService {
  private readonly logger = new Logger(BookmarkService.name);

  async createBookmark(
    userId: string, 
    request: BookmarkCreateRequest
  ): Promise<Bookmark> {
    try {
      // Implementation
    } catch (error) {
      this.logger.error('Failed to create bookmark', error);
      throw new BadRequestException('Unable to create bookmark');
    }
  }
}

// ❌ Bad: Poor typing và naming
class BookmarkSvc {
  async create(uid: string, req: any): Promise<any> {
    // Implementation without error handling
  }
}
```

### Angular Component Standards

```typescript
// ✅ Good: Standalone component với proper structure
@Component({
  selector: 'app-bookmark-card',
  standalone: true,
  imports: [CommonModule, RouterModule, HlmButtonDirective],
  template: `
    <article class="bookmark-card" [attr.data-testid]="'bookmark-' + bookmark().id">
      <header class="bookmark-header">
        <h3 class="bookmark-title">{{ bookmark().title }}</h3>
        <button 
          hlmBtn
          variant="ghost"
          size="sm"
          (click)="toggleFavorite()"
          [attr.aria-label]="favoriteLabel()"
          data-testid="favorite-button">
          <lucide-heart [class.filled]="bookmark().isFavorite" />
        </button>
      </header>
      
      <p class="bookmark-description">{{ bookmark().description }}</p>
      
      <footer class="bookmark-footer">
        <div class="bookmark-tags">
          @for (tag of bookmark().tags; track tag) {
            <span class="tag" [attr.data-testid]="'tag-' + tag">{{ tag }}</span>
          }
        </div>
        <time [dateTime]="bookmark().createdAt.toISOString()">
          {{ bookmark().createdAt | date:'short' }}
        </time>
      </footer>
    </article>
  `,
  styleUrl: './bookmark-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BookmarkCardComponent {
  bookmark = input.required<Bookmark>();
  
  favoriteToggled = output<string>();
  
  protected favoriteLabel = computed(() => 
    this.bookmark().isFavorite ? 'Remove from favorites' : 'Add to favorites'
  );

  protected toggleFavorite(): void {
    this.favoriteToggled.emit(this.bookmark().id);
  }
}
```

### NestJS Controller Standards

```typescript
// ✅ Good: Proper controller structure
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
@ApiTags('Bookmarks')
export class BookmarkController {
  constructor(private readonly bookmarkService: BookmarkService) {}

  @Get()
  @ApiOperation({ summary: 'Get user bookmarks' })
  @ApiResponse({ status: 200, type: [BookmarkResponseDto] })
  async getBookmarks(
    @CurrentUser() user: User,
    @Query() query: GetBookmarksQueryDto
  ): Promise<PaginatedResponse<BookmarkResponseDto>> {
    return this.bookmarkService.findUserBookmarks(user.id, query);
  }

  @Post()
  @ApiOperation({ summary: 'Create new bookmark' })
  @ApiResponse({ status: 201, type: BookmarkResponseDto })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createBookmark(
    @CurrentUser() user: User,
    @Body() createDto: CreateBookmarkDto
  ): Promise<BookmarkResponseDto> {
    return this.bookmarkService.create(user.id, createDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update bookmark' })
  @ApiParam({ name: 'id', description: 'Bookmark ID' })
  async updateBookmark(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateBookmarkDto
  ): Promise<BookmarkResponseDto> {
    return this.bookmarkService.update(user.id, id, updateDto);
  }
}
```

### CSS/SCSS Standards

```scss
// ✅ Good: BEM methodology và CSS custom properties
.bookmark-card {
  --card-padding: 1rem;
  --card-border-radius: 0.5rem;
  --card-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: var(--card-padding);
  border-radius: var(--card-border-radius);
  box-shadow: var(--card-shadow);
  background-color: var(--color-surface);
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &__header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 0.5rem;
  }

  &__title {
    margin: 0;
    font-size: 1.125rem;
    font-weight: 600;
    line-height: 1.4;
    color: var(--color-text-primary);
  }

  &__description {
    margin: 0;
    font-size: 0.875rem;
    line-height: 1.5;
    color: var(--color-text-secondary);
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: auto;
  }

  &__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .tag {
    padding: 0.125rem 0.5rem;
    font-size: 0.75rem;
    background-color: var(--color-primary-100);
    color: var(--color-primary-700);
    border-radius: 9999px;
    white-space: nowrap;
  }
}

// ❌ Bad: Inline styles và poor organization
.card {
  padding: 16px;
  margin: 8px;
  background: white;
  border: 1px solid #ccc;
}
.card h3 {
  color: #333;
}
.card p {
  color: #666;
}
```

### Testing Standards

```typescript
// ✅ Good: Comprehensive test structure
describe('BookmarkCardComponent', () => {
  let component: BookmarkCardComponent;
  let fixture: ComponentFixture<BookmarkCardComponent>;

  const mockBookmark: Bookmark = {
    id: 'test-id',
    title: 'Test Bookmark',
    url: 'https://example.com',
    description: 'Test description',
    tags: ['test', 'example'],
    isFavorite: false,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookmarkCardComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(BookmarkCardComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('bookmark', mockBookmark);
    fixture.detectChanges();
  });

  describe('Component Initialization', () => {
    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('should display bookmark information', () => {
      const titleElement = fixture.debugElement.query(
        By.css('[data-testid="bookmark-title"]')
      );
      const descriptionElement = fixture.debugElement.query(
        By.css('[data-testid="bookmark-description"]')
      );

      expect(titleElement.nativeElement.textContent).toBe('Test Bookmark');
      expect(descriptionElement.nativeElement.textContent).toBe('Test description');
    });
  });

  describe('User Interactions', () => {
    it('should emit favoriteToggled when favorite button clicked', () => {
      spyOn(component.favoriteToggled, 'emit');

      const favoriteButton = fixture.debugElement.query(
        By.css('[data-testid="favorite-button"]')
      );
      favoriteButton.nativeElement.click();

      expect(component.favoriteToggled.emit).toHaveBeenCalledWith('test-id');
    });

    it('should update favorite label based on bookmark state', () => {
      expect(component.favoriteLabel()).toBe('Add to favorites');

      fixture.componentRef.setInput('bookmark', { 
        ...mockBookmark, 
        isFavorite: true 
      });
      fixture.detectChanges();

      expect(component.favoriteLabel()).toBe('Remove from favorites');
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels', () => {
      const favoriteButton = fixture.debugElement.query(
        By.css('[data-testid="favorite-button"]')
      );

      expect(favoriteButton.nativeElement.getAttribute('aria-label'))
        .toBe('Add to favorites');
    });

    it('should have proper semantic structure', () => {
      const article = fixture.debugElement.query(By.css('article'));
      const header = fixture.debugElement.query(By.css('header'));
      const footer = fixture.debugElement.query(By.css('footer'));

      expect(article).toBeTruthy();
      expect(header).toBeTruthy();
      expect(footer).toBeTruthy();
    });
  });
});
```

## 📝 Commit Guidelines

### Conventional Commits

Chúng tôi sử dụng [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Commit Types

```bash
# Features
feat: add bookmark search functionality
feat(auth): implement OAuth2 login
feat(ui): add dark mode toggle

# Bug fixes
fix: resolve memory leak in bookmark service
fix(api): handle null values in user profile
fix(ui): correct button alignment on mobile

# Documentation
docs: update API documentation
docs(readme): add installation instructions
docs(contributing): clarify commit guidelines

# Refactoring
refactor: extract bookmark validation logic
refactor(store): simplify state management
refactor(components): use standalone components

# Performance
perf: optimize bookmark search query
perf(ui): implement virtual scrolling
perf(api): add response caching

# Tests
test: add unit tests for bookmark service
test(e2e): add bookmark creation flow
test(integration): add API endpoint tests

# Chores
chore: update dependencies
chore(ci): add automated testing
chore(build): optimize bundle size

# Styles
style: fix code formatting
style(css): update button styles
style(lint): fix ESLint warnings
```

### Commit Message Examples

```bash
# ✅ Good commits
feat: implement bookmark tagging system

Add ability to tag bookmarks with custom labels.
Users can now:
- Add multiple tags to bookmarks
- Filter bookmarks by tags
- Manage tag collections

Closes #123

fix(auth): resolve JWT token expiration handling

- Add automatic token refresh
- Improve error messages for expired tokens
- Add retry logic for failed requests

Breaking change: Auth service now requires refresh token

docs(api): add OpenAPI documentation for bookmark endpoints

- Document all CRUD operations
- Add request/response examples
- Include error response schemas

# ❌ Bad commits
fix stuff
update code
working on bookmarks
misc changes
```

### Commit Best Practices

```bash
# 1. Atomic commits - một commit cho một thay đổi logic
git add src/components/bookmark-card.component.ts
git commit -m "feat(ui): add bookmark card component"

git add src/services/bookmark.service.ts
git commit -m "feat(api): add bookmark service"

# 2. Use imperative mood
✅ "Add bookmark search"
❌ "Added bookmark search"
❌ "Adding bookmark search"

# 3. Limit subject line to 50 characters
✅ "feat: add bookmark search functionality"
❌ "feat: add comprehensive bookmark search functionality with advanced filtering options"

# 4. Separate subject from body with blank line
feat: implement user authentication

Add JWT-based authentication system with:
- Login/logout functionality
- Token refresh mechanism
- Role-based access control

# 5. Use body to explain what and why, not how
feat: add bookmark import feature

Allow users to import bookmarks from browser exports.
This addresses user feedback about migration difficulties
from other bookmark managers.

Supports Chrome, Firefox, and Safari export formats.
```

## 🔄 Pull Request Process

### Before Creating PR

```bash
# 1. Ensure code quality
npm run lint
npm run test
npm run build

# 2. Update documentation if needed
# 3. Add/update tests for new functionality
# 4. Sync with latest develop branch
git checkout develop
git pull upstream develop
git checkout feature/your-feature
git rebase develop
```

### PR Template

Khi tạo Pull Request, sử dụng template sau:

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Related Issues
Closes #123
Fixes #456
Related to #789

## Changes Made
- [ ] Added bookmark search functionality
- [ ] Updated API documentation
- [ ] Added unit tests
- [ ] Updated UI components

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Before:
[Screenshot]

After:
[Screenshot]

## Checklist
- [ ] My code follows the project's coding standards
- [ ] I have performed a self-review of my code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published
```

### PR Review Process

1. **Automated Checks**: CI/CD pipeline chạy tests và quality checks
2. **Code Review**: Ít nhất 1 reviewer approve
3. **Testing**: Manual testing nếu cần thiết
4. **Documentation**: Kiểm tra documentation updates
5. **Merge**: Squash and merge vào develop branch

### Review Guidelines

#### For Authors

```bash
# 1. Self-review trước khi submit
git diff develop...feature/your-feature

# 2. Ensure PR is focused và atomic
# 3. Provide clear description và context
# 4. Respond to feedback promptly
# 5. Update PR based on review comments
```

#### For Reviewers

```markdown
## Review Checklist

### Code Quality
- [ ] Code follows project standards
- [ ] No obvious bugs or security issues
- [ ] Proper error handling
- [ ] Appropriate logging

### Architecture
- [ ] Changes fit project architecture
- [ ] No unnecessary complexity
- [ ] Proper separation of concerns
- [ ] Follows SOLID principles

### Testing
- [ ] Adequate test coverage
- [ ] Tests are meaningful
- [ ] Edge cases covered
- [ ] No flaky tests

### Documentation
- [ ] Code is self-documenting
- [ ] Complex logic is commented
- [ ] API documentation updated
- [ ] README updated if needed

### Performance
- [ ] No obvious performance issues
- [ ] Efficient algorithms used
- [ ] Proper caching where applicable
- [ ] Database queries optimized
```

## 📚 Documentation Guidelines

### Documentation Types

1. **Code Documentation**: Inline comments và JSDoc
2. **API Documentation**: OpenAPI/Swagger specs
3. **User Documentation**: Feature guides và tutorials
4. **Developer Documentation**: Architecture và setup guides

### Writing Standards

```typescript
/**
 * Creates a new bookmark for the specified user.
 * 
 * @param userId - The ID of the user creating the bookmark
 * @param createDto - The bookmark creation data
 * @returns Promise resolving to the created bookmark
 * 
 * @throws {BadRequestException} When bookmark data is invalid
 * @throws {ConflictException} When bookmark URL already exists for user
 * 
 * @example
 * ```typescript
 * const bookmark = await bookmarkService.create('user-123', {
 *   title: 'Example Site',
 *   url: 'https://example.com',
 *   description: 'A useful example website'
 * });
 * ```
 */
async create(
  userId: string, 
  createDto: CreateBookmarkDto
): Promise<Bookmark> {
  // Implementation
}
```

### Documentation Updates

```bash
# Khi thêm feature mới
1. Update API documentation (OpenAPI specs)
2. Add/update user guides
3. Update architecture documentation
4. Add code examples

# Khi fix bugs
1. Update troubleshooting guide
2. Add known issues if applicable
3. Update FAQ if needed

# Khi refactor
1. Update architecture docs
2. Update code examples
3. Update setup instructions if needed
```

### Vietnamese Documentation Standards

```markdown
# ✅ Good Vietnamese documentation
## Tính năng Quản lý Bookmark

### Tổng quan
Tính năng này cho phép người dùng tạo, chỉnh sửa và quản lý bookmark một cách hiệu quả.

### Cách sử dụng
1. **Tạo bookmark mới**: Nhấn nút "Thêm bookmark"
2. **Chỉnh sửa**: Click vào icon chỉnh sửa
3. **Xóa**: Sử dụng menu context hoặc nút xóa

### Lưu ý
- URL phải hợp lệ và có thể truy cập
- Title không được để trống
- Mỗi user có thể có tối đa 1000 bookmarks

# ❌ Bad Vietnamese documentation
## bookmark feature

tạo bookmark mới bằng cách click button add. có thể edit và delete bookmark.

lưu ý: url phải đúng format.
```

---

*Cảm ơn bạn đã quan tâm đến việc đóng góp cho My Collection! Nếu có bất kỳ câu hỏi nào, vui lòng tạo issue hoặc liên hệ với team maintainers.*