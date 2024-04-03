export function isNotNil<TItem>(value?: TItem | null): value is TItem {
  return value !== null && value !== undefined;
}
