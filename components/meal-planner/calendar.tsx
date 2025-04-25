
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from "date-fns";
import { CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { DayColumn } from "./dayColumn";
// the calendar header 



interface CalendarHeaderProps {
  currentDate: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}



export const CalendarHeader = ({ currentDate, onPrevWeek, onNextWeek, onToday }: CalendarHeaderProps) => {

  const monthYear = format(currentDate, 'MMMM yyyy');
  
  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-xl p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold flex items-center">
          <CalendarIcon className="mr-2" size={20} />
          {monthYear}
        </h2>
        <div className="flex space-x-2">
          <button 
            onClick={onPrevWeek}
            className="p-2 rounded-full hover:bg-white/20 transition"
            aria-label="Previous week"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={onToday}
            className="px-3 py-1 bg-white/20 rounded-md hover:bg-white/30 transition text-sm font-medium"
          >
            Today
          </button>
          <button 
            onClick={onNextWeek}
            className="p-2 rounded-full hover:bg-white/20 transition"
            aria-label="Next week"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};


// weekday header component for the meal planning page
export const WeekdayHeader = ({ date, isCurrentDay }: { date: Date; isCurrentDay: boolean }) => {
    const dayNumber = format(date, 'd');
    const dayName = format(date, 'EEE');
    
    return (
      <div className={`text-center py-3 ${isCurrentDay ? 'bg-purple-50 rounded-t-lg' : ''}`}>
        <p className={`text-sm font-medium ${isCurrentDay ? 'text-purple-600' : 'text-gray-600'}`}>{dayName}</p>
        <p className={`text-xl font-bold ${isCurrentDay ? 'text-purple-700' : 'text-gray-800'}`}>{dayNumber}</p>
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
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3 bg-white rounded-b-xl p-4 shadow-md">
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
    );
  };
  