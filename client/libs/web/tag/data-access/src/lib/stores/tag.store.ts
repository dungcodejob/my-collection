import { inject } from "@angular/core";
import { tapHandleApi } from "@client/web-core-http";
import { NamedStatusState, setStatus, withStatus } from "@client/web-shared-utils";
import { patchState, signalStore, withMethods, withState } from "@ngrx/signals";
import { rxMethod } from "@ngrx/signals/rxjs-interop";
import { of, pipe, switchMap } from "rxjs";
import { CreateTagRequest, Tag, TagFilter, UpdateTagRequest } from "../models";
import { TagAdapter } from "../services/tag.adapter";
import { TagApi } from "../services/tag.api";

export const tagStatusNames = {
  list: "list",
  create: "create",
  update: "update",
  delete: "delete",
} as const;

export type TagState = {
  tags: {
    [collectionId: string]: Tag[];
  };
};

export type TagStateWithFeature = TagState &
  NamedStatusState<typeof tagStatusNames.list> &
  NamedStatusState<typeof tagStatusNames.create> &
  NamedStatusState<typeof tagStatusNames.update> &
  NamedStatusState<typeof tagStatusNames.delete>;

const initialState: TagState = {
  tags: {},
};

export const TagStore = signalStore(
  withState(initialState),
  withStatus({
    names: [
      tagStatusNames.list,
      tagStatusNames.create,
      tagStatusNames.update,
      tagStatusNames.delete,
    ],
  }),
  withMethods((store, _tagApi = inject(TagApi), _tagAdapter = inject(TagAdapter)) => ({
    load: rxMethod<TagFilter>(
      pipe(
        switchMap(filter => {
          const collectionId = filter.collectionId;
          const currentTags = store.tags()[collectionId];

          if (currentTags && currentTags.length > 0) {
            return of(null);
          }

          return _tagApi.loadTags(filter).pipe(
            tapHandleApi({
              successFn: result =>
                patchState(store, {
                  tags: _tagAdapter.setTags(store.tags(), collectionId, result.items),
                }),
              statusFn: status =>
                patchState(store, setStatus(status, tagStatusNames.list)),
            })
          );
        })
      )
    ),
    create: rxMethod<{ request: CreateTagRequest }>(
      pipe(
        switchMap(({ request }) =>
          _tagApi.createTag(request).pipe(
            tapHandleApi({
              successFn: result =>
                patchState(store, {
                  tags: _tagAdapter.addTag(
                    store.tags(),
                    request.collectionId,
                    result.data
                  ),
                }),
              statusFn: status =>
                patchState(store, setStatus(status, tagStatusNames.create)),
            })
          )
        )
      )
    ),
    update: rxMethod<{ request: UpdateTagRequest }>(
      pipe(
        switchMap(({ request }) =>
          _tagApi.updateTag(request).pipe(
            tapHandleApi({
              successFn: result =>
                patchState(store, {
                  tags: _tagAdapter.updateTag(
                    store.tags(),
                    request.collectionId,
                    result.data
                  ),
                }),
              statusFn: status =>
                patchState(store, setStatus(status, tagStatusNames.update)),
            })
          )
        )
      )
    ),
    delete: rxMethod<{ id: string; collectionId: string }>(
      pipe(
        switchMap(({ id, collectionId }) =>
          _tagApi.deleteTag(id).pipe(
            tapHandleApi({
              successFn: () =>
                patchState(store, {
                  tags: _tagAdapter.deleteTag(store.tags(), collectionId, id),
                }),
              statusFn: status =>
                patchState(store, setStatus(status, tagStatusNames.delete)),
            })
          )
        )
      )
    ),
  }))
);
