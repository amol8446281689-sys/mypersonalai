import React, { useState, useEffect } from 'react';
import {
  FileText,
  RefreshCw,
  Plus,
  Save,
  Download,
  Trash2,
  AlertTriangle,
  FolderOpen,
  FileCode,
  FileJson,
} from 'lucide-react';
import { WorkspaceFile } from '../types';
import { storage } from '../services/storage';

export const WorkspaceView: React.FC = () => {
  const [files, setFiles] = useState<WorkspaceFile[]>([]);
  const [selectedPath, setSelectedPath] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [newFilePath, setNewFilePath] = useState('');
  const [status, setStatus] = useState('');
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = () => {
    try {
      const list = storage.getFiles();
      setFiles(list);
      setStatus(`Loaded ${list.length} workspace files.`);
      setIsError(false);

      if (list.length > 0 && !selectedPath) {
        selectFile(list[0]);
      }
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Failed to load files');
      setIsError(true);
    }
  };

  const selectFile = (file: WorkspaceFile) => {
    setSelectedPath(file.path);
    setFileContent(file.content);
    setStatus(`Opened ${file.path}`);
    setIsError(false);
  };

  const handleCreateOrOpen = () => {
    const raw = newFilePath.trim();
    if (!raw) {
      setStatus('Enter a file path first (e.g., src/utils.js).');
      setIsError(true);
      return;
    }

    if (raw.startsWith('/') || raw.includes('..')) {
      setStatus('Invalid path: Directory traversal outside workspace is blocked.');
      setIsError(true);
      return;
    }

    setSelectedPath(raw);
    const existing = files.find((f) => f.path === raw);
    if (existing) {
      setFileContent(existing.content);
      setStatus(`Opened existing file: ${raw}`);
    } else {
      setFileContent(`// ${raw}\n\n`);
      setStatus(`Ready to create: ${raw}. Click "Save file" to commit.`);
    }
    setIsError(false);
    setNewFilePath('');
  };

  const handleSaveFile = () => {
    const path = selectedPath.trim();
    if (!path) {
      setStatus('Enter or select a file path to save.');
      setIsError(true);
      return;
    }

    try {
      storage.saveFile(path, fileContent);
      setStatus(`Saved ${path} successfully.`);
      setIsError(false);
      loadFiles();
    } catch (err: unknown) {
      setStatus(err instanceof Error ? err.message : 'Error saving file');
      setIsError(true);
    }
  };

  const handleDeleteFile = () => {
    if (!selectedPath) return;
    if (window.confirm(`Are you sure you want to delete ${selectedPath}?`)) {
      storage.deleteFile(selectedPath);
      setStatus(`Deleted ${selectedPath}`);
      setIsError(false);
      const remaining = storage.getFiles();
      setFiles(remaining);
      if (remaining.length > 0) {
        selectFile(remaining[0]);
      } else {
        setSelectedPath('');
        setFileContent('');
      }
    }
  };

  const handleDownload = () => {
    if (!selectedPath) return;
    const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = selectedPath.split('/').pop() || 'file.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith('.json')) return <FileJson className="w-3.5 h-3.5 text-[#e9b65d]" />;
    if (path.endsWith('.js') || path.endsWith('.ts') || path.endsWith('.py'))
      return <FileCode className="w-3.5 h-3.5 text-[#73d6c4]" />;
    return <FileText className="w-3.5 h-3.5 text-[#9aabc3]" />;
  };

  const lineCount = fileContent.split('\n').length;
  const byteSize = new Blob([fileContent]).size;

  return (
    <section className="bg-[#121d30] border border-[#26364f] rounded-xl p-4 sm:p-5 flex flex-col h-full min-w-0">
      <div className="pb-3 border-b border-[#26364f]">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-[#e8eef8] m-0">Code workspace</h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1b2b43] text-[#73d6c4] border border-[#26364f]">
            Sandboxed
          </span>
        </div>
        <p className="text-xs text-[#9aabc3] mt-0.5">
          Edit only files inside the configured workspace folder. This tool saves code; it does not
          execute generated code automatically.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4 mt-4 flex-1 min-h-[480px]">
        {/* Left column: File Explorer */}
        <div className="flex flex-col bg-[#0b1525] border border-[#26364f] rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={loadFiles}
              className="px-2.5 py-1.5 text-xs rounded-lg border border-[#26364f] bg-[#1b2b43] hover:bg-[#253958] text-[#e8eef8] flex items-center gap-1 cursor-pointer transition-colors"
              title="Refresh workspace files"
            >
              <RefreshCw className="w-3 h-3 text-[#73d6c4]" />
              <span>Refresh</span>
            </button>
            <input
              type="text"
              value={newFilePath}
              onChange={(e) => setNewFilePath(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateOrOpen()}
              placeholder="src/example.js"
              className="flex-1 bg-[#121d30] text-[#e8eef8] border border-[#26364f] rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-[#73d6c4]"
            />
          </div>

          <button
            onClick={handleCreateOrOpen}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#26364f] bg-[#1b2b43] hover:bg-[#253958] text-[#e8eef8] cursor-pointer transition-colors mb-3"
          >
            <Plus className="w-3.5 h-3.5 text-[#73d6c4]" />
            <span>Create / open file</span>
          </button>

          <div className="text-[11px] font-mono tracking-wider uppercase text-[#9aabc3] mb-1.5 px-1">
            Files ({files.length})
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 max-h-[350px] lg:max-h-[50vh] pr-1">
            {files.map((file) => {
              const isSelected = selectedPath === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => selectFile(file)}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md text-xs font-mono flex items-center justify-between transition-colors cursor-pointer group ${
                    isSelected
                      ? 'bg-[#1b2b43] border border-[#73d6c4] text-[#73d6c4] font-medium'
                      : 'text-[#e8eef8] border border-transparent hover:bg-[#121d30]'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {getFileIcon(file.path)}
                    <span className="truncate">{file.path}</span>
                  </div>
                  <span className="text-[10px] text-[#9aabc3] shrink-0 ml-1">
                    {file.size} B
                  </span>
                </button>
              );
            })}

            {files.length === 0 && (
              <div className="p-4 text-center text-xs text-[#9aabc3]">
                Workspace is empty. Create a file above.
              </div>
            )}
          </div>
        </div>

        {/* Right column: Code Editor */}
        <div className="flex flex-col bg-[#0b1525] border border-[#26364f] rounded-lg p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="flex-1 flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#73d6c4] shrink-0" />
              <input
                type="text"
                value={selectedPath}
                onChange={(e) => setSelectedPath(e.target.value)}
                placeholder="Selected file path (e.g. src/index.js)"
                className="w-full bg-[#121d30] text-[#e8eef8] border border-[#26364f] rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#73d6c4]"
              />
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              {selectedPath && (
                <>
                  <button
                    onClick={handleDownload}
                    className="p-1.5 text-xs rounded-lg border border-[#26364f] bg-[#121d30] hover:bg-[#1b2b43] text-[#9aabc3] hover:text-[#e8eef8] transition-colors cursor-pointer"
                    title="Download file"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={handleDeleteFile}
                    className="p-1.5 text-xs rounded-lg border border-[#26364f] bg-[#121d30] hover:bg-[#2b1717] text-[#9aabc3] hover:text-[#ff9e9e] transition-colors cursor-pointer"
                    title="Delete file"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="relative flex-1">
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              placeholder="Choose or create a file to start editing…"
              className="w-full h-full min-h-[300px] lg:min-h-[420px] bg-[#070d18] text-[#e8eef8] border border-[#26364f] rounded-lg p-3 font-mono text-xs leading-relaxed focus:outline-none focus:border-[#73d6c4] resize-none"
              spellCheck={false}
            />
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-3 pt-2 border-t border-[#26364f]">
            <div className="flex items-center gap-3">
              <button
                onClick={handleSaveFile}
                disabled={!selectedPath.trim()}
                className="px-4 py-2 text-xs font-bold rounded-lg bg-[#73d6c4] hover:bg-[#5fc5b2] text-[#08201c] flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save file</span>
              </button>

              <span
                className={`text-xs ${
                  isError ? 'text-[#ff9e9e]' : 'text-[#73d6c4]'
                } font-mono truncate`}
              >
                {status}
              </span>
            </div>

            <div className="text-[11px] font-mono text-[#9aabc3] flex items-center gap-2">
              <span>{lineCount} lines</span>
              <span>•</span>
              <span>{byteSize} bytes</span>
              <span>•</span>
              <span>UTF-8</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
