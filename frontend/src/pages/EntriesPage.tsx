import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, MessageSquare, Trash2 } from 'lucide-react';
import type { JournalSession } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { storageService } from '@/services/storage';

export const EntriesPage: React.FC = () => {
  const [sessions, setSessions] = useState<JournalSession[]>([]);
  const { user } = useAuth();
  const uid = user?.id || 'anonymous';

  useEffect(() => {
    const load = async () => {
      const list = await storageService.getSessions(uid);
      setSessions(list);
    };
    load();
  }, [uid]);

  const deleteSession = async (sessionId: string) => {
    await storageService.deleteSession(sessionId, uid);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  };

  const viewSession = (sessionId: string) => {
    storageService.setCurrentSessionId(sessionId);
    window.location.reload();
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