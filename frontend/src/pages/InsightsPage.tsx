// // import React from 'react';
// // import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// // import { TrendingUp, Calendar, MessageSquare, TrendingDown, Minus } from 'lucide-react';
// // import { useTheme } from '@/context/ThemeContext';

// // export const InsightsPage: React.FC = () => {
// //   const { isDark } = useTheme();

// //   const stats = [
// //     { label: 'Total Entries', value: '12', icon: MessageSquare, color: '#9333ea' },
// //     { label: 'Days Active', value: '6', icon: Calendar, color: '#3b82f6' },
// //     { label: 'Avg Sentiment', value: '0.65', icon: TrendingUp, color: '#10b981' },
// //   ];

// //   // Mock sentiment data
// //   const sentimentData = [
// //     { date: 'Jan 10', sentiment: 0.7, label: 'Positive' },
// //     { date: 'Jan 11', sentiment: 0.5, label: 'Neutral' },
// //     { date: 'Jan 12', sentiment: 0.3, label: 'Negative' },
// //     { date: 'Jan 13', sentiment: 0.6, label: 'Positive' },
// //     { date: 'Jan 14', sentiment: 0.8, label: 'Positive' },
// //     { date: 'Jan 15', sentiment: 0.9, label: 'Very Positive' },
// //   ];

// //   const getSentimentIcon = (sentiment: number) => {
// //     if (sentiment >= 0.7) return <TrendingUp className="h-4 w-4" style={{ color: '#10b981' }} />;
// //     if (sentiment <= 0.4) return <TrendingDown className="h-4 w-4" style={{ color: '#ef4444' }} />;
// //     return <Minus className="h-4 w-4" style={{ color: '#6b7280' }} />;
// //   };

// //   return (
// //     <div>
// //       <div className="mb-6">
// //         <h2 className="text-2xl font-bold">Insights Dashboard</h2>
// //         <p className="text-sm opacity-70">Track your journaling patterns and mood</p>
// //       </div>

// //       {/* Stats Cards */}
// //       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
// //         {stats.map((stat) => {
// //           const Icon = stat.icon;
// //           return (
// //             <Card key={stat.label}>
// //               <CardContent className="pt-6">
// //                 <div className="flex items-center justify-between">
// //                   <div>
// //                     <p className="text-sm opacity-70">{stat.label}</p>
// //                     <p className="text-3xl font-bold mt-1">{stat.value}</p>
// //                   </div>
// //                   <div
// //                     className="p-3 rounded-lg"
// //                     style={{ backgroundColor: stat.color + '20' }}
// //                   >
// //                     <Icon style={{ color: stat.color }} className="h-6 w-6" />
// //                   </div>
// //                 </div>
// //               </CardContent>
// //             </Card>
// //           );
// //         })}
// //       </div>

// //       {/* Sentiment History */}
// //       <Card>
// //         <CardHeader>
// //           <CardTitle>Recent Sentiment Trend</CardTitle>
// //         </CardHeader>
// //         <CardContent>
// //           <div className="space-y-3">
// //             {sentimentData.map((item, index) => (
// //               <div 
// //                 key={index}
// //                 className="flex items-center justify-between p-3 rounded-lg"
// //                 style={{
// //                   backgroundColor: isDark ? '#374151' : '#f3f4f6'
// //                 }}
// //               >
// //                 <div className="flex items-center gap-3">
// //                   {getSentimentIcon(item.sentiment)}
// //                   <div>
// //                     <p className="font-medium">{item.date}</p>
// //                     <p className="text-sm opacity-70">{item.label}</p>
// //                   </div>
// //                 </div>
// //                 <div className="text-right">
// //                   <p className="text-2xl font-bold">{item.sentiment.toFixed(1)}</p>
// //                 </div>
// //               </div>
// //             ))}
// //           </div>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // };

// import React, { useState, useEffect } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Sparkles, Calendar, MessageSquare, Brain, Heart } from 'lucide-react';
// import { useTheme } from '@/context/ThemeContext';

