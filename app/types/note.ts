export type TagType = 'link' | 'password' | 'configuration' | 'personalinfo' | 'project';

export interface File {
  id: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  tags: TagType[];
  files?: File[];
} 