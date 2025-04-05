/**
 * Converts a tags array to a JSON string for storage
 */
export function tagsToJson(tags: string[]): string {
  return JSON.stringify(tags || []);
}

/**
 * Parses a JSON string of tags into an array
 */
export function jsonToTags(json: string | null): string[] {
  if (!json) return [];
  
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Error parsing tags JSON:', error);
    return [];
  }
} 