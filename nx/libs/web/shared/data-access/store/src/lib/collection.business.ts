import { Injectable } from "@angular/core";
import { CollectionVM } from "@nx/web-shared-models";
import { clamp } from "@nx/web-shared-utils";

@Injectable({ providedIn: "root" })
export class CollectionBusiness {
  move(entities: CollectionVM[], fromIndex: number, toIndex: number): CollectionVM[] {
    const newEntities = structuredClone(entities);

    const from = clamp(fromIndex, entities.length - 1);
    const to = clamp(toIndex, entities.length - 1);

    if (from === to) {
      return newEntities;
    }

    const target = newEntities[from];
    const delta = to < from ? -1 : 1;

    for (let i = from; i !== to; i += delta) {
      newEntities[i] = newEntities[i + delta];
    }

    newEntities[to] = target;

    return newEntities;
  }

  getPositionFromIndex(
    entities: CollectionVM[],
    fromIndex: number,
    toIndex: number
  ): string[] {
    let prevPosition = "";
    let nextPosition = "";
    if (fromIndex < toIndex) {
      prevPosition = entities[toIndex]?.position ?? "";
      nextPosition = entities[toIndex + 1]?.position ?? "";
    } else {
      prevPosition = entities[toIndex - 1]?.position ?? "";
      nextPosition = entities[toIndex]?.position ?? "";
    }

    return [prevPosition, nextPosition];
  }
}
