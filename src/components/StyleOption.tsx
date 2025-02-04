import React from 'react';

interface StyleOptionProps {
  label: string;
  value: string;
  selected: boolean;
  icon: React.ReactNode | string;
  onChange: (value: string) => void;
  colorScheme?: 'pink' | 'blue';
}

export const StyleOption: React.FC<StyleOptionProps> = ({ 
  label, 
  value, 
  selected, 
  icon, 
  onChange,
  colorScheme = 'pink'
}) => {
  const colors = {
    pink: {
      selected: 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg scale-105',
      hover: 'hover:bg-pink-50 hover:text-pink-500',
      icon: 'text-pink-500',
      border: 'border-pink-200 hover:border-pink-500',
      glow: 'after:bg-pink-500/20'
    },
    blue: {
      selected: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105',
      hover: 'hover:bg-blue-50 hover:text-blue-500',
      icon: 'text-blue-500',
      border: 'border-blue-200 hover:border-blue-500',
      glow: 'after:bg-blue-500/20'
    }
  }[colorScheme];

  return (
    <button
      onClick={() => onChange(value)}
      className={`
        relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
        border backdrop-blur-sm
        ${selected 
          ? `${colors.selected} animate-pulse-subtle`
          : `bg-white/80 ${colors.hover} text-gray-600 ${colors.border}`
        }
        group hover:scale-[1.02] active:scale-[0.98]
        before:absolute before:inset-0 before:rounded-xl before:transition-opacity
        after:absolute after:inset-0 after:rounded-xl after:opacity-0 after:transition-opacity
        hover:after:opacity-10
      `}
    >
      <span 
        className={`
          text-2xl relative z-10 transition-transform duration-300 group-hover:scale-110
          ${selected ? 'text-white' : colors.icon}
        `}
      >
        {icon}
      </span>
      <span className="text-sm font-medium relative z-10">{label}</span>
      
      {/* Add floating hearts for selected items */}
      {selected && (
        <div className="absolute -right-1 -top-1 text-white/30 text-lg animate-float-slow">💝</div>
      )}
    </button>
  );
}; 