import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/context/ThemeContext';
import { Calendar, MessageSquare } from 'lucide-react';

export const EntriesPage: React.FC = () => {
  const { isDark } = useTheme();

  // Mock data - we'll connect to real data later
  const mockEntries = [
    {
      id: '1',
      title: 'Morning Reflection',
      date: new Date('2024-01-15'),
      messageCount: 12,
      sentiment: 'positive' as const,
    },
    {
      id: '2',
      title: 'Evening Thoughts',
      date: new Date('2024-01-14'),
      messageCount: 8,
      sentiment: 'neutral' as const,
    },
    {
      id: '3',
      title: 'Work Stress Discussion',
      date: new Date('2024-01-13'),
      messageCount: 15,
      sentiment: 'negative' as const,
    },
  ];

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#10b981';
      case 'negative': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Your Journal Entries</h2>
        <p className="text-sm opacity-70">Review your past conversations</p>
      </div>

      <div className="grid gap-4">
        {mockEntries.map((entry) => (
          <Card key={entry.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{entry.title}</CardTitle>
                  <CardDescription>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {entry.date.toLocaleDateString()}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        {entry.messageCount} messages
                      </span>
                    </div>
                  </CardDescription>
                </div>
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: getSentimentColor(entry.sentiment) }}
                  title={`Sentiment: ${entry.sentiment}`}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Button variant="secondary" size="sm">
                View Entry
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {mockEntries.length === 0 && (
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