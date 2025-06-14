import { CollectionFacade } from "./collection.facade";
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  HttpTestingController,
  provideHttpClientTesting,
} from "@angular/common/http/testing";
import { fakeAsync, TestBed, tick } from "@angular/core/testing";
import { ActivatedRoute, Params, provideRouter } from "@angular/router";
import { faker } from "@faker-js/faker";
import { CollectionApi } from "@nx/web-shared-api";
import {
  CollectionDtoBuilder,
  CollectionVM,
  CollectionVMBuilder,
} from "@nx/web-shared-models";
import { CollectionAdapter, ToastService } from "@nx/web-shared-services";
import { AppStore, CollectionBusiness, CollectionStore } from "@nx/web-shared-store";
import { BehaviorSubject, delay, mergeMap, of, switchMap, throwError, timer } from "rxjs";
import { ResponseBuilder } from "@nx/web-shared-http";

describe("CollectionFacade", () => {
  let collectionFacade: InstanceType<typeof CollectionFacade>;
  let collectionStore: InstanceType<typeof CollectionStore>;
  let collectionApi: CollectionApi;
  let params: BehaviorSubject<Params>;
  let vmBuilder: CollectionVMBuilder;
  let dtoBuilder: CollectionDtoBuilder;
  let collectionAdapter: CollectionAdapter;
  let httpTesting: HttpTestingController;
  let responseBuilder: ResponseBuilder;
  let appStore: InstanceType<typeof AppStore>;

  beforeEach(() => {
    params = new BehaviorSubject<Params>({ id: faker.string.uuid() });

    TestBed.configureTestingModule({
      providers: [
        provideHttpClientTesting(),
        {
          provide: CollectionApi,
          useValue: {
            create: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            move: jest.fn(),
          },
        },
        CollectionStore,
        CollectionFacade,
        CollectionBusiness,
        CollectionAdapter,
        AppStore,
        ToastService,
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

    vmBuilder = new CollectionVMBuilder();
    dtoBuilder = new CollectionDtoBuilder();
    responseBuilder = new ResponseBuilder();

    collectionApi = TestBed.inject(CollectionApi);
    collectionFacade = TestBed.inject(CollectionFacade);
    collectionStore = TestBed.inject(CollectionStore);
    collectionAdapter = TestBed.inject(CollectionAdapter);
    appStore = TestBed.inject(AppStore);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it("should be create", () => {
    expect(collectionFacade).toBeTruthy();
  });

  describe("Computed", () => {
    it("$items should return the list of collections", () => {
      expect(collectionFacade.$items()).toHaveLength(0);
    });

    it("$selectedId should return id of selected collection", fakeAsync(() => {
      const newId = faker.string.uuid();
      params.next({ id: newId });
      tick();
      expect(collectionFacade.$selectedId()).toEqual(newId);
    }));
  });

  describe("create method", () => {
    it("should add item and update status when the service call is successful", fakeAsync(() => {
      const itemToAdd = dtoBuilder.build();
      const res$ = responseBuilder.buildSuccess({ data: itemToAdd });

      jest.spyOn(collectionApi, "create").mockReturnValue(res$);

      collectionApi.create(itemToAdd);
      expect(collectionApi.create).toHaveBeenCalled();
      expect(collectionApi.create).toHaveBeenCalledWith(itemToAdd);

      collectionFacade.create(itemToAdd);

      tick(250);
      expect(collectionFacade.$isDetailPending()).toBe(true);
      expect(collectionFacade.$items()).toEqual([]);
      expect(collectionFacade.$items()).toHaveLength(0);

      tick(500);
      TestBed.flushEffects();

      let vm = collectionAdapter.toItemVM(itemToAdd);
      vm = { ...vm, index: vm.index - 1 };

      expect(collectionFacade.$isDetailPending()).toBe(false);
      expect(collectionFacade.$isDetailFulfilled()).toBe(true);
      expect(collectionFacade.$items()).toEqual([vm]);
      expect(collectionFacade.$items()).toHaveLength(1);
    }));

    it("should set error and update status when the service call is failed", fakeAsync(() => {
      const itemToAdd = dtoBuilder.build();
      const res$ = responseBuilder.buildFailed(500);
      jest.spyOn(collectionApi, "create").mockReturnValue(res$);

      collectionApi.create(itemToAdd);

      expect(collectionApi.create).toHaveBeenCalled();
      expect(collectionApi.create).toHaveBeenCalledWith(itemToAdd);

      collectionFacade.create(itemToAdd);

      tick(250);
      expect(collectionFacade.$isDetailPending()).toBe(true);
      expect(collectionFacade.$items()).toEqual([]);
      expect(collectionFacade.$items()).toHaveLength(0);

      tick(500);
      TestBed.flushEffects();

      expect(collectionFacade.$isDetailPending()).toBe(false);
      expect(collectionFacade.$detailError()).not.toBeNull();
    }));
  });

  describe("update method", () => {
    it("should update item and update status when the service call is successful", fakeAsync(() => {
      const beforeItem = vmBuilder.build();

      const afterItem = {
        ...beforeItem,
        title: faker.book.title(),
        icon: faker.string.symbol(4),
        position: faker.string.symbol(),
      };

      const initialItems: CollectionVM[] = [
        vmBuilder.build(),
        beforeItem,
        vmBuilder.build(),
      ];
      const expectItems: CollectionVM[] = [...initialItems];
      expectItems[1] = { ...afterItem };

      const res$ = responseBuilder.buildSuccess({
        data: collectionAdapter.toItemDto(afterItem),
      });
      jest.spyOn(collectionApi, "update").mockReturnValue(res$);

      collectionApi.update(afterItem.id, afterItem);
      expect(collectionApi.update).toHaveBeenCalled();
      expect(collectionApi.update).toHaveBeenCalledWith(afterItem.id, afterItem);

      collectionStore.setItems(initialItems);
      collectionFacade.update(collectionAdapter.toItemDto(afterItem));

      tick(250);

      expect(collectionFacade.$isDetailPending()).toBe(true);
      expect(collectionFacade.$items()).toEqual(initialItems);

      tick(500);

      expect(collectionFacade.$isDetailPending()).toBe(false);
      expect(collectionFacade.$items()[1].position).toEqual(afterItem.position);
      expect(collectionFacade.$items()[1].title).toEqual(afterItem.title);
      expect(collectionFacade.$items()[1].icon).toEqual(afterItem.icon);
    }));

    it("should set error and update status when the service call is failed", fakeAsync(() => {
      const beforeItem = vmBuilder.build();

      const afterItem = {
        ...beforeItem,
        title: faker.book.title(),
        icon: faker.string.symbol(4),
        position: faker.string.symbol(),
      };

      const res$ = responseBuilder.buildFailed(500);
      jest.spyOn(collectionApi, "update").mockReturnValue(res$);

      collectionApi.update(afterItem.id, afterItem);
      expect(collectionApi.update).toHaveBeenCalled();
      expect(collectionApi.update).toHaveBeenCalledWith(afterItem.id, afterItem);

      collectionStore.setItems([beforeItem]);
      collectionFacade.update(afterItem);

      tick(250);
      expect(collectionFacade.$isDetailPending()).toBe(true);
      expect(collectionFacade.$items()).toEqual([beforeItem]);

      tick(500);
      TestBed.flushEffects();

      expect(collectionFacade.$isDetailPending()).toBe(false);
      expect(collectionFacade.$detailError()).not.toBeNull();
    }));
  });

  describe("delete method", () => {
    it("should remove item and update status when the service call is successful", fakeAsync(() => {
      const itemToRemove = vmBuilder.build();
      const initialItems: CollectionVM[] = [
        vmBuilder.build(),
        itemToRemove,
        vmBuilder.build(),
      ];
      const expectItems: CollectionVM[] = initialItems.filter(
        item => item.id !== itemToRemove.id
      );

      const res$ = responseBuilder.buildSuccess<{ data: void }>();
      jest.spyOn(collectionApi, "delete").mockReturnValue(res$);

      collectionApi.delete(itemToRemove.id);
      expect(collectionApi.delete).toHaveBeenCalled();
      expect(collectionApi.delete).toHaveBeenCalledWith(itemToRemove.id);

      collectionStore.setItems(initialItems);
      collectionFacade.delete(itemToRemove.id);

      tick(250);

      expect(appStore.loading()).toBe(true);
      expect(collectionFacade.$items()).toEqual(initialItems);

      tick(500);

      expect(appStore.loading()).toBe(false);
      expect(collectionFacade.$detailError()).toBeNull();
      expect(collectionFacade.$items()).toEqual(expectItems);
    }));

    it("should set error and update status when the service call is failed", fakeAsync(() => {
      const itemToDelete = vmBuilder.build();

      const res$ = responseBuilder.buildFailed(500);
      jest.spyOn(collectionApi, "delete").mockReturnValue(res$);

      collectionApi.delete(itemToDelete.id);
      expect(collectionApi.delete).toHaveBeenCalled();
      expect(collectionApi.delete).toHaveBeenCalledWith(itemToDelete.id);

      collectionStore.setItems([itemToDelete]);
      collectionFacade.delete(itemToDelete.id);

      tick(250);
      expect(appStore.loading()).toBe(true);
      expect(collectionFacade.$items()).toEqual([itemToDelete]);

      tick(500);
      TestBed.flushEffects();

      expect(appStore.loading()).toBe(false);
      expect(collectionFacade.$items()).toEqual([itemToDelete]);
      expect(collectionFacade.$detailError()).toBeNull();
    }));
  });

  //   describe("removeItem method", () => {
  //     it("should remove an existing collection from the store", () => {
  //       const itemToDelete = builder.build();
  //       const expectedItems: CollectionVM[] = [builder.build(), builder.build()];
  //       const initialItems: CollectionVM[] = [...expectedItems, itemToDelete];

  //       collectionFacade.setItems(initialItems);
  //       collectionFacade.deleteItem(itemToDelete.id);

  //       expect(collectionFacade.$items()).toEqual(expectedItems);
  //       expect(collectionFacade.$items()).toHaveLength(expectedItems.length);
  //     });

  //     it("should not affect the store if the collection id does not exist", () => {
  //       const initialItems: CollectionVM[] = [builder.build(), builder.build()];
  //       collectionFacade.setItems(initialItems);
  //       collectionFacade.deleteItem(faker.string.uuid());

  //       expect(collectionFacade.$items()).toEqual(initialItems);
  //       expect(collectionFacade.$items()).toHaveLength(initialItems.length);
  //     });
  //   });

  //   describe("move method", () => {
  //     it("should throw error if index are null or undefined", () => {
  //       expect(() => collectionFacade.move(null as any, faker.number.int())).toThrow(
  //         "Index cannot be null or undefined"
  //       );

  //       expect(() => collectionFacade.move(faker.number.int(), null as any)).toThrow(
  //         "Index cannot be null or undefined"
  //       );

  //       expect(() => collectionFacade.move(null as any, null as any)).toThrow(
  //         "Index cannot be null or undefined"
  //       );
  //     });

  //     it("should swap positions of existing collection from the store", () => {
  //       const fromItem = builder.build();
  //       const toItem = builder.build();

  //       const initialItems: CollectionVM[] = [fromItem, toItem];
  //       const expectedItems: CollectionVM[] = [toItem, fromItem];

  //       collectionFacade.setItems(initialItems);
  //       collectionFacade.move(0, 1);

  //       expect(collectionFacade.$items()).toEqual(expectedItems);
  //       expect(collectionFacade.$items()).toHaveLength(expectedItems.length);
  //     });
  //   });
});
