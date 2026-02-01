import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare, Trash2 } from 'lucide-react';
import type { JournalSession } from '@/types';

export const EntriesPage: React.FC = () => {
  const [sessions, setSessions] = useState<JournalSession[]>([]);

  // Load all sessions from localStorage
  useEffect(() => {
    const loadSessions = () => {
      const allSessions: JournalSession[] = [];
      
      // Iterate through localStorage to find all sessions
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('mindspace-session-')) {
          const sessionData = localStorage.getItem(key);
          if (sessionData) {
            const messages = JSON.parse(sessionData, (k, value) => {
              if (k === 'timestamp') return new Date(value);
              return value;
            });
            
            const sessionId = key.replace('mindspace-session-', '');
            const firstUserMessage = messages.find((m: any) => m.role === 'user');
            const title = firstUserMessage 
              ? firstUserMessage.content.slice(0, 50) + (firstUserMessage.content.length > 50 ? '...' : '')
              : 'New Entry';
            
            allSessions.push({
              id: sessionId,
              title,
              messages,
              createdAt: messages[0]?.timestamp || new Date(),
              updatedAt: messages[messages.length - 1]?.timestamp || new Date(),
            });
          }
        }
      }
      
      // Sort by most recent first
      allSessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
      setSessions(allSessions);
    };

    loadSessions();
  }, []);

  const deleteSession = (sessionId: string) => {
    localStorage.removeItem(`mindspace-session-${sessionId}`);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
  };

  const viewSession = (sessionId: string) => {
    localStorage.setItem('mindspace-current-session', sessionId);
    window.location.reload(); // Simple way to load the session
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Your Journal Entries</h2>
        <p className="text-sm opacity-70">Review your past conversations ({sessions.length} total)</p>
      </div>

      <div className="grid gap-4">
        {sessions.map((session) => (
          <Card key={session.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle>{session.title}</CardTitle>
                  <CardDescription>
                    <span className="flex items-center gap-1 mt-2">
                      <Calendar className="h-4 w-4" />
                      <span>{session.createdAt.toLocaleDateString()}</span>
                      <span className="mx-2">•</span>
                      <MessageSquare className="h-4 w-4" />
                      <span>{session.messages.length} messages</span>
                    </span>
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Button 
                  variant="primary" 
                  size="sm"
                  onClick={() => viewSession(session.id)}
                >
                  View Entry
                </Button>
                <Button 
                  variant="danger" 
                  size="sm"
                  onClick={() => deleteSession(session.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {sessions.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-lg opacity-50">No journal entries yet</p>
            <p className="text-sm opacity-50 mt-2">Start a new conversation to create your first entry</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};