import { inject } from "@angular/core";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { setAllEntities, withEntities } from "@ngrx/signals/entities";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import {
  setError,
  setFulfilled,
  setPending,
  withPagination,
  withStatus,
} from "@shared/data-access";
import { CreateTagDto, TagFilterDto, TagVM } from "@shared/models";
import { ToastService } from "@shared/services";
import { prefix } from "@shared/utils";
import { EMPTY, catchError, pipe, switchMap, tap } from "rxjs";

import { injectTagApi } from "./tag.provider";

interface TagState {
  collectionId: string | null;
  filter: TagFilterDto;
  result: TagVM | null;
}

const initialState: TagState = {
  collectionId: null,
  filter: {
    keyword: null,
  },
  result: null,
};

export const TagStore = signalStore(
  withState<TagState>(initialState),
  withEntities<TagVM>(),
  withStatus(),
  withPagination(),
  withMethods(store => {
    const tagApi = injectTagApi();
    const toastService = inject(ToastService);

    return {
      reset: () => patchState(store, { result: null }),
      setCollectionId: rxMethod<string | null>(value$ => {
        return value$.pipe(
          tap(value => {
            patchState(store, { collectionId: value });
          })
        );
      }),
      setFilter: (value: TagFilterDto | null) =>
        patchState(store, state => {
          return { filter: { ...state.filter, ...value } };
        }),
      load: rxMethod<void>(
        pipe(
          switchMap(() => {
            const filter = store.filter();
            const pagination = store.$pagination();
            const collectionId = store.collectionId();
            if (filter) {
              return tagApi.findAll({ collectionId, ...filter, ...pagination }).pipe(
                prefix(() => patchState(store, setPending())),
                tap({
                  next: res =>
                    patchState(store, setAllEntities(res.result.items), setFulfilled()),
                  error: err => patchState(store, setError(err)),
                }),
                catchError(() => EMPTY)
              );
            }

            return EMPTY;
          })
        )
      ),
      create: rxMethod<CreateTagDto>(
        pipe(
          switchMap(body =>
            tagApi.create(body).pipe(
              prefix(() => patchState(store, setPending())),
              tap({
                next: res => {
                  const data = res.result.data;
                  patchState(store, { result: data }, setFulfilled());
                  toastService.success(`Tag “${data.title}“ was created`);
                },
                error: err => {
                  const message = "Tag could not be created";
                  // TODO: using logger service
                  console.log(err);
                  patchState(store, setError(err));
                  toastService.error(message);
                },
              }),
              catchError(() => EMPTY)
            )
          )
        )
      ),
    };
  })
);
