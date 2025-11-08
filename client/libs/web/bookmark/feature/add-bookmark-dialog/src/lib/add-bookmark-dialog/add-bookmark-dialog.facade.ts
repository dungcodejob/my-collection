import { computed, inject } from "@angular/core";
import {
  BookmarkApi,
  BookmarkCreateDto,
  MetadataDto,
} from "@client/web-bookmark-data-access";
import { tapHandleApi } from "@client/web-core-http";
import {
  NamedStatusState,
  setError,
  setStatus,
  withStatus,
} from "@client/web-shared-utils";
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withProps,
  withState,
} from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { pipe, switchMap, tap } from "rxjs";

/**
 * T048-T052: AddBookmarkDialogStore
 * State management for the Add Bookmark Dialog feature
 */

export const addBookmarkDialogStatusNames = {
  fetchMetadata: "fetchMetadata",
  saveBookmark: "saveBookmark",
  checkDuplicate: "checkDuplicate",
} as const;

export type AddBookmarkDialogStateWithFeature = NamedStatusState<
  typeof addBookmarkDialogStatusNames.fetchMetadata
> &
  NamedStatusState<typeof addBookmarkDialogStatusNames.saveBookmark> &
  NamedStatusState<typeof addBookmarkDialogStatusNames.checkDuplicate>;

/**
 * T049: State properties
 */
type AddBookmarkDialogState = {
  // Form fields
  url: string;
  title: string;
  description: string;
  imageUrl: string;
  faviconUrl: string;
  siteName: string;
  notes: string;
  tags: string[];

  // Metadata
  metadata: MetadataDto | null;
  availableImages: string[];
  selectedImageIndex: number;

  // UI state
  error: string | null;

  // Duplicate detection
  isDuplicate: boolean;
  existingBookmark: {
    id: string;
    title: string;
    createdAt: string;
    imageUrl: string | null;
  } | null;
};

const initialState: AddBookmarkDialogState = {
  url: "",
  title: "",
  description: "",
  imageUrl: "",
  faviconUrl: "",
  siteName: "",
  notes: "",
  tags: [],
  metadata: null,
  availableImages: [],
  selectedImageIndex: 0,
  error: null,
  isDuplicate: false,
  existingBookmark: null,
};

export const AddBookmarkDialogFacade = signalStore(
  withState(initialState),
  withStatus({
    names: [
      addBookmarkDialogStatusNames.fetchMetadata,
      addBookmarkDialogStatusNames.saveBookmark,
      addBookmarkDialogStatusNames.checkDuplicate,
    ],
  }),
  withProps(() => ({
    _bookmarkApi: inject(BookmarkApi),
  })),
  /**
   * T050: Computed signals
   */
  withComputed(store => ({
    // Check if URL is valid
    isValidUrl: computed(() => {
      const url = store.url();
      if (!url) return false;
      try {
        new URL(url);
        return true;
      } catch {
        return false;
      }
    }),

    // Check if form is valid and can be saved
    // canSave: computed(() => {
    //   const title = store.title();
    //   const url = store.url();
    //   const isValidUrl = store.isValidUrl();
    //   return isValidUrl && title.trim().length > 0 && url.trim().length > 0;
    // }),
    canSave: computed(() => true), // TODO: Implement validation

    // Check if form has unsaved changes
    hasChanges: computed(() => {
      const url = store.url();
      const title = store.title();
      const description = store.description();
      const notes = store.notes();
      return url !== "" || title !== "" || description !== "" || notes !== "";
    }),

    // Get current selected image
    selectedImage: computed(() => {
      const images = store.availableImages();
      const index = store.selectedImageIndex();
      return images[index] || store.imageUrl() || null;
    }),
  })),
  withMethods(({ _bookmarkApi, ...store }) => ({
    /**
     * T051: Fetch metadata effect using rxMethod()
     */
    fetchMetadata: rxMethod<string>(
      pipe(
        tap(url => {
          // Clear previous error
          patchState(store, { error: null, url });
        }),
        switchMap(url =>
          _bookmarkApi.fetchMetadata(url).pipe(
            tapHandleApi({
              successFn: result => {
                const metadata = result.data;
                patchState(store, {
                  metadata,
                  title: metadata.title || "",
                  description: metadata.description || "",
                  imageUrl: metadata.image || "",
                  faviconUrl: metadata.favicon || "",
                  siteName: metadata.siteName || "",
                  availableImages: metadata.images || [],
                  selectedImageIndex: 0,
                  error: null,
                });
              },
              errorFn: error => {
                console.error("Failed to fetch metadata:", error);
                patchState(
                  store,
                  {
                    metadata: null,
                  },
                  setError(
                    new Error(
                      "Failed to fetch metadata. Please check the URL and try again."
                    ),
                    addBookmarkDialogStatusNames.fetchMetadata
                  )
                );
              },
              statusFn: status => {
                patchState(
                  store,
                  setStatus(status, addBookmarkDialogStatusNames.fetchMetadata)
                );
              },
            })
          )
        )
      )
    ),

    /**
     * T052: Save bookmark effect using rxMethod()
     */
    saveBookmark: rxMethod<void>(
      pipe(
        switchMap(() => {
          const request: BookmarkCreateDto = {
            url: store.url(),
            title: store.title(),
            description: store.description() || undefined,
            imageUrl: store.selectedImage() || undefined,
            faviconUrl: store.faviconUrl() || undefined,
            siteName: store.siteName() || undefined,
            notes: store.notes() || undefined,
            tags: store.tags().length > 0 ? store.tags() : undefined,
          };

          return _bookmarkApi.createBookmark(request).pipe(
            tapHandleApi({
              successFn: () => {
                // Reset form on success
                patchState(store, initialState);
              },
              errorFn: error => {
                console.error("Failed to save bookmark:", error);
                patchState(
                  store,
                  setError(
                    new Error("Failed to save bookmark. Please try again."),
                    addBookmarkDialogStatusNames.saveBookmark
                  )
                );
              },
              statusFn: status => {
                patchState(
                  store,
                  setStatus(status, addBookmarkDialogStatusNames.saveBookmark)
                );
              },
            })
          );
        })
      )
    ),

    /**
     * Check for duplicate URL
     */
    checkDuplicate: rxMethod<string>(
      pipe(
        switchMap(url =>
          _bookmarkApi.checkDuplicate(url).pipe(
            tapHandleApi({
              successFn: result => {
                patchState(store, {
                  isDuplicate: result.data.exists,
                  existingBookmark: result.data.bookmark,
                });
              },
              errorFn: error => {
                console.error("Failed to check duplicate:", error);
              },
              statusFn: status => {
                patchState(
                  store,
                  setStatus(status, addBookmarkDialogStatusNames.checkDuplicate)
                );
              },
            })
          )
        )
      )
    ),

    // Helper methods for form updates
    updateUrl: (url: string): void => patchState(store, { url }),
    updateTitle: (title: string): void => patchState(store, { title }),
    updateDescription: (description: string): void => patchState(store, { description }),
    updateNotes: (notes: string): void => patchState(store, { notes }),
    updateTags: (tags: string[]): void => patchState(store, { tags }),
    updateImageUrl: (imageUrl: string): void => patchState(store, { imageUrl }),
    selectImage: (index: number): void =>
      patchState(store, { selectedImageIndex: index }),

    // Reset form
    reset: (): void => patchState(store, initialState),

    // Clear error
    clearError: (): void => patchState(store, { error: null }),
  }))
);
