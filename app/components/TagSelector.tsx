'use client';

import { TagType } from '../types/note';

interface TagSelectorProps {
  selectedTags: TagType[];
  onChange: (tags: TagType[]) => void;
}

const ALL_TAGS: TagType[] = ['link', 'password', 'configuration', 'personalinfo', 'project'];

const TAG_LABELS = {
  link: 'Link',
  password: 'Password',
  configuration: 'Config',
  personalinfo: 'Personal',
  project: 'Project',
};

export default function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  const toggleTag = (tag: TagType) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  return (
    <div className="flex flex-wrap gap-2">
      {ALL_TAGS.map(tag => (
        <button
          key={tag}
          type="button"
          onClick={() => toggleTag(tag)}
          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors
            ${selectedTags.includes(tag)
              ? 'bg-blue-500 text-white'
              : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            } hover:opacity-80`}
        >
          {TAG_LABELS[tag]}
        </button>
      ))}
    </div>
  );
} 