import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { LoginModal } from './components/LoginModal';
import { ApprovalModal } from './components/ApprovalModal';
import { ChatView } from './components/ChatView';
import { WorkspaceView } from './components/WorkspaceView';
import { SettingsView } from './components/SettingsView';
import { ActiveTab, AppSettings, SavedLesson, WorkspaceFile } from './types';
import { storage } from './services/storage';

export const App: React.FC = () => {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('chat');
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());
  const [lessons, setLessons] = useState<SavedLesson[]>(storage.getLessons());
  const [filesCount, setFilesCount] = useState<number>(storage.getFiles().length);

  // Approval Modal state
  const [approvalModal, setApprovalModal] = useState<{
    isOpen: boolean;
    title: string;
    details: string;
    resolve: (value: boolean) => void;
  }>({
    isOpen: false,
    title: '',
    details: '',
    resolve: () => {},
  });

  useEffect(() => {
    // Check initial authentication
    const isAuth = storage.isAuthenticated();
    setAuthenticated(isAuth);
  }, []);

  const handleLogin = async (password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate brief secure bcrypt check
    await new Promise((r) => setTimeout(r, 400));

    if (storage.validatePassword(password)) {
      storage.setAuthenticated(true);
      setAuthenticated(true);
      setFilesCount(storage.getFiles().length);
      return { success: true };
    }
    return { success: false, error: 'Password is incorrect. Please check your admin credentials.' };
  };

  const handleLogout = () => {
    storage.setAuthenticated(false);
    setAuthenticated(false);
  };

  const handleRequestApproval = (details: string): Promise<boolean> => {
    return new Promise((resolve) => {
      setApprovalModal({
        isOpen: true,
        title: 'Model Execution Approval',
        details,
        resolve: (val: boolean) => {
          setApprovalModal((prev) => ({ ...prev, isOpen: false }));
          resolve(val);
        },
      });
    });
  };

  const handleSaveLesson = async (text: string) => {
    // If approval required for lessons, prompt owner
    if (settings.requireApproval) {
      const approved = await handleRequestApproval(`Save lesson to memory?\n\n"${text}"`);
      if (!approved) return;
    }

    const saved = storage.saveLesson(text);
    setLessons(storage.getLessons());
  };

  const handleDeleteLesson = (id: string) => {
    storage.deleteLesson(id);
    setLessons(storage.getLessons());
  };

  const handleUpdateSettings = (newSettings: AppSettings) => {
    storage.saveSettings(newSettings);
    setSettings(newSettings);
  };

  // Compute status pill text
  const providerStatus = settings.apiKey
    ? `Remote: ${settings.model}`
    : 'Local AI (Ollama ready)';

  return (
    <div className="min-h-screen bg-[#0b1220] text-[#e8eef8] flex flex-col font-sans">
      <Header
        authenticated={authenticated}
        onLogout={handleLogout}
        providerStatus={providerStatus}
      />

      <main className="flex-1 max-w-[1300px] w-full mx-auto p-3 sm:p-5 flex flex-col min-h-0">
        {!authenticated ? (
          <div className="flex-1 flex items-center justify-center">
            <LoginModal onLogin={handleLogin} />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-[240px_minmax(0,1fr)] gap-4 min-h-0">
            <Sidebar
              activeTab={activeTab}
              onSelectTab={setActiveTab}
              filesCount={filesCount}
              lessonsCount={lessons.length}
            />

            <div className="min-w-0 flex flex-col h-full">
              {activeTab === 'chat' && (
                <ChatView
                  settings={settings}
                  onRequestApproval={handleRequestApproval}
                  onSaveLesson={handleSaveLesson}
                />
              )}

              {activeTab === 'files' && <WorkspaceView />}

              {activeTab === 'settings' && (
                <SettingsView
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  lessons={lessons}
                  onDeleteLesson={handleDeleteLesson}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Approval Modal */}
      <ApprovalModal
        isOpen={approvalModal.isOpen}
        title={approvalModal.title}
        details={approvalModal.details}
        onApprove={() => approvalModal.resolve(true)}
        onDeny={() => approvalModal.resolve(false)}
      />
    </div>
  );
};
export default App;
