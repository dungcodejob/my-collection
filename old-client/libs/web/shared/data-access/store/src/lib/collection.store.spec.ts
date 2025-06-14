/* eslint-disable @typescript-eslint/no-unsafe-call */
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ActivatedRoute, Params, provideRouter } from "@angular/router";
import { faker } from "@faker-js/faker";
import { CollectionVM, CollectionVMBuilder } from "@nx/web-shared-models";
import { BehaviorSubject } from "rxjs";
import { CollectionStore } from "./collection.store";

describe("CollectionStore", () => {
  let collectionStore: InstanceType<typeof CollectionStore>;
  let params: BehaviorSubject<Params>;
  let builder: CollectionVMBuilder;

  beforeEach(() => {
    params = new BehaviorSubject<Params>({ id: faker.string.uuid() });
    builder = new CollectionVMBuilder();

    TestBed.configureTestingModule({
      providers: [
        CollectionStore,
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            params: params,
            snapshot: { params: params.value },
          },
        },
      ],
    });
    collectionStore = TestBed.inject(CollectionStore);
  });

  it("should be create", () => {
    expect(collectionStore).toBeTruthy();
  });

  describe("Computed", () => {
    it("$items should return the list of collections", () => {
      expect(collectionStore.$items()).toHaveLength(0);
    });

    it("$selectedId should return id of selected collection", fakeAsync(() => {
      const newId = faker.string.uuid();
      params.next({ id: newId });
      tick();
      expect(collectionStore.$selectedId()).toEqual(newId);
    }));

    it("$selectedEntity should return selected collection", fakeAsync(() => {
      const collection = builder.build();

      collectionStore.setItems([collection]);
      params.next({ id: collection.id });

      tick();
      expect(collectionStore.$selectedEntity()).toEqual(collection);
    }));
  });

  describe("addItem method", () => {
    it("should add collection into item state", () => {
      const itemToAdd = builder.build();
      const initialItems: CollectionVM[] = [builder.build(), builder.build()];
      const expectedItems: CollectionVM[] = [...initialItems, itemToAdd];

      collectionStore.setItems(initialItems);

      expect(collectionStore.$items()).toEqual(initialItems);
      expect(collectionStore.$items()).toHaveLength(initialItems.length);

      collectionStore.addItem(itemToAdd);

      expect(collectionStore.$items()).toEqual(expectedItems);
      expect(collectionStore.$items()).toHaveLength(expectedItems.length);
    });
  });

  describe("updateItem method", () => {
    it("should throw error if params are null or undefined", () => {
      let itemToUpdate = builder.build();
      expect(() => collectionStore.updateItem(null as any, itemToUpdate)).toThrow(
        "Id cannot be null or undefined"
      );
      expect(() => collectionStore.updateItem(itemToUpdate.id, undefined as any)).toThrow(
        "Updated item cannot be null or undefined"
      );
    });

    it("should update existing collection from the store", () => {
      let itemToUpdate = builder.build();
      const items: CollectionVM[] = [builder.build(), itemToUpdate, builder.build()];

      collectionStore.setItems(items);

      itemToUpdate = {
        ...itemToUpdate,
        title: faker.book.title(),
        icon: faker.string.symbol(4),
        position: faker.string.symbol(),
        updateAt: new Date(),
      };

      collectionStore.updateItem(itemToUpdate.id, itemToUpdate);

      const itemInStore = collectionStore
        .$items()
        .find(item => item.id === itemToUpdate.id);

      expect(itemInStore).toBeDefined();
      expect(itemInStore).toEqual(itemToUpdate);
    });

    it("should not affect the store if the collection id does not exist", () => {
      const initialItems: CollectionVM[] = [builder.build(), builder.build()];
      collectionStore.setItems(initialItems);
      collectionStore.updateItem(faker.string.uuid(), builder.build());

      expect(collectionStore.$items()).toEqual(initialItems);
      expect(collectionStore.$items()).toHaveLength(initialItems.length);
    });
  });

  describe("removeItem method", () => {
    it("should remove an existing collection from the store", () => {
      const itemToDelete = builder.build();
      const expectedItems: CollectionVM[] = [builder.build(), builder.build()];
      const initialItems: CollectionVM[] = [...expectedItems, itemToDelete];

      collectionStore.setItems(initialItems);
      collectionStore.deleteItem(itemToDelete.id);

      expect(collectionStore.$items()).toEqual(expectedItems);
      expect(collectionStore.$items()).toHaveLength(expectedItems.length);
    });

    it("should not affect the store if the collection id does not exist", () => {
      const initialItems: CollectionVM[] = [builder.build(), builder.build()];
      collectionStore.setItems(initialItems);
      collectionStore.deleteItem(faker.string.uuid());

      expect(collectionStore.$items()).toEqual(initialItems);
      expect(collectionStore.$items()).toHaveLength(initialItems.length);
    });
  });

  describe("move method", () => {
    it("should throw error if index are null or undefined", () => {
      expect(() => collectionStore.move(null as any, faker.number.int())).toThrow(
        "Index cannot be null or undefined"
      );

      expect(() => collectionStore.move(faker.number.int(), null as any)).toThrow(
        "Index cannot be null or undefined"
      );

      expect(() => collectionStore.move(null as any, null as any)).toThrow(
        "Index cannot be null or undefined"
      );
    });

    it("should swap positions of existing collection from the store", () => {
      const fromItem = builder.build();
      const toItem = builder.build();

      const initialItems: CollectionVM[] = [fromItem, toItem];
      const expectedItems: CollectionVM[] = [toItem, fromItem];

      collectionStore.setItems(initialItems);
      collectionStore.move(0, 1);

      expect(collectionStore.$items()).toEqual(expectedItems);
      expect(collectionStore.$items()).toHaveLength(expectedItems.length);
    });
  });
});
