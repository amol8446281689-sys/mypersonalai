export type ProviderType = 'local' | 'remote';

export interface ChatMessage {
  id: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  timestamp: string;
  provider?: string;
}

export interface WorkspaceFile {
  path: string;
  content: string;
  size: number;
  lastModified: number;
}

export interface AppSettings {
  baseUrl: string;
  model: string;
  apiKey: string;
  ollamaUrl: string;
  ollamaModel: string;
  requireApproval: boolean;
  autoSaveLessons: boolean;
  adminPasswordHash?: string;
}

export interface SavedLesson {
  id: string;
  text: string;
  timestamp: string;
}

export type ActiveTab = 'chat' | 'files' | 'settings';