// export const InsightsPage: React.FC = () => {
//   const { isDark } = useTheme();
//   const [insights, setInsights] = useState<any>(null);

//   useEffect(() => {
//     const loadSessions = () => {
//       const allSessions: any[] = [];

//       for (let i = 0; i < localStorage.length; i++) {
//         const key = localStorage.key(i);
//         if (key?.startsWith('mindspace-session-')) {
//           const sessionData = localStorage.getItem(key);
//           if (sessionData) {
//             const messages = JSON.parse(sessionData, (k, value) => {
//               if (k === 'timestamp') return new Date(value);
//               return value;
//             });
//             allSessions.push({ id: key, messages });
//           }
//         }
//       }

//       generateInsights(allSessions);
//     };

//     loadSessions();
//   }, []);

//   const generateInsights = (sessions: any[]) => {
//     if (sessions.length === 0) {
//       setInsights(null);
//       return;
//     }

//     const userMessages = sessions.reduce(
//       (sum, s) => sum + s.messages.filter((m: any) => m.role === 'user').length,
//       0
//     );

//     // Calculate days active (unique dates)
//     const dates = new Set(
//       sessions.flatMap(s => 
//         s.messages.map((m: any) => m.timestamp.toDateString())
//       )
//     );

//     // Get most active day
//     const dayCount: any = {};
//     sessions.forEach(s => {
//       s.messages.forEach((m: any) => {
//         const day = m.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
//         dayCount[day] = (dayCount[day] || 0) + 1;
//       });
//     });
//     const mostActiveDay = Object.entries(dayCount).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';

//     // Average messages per session
//     const avgMessages = Math.round(userMessages / sessions.length);

//     // Longest conversation
//     const longestSession = Math.max(...sessions.map(s => s.messages.length));

//     // Recent activity (last 7 days)
//     const weekAgo = new Date();
//     weekAgo.setDate(weekAgo.getDate() - 7);
//     const recentSessions = sessions.filter(s => 
//       s.messages.some((m: any) => m.timestamp >= weekAgo)
//     );

//     setInsights({
//       totalEntries: sessions.length,
//       totalMessages: userMessages,
//       daysActive: dates.size,
//       avgMessages,
//       longestSession,
//       mostActiveDay,
//       recentActivity: recentSessions.length,
//       streak: dates.size >= 3 ? '🔥 On a roll!' : dates.size >= 7 ? '💜 Amazing streak!' : null,
//     });
//   };

//   const stats = insights ? [
//     { 
//       label: 'Total Reflections', 
//       value: `${insights.totalEntries} ${insights.totalEntries > 5 ? '🌟' : ''}`, 
//       icon: MessageSquare, 
//       color: '#9333ea',
//       subtitle: `${insights.totalMessages} thoughts shared`
//     },
//     { 
//       label: 'Active Days', 
//       value: `${insights.daysActive} ${insights.daysActive > 3 ? '💜' : ''}`, 
//       icon: Calendar, 
//       color: '#8b5cf6',
//       subtitle: `Most active: ${insights.mostActiveDay}`
//     },
//     { 
//       label: 'Deepest Conversation', 
//       value: `${insights.longestSession} exchanges`, 
//       icon: Brain, 
//       color: '#a78bfa',
//       subtitle: 'Your most engaged session'
//     },
//   ] : [];

