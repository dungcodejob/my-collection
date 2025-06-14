import { WritableSignal } from "@angular/core";
import { BaseMockApi } from "./base-mock.api";
import { Identity } from "@nx/web-shared-models";

export abstract class EntityMockApi<T extends { id: Identity }> extends BaseMockApi {
  protected _entities: WritableSignal<T[] | null>;

  constructor(key: string) {
    super();
    this._entities = this._storageService.form(key);
  }

  protected _addEntity(valueToAdd: T) {
    const newEntities = this._entities() ?? [];
    newEntities.push(valueToAdd);
    this._entities.set(newEntities);
  }

  protected _updateEntity(id: string, valueToUpdate: Partial<T>) {
    const newEntities = this._entities() ?? [];
    const indexToUpdate = newEntities.findIndex(entity => entity.id === id);
    if (indexToUpdate !== -1) {
      newEntities[indexToUpdate] = { ...newEntities[indexToUpdate], ...valueToUpdate };
      this._entities.set(newEntities);
    }
  }

  protected _deleteEntity(id: string) {
    let newEntities = this._entities() ?? [];
    newEntities = newEntities.filter(item => item.id !== id);
    this._entities.set(newEntities);
  }
}
