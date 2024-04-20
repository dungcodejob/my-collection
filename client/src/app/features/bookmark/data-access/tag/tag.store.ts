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

type TagState = {
  filter: TagFilterDto | null;
  result: TagVM | null;
};

const initialState: TagState = {
  filter: null,
  result: null,
};

export const TagStore = signalStore(
  withStatus(),
  withPagination(),
  withEntities<TagVM>(),
  withState<TagState>(initialState),
  withMethods(store => {
    const tagApi = injectTagApi();
    const toastService = inject(ToastService);

    return {
      ...store,
      enter: () => patchState(store, { result: null }),
      setFilter: (value: TagFilterDto | null) =>
        patchState(store, state => {
          return { filter: { ...state.filter, ...value } };
        }),
      load: rxMethod<void>(
        pipe(
          switchMap(() => {
            const filter = store.filter();
            const pagination = store.$pagination();
            if (filter) {
              return tagApi.findAll({ ...filter, ...pagination }).pipe(
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
