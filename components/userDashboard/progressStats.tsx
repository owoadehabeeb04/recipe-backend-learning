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
    <div className="space-y-3 sm:space-y-4">
      <div className="bg-muted p-3 rounded-lg border border-border">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm font-medium text-foreground">Meals cooked this week</span>
          <span className="text-base sm:text-lg font-bold text-primary">{stats.cookedThisWeek}</span>
        </div>
        <div className="w-full bg-muted-foreground/20 rounded-full h-2 sm:h-2.5 mt-2">
          <div 
            className="bg-primary h-2 sm:h-2.5 rounded-full transition-all" 
            style={{ width: `${Math.min((stats.cookedThisWeek / 7) * 100, 100)}%` }}
          ></div>
        </div>
      </div>
      
      <div className="bg-muted p-3 rounded-lg border border-border">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm font-medium text-foreground">Top cuisine</span>
          <span className="text-base sm:text-lg font-bold text-primary">{stats.topCuisine}</span>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">You've cooked this cuisine the most</p>
      </div>
      
      <div className="bg-muted p-3 rounded-lg border border-border">
        <div className="flex justify-between items-center">
          <span className="text-xs sm:text-sm font-medium text-foreground">New recipes saved</span>
          <span className="text-base sm:text-lg font-bold text-primary">{stats.savedThisMonth}</span>
        </div>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">This month</p>
      </div>
    </div>
  );
};

export default ProgressStats;