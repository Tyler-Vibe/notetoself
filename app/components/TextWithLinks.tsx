'use client';

import { parseLinks } from '../utils/linkParser';

interface TextWithLinksProps {
  text: string;
  className?: string;
}

export default function TextWithLinks({ text, className = '' }: TextWithLinksProps) {
  const parts = parseLinks(text);

  return (
    <p className={`${className} break-words`}>
      {parts.map((part, index) => {
        if (part.type === 'link') {
          const href = part.content.startsWith('www.') 
            ? `https://${part.content}` 
            : part.content;
          
          return (
            <a
              key={index}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-600 hover:underline break-all inline-block max-w-full"
            >
              {part.content}
            </a>
          );
        }
        return <span key={index}>{part.content}</span>;
      })}
    </p>
  );
} 