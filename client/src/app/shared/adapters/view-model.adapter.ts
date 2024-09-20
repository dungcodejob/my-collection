export interface ViewModelAdapter<TDto, TViewModel> {
  fromEntityDto(dto: TDto): TViewModel;
  fromEntityDto(dto: TDto[]): TViewModel[];
  fromEntityDto(dto: TDto | TDto[]): TViewModel | TViewModel[];

  toEntityDto(vm: TViewModel): TDto;
  toEntityDto(vm: TViewModel[]): TDto[];
  toEntityDto(vm: TViewModel | TViewModel[]): TDto | TDto[];
}
