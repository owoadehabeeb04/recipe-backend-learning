import React from 'react';
import { Loader } from 'lucide-react';
import { addWeeks, subWeeks, startOfWeek } from 'date-fns';
import { CalendarHeader, MealPlanCalendar } from './calendar';

interface MealPlannerCalendarViewProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  weekDates: Date[];
  weekPlan: any;
  currentWeekPlanId: string | null;
  onAddMeal: (day: string, mealType: string) => void;
  isLoading: boolean;
}

const MealPlannerCalendarView: React.FC<MealPlannerCalendarViewProps> = ({
  currentDate,
  setCurrentDate,
  weekDates,
  weekPlan,
  currentWeekPlanId,
  onAddMeal,
  isLoading
}) => {
  const goToPreviousWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToNextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const goToCurrentWeek = () => setCurrentDate(startOfWeek(new Date(), { weekStartsOn: 1 }));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center">
          <Loader size={32} className="text-purple-500 animate-spin mb-4" />
          <p className="text-gray-500">Loading meal plan...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* <div className="p-4 bg-purple-50 border-b border-purple-100 flex items-center justify-between">
          {currentWeekPlanId && (
            <div className="text-purple-600 text-sm px-3 py-1 bg-purple-100 rounded-full">
              Plan loaded for this week
            </div>
          )}
          <div></div> 
        </div> */}
        
        <CalendarHeader
          currentDate={currentDate}
          onPrevWeek={goToPreviousWeek}
          onNextWeek={goToNextWeek}
          onToday={goToCurrentWeek}
        />
        
        <MealPlanCalendar
          weekDates={weekDates}
          weekPlan={weekPlan}
          onAddMeal={onAddMeal}
        />
      </div>
    </div>
  );
};

export default MealPlannerCalendarView;