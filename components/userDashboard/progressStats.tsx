import React from 'react';

interface StatsProps {
  stats: {
    cookedThisWeek: number;
    topCuisine: string;
    savedThisMonth: number;
  };
}

const ProgressStats: React.FC<StatsProps> = ({ stats }) => {
  return (
    <div className="space-y-4">
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Meals cooked this week</span>
          <span className="text-lg font-bold text-primary">{stats.cookedThisWeek}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-primary h-2.5 rounded-full" 
            style={{ width: `${Math.min((stats.cookedThisWeek / 7) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">Top cuisine</span>
          <span className="text-lg font-bold text-primary">{stats.topCuisine}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">You've cooked this cuisine the most</p>
      </div>
      
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium">New recipes saved</span>
          <span className="text-lg font-bold text-primary">{stats.savedThisMonth}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">This month</p>
      </div>
    </div>
  );
};

export default ProgressStats;