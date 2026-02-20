import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2, Plus } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import type { ChatMessage } from '@/types';
import { generateId } from '@/lib/utils';
import { apiService } from '@/services/api';
import { storageService } from '@/services/storage';

export const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPrompt, setLoadingPrompt] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string>('');
  const { isDark } = useTheme();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    if (typeof messagesEndRef.current?.scrollIntoView === 'function') {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const saveMessages = async (msgs: ChatMessage[], sessionId: string) => {
    const uid = user?.id || 'anonymous';
    await storageService.saveMessages(sessionId, uid, msgs);
  };

  // Load current session or create new one
  useEffect(() => {
    const loadSession = async () => {
      const uid = user?.id || 'anonymous';
      const savedSessionId = storageService.getCurrentSessionId();

      if (savedSessionId) {
        const loaded = await storageService.getSession(savedSessionId, uid);
        if (loaded && loaded.length > 0) {
          setMessages(loaded);
          setCurrentSessionId(savedSessionId);
          setLoadingPrompt(false);
          return;
        }
      }

      const newSessionId = await storageService.createSession(uid);
      setCurrentSessionId(newSessionId);
      storageService.setCurrentSessionId(newSessionId);

      try {
        const prompt = await apiService.getOpeningPrompt();
        const aiMessage: ChatMessage = { id: generateId(), role: 'assistant', content: prompt, timestamp: new Date() };
        setMessages([aiMessage]);
        await saveMessages([aiMessage], newSessionId);
      } catch {
        const aiMessage: ChatMessage = { id: generateId(), role: 'assistant', content: "Hi! I'm here to listen. What's on your mind?", timestamp: new Date() };
        setMessages([aiMessage]);
        await saveMessages([aiMessage], newSessionId);
      } finally {
        setLoadingPrompt(false);
      }
    };

    loadSession();
  }, [user?.id]);

  const startNewConversation = async () => {
    const uid = user?.id || 'anonymous';
    setLoadingPrompt(true);
    try {
      const newSessionId = await storageService.createSession(uid);
      setCurrentSessionId(newSessionId);
      storageService.setCurrentSessionId(newSessionId);
      const prompt = await apiService.getOpeningPrompt();
      const aiMessage: ChatMessage = { id: generateId(), role: 'assistant', content: prompt, timestamp: new Date() };
      setMessages([aiMessage]);
      await saveMessages([aiMessage], newSessionId);
    } catch {
      const fallbackId = generateId();
      setCurrentSessionId(fallbackId);
      storageService.setCurrentSessionId(fallbackId);
      const aiMessage: ChatMessage = { id: generateId(), role: 'assistant', content: "Hi! I'm here to listen. What's on your mind?", timestamp: new Date() };
      setMessages([aiMessage]);
      storageService.saveMessagesToStorage(fallbackId, [aiMessage]);
    } finally {
      setLoadingPrompt(false);
    }
  };

  const handleSend = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: inputText,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    await saveMessages(updatedMessages, currentSessionId);
    setInputText('');
    setIsLoading(true);

    try {
      const apiMessages = updatedMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));

      const responseText = await apiService.sendMessage(apiMessages, user?.id || 'anonymous');

      const aiMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };

      const finalMessages = [...updatedMessages, aiMessage];
      setMessages(finalMessages);
      await saveMessages(finalMessages, currentSessionId);
    } catch (error) {
      console.error('Failed to send message:', error);
      
      const errorMessage: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble connecting right now. Please try again.",
        timestamp: new Date(),
      };
      
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      await saveMessages(finalMessages, currentSessionId);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loadingPrompt) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" style={{ color: '#9333ea' }} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Journal Entry</h2>
          <p className="text-sm opacity-70">Chat with your AI companion</p>
        </div>
        <Button 
          variant="secondary" 
          size="sm"
          onClick={startNewConversation}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Entry
        </Button>
      </div>

      {/* Messages Area */}
      <Card className="flex-1 mb-4 overflow-hidden flex flex-col">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
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
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div
                className="rounded-2xl px-4 py-3 flex items-center gap-2"
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6',
                }}
              >
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
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
          disabled={isLoading}
        />
        <Button 
          onClick={handleSend} 
          disabled={!inputText.trim() || isLoading}
          variant="primary"
        >
          {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
        </Button>
      </div>
    </div>
  );
};