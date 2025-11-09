// Utility functions

/**
 * Convert Vietnamese string to slug
 * Example: "Khoa học dữ liệu" -> "khoa-hoc-du-lieu"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim();
}

/**
 * Format date to Vietnamese format
 * Note: This function should produce consistent results between server and client
 * as long as they're in the same timezone (which is typical for most deployments)
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  // Format in Vietnamese locale
  // Using Asia/Ho_Chi_Minh timezone for consistency (Vietnam timezone)
  return new Intl.DateTimeFormat('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(d);
}

/**
 * Truncate text to specified length
 */
export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

