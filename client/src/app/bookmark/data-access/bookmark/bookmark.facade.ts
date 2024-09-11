import { computed, inject, untracked } from "@angular/core";
import { ServerSideError } from "@core/http";
import {
  patchState,
  signalStore,
  withComputed,
  withHooks,
  withMethods,
  withState,
} from "@ngrx/signals";
import {
  addEntity,
  removeEntity,
  setAllEntities,
  updateEntity,
  withEntities,
} from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import {
  AppFacade,
  CollectionFacade,
  setError,
  setFulfilled,
  setPending,
  TagFacade,
  withPagination,
  withStatus,
} from "@shared/data-access";

import { ActivatedRoute, Router } from "@angular/router";
import { tapResponse } from "@ngrx/operators";
import { MessageKeys } from "@shared/constants";
import { PaginationMeta } from "@shared/data-access/pagination/pagination-name.type";
import {
  BookmarkFilterVM,
  BookmarkQueryDto,
  BookmarkQueryVM,
  BookmarkVM,
  CreateBookmarkDto,
  CreateBookmarkVM,
  UpdateBookmarkDto,
  UpdateBookmarkVM,
} from "@shared/models";
import { ToastService } from "@shared/services";
import { injectAutoEffect, injectQueryParams, isNotNil, prefix } from "@shared/utils";
import { filter, map, Observable, pipe, switchMap, tap } from "rxjs";
import { injectBookmarkApi } from "./bookmark.provider";

export const BookmarkViewOption = {
  Description: "Description",
  Tags: "Tags",
  Info: "Info",
  Cover: "Cover",
} as const;

export type BookmarkViewKey = keyof typeof BookmarkViewOption;
export type BookmarkVisibility = Record<BookmarkViewKey, boolean>;

interface BookmarkState {
  filter: BookmarkFilterVM;
  visibility: BookmarkVisibility;
}

const initialState: BookmarkState = {
  filter: {
    tags: [],
    keyword: null,
  },
  visibility: {
    [BookmarkViewOption.Description]: true,
    [BookmarkViewOption.Tags]: true,
    [BookmarkViewOption.Info]: true,
    [BookmarkViewOption.Cover]: true,
  },
};

