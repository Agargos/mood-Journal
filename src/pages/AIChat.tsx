import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Navigation } from '@/components/layout/Navigation';

const AIChat = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-20">
        <ChatInterface />
      </main>
    </div>
  );
};

export default AIChat;