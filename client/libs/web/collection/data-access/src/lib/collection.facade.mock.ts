import { signalState } from "@ngrx/signals";

export const adapter: EntityAdapter<User> = createEntityAdapter<User>({
  selectId: selectUserId,
  sortComparer: sortByName,
});

export class CollectionMockFacade {
  state = signalState({
    items: [],
  });


  
}
