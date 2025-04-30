/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable react-hooks/exhaustive-deps */
import { format, addWeeks, startOfWeek, subWeeks, addMonths, isSameDay } from 'date-fns';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

interface DuplicatePlanModalProps {
  planName: string;
  currentWeek: Date;
  onConfirm: (targetWeek: Date) => void;
  onCancel: () => void;
}

export const DuplicatePlanModal: React.FC<DuplicatePlanModalProps> = ({
  planName,
  currentWeek,
  onConfirm,
  onCancel
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  // Start with next week as the default target
  const [targetWeek, setTargetWeek] = useState<Date>(() => {
    return addWeeks(startOfWeek(currentWeek, { weekStartsOn: 1 }), 1);
  });


  const handlePreviousWeek = () => {
    // Allow selecting any previous week
    setTargetWeek(subWeeks(targetWeek, 1));
  };

  const handleNextWeek = () => {
    // Allow going forward to future weeks
    setTargetWeek(addWeeks(targetWeek, 1));
  };

  // Format the week display (showing Monday - Sunday)
  const formatWeekDisplay = (date: Date) => {
    const weekStart = startOfWeek(date, { weekStartsOn: 1 });
    const weekEnd = addWeeks(weekStart, 1);
    weekEnd.setDate(weekEnd.getDate() - 1); // Go back one day to get Sunday
    
    return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
  };

  // Generate quick selection options
  const quickSelections = [
    { label: "Next Week", date: addWeeks(startOfWeek(currentWeek, { weekStartsOn: 1 }), 1) },
    { label: "In 2 Weeks", date: addWeeks(startOfWeek(currentWeek, { weekStartsOn: 1 }), 2) },
    { label: "In 4 Weeks", date: addWeeks(startOfWeek(currentWeek, { weekStartsOn: 1 }), 4) },
  ];

  // Generate a comprehensive list of weeks for the dropdown (3 months past, 6 months future)
  const weekOptions = [];
  const currentWeekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });
  
  // Past weeks (up to 3 months back)
  for (let i = 12; i > 0; i--) {
    const weekStart = subWeeks(currentWeekStart, i);
    weekOptions.push({
      label: formatWeekDisplay(weekStart),
      date: weekStart,
    });
  }
  
  // Current week
  weekOptions.push({
    label: `${formatWeekDisplay(currentWeekStart)} (Current)`,
    date: currentWeekStart,
  });
  
  // Future weeks (6 months ahead)
  for (let i = 1; i <= 24; i++) {
    const weekStart = addWeeks(currentWeekStart, i);
    weekOptions.push({
      label: formatWeekDisplay(weekStart),
      date: weekStart,
    });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 10 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
      >
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 relative">
          <h2 className="text-2xl font-bold text-white mb-1">Duplicate Plan</h2>
          <p className="text-indigo-100 text-sm">
            Choose which week to copy this plan to
          </p>
          <button 
            onClick={onCancel}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="p-6">
          <p className="mb-4 text-gray-700">
            You're about to duplicate "<strong>{planName}</strong>". Select the target week:
          </p>
          
          {/* Quick selections */}
          <div className="mb-6 flex flex-wrap gap-2">
            {quickSelections.map((option) => (
              <button
                key={option.label}
                onClick={() => setTargetWeek(option.date)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                  isSameDay(targetWeek, option.date)
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          {/* Week dropdown */}
          <div className="mb-6 relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 bg-white hover:bg-gray-50 rounded-xl text-left transition-colors"
            >
              <span className="flex items-center">
                <Calendar size={18} className="mr-2 text-purple-500" />
                <span className='text-gray-700'>Select from all available weeks</span>
              </span>
              <ChevronDown size={18} className={`transition-transform duration-200 ${showDropdown ? 'transform rotate-180' : ''}`} />
            </button>

            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-72 overflow-y-auto"
              >
                {weekOptions.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setTargetWeek(option.date);
                      setShowDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                      isSameDay(targetWeek, option.date)
                        ? 'bg-purple-50 text-purple-700 font-medium'
                        : 'text-gray-700'
                    } ${index !== weekOptions.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    {option.label}
                  </button>
                ))}
              </motion.div>
            )}
          </div>

          {/* Week selection */}
          <div className="flex items-center justify-between mb-8 bg-gray-50 rounded-xl p-4 border border-gray-200">
            <button 
              onClick={handlePreviousWeek} 
              className="p-2 rounded-full hover:bg-gray-200"
              aria-label="Previous week"
            >
              <ChevronLeft size={20} />
            </button>
            
            <div className="flex items-center text-xl font-medium text-gray-800">
              <Calendar size={20} className="mr-2 text-purple-500" />
              {formatWeekDisplay(targetWeek)}
            </div>
            
            <button 
              onClick={handleNextWeek}
              className="p-2 rounded-full hover:bg-gray-200"
              aria-label="Next week"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => onConfirm(targetWeek)}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition duration-200 flex items-center justify-center font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Duplicate to this week
            </button>
          </div>
          
          <button
            onClick={onCancel}
            className="w-full mt-3 py-2 text-gray-500 hover:text-gray-700 rounded-xl transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};