import { Injectable } from "@angular/core";
import { CollectionVM } from "@nx/web-shared-models";
import { clamp } from "@nx/web-shared-utils";

@Injectable({ providedIn: "root" })
export class CollectionBusiness {
  move(items: CollectionVM[], fromIndex: number, toIndex: number): CollectionVM[] {
    if (
      fromIndex < 0 ||
      fromIndex >= items.length ||
      toIndex < 0 ||
      toIndex >= items.length
    ) {
      // console.error("Chỉ mục không hợp lệ");
      return items;
    }

    let changedItems = [...items];
    const todoItem = changedItems.splice(fromIndex, 1)[0];
    changedItems.splice(toIndex, 0, todoItem);
    changedItems = changedItems.map((item, index) => ({
      ...item,
      index: index,
    }));

    return changedItems;
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
