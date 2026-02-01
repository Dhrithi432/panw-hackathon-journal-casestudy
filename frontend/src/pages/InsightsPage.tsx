import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '@/context/ThemeContext';
import { TrendingUp, Calendar, MessageSquare } from 'lucide-react';

export const InsightsPage: React.FC = () => {
  const { isDark } = useTheme();

  // Mock data - we'll connect to real data later
  const mockData = [
    { date: 'Jan 10', sentiment: 0.7, entries: 1 },
    { date: 'Jan 11', sentiment: 0.5, entries: 2 },
    { date: 'Jan 12', sentiment: 0.3, entries: 1 },
    { date: 'Jan 13', sentiment: 0.6, entries: 3 },
    { date: 'Jan 14', sentiment: 0.8, entries: 2 },
    { date: 'Jan 15', sentiment: 0.9, entries: 1 },
  ];

  const stats = [
    { label: 'Total Entries', value: '12', icon: MessageSquare, color: '#9333ea' },
    { label: 'Days Active', value: '6', icon: Calendar, color: '#3b82f6' },
    { label: 'Avg Sentiment', value: '0.65', icon: TrendingUp, color: '#10b981' },
  ];

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

      {/* Sentiment Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Sentiment Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={mockData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke={isDark ? '#374151' : '#e5e7eb'} 
              />
              <XAxis 
                dataKey="date" 
                stroke={isDark ? '#9ca3af' : '#6b7280'}
              />
              <YAxis 
                stroke={isDark ? '#9ca3af' : '#6b7280'}
                domain={[0, 1]}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  border: `1px solid ${isDark ? '#374151' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  color: isDark ? '#f9fafb' : '#111827',
                }}
              />
              <Line 
                type="monotone" 
                dataKey="sentiment" 
                stroke="#9333ea" 
                strokeWidth={2}
                dot={{ fill: '#9333ea', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};