import { computed, inject } from "@angular/core";
import {
  BookmarkApi,
  BookmarkCreateDto,
  BookmarkDto,
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
import { pipe, switchMap } from "rxjs";

/**
 * T048-T052: AddBookmarkDialogStore
 * State management for the Add Bookmark Dialog feature
 */

export const addBookmarkDialogStatusNames = {
  fetchMetadata: "fetchMetadata",
  saveBookmark: "saveBookmark",
  checkDuplicate: "checkDuplicate",
  uploadImage: "uploadImage",
  validateImageUrl: "validateImageUrl",
} as const;

export type AddBookmarkDialogStateWithFeature = NamedStatusState<
  typeof addBookmarkDialogStatusNames.fetchMetadata
> &
  NamedStatusState<typeof addBookmarkDialogStatusNames.saveBookmark> &
  NamedStatusState<typeof addBookmarkDialogStatusNames.checkDuplicate> &
  NamedStatusState<typeof addBookmarkDialogStatusNames.uploadImage> &
  NamedStatusState<typeof addBookmarkDialogStatusNames.validateImageUrl>;

/**
 * T049: State properties
 * T129: Add image upload state
 */
type AddBookmarkDialogState = {
  // Metadata
  metadata: MetadataDto | null;

  selectedImageIndex: number;

  // UI state
  error: string | null;

  // Duplicate detection
  isDuplicate: boolean;
  existingBookmark: BookmarkDto | null;

  // T129: Image upload state
  customImageUrl: string;
  customImageFile: File | null;
  uploadProgress: number;
  imageError: string | null;
  defaultImageUrl: string; // Store original fetched image

  // T147, T148: Duplicate confirmation state
  showDuplicateConfirmation: boolean;
  duplicateBookmark: BookmarkDto | null;
};

const initialState: AddBookmarkDialogState = {
  metadata: null,
  selectedImageIndex: 0,
  error: null,
  isDuplicate: false,
  existingBookmark: null,
  customImageUrl: "",
  customImageFile: null,
  uploadProgress: 0,
  imageError: null,
  defaultImageUrl: "",
  showDuplicateConfirmation: false,
  duplicateBookmark: null,
};

export const AddBookmarkDialogFacade = signalStore(
  withState(initialState),
  withStatus({
    names: [
      addBookmarkDialogStatusNames.fetchMetadata,
      addBookmarkDialogStatusNames.saveBookmark,
      addBookmarkDialogStatusNames.checkDuplicate,
      addBookmarkDialogStatusNames.uploadImage,
      addBookmarkDialogStatusNames.validateImageUrl,
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
    // isValidUrl: computed(() => {
    //   const url = store.url();
    //   if (!url) return false;
    //   try {
    //     new URL(url);
    //     return true;
    //   } catch {
    //     return false;
    //   }
    // }),

    // Check if form is valid and can be saved
    // canSave: computed(() => {
    //   const title = store.title();
    //   const url = store.url();
    //   const isValidUrl = store.isValidUrl();
    //   return isValidUrl && title.trim().length > 0 && url.trim().length > 0;
    // }),
    canSave: computed(() => true), // TODO: Implement validation

    // Check if form has unsaved changes
    // Get current selected image

    // Check if user has set a custom image
    hasCustomImage: computed(() => {
      const customUrl = store.customImageUrl();
      const customFile = store.customImageFile();
      return !!customUrl || !!customFile;
    }),
    availableImages: computed(() => {
      const metadata = store.metadata();
      return metadata?.images || [];
    }),
  })),
  withMethods(({ _bookmarkApi, ...store }) => ({
    /**
     * T051: Fetch metadata effect using rxMethod()
     */
    fetchMetadata: rxMethod<string>(
      pipe(
        switchMap(url =>
          _bookmarkApi.fetchMetadata(url).pipe(
            tapHandleApi({
              prefixFn: () => {
                patchState(store, { error: null, metadata: null });
              },
              successFn: result => {
                const metadata = result.data;
                const defaultImage = metadata.image || "";
                patchState(store, {
                  metadata,

                  selectedImageIndex: 0,
                  error: null,
                  defaultImageUrl: defaultImage, // Store for revert functionality
                  customImageUrl: "", // Reset custom image
                  customImageFile: null,
                  imageError: null,
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
    saveBookmark: rxMethod<BookmarkCreateDto>(
      pipe(
        switchMap(request => {
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
     * T141: Add duplicate check before save
     */
    checkDuplicate: rxMethod<string>(
      pipe(
        switchMap(url =>
          _bookmarkApi.checkDuplicate(url).pipe(
            tapHandleApi({
              successFn: result => {
                patchState(store, {
                  isDuplicate: !!result.data,
                  existingBookmark: result.data || null,
                  // T147: Show duplicate confirmation if duplicate found
                  showDuplicateConfirmation: !!result.data,
                  duplicateBookmark: result.data || null,
                });
              },
              errorFn: error => {
                console.error("Failed to check duplicate:", error);
                // On error, allow save to proceed
                patchState(store, {
                  isDuplicate: false,
                  showDuplicateConfirmation: false,
                });
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

    selectImage: (index: number): void =>
      patchState(store, { selectedImageIndex: index }),

    /**
     * T122, T123: Handle file selection and validation
     */
    handleFileSelection: (file: File): void => {
      // T123: Validate file
      const maxSize = 5 * 1024 * 1024; // 5MB
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      if (!allowedTypes.includes(file.type)) {
        patchState(store, {
          imageError: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
        });
        return;
      }

      if (file.size > maxSize) {
        patchState(store, {
          imageError: `File size exceeds 5MB limit. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`,
        });
        return;
      }

      // File is valid, create preview URL
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>): void => {
        const imageUrl = e.target?.result as string;
        patchState(store, {
          customImageFile: file,
          customImageUrl: imageUrl,
          imageError: null,
        });
      };
      reader.readAsDataURL(file);
    },

    /**
     * T126, T127: Handle custom image URL input and validation
     */
    setCustomImageUrl: (url: string): void => {
      patchState(store, {
        customImageUrl: url,
        customImageFile: null,
        imageError: null,
      });
    },

    /**
     * T128: Revert to default fetched image
     */
    revertToDefaultImage: (): void => {
      patchState(store, {
        customImageUrl: "",
        customImageFile: null,
        imageError: null,
        selectedImageIndex: 0,
      });
    },

    /**
     * T130: Upload image effect (simplified - using data URL for now)
     * In production, this would upload to S3 via presigned URL
     */
    uploadImage: rxMethod<File>(
      pipe(
        switchMap(file => {
          // For now, we're using data URLs (base64)
          // In production, implement actual S3 upload with presigned URL
          return new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e: ProgressEvent<FileReader>): void => {
              resolve(e.target?.result as string);
            };
            reader.onerror = (): void => reject(new Error("Failed to read file"));
            reader.readAsDataURL(file);
          });
        })
      )
    ),

    /**
     * T131: Validate image URL effect
     * Checks if the URL is accessible and is a valid image
     */
    validateImageUrl: (url: string): void => {
      if (!url) {
        patchState(store, { imageError: null });
        return;
      }

      // Basic URL validation
      try {
        new URL(url);
      } catch {
        patchState(store, { imageError: "Invalid URL format" });
        return;
      }

      // In production, call backend API to validate image URL
      // For now, just check if it looks like an image URL
      const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
      const hasImageExtension = imageExtensions.some(ext =>
        url.toLowerCase().includes(ext)
      );

      if (!hasImageExtension) {
        patchState(store, {
          imageError:
            "URL does not appear to be an image. Please provide a direct image URL.",
        });
      } else {
        patchState(store, { imageError: null });
      }
    },

    /**
     * T146: Dismiss duplicate confirmation dialog
     */
    dismissDuplicateConfirmation: (): void => {
      patchState(store, {
        showDuplicateConfirmation: false,
      });
    },

    /**
     * T146: Save bookmark anyway despite duplicate
     */
    saveAnyway: (): void => {
      patchState(store, {
        showDuplicateConfirmation: false,
        isDuplicate: false,
      });
      // Trigger save after dismissing confirmation
      // The component will handle calling saveBookmark()
    },

    // Reset form
    reset: (): void => patchState(store, initialState),

    // Clear error
    clearError: (): void => patchState(store, { error: null }),
  }))
);
