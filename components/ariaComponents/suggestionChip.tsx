import React from 'react';

interface SuggestionChipProps {
  text: string;
  onClick: () => void;
}

const SuggestionChip: React.FC<SuggestionChipProps> = ({ text, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex-shrink-0 bg-gradient-to-r from-purple-800/30 to-purple-900/30 hover:from-purple-700/40 hover:to-purple-800/40 text-white text-sm px-3 py-1.5 rounded-full border border-purple-700/30 mr-2 whitespace-nowrap transition-colors"
    >
      {text}
    </button>
  );
};

export default SuggestionChip;