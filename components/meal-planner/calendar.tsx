import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DayColumn } from "./dayColumn";
import { memo, useCallback, useMemo } from "react";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export const CalendarHeader = memo(({ currentDate, onPrevWeek, onNextWeek, onToday }: CalendarHeaderProps) => {
  const monthYear = useMemo(() => format(currentDate, 'MMMM yyyy'), [currentDate]);
  
  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 sm:p-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
            <CalendarIcon size={18} className="sm:hidden" />
            <CalendarIcon size={20} className="hidden sm:block" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-bold">{monthYear}</h2>
            <p className="text-white/80 text-sm">Plan your weekly meals</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={onPrevWeek}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
            aria-label="Previous week"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={onToday}
            className="px-3 sm:px-4 py-2 bg-white/15 hover:bg-white/25 rounded-lg transition-colors duration-200 text-sm font-medium"
          >
            Today
          </button>
          <button 
            onClick={onNextWeek}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors duration-200"
            aria-label="Next week"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
});

CalendarHeader.displayName = 'CalendarHeader';

// Enhanced Weekday Header
export const WeekdayHeader = memo(({ date, isCurrentDay }: { date: Date; isCurrentDay: boolean }) => {
  const dayNumber = useMemo(() => format(date, 'd'), [date]);
  const dayName = useMemo(() => format(date, 'EEE'), [date]);
  
  return (
    <div className={`text-center py-3 sm:py-4 ${
      isCurrentDay 
        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-xl' 
        : 'bg-gray-50 text-gray-700'
    }`}>
      <p className={`text-xs sm:text-sm font-medium ${
        isCurrentDay ? 'text-white/90' : 'text-gray-500'
      }`}>
        {dayName}
      </p>
      <p className={`text-lg sm:text-2xl font-bold ${
        isCurrentDay ? 'text-white' : 'text-gray-800'
      }`}>
        {dayNumber}
      </p>
      {isCurrentDay && (
        <div className="w-1 h-1 bg-white rounded-full mx-auto mt-1"></div>
      )}
    </div>
  );
});

WeekdayHeader.displayName = 'WeekdayHeader';

interface MealPlanCalendarProps {
  weekDates: Date[];
  weekPlan: { [key: string]: any }; 
  onAddMeal: (date: string, mealType: string) => void;
}

export const MealPlanCalendar = memo(({ weekDates, weekPlan, onAddMeal }: MealPlanCalendarProps) => {
  const today = useMemo(() => new Date(), []);
  
  // Memoized day columns with better keys
  const dayColumns = useMemo(() => {
    return weekDates.map((date, idx) => {
      const dayKey = format(date, 'EEE');
      const isCurrentDay = isSameDay(date, today);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      return (
        <DayColumn 
          key={`${dateKey}-${dayKey}`}
          date={date}
          dayPlan={weekPlan[dayKey]}
          onAddMeal={onAddMeal}
          isCurrentDay={isCurrentDay}
        />
      );
    });
  }, [weekDates, weekPlan, onAddMeal, today]);
  
  return (
    <div className="bg-gradient-to-b from-gray-50 to-white">
      {/* Mobile view - horizontal scroll with better UX */}
      <div className="block lg:hidden">
        <div className="overflow-x-auto pb-4 px-2">
          <div className="flex space-x-3 min-w-[700px]">
            {dayColumns}
          </div>
        </div>
        <div className="text-center pb-4 text-xs text-gray-500 bg-gray-50">
          <div className="flex items-center justify-center">
            <div className="w-8 h-0.5 bg-gray-300 rounded mr-2"></div>
            Swipe horizontally to view more days
            <div className="w-8 h-0.5 bg-gray-300 rounded ml-2"></div>
          </div>
        </div>
      </div>
      
      {/* Desktop view - enhanced grid */}
      <div className="hidden lg:block p-4 sm:p-6">
        <div className="grid grid-cols-7 gap-4">
          {dayColumns}
        </div>
      </div>
    </div>
  );
});

MealPlanCalendar.displayName = 'MealPlanCalendar';