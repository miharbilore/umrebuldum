const TURKISH_CHAR_MAP: Record<string, string> = {
  "ç": "c",
  "ğ": "g",
  "ı": "i",
  "ö": "o",
  "ş": "s",
  "ü": "u",
  "Ç": "c",
  "Ğ": "g",
  "İ": "i",
  "I": "i",
  "Ö": "o",
  "Ş": "s",
  "Ü": "u",
};

/**
 * Normalizes a string for URL usage.
 */
export function normalizeSlug(input: string): string {
  if (!input) return "";
  const normalized = input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[çğıöşüÇĞİIÖŞÜ]/g, (char) => TURKISH_CHAR_MAP[char] || char)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized;
}

/**
 * Builds a listing slug from ID and title.
 */
export function buildListingSlug(id: string, title: string): string {
  const slugPart = normalizeSlug(title);
  return slugPart ? `${id}-${slugPart}` : id;
}

/**
 * Generates a URL-friendly slug from a string (e.g. "Mehmet Aydın" -> "mehmet-aydin")
 * This is used for pure SEO slugs without IDs.
 */
export function slugify(text: string): string {
  if (!text) return "";
  const trMap: Record<string, string> = {
    'ç': 'c', 'Ç': 'c',
    'ğ': 'g', 'Ğ': 'g',
    'ı': 'i', 'I': 'i',
    'İ': 'i',
    'ö': 'o', 'Ö': 'o',
    'ş': 's', 'Ş': 's',
    'ü': 'u', 'Ü': 'u',
  };

  return text
    .toString()
    .toLowerCase()
    .replace(/[çğışüöÇĞİŞÜÖ]/g, (match) => trMap[match] || match)
    .trim()
    .replace(/\s+/g, '-')         // Replace spaces with -
    .replace(/[^\w-]+/g, '')     // Remove all non-word chars
    .replace(/--+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')           // Trim - from start of text
    .replace(/-+$/, '');          // Trim - from end of text
}
