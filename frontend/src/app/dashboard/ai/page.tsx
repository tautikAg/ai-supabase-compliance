'use client';

import { AIAssistant } from '@/components/ai/ai-assistant';

export default function AIPage() {
  return (
    <div className="flex-1 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">AI Assistant</h2>
      </div>
      <div className="mt-4">
        <AIAssistant />
      </div>
    </div>
  );
} 