import slugify from 'slugify';

export function generatePointSlug(str: string): string {
  // eslint-disable-next-line no-useless-escape
  return slugify(str, { lower: true, replacement: '.', remove: /['_\.\-]/g });
}

export function generateBaseSlug(str: string): string {
  return slugify(str, { lower: true, strict: true });
}
