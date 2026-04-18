const TURKISH_CHAR_MAP: Record<string, string> = {
  "ç": "c",
  "ğ": "g",
  "ı": "i",
  "ö": "o",
  "ş": "s",
  "ü": "u",
};

export function normalizeSlug(input: string): string {
  if (!input) return "";
  const normalized = input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[çğıöşü]/g, (char) => TURKISH_CHAR_MAP[char] || char)
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  return normalized;
}

export function buildListingSlug(id: string, title: string): string {
  const slugPart = normalizeSlug(title);
  return slugPart ? `${id}-${slugPart}` : id;
}
