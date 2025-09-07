import React from 'react';
import { ChatInterface } from '@/components/chat/ChatInterface';
import { Navigation } from '@/components/layout/Navigation';

const AIChat = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <main className="pt-4 sm:pt-6 lg:pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <ChatInterface />
        </div>
      </main>
    </div>
  );
};

export default AIChat;