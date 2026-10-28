import { AppSettings, SavedLesson, WorkspaceFile } from '../types';

const STORAGE_KEYS = {
  AUTH_SESSION: 'mypersonalai_authenticated',
  SETTINGS: 'mypersonalai_cfg',
  FILES: 'mypersonalai_workspace_files',
  LESSONS: 'mypersonalai_lessons',
  CUSTOM_PASSWORD: 'mypersonalai_admin_password',
};

const DEFAULT_SETTINGS: AppSettings = {
  baseUrl: 'https://api.openai.com/v1',
  model: 'gpt-4o-mini',
  apiKey: '',
  ollamaUrl: 'http://127.0.0.1:11434',
  ollamaModel: 'qwen2.5-coder:7b',
  requireApproval: false,
  autoSaveLessons: true,
};

const INITIAL_FILES: WorkspaceFile[] = [
  {
    path: 'src/index.js',
    content: `// Sample workspace application
function calculateThroughput(requests, seconds) {
  if (seconds <= 0) return 0;
  return Number((requests / seconds).toFixed(2));
}

console.log("Calculated RPS:", calculateThroughput(12500, 45));
`,
    size: 204,
    lastModified: Date.now() - 3600000,
  },
  {
    path: 'src/auth/session.js',
    content: `// Private session guard
export function verifySessionToken(token, secret) {
  if (!token || token.length < 32) {
    throw new Error("Invalid session token length");
  }
  return { valid: true, expiresAt: Date.now() + (8 * 3600 * 1000) };
}
`,
    size: 235,
    lastModified: Date.now() - 1800000,
  },
  {
    path: 'notes/architecture.md',
    content: `# Personal AI Engineer Architecture

- **Local-first**: Operates with Ollama or trusted OpenAI-compatible endpoints.
- **Safety checks**: Strict path traversal confinement to the workspace folder.
- **Memory**: Lessons learned retained in local private storage.
- **Access control**: Strong password protection with rate limiting.
`,
    size: 341,
    lastModified: Date.now() - 900000,
  },
  {
    path: 'workspace/quickstart.py',
    content: `# Quickstart Python automation script
import sys

def main():
    print("MyPersonalAI Engineer workspace initialized.")
    print("Python runtime available for verified safe tasks.")

if __name__ == '__main__':
    main()
`,
    size: 212,
    lastModified: Date.now() - 500000,
  },
];

export const storage = {
  isAuthenticated(): boolean {
    return sessionStorage.getItem(STORAGE_KEYS.AUTH_SESSION) === 'true';
  },

  setAuthenticated(value: boolean): void {
    if (value) {
      sessionStorage.setItem(STORAGE_KEYS.AUTH_SESSION, 'true');
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.AUTH_SESSION);
    }
  },

  validatePassword(password: string): boolean {
    const custom = localStorage.getItem(STORAGE_KEYS.CUSTOM_PASSWORD);
    if (custom) {
      return password === custom;
    }
    // Default admin password for local workspace (min 12 characters)
    return password === 'admin12345678' || password === 'developer1234';
  },

  setAdminPassword(password: string): void {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_PASSWORD, password);
  },

  getSettings(): AppSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error('Failed to parse settings:', e);
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: AppSettings): void {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },

  getFiles(): WorkspaceFile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.FILES);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load files:', e);
    }
    return INITIAL_FILES;
  },

  saveFiles(files: WorkspaceFile[]): void {
    localStorage.setItem(STORAGE_KEYS.FILES, JSON.stringify(files));
  },

  getFile(filePath: string): WorkspaceFile | undefined {
    const files = this.getFiles();
    return files.find((f) => f.path === filePath);
  },

  saveFile(filePath: string, content: string): WorkspaceFile {
    const cleanPath = filePath.trim();
    if (!cleanPath) throw new Error('File path cannot be empty.');
    if (cleanPath.startsWith('/') || cleanPath.includes('..')) {
      throw new Error('Invalid path: Escaping workspace is disallowed.');
    }

    const files = this.getFiles();
    const existingIndex = files.findIndex((f) => f.path === cleanPath);
    const size = new Blob([content]).size;
    const fileRecord: WorkspaceFile = {
      path: cleanPath,
      content,
      size,
      lastModified: Date.now(),
    };

    if (existingIndex >= 0) {
      files[existingIndex] = fileRecord;
    } else {
      files.push(fileRecord);
    }

    this.saveFiles(files);
    return fileRecord;
  },

  deleteFile(filePath: string): void {
    const files = this.getFiles().filter((f) => f.path !== filePath);
    this.saveFiles(files);
  },

  getLessons(): SavedLesson[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LESSONS);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.error('Failed to load lessons:', e);
    }
    return [
      {
        id: 'lesson-1',
        text: 'Always sanitize file paths to prevent directory traversal outside workspace.',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
      },
      {
        id: 'lesson-2',
        text: 'Never execute generated code automatically without developer review and approval.',
        timestamp: new Date(Date.now() - 43200000).toISOString(),
      },
    ];
  },

  saveLesson(text: string): SavedLesson {
    const lessons = this.getLessons();
    const newLesson: SavedLesson = {
      id: `lesson-${Date.now()}`,
      text: text.trim(),
      timestamp: new Date().toISOString(),
    };
    lessons.unshift(newLesson);
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
    return newLesson;
  },

  deleteLesson(id: string): void {
    const lessons = this.getLessons().filter((l) => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LESSONS, JSON.stringify(lessons));
  },
};
