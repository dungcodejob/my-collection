import { Injectable } from "@angular/core";
import { BaseMockApi } from "./base-mock.api";
import { EntityMockApi } from "./entity-mock.api";
import { CollectionDto } from "@nx/web-shared-models";

@Injectable()
export class CollectionMockApi extends EntityMockApi<CollectionDto> {
  constructor() {
    super("collection");
  }

  //   findByQuery() {
  //     return this._get({
  //         url: ''
  //     })
  //   }
}
