import React from 'react';
import { motion } from 'framer-motion';

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
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-r from-primary-light to-primary rounded-xl p-8 text-white shadow-lg"
    >
      <h1 className="text-3xl font-bold mb-2">
        {getGreeting()}, {name}! 👋
      </h1>
      <p className="text-lg opacity-90">Ready to cook something delicious today?</p>
      <p className="mt-4 italic text-sm opacity-80">"{randomQuote}"</p>
    </motion.div>
  );
};

export default WelcomeMessage;