//   const aiInsights = insights ? [
//     {
//       icon: '💭',
//       title: 'Reflection Pattern',
//       insight: insights.avgMessages > 5 
//         ? 'You dive deep into your thoughts, averaging over 5 messages per session. Your willingness to explore is wonderful!'
//         : 'You tend to share concise, focused thoughts. Sometimes brevity brings clarity!',
//     },
//     {
//       icon: '📈',
//       title: 'Recent Activity',
//       insight: insights.recentActivity > 0
//         ? `You've journaled ${insights.recentActivity} ${insights.recentActivity === 1 ? 'time' : 'times'} this week. Your consistency is building momentum!`
//         : 'It\'s been a while since your last entry. Your thoughts are always welcome here.',
//     },
//     {
//       icon: '✨',
//       title: 'Growth Insight',
//       insight: insights.totalEntries < 5
//         ? 'You\'re just getting started! Each conversation helps build self-awareness.'
//         : insights.totalEntries < 15
//         ? 'You\'re building a meaningful practice. Your commitment to reflection shows real growth.'
//         : 'You\'ve created a rich tapestry of self-reflection. Your dedication to inner work is inspiring!',
//     },
//     {
//       icon: '🎯',
//       title: 'Next Milestone',
//       insight: insights.totalEntries < 10
//         ? `${10 - insights.totalEntries} more reflections to reach 10 entries!`
//         : insights.totalEntries < 25
//         ? `${25 - insights.totalEntries} more reflections to reach 25 entries!`
//         : 'You\'ve journaled extensively! Keep nurturing this valuable habit.',
//     },
//   ] : [];

//   if (!insights) {
//     return (
//       <div>
//         <div className="mb-6">
//           <h2 className="text-2xl font-bold">Insights Dashboard 💜</h2>
//           <p className="text-sm opacity-70">Track your journaling journey</p>
//         </div>

//         <Card>
//           <CardContent className="text-center py-12">
//             <Sparkles className="h-12 w-12 mx-auto mb-4" style={{ color: '#9333ea' }} />
//             <p className="text-lg opacity-70 mb-2">No insights yet</p>
//             <p className="text-sm opacity-50">Start journaling to see your patterns emerge!</p>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="mb-6">
//         <h2 className="text-2xl font-bold">Insights Dashboard 💜</h2>
//         <p className="text-sm opacity-70">Your journaling journey at a glance</p>
//         {insights.streak && (
//           <p className="text-sm mt-2" style={{ color: '#9333ea' }}>
//             {insights.streak}
//           </p>
//         )}
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//         {stats.map((stat) => {
//           const Icon = stat.icon;
//           return (
//             <Card key={stat.label}>
//               <CardContent className="pt-6">
//                 <div className="flex items-center justify-between mb-3">
//                   <div>
//                     <p className="text-sm opacity-70">{stat.label}</p>
//                     <p className="text-3xl font-bold mt-1">{stat.value}</p>
//                   </div>
//                   <div
//                     className="p-3 rounded-lg"
//                     style={{ backgroundColor: stat.color + '20' }}
//                   >
//                     <Icon style={{ color: stat.color }} className="h-6 w-6" />
//                   </div>
//                 </div>
//                 <p className="text-xs opacity-60">{stat.subtitle}</p>
//               </CardContent>
//             </Card>
//           );
//         })}
//       </div>

//       {/* AI-Generated Insights */}
//       <Card>
//         <CardHeader>
//           <div className="flex items-center gap-2">
//             <Sparkles style={{ color: '#9333ea' }} className="h-5 w-5" />
//             <CardTitle>AI Insights</CardTitle>
//           </div>
//         </CardHeader>
//         <CardContent>
//           <div className="space-y-4">
//             {aiInsights.map((item, index) => (
//               <div 
//                 key={index}
//                 className="p-4 rounded-lg border-l-4"
//                 style={{
//                   backgroundColor: isDark ? '#1f2937' : '#faf5ff',
//                   borderLeftColor: '#9333ea',
//                 }}
//               >
//                 <div className="flex items-start gap-3">
//                   <span className="text-2xl">{item.icon}</span>
//                   <div className="flex-1">
//                     <p className="font-semibold mb-1" style={{ color: '#9333ea' }}>
//                       {item.title}
//                     </p>
//                     <p className="text-sm opacity-80">{item.insight}</p>
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </CardContent>
//       </Card>

