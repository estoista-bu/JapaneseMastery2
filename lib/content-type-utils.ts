/**
 * Content type constants matching the backend
 */
export const CONTENT_TYPES = {
  CUSTOM_DECKS: 'custom_decks',
  PROVIDED_DECKS: 'provided_decks',
  KANA_PRACTICE: 'kana_practice',
  JLPT_DECKS: 'jlpt_decks',
} as const;

export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES];

/**
 * Determine content type based on deck category
 */
export function getContentTypeFromDeckCategory(category?: string): ContentType {
  switch (category) {
    case 'user':
      return CONTENT_TYPES.CUSTOM_DECKS;
    case 'kana':
      return CONTENT_TYPES.KANA_PRACTICE;
    case 'jlpt':
      return CONTENT_TYPES.JLPT_DECKS;
    default:
      return CONTENT_TYPES.PROVIDED_DECKS;
  }
}

/**
 * Get content type display name
 */
export function getContentTypeDisplayName(contentType: ContentType): string {
  switch (contentType) {
    case CONTENT_TYPES.CUSTOM_DECKS:
      return 'Custom Decks';
    case CONTENT_TYPES.PROVIDED_DECKS:
      return 'Provided Decks';
    case CONTENT_TYPES.KANA_PRACTICE:
      return 'Kana Practice';
    case CONTENT_TYPES.JLPT_DECKS:
      return 'JLPT Decks';
    default:
      return 'Unknown';
  }
}

/**
 * Get content type icon component name
 */
export function getContentTypeIcon(contentType: ContentType): string {
  switch (contentType) {
    case CONTENT_TYPES.CUSTOM_DECKS:
      return 'BookCopy';
    case CONTENT_TYPES.PROVIDED_DECKS:
      return 'GraduationCap';
    case CONTENT_TYPES.KANA_PRACTICE:
      return 'Trophy';
    case CONTENT_TYPES.JLPT_DECKS:
      return 'BarChart2';
    default:
      return 'BookCopy';
  }
}

/**
 * Get all content types
 */
export function getAllContentTypes(): ContentType[] {
  return Object.values(CONTENT_TYPES);
}
