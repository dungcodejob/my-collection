# Image Gallery Component

A reusable, accessible image gallery component with lazy loading and selection capabilities.

## Features

- ✅ **Responsive Grid Layout** - Adapts to different screen sizes
- ✅ **Image Selection** - Click to select with visual feedback
- ✅ **Lazy Loading** - Uses IntersectionObserver for performance
- ✅ **Error Handling** - Graceful fallback for broken images
- ✅ **Accessibility** - Full keyboard navigation and ARIA support
- ✅ **Customizable** - Configurable columns, placeholder, and styling
- ✅ **Performance Optimized** - TrackBy, lazy loading, and efficient rendering

## Installation

The component is already available in the bookmark UI library:

```typescript
import { ImageGallery } from "@client/web-bookmark-ui-image-gallery";
```

## Usage

### Basic Usage

```typescript
import { Component } from "@angular/core";
import { ImageGallery } from "@client/web-bookmark-ui-image-gallery";

@Component({
  selector: "app-bookmark-form",
  standalone: true,
  imports: [ImageGallery],
  template: `
    <mc-image-gallery
      [images]="imageUrls"
      [selectedIndex]="selectedImageIndex"
      (imageSelected)="onImageSelected($event)"
    />
  `,
})
export class BookmarkFormComponent {
  imageUrls = [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg",
  ];

  selectedImageIndex = 0;

  onImageSelected(index: number) {
    this.selectedImageIndex = index;
    console.log("Selected image:", this.imageUrls[index]);
  }
}
```

### Advanced Usage with Error Handling

```typescript
import { Component } from "@angular/core";
import { ImageGallery } from "@client/web-bookmark-ui-image-gallery";

@Component({
  selector: "app-advanced-gallery",
  standalone: true,
  imports: [ImageGallery],
  template: `
    <mc-image-gallery
      [images]="imageUrls"
      [selectedIndex]="selectedImageIndex"
      [columns]="4"
      [placeholderImage]="customPlaceholder"
      (imageSelected)="onImageSelected($event)"
      (imageError)="onImageError($event)"
    />
  `,
})
export class AdvancedGalleryComponent {
  imageUrls: string[] = [];
  selectedImageIndex = 0;
  customPlaceholder = "assets/images/custom-placeholder.png";

  onImageSelected(index: number) {
    this.selectedImageIndex = index;
  }

  onImageError(event: { index: number; url: string }) {
    console.error(`Image ${event.index} failed to load:`, event.url);
    // Remove broken image or handle error
    this.imageUrls = this.imageUrls.filter((_, i) => i !== event.index);
  }
}
```

### Integration with Add Bookmark Dialog

```typescript
import { Component, signal } from "@angular/core";
import { ImageGallery } from "@client/web-bookmark-ui-image-gallery";

@Component({
  selector: "app-add-bookmark-dialog",
  standalone: true,
  imports: [ImageGallery],
  template: `
    @if (metadata()?.images && metadata()!.images.length > 0) {
      <div class="space-y-2">
        <label>Select Thumbnail</label>

        <mc-image-gallery
          [images]="metadata()!.images"
          [selectedIndex]="selectedImageIndex()"
          (imageSelected)="onImageSelected($event)"
        />
      </div>
    }
  `,
})
export class AddBookmarkDialogComponent {
  metadata = signal<{ images: string[] } | null>(null);
  selectedImageIndex = signal(0);

  onImageSelected(index: number) {
    this.selectedImageIndex.set(index);
  }
}
```

## API

### Inputs

| Input              | Type       | Default                           | Description                                                       |
| ------------------ | ---------- | --------------------------------- | ----------------------------------------------------------------- |
| `images`           | `string[]` | `[]`                              | **Required**. Array of image URLs to display (max 10 recommended) |
| `selectedIndex`    | `number`   | `0`                               | Index of the currently selected image                             |
| `placeholderImage` | `string`   | `"assets/images/placeholder.png"` | URL for placeholder/error images                                  |
| `columns`          | `number`   | `4`                               | Number of columns in the grid (responsive)                        |

### Outputs

| Output          | Type                                         | Description                             |
| --------------- | -------------------------------------------- | --------------------------------------- |
| `imageSelected` | `EventEmitter<number>`                       | Emits when an image is selected (index) |
| `imageError`    | `EventEmitter<{index: number, url: string}>` | Emits when an image fails to load       |

## Features in Detail

### Responsive Grid Layout

