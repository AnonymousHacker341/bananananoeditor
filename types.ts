export interface ImageState {
  original: string | null; // Data URL
  generated: string | null; // Data URL
  mimeType: string;
}

export enum AppStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

export interface EditorProps {
  defaultImage?: string;
}
