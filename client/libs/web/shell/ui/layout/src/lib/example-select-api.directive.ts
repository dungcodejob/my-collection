import { computed, Directive, Signal } from "@angular/core";
import { MCSelectApiDirective, SelectOption } from "@client/web-shared-ui-select";
import { delay, Observable, of } from "rxjs";

type ExampleFilter = {
  searchTerm?: string;
  page?: number;
  itemSize?: number;
};

@Directive({
  selector: "[mcExampleSelectApi]",
  providers: [
    {
      provide: MCSelectApiDirective,
      useClass: ExampleSelectApiDirective,
    },
  ],
})
export class ExampleSelectApiDirective extends MCSelectApiDirective<ExampleFilter> {
  // Mock data for testing
  private readonly _mockOptions: SelectOption[] = [
    { value: "user1", label: "John Doe" },
    { value: "user2", label: "Jane Smith" },
    { value: "user3", label: "Bob Johnson" },
    { value: "user4", label: "Alice Brown" },
    { value: "user5", label: "Charlie Wilson" },
    { value: "user6", label: "Diana Davis" },
    { value: "user7", label: "Edward Miller" },
    { value: "user8", label: "Fiona Garcia" },
    { value: "user9", label: "George Martinez" },
    { value: "user10", label: "Helen Rodriguez" },
    { value: "user11", label: "Ivan Lopez" },
    { value: "user12", label: "Julia Gonzalez" },
    { value: "user13", label: "Kevin Anderson" },
    { value: "user14", label: "Linda Taylor" },
    { value: "user15", label: "Michael Thomas" },
    { value: "user16", label: "Nancy Jackson" },
    { value: "user17", label: "Oliver White" },
    { value: "user18", label: "Patricia Harris" },
    { value: "user19", label: "Quincy Martin" },
    { value: "user20", label: "Rachel Thompson" },
  ];

  protected computeParams(): Signal<{
    searchTerm: string;
    page: number;
    itemSize: number;
  }> {
    return computed(() => ({
      searchTerm: this._$searchTerm(),
      page: this._$page(),
      itemSize: this.$itemSize(),
    }));
  }

  protected fetchOptions(params: ExampleFilter): Observable<SelectOption[]> {
    // Simulate API call with delay
    let filteredOptions = this._mockOptions;

    // Filter by search term
    if (params.searchTerm) {
      const searchLower = params.searchTerm.toLowerCase();
      filteredOptions = filteredOptions.filter(
        option =>
          option.label.toLowerCase().includes(searchLower) ||
          option.value.toLowerCase().includes(searchLower)
      );
    }

    // Simulate pagination
    const startIndex = ((params.page || 1) - 1) * (params.itemSize || 10);
    const endIndex = startIndex + (params.itemSize || 10);
    const paginatedOptions = filteredOptions.slice(startIndex, endIndex);

    // Simulate network delay
    return of(paginatedOptions).pipe(delay(500));
  }
}