The gallery automatically adjusts columns based on screen size:

- **Mobile** (< 640px): 2 columns
- **Tablet** (640px - 768px): 3 columns
- **Desktop** (> 768px): 4 columns (or custom)

```typescript
// Custom column configuration
<mc-image-gallery [columns]="3" [images]="images" />
```

### Lazy Loading

Images are loaded only when they enter the viewport using IntersectionObserver:

- **Performance**: Reduces initial page load time
- **Bandwidth**: Saves data by loading only visible images
- **Fallback**: Automatically loads all images if IntersectionObserver is not supported

### Image Selection

Multiple ways to select an image:

- **Click**: Click on any image
- **Keyboard**: Use Tab to navigate, Enter/Space to select
- **Visual Feedback**: Selected image has border and checkmark overlay

### Error Handling

Graceful handling of broken images:

- Automatically replaces broken images with placeholder
- Emits `imageError` event for custom handling
- Maintains gallery layout even with errors

### Accessibility

Full accessibility support:

- **ARIA Roles**: `radiogroup` and `radio` roles
- **Keyboard Navigation**: Tab, Enter, Space keys
- **Screen Readers**: Proper labels and states
- **Focus Management**: Visible focus indicators

## Styling

The component uses Tailwind CSS and can be customized:

### Custom Styles

```css
/* Override in your component CSS */
::ng-deep mc-image-gallery {
  .image-item {
    border-radius: 12px;
  }

  .image-item.selected {
    border-color: #your-color;
  }
}
```

### Tailwind Classes

The component uses these Tailwind utilities:

- `grid`, `gap-2` - Grid layout
- `aspect-video` - Image aspect ratio
- `border-primary` - Selection color
- `hover:shadow-md` - Hover effects
- `transition-all` - Smooth animations

## Performance

### Optimization Techniques

1. **Lazy Loading**: IntersectionObserver for on-demand loading
2. **TrackBy**: Efficient ngFor rendering
3. **Signals**: Reactive state management
4. **CSS Transforms**: Hardware-accelerated animations
5. **Loading Strategy**: Native lazy loading attribute

### Best Practices

```typescript
// Limit images to 10 for best performance
const images = allImages.slice(0, 10);

// Use optimized image URLs (CDN, compressed)
const optimizedImages = images.map(url =>
  `${url}?w=400&h=300&q=80`
);

// Handle errors to remove broken images
onImageError(event: { index: number }) {
  this.images = this.images.filter((_, i) => i !== event.index);
}
```

## Examples

### Example 1: Simple Gallery

```typescript
<mc-image-gallery
  [images]="['img1.jpg', 'img2.jpg', 'img3.jpg']"
  (imageSelected)="selectedIndex = $event"
/>
```

### Example 2: With Custom Columns

```typescript
<mc-image-gallery
  [images]="images"
  [columns]="3"
  [selectedIndex]="0"
/>
```

### Example 3: With Error Handling

```typescript
<mc-image-gallery
  [images]="images"
  (imageError)="handleError($event)"
  [placeholderImage]="'assets/fallback.png'"
/>
```

### Example 4: Reactive Form Integration

```typescript
@Component({
  template: `
    <form [formGroup]="form">
      <mc-image-gallery
        [images]="images"
        [selectedIndex]="form.get('imageIndex')?.value"
        (imageSelected)="form.patchValue({ imageIndex: $event })"
      />
    </form>
  `,
})
export class FormComponent {
  form = this.fb.group({
    imageIndex: [0],
  });
}
```

## Browser Support

- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **IE11**: Lazy loading fallback (loads all images)

## Testing

```typescript
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ImageGallery } from "./image-gallery";

describe("ImageGallery", () => {
  let component: ImageGallery;
  let fixture: ComponentFixture<ImageGallery>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ImageGallery],
    }).compileComponents();

    fixture = TestBed.createComponent(ImageGallery);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should emit imageSelected on click", () => {
    component.images = ["img1.jpg", "img2.jpg"];
    const spy = jest.spyOn(component.imageSelected, "emit");

    component.onImageClick(1);

    expect(spy).toHaveBeenCalledWith(1);
  });

  it("should handle image errors", () => {
    const spy = jest.spyOn(component.imageError, "emit");

    component.onImageError(0, "broken.jpg");

    expect(spy).toHaveBeenCalledWith({ index: 0, url: "broken.jpg" });
  });
});
```

## License

Part of the My Collection project.