//       {/* Encouragement */}
//       <Card className="mt-6">
//         <CardContent className="pt-6 text-center">
//           <Heart style={{ color: '#9333ea' }} className="h-8 w-8 mx-auto mb-3" />
//           <p className="text-sm opacity-70">
//             Every reflection is a step toward greater self-understanding. Keep going! ✨
//           </p>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Sparkles, Calendar, MessageSquare, Brain, Heart, Loader2, Lightbulb, MessageCircle } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { apiService, type UnifiedInsights } from '@/services/api';
import { WordCloud } from '@/components/WordCloud.tsx';

export const InsightsPage: React.FC = () => {
  const { isDark } = useTheme();
  const [sessions, setSessions] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<UnifiedInsights | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDataAndGenerateInsights();
  }, []);

  const loadDataAndGenerateInsights = async () => {
    setLoading(true);
    
    const allSessions: any[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('mindspace-session-')) {
        const sessionData = localStorage.getItem(key);
        if (sessionData) {
          const messages = JSON.parse(sessionData, (k, value) => {
            if (k === 'timestamp') return new Date(value);
            return value;
          });
          allSessions.push({ id: key, messages });
        }
      }
    }
    
    setSessions(allSessions);

    if (allSessions.length === 0) {
      setLoading(false);
      return;
    }

    // Calculate stats
    // const totalMessages = allSessions.reduce((sum, s) => sum + s.messages.length, 0);
    const userMessages = allSessions.reduce(
      (sum, s) => sum + s.messages.filter((m: any) => m.role === 'user').length,
      0
    );

    const dates = new Set(
      allSessions.flatMap(s => 
        s.messages.map((m: any) => m.timestamp.toDateString())
      )
    );

    const dayCount: any = {};
    allSessions.forEach(s => {
      s.messages.forEach((m: any) => {
        const day = m.timestamp.toLocaleDateString('en-US', { weekday: 'long' });
        dayCount[day] = (dayCount[day] || 0) + 1;
      });
    });
    const mostActiveDay = Object.entries(dayCount).sort((a: any, b: any) => b[1] - a[1])[0]?.[0] || 'N/A';

    const avgMessages = Math.round(userMessages / allSessions.length);
    const longestSession = Math.max(...allSessions.map(s => s.messages.length));

    setStats({
      totalEntries: allSessions.length,
      totalMessages: userMessages,
      daysActive: dates.size,
      avgMessages,
      longestSession,
      mostActiveDay,
    });

    // Generate unified insights
    try {
      const entries = allSessions.map(session => {
        const userMsgs = session.messages
          .filter((m: any) => m.role === 'user')
          .map((m: any) => m.content);
        
        return {
          date: session.messages[0]?.timestamp.toLocaleDateString() || 'Unknown',
          message_count: userMsgs.length,
          sample_messages: userMsgs,
        };
      });

      const unifiedInsights = await apiService.generateUnifiedInsights({
        entries,
        total_days_active: dates.size,
        total_messages: userMessages,
      });

      setInsights(unifiedInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    }

    setLoading(false);
  };

  const getSentimentColor = (sentiment: string) => {
    if (sentiment.includes('positive')) return '#10b981';
    if (sentiment.includes('negative')) return '#ef4444';
    return '#a78bfa';
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: '#9333ea' }} />
          <p className="text-lg opacity-70">Analyzing your journal...</p>
          <p className="text-sm opacity-50 mt-2">Discovering patterns and themes ✨</p>
        </div>
      </div>
    );
  }

  if (!stats || sessions.length === 0) {
    return (
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Insights Dashboard 💜</h2>
          <p className="text-sm opacity-70">Track your journaling journey</p>
        </div>

        <Card>
          <CardContent className="text-center py-12">
            <Sparkles className="h-12 w-12 mx-auto mb-4" style={{ color: '#9333ea' }} />
            <p className="text-lg opacity-70 mb-2">No insights yet</p>
            <p className="text-sm opacity-50">Start journaling to see your patterns emerge!</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Total Reflections',
      value: `${stats.totalEntries} ${stats.totalEntries > 5 ? '🌟' : ''}`,
      icon: MessageSquare,
      color: '#9333ea',
      subtitle: `${stats.totalMessages} thoughts shared`,
    },
    {
      label: 'Active Days',
      value: `${stats.daysActive} ${stats.daysActive > 3 ? '💜' : ''}`,
      icon: Calendar,
      color: '#8b5cf6',
      subtitle: `Most active: ${stats.mostActiveDay}`,
    },
    {
      label: 'Deepest Conversation',
      value: `${stats.longestSession} exchanges`,
      icon: Brain,
      color: '#a78bfa',
      subtitle: 'Your most engaged session',
    },
  ];

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold">AI Insights Dashboard 💜</h2>
        <p className="text-sm opacity-70">Claude analyzed your journaling patterns</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-3">
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
                <p className="text-xs opacity-60">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {insights && (
        <>
          {/* Word Cloud - Central Theme */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{insights.central_emoji}</span>
                <CardTitle>Your Central Theme</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="py-8">
              <WordCloud
                central_theme={insights.central_theme}
                central_emoji={insights.central_emoji}
                description={insights.theme_description}
                related_words={insights.related_words}
                theme_color={insights.theme_color}
              />
            </CardContent>
          </Card>

          {/* Theme Constellation */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles style={{ color: '#9333ea' }} className="h-5 w-5" />
                <CardTitle>Theme Constellation</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {/* Core Themes Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {insights.core_themes.map((theme, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl text-center relative"
                    style={{
                      backgroundColor: isDark ? '#1f2937' : '#ffffff',
                      border: `2px solid ${getSentimentColor(theme.sentiment)}`,
                    }}
                  >
                    <div className="text-3xl mb-2">{theme.emoji}</div>
                    <p className="font-semibold text-sm mb-1">{theme.theme}</p>
                    <p className="text-xs opacity-60">
                      {theme.frequency}x · {theme.sentiment}
                    </p>
                    <div
                      className="absolute top-2 right-2 w-2 h-2 rounded-full"
                      style={{ backgroundColor: getSentimentColor(theme.sentiment) }}
                    />
                  </div>
                ))}
              </div>

              {/* Connections */}
              <div className="space-y-2">
                <p className="text-sm font-semibold opacity-70 mb-3">Theme Connections:</p>
                {insights.connections.map((conn, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 rounded-lg"
                    style={{ backgroundColor: isDark ? '#374151' : '#f3f4f6' }}
                  >
                    <span className="text-sm flex-1">
                      {conn.from_theme} ↔ {conn.to_theme}
                    </span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: i < conn.strength ? '#9333ea' : '#d1d5db',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Narrative */}
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain style={{ color: '#9333ea' }} className="h-5 w-5" />
                <CardTitle>AI Analysis</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{insights.narrative}</p>
            </CardContent>
          </Card>

          {/* Hidden Pattern */}
          <Card className="mb-4">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lightbulb style={{ color: '#f59e0b' }} className="h-5 w-5" />
                <CardTitle>Hidden Pattern</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed opacity-80">{insights.hidden_pattern}</p>
            </CardContent>
          </Card>

          {/* Future Prompt */}
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle style={{ color: '#9333ea' }} className="h-5 w-5" />
                <CardTitle>Reflection Question</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p
                className="text-sm leading-relaxed italic p-4 rounded-lg"
                style={{
                  backgroundColor: isDark ? '#1f2937' : '#faf5ff',
                  borderLeft: '4px solid #9333ea',
                }}
              >
                "{insights.future_prompt}"
              </p>
            </CardContent>
          </Card>
        </>
      )}

      {/* Encouragement */}
      <Card>
        <CardContent className="pt-6 text-center">
          <Heart style={{ color: '#9333ea' }} className="h-8 w-8 mx-auto mb-3" />
          <p className="text-sm opacity-70">
            Every reflection is a step toward greater self-understanding. Keep going! ✨
          </p>
        </CardContent>
      </Card>
    </div>
  );
};