import React from 'react';

interface CookingTimeFilterProps {
  selectedTime: string;
  onChange: (value: string) => void;
}

export const CookingTimeFilter: React.FC<CookingTimeFilterProps> = ({
  selectedTime,
  onChange
}) => {
  const timeOptions = [
    { value: 'all', label: 'Any Time' },
    { value: 'quick', label: 'Quick (< 15 min)' },
    { value: 'medium', label: 'Medium (15-30 min)' },
    { value: 'long', label: 'Long (> 30 min)' }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      <div className="flex items-center mr-2">
        <svg 
          className="w-4 h-4 text-purple-400 mr-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <span className="text-sm text-gray-400">Cooking time:</span>
      </div>
      {timeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 rounded-full text-xs transition-colors ${
            selectedTime === option.value
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-gray-800/70 text-gray-300 hover:bg-gray-700'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
};