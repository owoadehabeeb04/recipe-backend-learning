import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DayColumn } from "./dayColumn";

interface CalendarHeaderProps {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

export const CalendarHeader = ({ currentDate, onPrevWeek, onNextWeek, onToday }: CalendarHeaderProps) => {
  const monthYear = format(currentDate, 'MMMM yyyy');
  
  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl p-3 sm:p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-base sm:text-xl font-bold flex items-center truncate">
          <CalendarIcon className="mr-1 sm:mr-2 flex-shrink-0" size={18} />
          <span className="truncate">{monthYear}</span>
        </h2>
        <div className="flex space-x-1 sm:space-x-2 ml-2">
          <button 
            onClick={onPrevWeek}
            className="p-1 sm:p-2 rounded-full hover:bg-white/20 transition"
            aria-label="Previous week"
          >
            <ChevronLeft size={18} />
          </button>
          <button 
            onClick={onToday}
            className="px-2 sm:px-3 py-1 bg-white/20 rounded-md hover:bg-white/30 transition text-xs sm:text-sm font-medium"
          >
            Today
          </button>
          <button 
            onClick={onNextWeek}
            className="p-1 sm:p-2 rounded-full hover:bg-white/20 transition"
            aria-label="Next week"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

// Weekday header component for the meal planning page
export const WeekdayHeader = ({ date, isCurrentDay }: { date: Date; isCurrentDay: boolean }) => {
  const dayNumber = format(date, 'd');
  const dayName = format(date, 'EEE');
  
  return (
    <div className={`text-center py-2 sm:py-3 ${isCurrentDay ? 'bg-purple-50 rounded-t-lg' : ''}`}>
      <p className={`text-xs sm:text-sm font-medium ${isCurrentDay ? 'text-purple-600' : 'text-gray-600'}`}>{dayName}</p>
      <p className={`text-base sm:text-xl font-bold ${isCurrentDay ? 'text-purple-700' : 'text-gray-800'}`}>{dayNumber}</p>
    </div>
  );
};

interface MealPlanCalendarProps {
  weekDates: Date[];
  weekPlan: { [key: string]: any }; 
  onAddMeal: (date: string, mealType: string) => void;
}

export const MealPlanCalendar = ({ weekDates, weekPlan, onAddMeal }: MealPlanCalendarProps) => {
  const today = new Date();
  
  return (
    <div className="relative bg-white rounded-b-xl p-2 sm:p-4 shadow-md overflow-hidden">
      {/* Mobile view - horizontal scroll */}
      <div className="block lg:hidden overflow-x-auto pb-2">
        <div className="flex min-w-[700px]">
          {weekDates.map((date, idx) => (
            <div key={idx} className="flex-1">
              <DayColumn 
                date={date}
                dayPlan={weekPlan[format(date, 'EEE')]}
                onAddMeal={onAddMeal}
                isCurrentDay={isSameDay(date, today)}
              />
            </div>
          ))}
        </div>
        <div className="mt-2 text-center text-xs text-gray-500">
          Swipe horizontally to view more days
        </div>
      </div>
      
      {/* Desktop view - grid */}
      <div className="hidden lg:grid lg:grid-cols-7 gap-3">
        {weekDates.map((date, idx) => (
          <DayColumn 
            key={idx}
            date={date}
            dayPlan={weekPlan[format(date, 'EEE')]}
            onAddMeal={onAddMeal}
            isCurrentDay={isSameDay(date, today)}
          />
        ))}
      </div>
    </div>
  );
};