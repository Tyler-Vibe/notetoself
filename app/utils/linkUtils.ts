/**
 * Converts URLs in text to clickable links
 * @param text The text to process
 * @returns JSX with clickable links
 */
export function convertLinksToJSX(text: string) {
  if (!text) return null;
  
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Split the text by URLs
  const parts = text.split(urlRegex);
  
  // Find all URLs in the text
  const urls = text.match(urlRegex) || [];
  
  // Combine parts and URLs
  const result = [];
  for (let i = 0; i < parts.length; i++) {
    // Add the text part
    if (parts[i]) {
      result.push(<span key={`text-${i}`}>{parts[i]}</span>);
    }
    
    // Add the URL part (if there is one)
    if (urls[i - 1]) {
      result.push(
        <a 
          key={`link-${i-1}`} 
          href={urls[i - 1]} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {urls[i - 1]}
        </a>
      );
    }
  }
  
  return result;
}

/**
 * Truncates text to a specified length and adds ellipsis if needed
 * @param text The text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text;
  
  // Try to truncate at a space to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(' ');
  
  if (lastSpaceIndex > maxLength * 0.8) {
    // If we can find a space near the end, truncate there
    return truncated.substring(0, lastSpaceIndex) + '...';
  }
  
  // Otherwise truncate at the exact length
  return truncated + '...';
}

/**
 * Detects URLs in text
 * @param text The text to process
 * @returns Array of URLs found in the text
 */
export function detectUrls(text: string): string[] {
  if (!text) return [];
  
  // Regular expression to match URLs
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Find all URLs in the text
  return text.match(urlRegex) || [];
} 