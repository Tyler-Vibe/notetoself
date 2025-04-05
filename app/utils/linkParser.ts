export function parseLinks(text: string): Array<{ type: 'text' | 'link'; content: string }> {
  // This regex matches URLs starting with http://, https://, or www.
  const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
  const parts: Array<{ type: 'text' | 'link'; content: string }> = [];
  let lastIndex = 0;

  text.replace(urlRegex, (match, p1, p2, offset) => {
    // Add text before the link
    if (offset > lastIndex) {
      parts.push({
        type: 'text',
        content: text.slice(lastIndex, offset),
      });
    }

    // Add the link
    parts.push({
      type: 'link',
      content: match,
    });

    lastIndex = offset + match.length;
    return match;
  });

  // Add remaining text after the last link
  if (lastIndex < text.length) {
    parts.push({
      type: 'text',
      content: text.slice(lastIndex),
    });
  }

  return parts.length > 0 ? parts : [{ type: 'text', content: text }];
} 