export const BookmarkFacade = signalStore(
  withState<BookmarkState>(initialState),
  withEntities<BookmarkVM>(),
  withPagination(),
  withStatus(),
  withComputed(() => {
    const collectionFacade = inject(CollectionFacade);
    const tagFacade = inject(TagFacade);
    return {
      $collectionSelectedTitle: computed(
        () => collectionFacade.$selectedEntity()?.title ?? ""
      ),

      $collectionSelectedId: collectionFacade.$selectedId,
      $tagItems: tagFacade.entities,
    };
  }),
  withMethods(store => {
    const bookmarkApi = injectBookmarkApi();
    const appFacade = inject(AppFacade);
    const toastService = inject(ToastService);

    const useAppStatus = <T>() => {
      return (source$: Observable<T>) =>
        source$.pipe(
          prefix(() => appFacade.setStatus("pending")),
          tap({
            next: () => appFacade.setStatus("fulfilled"),
            error: error => appFacade.setStatus({ error: error }),
          })
        );
    };
    return {
      visibilityToggle: (key: keyof BookmarkVisibility) => {
        const visibility = store.visibility();
        patchState(store, {
          visibility: {
            ...visibility,
            [key]: !visibility[key],
          },
        });
      },
      setFilter: rxMethod<BookmarkFilterVM>(value$ => {
        return value$.pipe(
          tap(value => {
            const filter = { ...store.filter(), ...value };
            patchState(store, { filter });
            store.paginationReset();
          })
        );
      }),
      findAll: rxMethod<BookmarkQueryVM>(
        pipe(
          switchMap(vm => {
            const dto: BookmarkQueryDto = {
              ...vm,
              tagIds: vm.tags.map(tag => tag.id),
            };

            return bookmarkApi.findAll(dto).pipe(
              prefix(() => patchState(store, setPending())),
              tapResponse({
                next: res =>
                  patchState(store, setAllEntities(res.result.items), setFulfilled()),
                error: (err: Error) => patchState(store, setError(err)),
              })
            );
          })
        )
      ),
      create: rxMethod<CreateBookmarkVM>(
        pipe(
          switchMap(bookmarkToCreate => {
            const dto: CreateBookmarkDto = {
              ...bookmarkToCreate,
              collectionId: bookmarkToCreate.collection.id,
              tagIds: bookmarkToCreate.tags.map(tag => tag.id),
            };
            return bookmarkApi.create(dto).pipe(
              useAppStatus(),
              tapResponse({
                next: res => {
                  const data = res.result.data;
                  patchState(store, addEntity(data));

                  toastService.success(`Bookmark “${data.title}“ was created`);
                },
                error: () => {
                  const message = "Bookmark could not be created";
                  toastService.error(message);
                },
              })
            );
          })
        )
      ),
      update: rxMethod<UpdateBookmarkVM>(
        pipe(
          switchMap(bookmarkToUpdate => {
            const dto: UpdateBookmarkDto = {
              ...bookmarkToUpdate,
              tagIds: bookmarkToUpdate.tags.map(tag => tag.id),
            };
            return bookmarkApi.update(bookmarkToUpdate.id, dto).pipe(
              useAppStatus(),
              tapResponse({
                next: res => {
                  const data = res.result.data;

                  patchState(store, updateEntity({ id: data.id, changes: data }));

                  toastService.success(`Bookmark “${data.title}“ was updated`);
                },
                error: () => {
                  const message = "Bookmark could not be updated";
                  toastService.error(message);
                },
              })
            );
          })
        )
      ),
      delete: rxMethod<string>(
        pipe(
          map(id => store.entities().find(item => item.id === id)),
          filter(isNotNil),
          switchMap(bookmarkToDelete =>
            bookmarkApi.delete(bookmarkToDelete.id).pipe(
              useAppStatus(),
              tapResponse({
                next: () => {
                  patchState(store, removeEntity(bookmarkToDelete.id));
                  toastService.success(
                    `Bookmark “${bookmarkToDelete.title}“ was deleted`
                  );
                },
                error: (err: Error) => {
                  if (err instanceof ServerSideError) {
                    const Messages: Record<string, string> = {
                      [MessageKeys.Bookmark.NotExist]:
                        `Bookmark “${bookmarkToDelete.title}” to be deleted does not exist`,

                      default: `Bookmark “${bookmarkToDelete.title}” could not be deleted`,
                    };

                    const key = err.message;
                    const message = Messages[key] || Messages["default"];
                    toastService.error(message);
                  }
                },
              })
            )
          )
        )
      ),
    };
  }),
  withHooks(store => {
    const autoEffect = injectAutoEffect();

    const router = inject(Router);
    const route = inject(ActivatedRoute);
    const queryParams = injectQueryParams();
    const sync = () => {
      const { keyword, tags, pageSize, currentPage, totalCount } = queryParams();
      const filter: BookmarkFilterVM = {
        keyword: keyword ?? "",
        tags: tags ? JSON.parse(tags) : [],
      };

      const pagination: PaginationMeta = {
        pageSize: Number(pageSize),
        currentPage: Number(currentPage),
        totalCount: Number(totalCount),
      };

      store.setFilter(filter);
      store.setPagination(pagination);
    };

    return {
      onInit() {
        sync();
        autoEffect(() => {
          const pagination = store.$pagination();
          const filter = store.filter();
          console.log(filter);
          router.navigate([], {
            relativeTo: route,
            queryParams: { ...pagination, ...filter, tags: JSON.stringify(filter.tags) },
            queryParamsHandling: "merge",
          });
        });

        autoEffect(() => {
          const collectionId = store.$collectionSelectedId();
          const filter = store.filter();
          const pagination = store.$pagination();

          const query = {
            collectionId,
            ...filter,
            ...pagination,
          };
          untracked(() => store.findAll(query));
        });
      },
    };
  })
);
