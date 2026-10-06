"use client";
import { ScreenId } from '@/types';

export function AITeacherPage({ onNavigate }: { onNavigate: (screen: ScreenId) => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-900 text-slate-100 p-6">
      <h1 className="text-2xl font-bold mb-4">AI Teacher Hub</h1>
      <p className="mb-6 text-center max-w-lg">
        Welcome to the AI Teacher! Choose a subject and start a conversation with
        Anita Ma'am.
      </p>
      <button
        onClick={() => onNavigate('teacher-agent-chat')}
        className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 transition-colors"
      >
        Open AI Teacher Chat
      </button>
    </div>
  );
}

export default AITeacherPage;

