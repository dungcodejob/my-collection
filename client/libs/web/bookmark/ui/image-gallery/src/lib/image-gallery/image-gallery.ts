/**
 * T079-T086: Image Gallery Component
 * Displays a grid of images with selection capability
 * Features:
 * - Responsive grid layout
 * - Image selection with visual feedback
 * - Lazy loading with IntersectionObserver
 * - Error handling for broken images
 * - Accessibility support
 */
import { NgOptimizedImage } from "@angular/common";
import { Component, input, OnDestroy, OnInit, output, signal } from "@angular/core";
@Component({
  selector: "mc-image-gallery",
  standalone: true,
  imports: [NgOptimizedImage],
  templateUrl: "./image-gallery.html",
  styleUrl: "./image-gallery.css",
})
export class ImageGallery implements OnInit, OnDestroy {
  readonly images = input<string[]>([]);
  readonly selectedIndex = input<number>(0);
  readonly placeholderImage = input<string>("assets/images/placeholder.png");
  readonly columns = input<number>(4);
  readonly imageSelected = output<number>();
  readonly imageError = output<{ index: number; url: string }>();
  readonly loadedImages = signal<Set<number>>(new Set());

  /**
   * IntersectionObserver for lazy loading
   */
  private _intersectionObserver?: IntersectionObserver;

  ngOnInit(): void {
    this.setupLazyLoading();
  }

  ngOnDestroy(): void {
    this._intersectionObserver?.disconnect();
  }

  /**
   * T084: Setup lazy loading with IntersectionObserver
   */
  private setupLazyLoading(): void {
    if (!("IntersectionObserver" in window)) {
      // Fallback: load all images immediately if IntersectionObserver not supported
      this.loadedImages.set(new Set(this.images().map((_, i) => i)));
      return;
    }

    this._intersectionObserver = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const index = parseInt(entry.target.getAttribute("data-index") || "0", 10);
            this.loadedImages.update(loaded => {
              const newSet = new Set(loaded);
              newSet.add(index);
              return newSet;
            });
            this._intersectionObserver?.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "50px",
        threshold: 0.01,
      }
    );
  }

  /**
   * T082: Handle image selection
   */
  onImageClick(index: number): void {
    if (index >= 0 && index < this.images.length) {
      this.imageSelected.emit(index);
    }
  }

  /**
   * Handle image load error
   */
  onImageError(index: number, url: string): void {
    this.imageError.emit({ index, url });
  }

  /**
   * Check if image should be loaded (for lazy loading)
   */
  shouldLoadImage(index: number): boolean {
    return this.loadedImages().has(index);
  }

  /**
   * Track by function for ngFor performance
   */
  trackByIndex(index: number): number {
    return index;
  }

  /**
   * Setup observer for lazy loading element
   */
  setupObserver(element: HTMLElement, index: number): void {
    if (this._intersectionObserver) {
      element.setAttribute("data-index", index.toString());
      this._intersectionObserver.observe(element);
    }
  }
}
