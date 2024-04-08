export interface ViewModelAdapter<TDto, TViewModel> {
  fromDto(dto: TDto): TViewModel;
  fromDto(dto: TDto[]): TViewModel[];
  fromDto(dto: TDto | TDto[]): TViewModel | TViewModel[];

  toDto(vm: TViewModel): TDto;
  toDto(vm: TViewModel[]): TDto[];
  toDto(vm: TViewModel | TViewModel[]): TDto | TDto[];
}
