import React, { useState, useRef, useEffect } from 'react';
import { Send, Copy, Check, Sparkles, AlertCircle, BookmarkPlus, RotateCcw, Cpu } from 'lucide-react';
import { AppSettings, ChatMessage, ProviderType } from '../types';
import { sendChatMessage } from '../services/aiService';

interface ChatViewProps {
  settings: AppSettings;
  onRequestApproval: (details: string) => Promise<boolean>;
  onSaveLesson: (text: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  settings,
  onRequestApproval,
  onSaveLesson,
}) => {
  const [provider, setProvider] = useState<ProviderType>('local');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'नमस्कार! मी MyPersonalAI Engineer आहे. तुमचा प्रश्न किंवा कोड इथे पाठवा. कोड बदलण्यापूर्वी तो workspace मध्ये सेव्ह करा.\n\n(Hello! I am MyPersonalAI Engineer. Send your code or engineering questions here. Make sure to save code in the workspace before applying changes.)',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('Choose Local AI or configure a remote provider in Setup.');
  const [loading, setLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const trimmed = prompt.trim();
    if (!trimmed || loading) return;

    // Check if approval required by user settings
    if (settings.requireApproval) {
      const approved = await onRequestApproval(`Estimated model calls: 1 (${provider === 'local' ? 'Local Ollama' : 'Remote API'})\nQuery: "${trimmed.slice(0, 80)}${trimmed.length > 80 ? '…' : ''}"`);
      if (!approved) {
        setStatus('Owner denied model call.');
        return;
      }
    }

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setPrompt('');
    setLoading(true);
    setStatus('Thinking…');

    try {
      const response = await sendChatMessage(newMessages, provider, settings);

      const assistantMsg: ChatMessage = {
        id: `ast-${Date.now()}`,
        role: 'assistant',
        content: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: response.providerUsed,
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStatus(`Answered using ${response.providerUsed}.`);

      // Detect if answer has a key lesson to offer saving to memory
      if (settings.autoSaveLessons && response.text.toLowerCase().includes('lesson:')) {
        const match = response.text.match(/lesson:\s*([^\n]+)/i);
        if (match && match[1]) {
          onSaveLesson(match[1].trim());
        }
      }
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : 'Unknown error';
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `Error: ${errMsg}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      setStatus('Check AI setup and server logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyToClipboard = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      setMessages([
        {
          id: 'welcome-reset',
          role: 'assistant',
          content: 'Chat reset. How can I assist with your code or architecture?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
      setStatus('Conversation cleared.');
    }
  };

  const promptSuggestions = [
    'How do I scale an Express + SQLite server for higher throughput?',
    'Review defensive path traversal checks for a file explorer.',
    'Create an engineering plan for a private microservice.',
  ];

  return (
    <section className="bg-[#121d30] border border-[#26364f] rounded-xl p-4 sm:p-5 flex flex-col h-full min-w-0">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#26364f] gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-[#e8eef8] m-0">AI Engineer</h2>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#1b2b43] text-[#73d6c4] border border-[#26364f]">
              v2.0
            </span>
          </div>
          <p className="text-xs text-[#9aabc3] mt-0.5">
            Ask questions, debug code, or plan a project.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label htmlFor="provider-select" className="text-xs text-[#9aabc3] hidden sm:inline">
            Provider:
          </label>
          <select
            id="provider-select"
            value={provider}
            onChange={(e) => setProvider(e.target.value as ProviderType)}
            className="bg-[#0b1525] text-[#e8eef8] text-xs border border-[#26364f] rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#73d6c4] cursor-pointer"
          >
            <option value="local">Local AI (Ollama / DevMind)</option>
            <option value="remote">Remote AI (API endpoint)</option>
          </select>

          <button
            onClick={clearChat}
            className="p-1.5 text-xs text-[#9aabc3] hover:text-[#e8eef8] rounded-lg border border-[#26364f] bg-[#0b1525] hover:bg-[#1b2b43] transition-colors cursor-pointer"
            title="Clear chat"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="flex-1 my-3 overflow-y-auto rounded-lg border border-[#26364f] p-3 sm:p-4 bg-[#0a1322] space-y-3 min-h-[380px] max-h-[58vh]"
        aria-live="polite"
      >
        {messages.map((msg) => {
          const isUser = msg.role === 'user';
          const isCopied = copiedId === msg.id;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              <div
                className={`max-w-[92%] sm:max-w-[85%] rounded-xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm ${
                  isUser
                    ? 'bg-[#1b3445] text-[#e8eef8] rounded-tr-xs border border-[#275370]'
                    : 'bg-[#172238] text-[#e8eef8] rounded-tl-xs border border-[#26364f]'
                }`}
              >
                {msg.content}
              </div>

              <div className="flex items-center gap-2 mt-1 px-1 text-[11px] text-[#9aabc3] font-mono">
                <span>{msg.timestamp}</span>
                {msg.provider && (
                  <span className="text-[10px] text-[#73d6c4] bg-[#0b1525] px-1.5 py-0.2 rounded border border-[#26364f]">
                    {msg.provider}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => copyToClipboard(msg.id, msg.content)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-[#e8eef8] cursor-pointer"
                  title="Copy text"
                >
                  {isCopied ? (
                    <Check className="w-3 h-3 text-[#73d6c4]" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-[#172238] border border-[#26364f] text-xs text-[#9aabc3] w-fit animate-pulse">
            <Cpu className="w-4 h-4 text-[#73d6c4] animate-spin" />
            <span>AI Engineer is thinking…</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts if only welcome msg */}
      {messages.length === 1 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {promptSuggestions.map((sug, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPrompt(sug)}
              className="text-[11px] text-[#9aabc3] hover:text-[#73d6c4] bg-[#0b1525] border border-[#26364f] hover:border-[#73d6c4] px-2.5 py-1 rounded-full transition-colors cursor-pointer text-left"
            >
              💡 {sug}
            </button>
          ))}
        </div>
      )}

      {/* Composer Input */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2 pt-1">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Explain a bug, write code, or describe a task… (Ctrl+Enter to send)"
          className="bg-[#0b1525] text-[#e8eef8] border border-[#26364f] rounded-lg p-3 text-sm focus:outline-none focus:border-[#73d6c4] min-h-[75px] max-h-[160px] resize-y placeholder:text-[#9aabc3]/60 transition-colors"
        />
        <button
          onClick={handleSend}
          disabled={loading || !prompt.trim()}
          className="bg-[#73d6c4] hover:bg-[#5fc5b2] text-[#08201c] font-bold text-sm px-5 py-3 rounded-lg border border-[#73d6c4] flex sm:flex-col items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm h-full"
        >
          <Send className="w-4 h-4" />
          <span>Send ↗</span>
        </button>
      </div>

      {/* Status Footer */}
      <div className="mt-2 text-xs text-[#9aabc3] flex items-center justify-between">
        <span className="truncate">{status}</span>
        <span className="text-[11px] font-mono text-[#9aabc3]/70 hidden sm:inline">
          Ctrl+Enter to send
        </span>
      </div>
    </section>
  );
};
