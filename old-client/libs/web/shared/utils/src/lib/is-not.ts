export function isNotNil<TItem>(value?: TItem | null): value is TItem {
  return value !== null && value !== undefined;
}

export function isNotFalsy<TItem>(value?: TItem): value is TItem {
  return !!value;
}
