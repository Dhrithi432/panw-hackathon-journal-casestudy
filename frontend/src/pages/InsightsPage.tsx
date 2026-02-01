import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, Calendar, MessageSquare, TrendingDown, Minus } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export const InsightsPage: React.FC = () => {
  const { isDark } = useTheme();

  const stats = [
    { label: 'Total Entries', value: '12', icon: MessageSquare, color: '#9333ea' },
    { label: 'Days Active', value: '6', icon: Calendar, color: '#3b82f6' },
    { label: 'Avg Sentiment', value: '0.65', icon: TrendingUp, color: '#10b981' },
  ];

  // Mock sentiment data
  const sentimentData = [
    { date: 'Jan 10', sentiment: 0.7, label: 'Positive' },
    { date: 'Jan 11', sentiment: 0.5, label: 'Neutral' },
    { date: 'Jan 12', sentiment: 0.3, label: 'Negative' },
    { date: 'Jan 13', sentiment: 0.6, label: 'Positive' },
    { date: 'Jan 14', sentiment: 0.8, label: 'Positive' },
    { date: 'Jan 15', sentiment: 0.9, label: 'Very Positive' },
  ];

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment >= 0.7) return <TrendingUp className="h-4 w-4" style={{ color: '#10b981' }} />;
    if (sentiment <= 0.4) return <TrendingDown className="h-4 w-4" style={{ color: '#ef4444' }} />;
    return <Minus className="h-4 w-4" style={{ color: '#6b7280' }} />;
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Insights Dashboard</h2>
        <p className="text-sm opacity-70">Track your journaling patterns and mood</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-70">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: stat.color + '20' }}
                  >
                    <Icon style={{ color: stat.color }} className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Sentiment History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Sentiment Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sentimentData.map((item, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 rounded-lg"
                style={{
                  backgroundColor: isDark ? '#374151' : '#f3f4f6'
                }}
              >
                <div className="flex items-center gap-3">
                  {getSentimentIcon(item.sentiment)}
                  <div>
                    <p className="font-medium">{item.date}</p>
                    <p className="text-sm opacity-70">{item.label}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{item.sentiment.toFixed(1)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};