import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import type { ChatMessage } from '@/types';
import { generateId } from '@/lib/utils';

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isDark } = useTheme();

  const handleSend = async () => {
    if (!inputText.trim()) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    // Simulate AI response (we'll connect to real API later)
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: "I'm here to listen. This is a placeholder response - we'll connect to the real AI API in the backend setup!",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4">
        <h2 className="text-2xl font-bold">New Journal Entry</h2>
        <p className="text-sm opacity-70">Chat with your AI companion</p>
      </div>

      {/* Messages Area */}
      <Card className="flex-1 mb-4 overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center opacity-50">
                <p className="text-lg mb-2">Start your journaling session</p>
                <p className="text-sm">Share what's on your mind...</p>
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[80%] rounded-2xl px-4 py-3"
                  style={{
                    backgroundColor: msg.role === 'user' 
                      ? '#9333ea' 
                      : (isDark ? '#374151' : '#f3f4f6'),
                    color: msg.role === 'user' 
                      ? '#ffffff' 
                      : (isDark ? '#f9fafb' : '#111827'),
                  }}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                  <p className="text-xs mt-1 opacity-70">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl px-4 py-3"
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                }}
              >
                <p>Thinking...</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          placeholder="Type your thoughts here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyPress}
          className="flex-1"
        />
        <Button 
          onClick={handleSend} 
          disabled={!inputText.trim() || isLoading}
          variant="primary"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
};