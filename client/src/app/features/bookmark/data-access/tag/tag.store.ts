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
import { TagFilterDto, TagQueryDto, TagVM } from "@shared/models";
import { ToastService } from "@shared/services";
import { prefix } from "@shared/utils";
import { EMPTY, catchError, pipe, switchMap, tap } from "rxjs";

import { injectTagApi } from "./tag.provider";

type TagState = {
  filter: TagFilterDto | null;
};

const initialState: TagState = {
  filter: null,
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
      setFilter: (filter: TagFilterDto | null) =>
        patchState(store, state => ({
          ...state,
          filter: { ...state.filter, ...filter },
        })),
      findAll: rxMethod<TagQueryDto>(
        pipe(
          switchMap(query => {
            const filter = store.filter();
            if (filter) {
              return tagApi.findAll(query).pipe(
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
    };
  })
);
