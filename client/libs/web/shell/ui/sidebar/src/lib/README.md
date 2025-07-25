# Angular Sidebar Components

This library provides a complete sidebar navigation system for Angular applications, inspired by modern UI design patterns.

## Components

### AppSidebarComponent

The main sidebar component that contains all navigation elements.

**Usage:**

```html
<mc-app-sidebar />
```

**Features:**

- Collapsible sidebar with smooth animations
- Dark mode support
- Responsive design
- Keyboard navigation support
- Accessibility features

### TeamSwitcherComponent

Displays team information and allows team switching.

**Props:**

- `teams`: Array of team objects
- `isCollapsed`: Boolean indicating if sidebar is collapsed

### NavGroupComponent

Renders navigation groups with expandable menu items.

**Props:**

- `title`: Group title (optional)
- `items`: Array of menu items
- `isCollapsed`: Boolean indicating if sidebar is collapsed

**Features:**

- Expandable/collapsible menu items
- Keyboard shortcuts display
- Icon support
- Nested navigation

### NavUserComponent

Displays user information in the sidebar footer.

**Props:**

- `user`: User object with name, email, and avatar
- `isCollapsed`: Boolean indicating if sidebar is collapsed

### SeparatorComponent

A simple separator component for visual division.

**Props:**

- `orientation`: 'horizontal' | 'vertical' (default: 'horizontal')

## Data Interfaces

### MenuItem

```typescript
interface MenuItem {
  id: string;
  title: string;
  icon?: string;
  url?: string;
  shortcut?: string;
  children?: MenuItem[];
  groups?: MenuGroup[];
  isHidden?: boolean;
  isHideChildren?: boolean;
  isShowSubSidebar?: boolean;
  permissionKey?: string;
}
```

### Team

```typescript
interface Team {
  name: string;
  logo: string;
  plan: string;
}
```

### User

```typescript
interface User {
  name: string;
  email: string;
  avatar: string;
}
```

## Styling

The components use Tailwind CSS for styling and support both light and dark themes. The sidebar includes:

- Smooth transitions and animations
- Hover effects
- Focus states for accessibility
- Custom scrollbar styling
- Responsive design

## Demo

Use the `SidebarDemoComponent` to see the sidebar in action:

```html
<mc-sidebar-demo />
```

This provides a complete layout with the sidebar and main content area.

## Dependencies

- `@ng-icons/core` and `@ng-icons/lucide` for icons
- Tailwind CSS for styling
- Angular 20+ with signals support

## Accessibility

- ARIA labels and roles
- Keyboard navigation
- Focus management
- Screen reader support
- Semantic HTML structure
