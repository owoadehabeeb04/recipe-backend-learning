import React from 'react';

interface WelcomeMessageProps {
  name: string;
}

const WelcomeMessage: React.FC<WelcomeMessageProps> = ({ name }) => {
  // Get time of day for personalized greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get a random cooking quote
  const quotes = [
    "Cooking is love made visible.",
    "The kitchen is where memories are homemade and seasoned with love.",
    "Good food is the foundation of happiness.",
    "People who love to eat are always the best people.",
    "Cooking is like painting or writing a song. Just as there are only so many notes or colors, there are only so many flavors."
  ];
  
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

  return (
    <div 
      //{ opacity: 0, y: -20 }}
      // opacity: 1, y: 0 }}
      // duration: 0.5 }}
      className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-4 sm:p-6 md:p-8 text-primary-foreground shadow-lg"
    >
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-2">
        {getGreeting()}, {name}! 👋
      </h1>
      <p className="text-sm sm:text-base md:text-lg opacity-90">Ready to cook something delicious today?</p>
      <p className="mt-3 sm:mt-4 italic text-xs sm:text-sm opacity-80">"{randomQuote}"</p>
    </div>
  );
};

export default WelcomeMessage;