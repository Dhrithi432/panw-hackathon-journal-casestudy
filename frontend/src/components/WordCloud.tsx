import React from 'react';
import { useTheme } from '@/context/ThemeContext';

interface WordCloudProps {
  central_theme: string;
  central_emoji: string;
  description: string;
  related_words: Array<{ word: string; size: number }>;
  theme_color: string;
}

export const WordCloud: React.FC<WordCloudProps> = ({
  central_theme,
  central_emoji,
  description,
  related_words,
  theme_color,
}) => {
  const { isDark } = useTheme();

  // Calculate positions in a circle around the center
  const getWordPosition = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI;
    const radius = 45; // percentage
    const x = 50 + radius * Math.cos(angle);
    const y = 50 + radius * Math.sin(angle);
    return { x, y };
  };

  // Font size based on word size (1-5)
  const getFontSize = (size: number) => {
    const sizes = {
      1: 'text-xs',
      2: 'text-sm',
      3: 'text-base',
      4: 'text-lg',
      5: 'text-xl',
    };
    return sizes[size as keyof typeof sizes] || 'text-sm';
  };

  // Opacity based on word size
  const getOpacity = (size: number) => {
    return 0.4 + (size * 0.12); // 0.52 to 1.0
  };

  return (
    <div>
      {/* Description */}
      <p className="text-sm opacity-70 mb-6 text-center">{description}</p>

      {/* Word Cloud Container */}
      <div className="relative w-full aspect-square max-w-xl mx-auto">
        {/* Central Theme */}
        <div
          className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ color: theme_color }}
        >
          <div className="text-center p-6 rounded-2xl"
            style={{
              backgroundColor: isDark 
                ? `${theme_color}15` 
                : `${theme_color}10`,
              border: `2px solid ${theme_color}40`,
            }}
          >
            <div className="text-5xl mb-2">{central_emoji}</div>
            <p className="font-bold text-lg whitespace-nowrap">
              {central_theme}
            </p>
          </div>
        </div>

        {/* Orbiting Words */}
        {related_words.map((wordData, index) => {
          const pos = getWordPosition(index, related_words.length);
          return (
            <div
              key={index}
              className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${getFontSize(wordData.size)} font-medium transition-all hover:scale-110 cursor-default`}
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                opacity: getOpacity(wordData.size),
                color: theme_color,
              }}
            >
              {wordData.word}
            </div>
          );
        })}

        {/* Decorative connecting lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
          {related_words.map((_, index) => {
            const pos = getWordPosition(index, related_words.length);
            return (
              <line
                key={index}
                x1="50%"
                y1="50%"
                x2={`${pos.x}%`}
                y2={`${pos.y}%`}
                stroke={theme_color}
                strokeWidth="1"
                strokeDasharray="2,4"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
};