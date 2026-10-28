import React, { useState } from 'react';
import {
  Settings,
  Server,
  Key,
  Shield,
  BookOpen,
  Trash2,
  Check,
  Copy,
  AlertTriangle,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { AppSettings, SavedLesson } from '../types';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  lessons: SavedLesson[];
  onDeleteLesson: (id: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  lessons,
  onDeleteLesson,
}) => {
  const [form, setForm] = useState<AppSettings>({ ...settings });
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(form);
    setSavedStatus(true);
    setTimeout(() => setSavedStatus(false), 2500);
  };

  const copyCommand = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <section className="bg-[#121d30] border border-[#26364f] rounded-xl p-4 sm:p-5 flex flex-col h-full min-w-0 overflow-y-auto space-y-6">
      {/* Header */}
      <div className="pb-3 border-b border-[#26364f]">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold tracking-tight text-[#e8eef8] m-0">Setup & status</h2>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1b2b43] text-[#73d6c4] border border-[#26364f]">
            Configuration
          </span>
        </div>
        <p className="text-xs text-[#9aabc3] mt-0.5">
          Configure local Ollama, remote API endpoints, and view session telemetry.
        </p>
      </div>

      {/* Status Details Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-[#0b1525] border border-[#26364f] rounded-lg p-3">
          <div className="text-[11px] text-[#9aabc3] uppercase font-mono">System Engine</div>
          <div className="text-sm font-semibold text-[#e8eef8] mt-1">v2.0.0 (React SPA)</div>
          <div className="text-[11px] text-[#73d6c4] mt-0.5">Sandboxed Workspace</div>
        </div>

        <div className="bg-[#0b1525] border border-[#26364f] rounded-lg p-3">
          <div className="text-[11px] text-[#9aabc3] uppercase font-mono">Local AI Engine</div>
          <div className="text-sm font-semibold text-[#e8eef8] mt-1">{form.ollamaModel}</div>
          <div className="text-[11px] text-[#9aabc3] mt-0.5">{form.ollamaUrl}</div>
        </div>

        <div className="bg-[#0b1525] border border-[#26364f] rounded-lg p-3">
          <div className="text-[11px] text-[#9aabc3] uppercase font-mono">Remote Provider</div>
          <div className="text-sm font-semibold text-[#e8eef8] mt-1">
            {form.apiKey ? 'Configured (Active)' : 'Unconfigured'}
          </div>
          <div className="text-[11px] text-[#9aabc3] mt-0.5 truncate">{form.model}</div>
        </div>

        <div className="bg-[#0b1525] border border-[#26364f] rounded-lg p-3">
          <div className="text-[11px] text-[#9aabc3] uppercase font-mono">Session Safety</div>
          <div className="text-sm font-semibold text-[#73d6c4] mt-1">Private Session</div>
          <div className="text-[11px] text-[#9aabc3] mt-0.5">No cloud telemetry</div>
        </div>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSave} className="space-y-5">
        {/* Remote AI Config */}
        <div className="bg-[#0b1525] border border-[#26364f] rounded-lg p-4 space-y-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-[#73d6c4]" />
            <h3 className="text-sm font-bold text-[#e8eef8] m-0">Remote AI (Optional)</h3>
          </div>
          <p className="text-xs text-[#9aabc3]">
            Provide an OpenAI-compatible API endpoint (OpenAI, OpenRouter, Groq, Mistral, etc.).
            API keys stay locally in your private session and are never exposed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#e8eef8] mb-1">
                API Base URL
              </label>
              <input
                type="text"
                value={form.baseUrl}
                onChange={(e) => setForm({ ...form, baseUrl: e.target.value })}
                placeholder="https://api.openai.com/v1"
                className="w-full bg-[#121d30] text-[#e8eef8] border border-[#26364f] rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#73d6c4]"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#e8eef8] mb-1">
                Model Name
              </label>
              <input
                type="text"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
                placeholder="gpt-4o-mini or mistral-large"
                className="w-full bg-[#121d30] text-[#e8eef8] border border-[#26364f] rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#73d6c4]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#e8eef8] mb-1">
              API Key
            </label>
            <input
              type="password"
              value={form.apiKey}
              onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
              placeholder="sk-…"
              className="w-full bg-[#121d30] text-[#e8eef8] border border-[#26364f] rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#73d6c4]"
            />
          </div>
        </div>

        {/* Local AI Instructions */}
        <div className="bg-[#0b1525] border border-[#26364f] rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Key className="w-4 h-4 text-[#73d6c4]" />
            <h3 className="text-sm font-bold text-[#e8eef8] m-0">Local AI Setup (Ollama)</h3>
          </div>

          <ol className="text-xs text-[#e8eef8] space-y-2 list-decimal list-inside pl-1">
            <li>
              Install Ollama from{' '}
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noreferrer"
                className="text-[#73d6c4] underline"
              >
                ollama.com
              </a>{' '}
              on your workstation.
            </li>
            <li className="space-y-1">
              <div>Run the model pull command in your terminal:</div>
              <div className="flex items-center justify-between bg-[#121d30] border border-[#26364f] rounded px-2.5 py-1.5 font-mono text-xs text-[#73d6c4]">
                <span>ollama pull qwen2.5-coder:7b</span>
                <button
                  type="button"
                  onClick={() => copyCommand('ollama pull qwen2.5-coder:7b')}
                  className="hover:text-white cursor-pointer ml-2"
                >
                  {copiedCmd === 'ollama pull qwen2.5-coder:7b' ? (
                    <Check className="w-3.5 h-3.5 text-[#73d6c4]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </li>
            <li>
              Ollama serves on{' '}
              <code className="bg-[#121d30] px-1.5 py-0.5 rounded text-[#73d6c4] font-mono">
                http://127.0.0.1:11434
              </code>
              . When active, requests route directly to your GPU/CPU without internet access.
            </li>
          </ol>
        </div>

        {/* Safety & Approval Controls */}
        <div className="bg-[#0b1525] border border-[#26364f] rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#73d6c4]" />
            <h3 className="text-sm font-bold text-[#e8eef8] m-0">Guardrails & Approvals</h3>
          </div>

          <div className="space-y-2.5">
            <label className="flex items-center gap-2 text-xs text-[#e8eef8] cursor-pointer">
              <input
                type="checkbox"
                checked={form.requireApproval}
                onChange={(e) => setForm({ ...form, requireApproval: e.target.checked })}
                className="rounded border-[#26364f] text-[#73d6c4] focus:ring-0 cursor-pointer"
              />
              <span>Require owner approval modal before triggering external model calls</span>
            </label>

            <label className="flex items-center gap-2 text-xs text-[#e8eef8] cursor-pointer">
              <input
                type="checkbox"
                checked={form.autoSaveLessons}
                onChange={(e) => setForm({ ...form, autoSaveLessons: e.target.checked })}
                className="rounded border-[#26364f] text-[#73d6c4] focus:ring-0 cursor-pointer"
              />
              <span>Automatically extract engineering takeaways into Lessons memory</span>
            </label>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold rounded-lg bg-[#73d6c4] hover:bg-[#5fc5b2] text-[#08201c] flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save configuration</span>
          </button>

          {savedStatus && (
            <div className="flex items-center gap-1.5 text-xs text-[#73d6c4] font-mono">
              <CheckCircle2 className="w-4 h-4" />
              <span>Settings saved locally.</span>
            </div>
          )}
        </div>
      </form>

      {/* Warning Box */}
      <div className="border-l-3 border-[#e9b65d] p-3.5 rounded-lg bg-[#2b2417] text-[#f3dcae] text-xs leading-relaxed flex items-start gap-2.5">
        <AlertTriangle className="w-4 h-4 text-[#e9b65d] shrink-0 mt-0.5" />
        <div>
          <strong>Deployment Advisory:</strong> For access outside your own computer, put this app
          behind HTTPS and preferably a VPN or identity-aware proxy. Do not expose port 3000
          directly to the public internet. Configure a strong unique password and session secret.
        </div>
      </div>

      {/* Lessons Memory Section */}
      <div className="bg-[#0b1525] border border-[#26364f] rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[#73d6c4]" />
            <h3 className="text-sm font-bold text-[#e8eef8] m-0">
              Lessons Learned Memory ({lessons.length})
            </h3>
          </div>
          <span className="text-[11px] text-[#9aabc3] font-mono">Saved engineering rules</span>
        </div>

        <div className="space-y-2 max-h-[220px] overflow-y-auto">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-start justify-between gap-3 p-2.5 rounded-md bg-[#121d30] border border-[#26364f] text-xs"
            >
              <div className="space-y-1">
                <p className="text-[#e8eef8] m-0 leading-relaxed font-mono">{lesson.text}</p>
                <div className="text-[10px] text-[#9aabc3]">
                  {new Date(lesson.timestamp).toLocaleString()}
                </div>
              </div>

              <button
                type="button"
                onClick={() => onDeleteLesson(lesson.id)}
                className="text-[#9aabc3] hover:text-[#ff9e9e] p-1 transition-colors cursor-pointer"
                title="Delete lesson"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {lessons.length === 0 && (
            <div className="p-3 text-center text-xs text-[#9aabc3]">
              No lessons recorded yet. As you debug, key insights will appear here.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
