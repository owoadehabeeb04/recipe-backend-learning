import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DayColumn } from "./dayColumn";
import { memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export const CalendarHeader = memo(({ currentDate, onPrevWeek, onNextWeek, onToday }: CalendarHeaderProps) => {
  const monthYear = useMemo(() => format(currentDate, 'MMMM yyyy'), [currentDate]);
  
  return (
    <div className="bg-primary text-primary-foreground p-3 sm:p-4 md:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
        <div className="flex items-center">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center mr-2 sm:mr-3">
            <CalendarIcon size={16} className="sm:hidden" />
            <CalendarIcon size={20} className="hidden sm:block" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl md:text-2xl font-bold">{monthYear}</h2>
            <p className="text-primary-foreground/80 text-xs sm:text-sm">Plan your weekly meals</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto justify-end">
          <Button
            variant="ghost"
            size="icon"
            onClick={onPrevWeek}
            className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 sm:h-10 sm:w-10"
            aria-label="Previous week"
          >
            <ChevronLeft size={16} className="sm:h-[18px] sm:w-[18px]" />
          </Button>
          <Button
            variant="secondary"
            onClick={onToday}
            size="sm"
            className="bg-primary-foreground/15 hover:bg-primary-foreground/25 text-primary-foreground border-0 text-xs sm:text-sm px-2 sm:px-3"
          >
            Today
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onNextWeek}
            className="text-primary-foreground hover:bg-primary-foreground/20 h-8 w-8 sm:h-10 sm:w-10"
            aria-label="Next week"
          >
            <ChevronRight size={16} className="sm:h-[18px] sm:w-[18px]" />
          </Button>
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
        ? 'bg-primary text-primary-foreground rounded-t-xl' 
        : 'bg-muted text-muted-foreground'
    }`}>
      <p className={`text-xs sm:text-sm font-medium ${
        isCurrentDay ? 'text-primary-foreground/90' : 'text-muted-foreground'
      }`}>
        {dayName}
      </p>
      <p className={`text-lg sm:text-2xl font-bold ${
        isCurrentDay ? 'text-primary-foreground' : 'text-foreground'
      }`}>
        {dayNumber}
      </p>
      {isCurrentDay && (
        <div className="w-1 h-1 bg-primary-foreground rounded-full mx-auto mt-1"></div>
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
    <div className="bg-background">
      {/* Mobile view - horizontal scroll with better UX */}
      <div className="block lg:hidden">
        <div className="overflow-x-auto pb-4 px-2 -mx-2 sm:mx-0" style={{ WebkitOverflowScrolling: 'touch' }}>
          <div className="flex space-x-2 sm:space-x-3 min-w-[600px] sm:min-w-[700px] px-2">
            {dayColumns}
          </div>
        </div>
        <div className="text-center pb-3 sm:pb-4 text-[10px] sm:text-xs text-muted-foreground bg-muted/30 py-2">
          <div className="flex items-center justify-center">
            <div className="w-6 sm:w-8 h-0.5 bg-border rounded mr-1 sm:mr-2"></div>
            <span className="whitespace-nowrap">Swipe to view more days</span>
            <div className="w-6 sm:w-8 h-0.5 bg-border rounded ml-1 sm:ml-2"></div>
          </div>
        </div>
      </div>
      
      {/* Desktop view - enhanced grid */}
      <div className="hidden lg:block p-4 sm:p-6">
        <div className="grid grid-cols-7 gap-3 sm:gap-4">
          {dayColumns}
        </div>
      </div>
    </div>
  );
});

MealPlanCalendar.displayName = 'MealPlanCalendar';