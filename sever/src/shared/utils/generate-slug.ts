import slugify from 'slugify';

export function generatePointSlug(str: string): string {
  return slugify(str, { lower: true, replacement: '.', remove: /['_\.\-]/g });
}

export function generateSlug(str: string): string {
  return slugify(str, { lower: true });
}
