import { TagType } from '../types/note';

interface TagProps {
  type: TagType;
}

const TAG_STYLES = {
  link: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  password: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  configuration: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
  personalinfo: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  project: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
};

const TAG_LABELS = {
  link: 'Link',
  password: 'Password',
  configuration: 'Config',
  personalinfo: 'Personal',
  project: 'Project',
};

export default function Tag({ type }: TagProps) {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${TAG_STYLES[type]}`}>
      {TAG_LABELS[type]}
    </span>
  );
} 