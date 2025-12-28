import { format } from "date-fns";
import { Sunrise, Sun, Moon } from "lucide-react";
import { WeekdayHeader } from "./calendar";
import { MealSlotItem } from "./mealslot";
import { memo, useMemo, useCallback } from "react";

interface DayColumnProps {
  date: Date;
  dayPlan: Record<string, { mealType: string; recipe: any } | null>;
  onAddMeal: (dayStr: string, mealType: string) => void;
  isCurrentDay: boolean;
}

export const DayColumn = memo(({ date, dayPlan, onAddMeal, isCurrentDay }: DayColumnProps) => {
  const dayStr = useMemo(() => format(date, 'EEE'), [date]);
  
  // Better meal icons for visual clarity
  const mealConfig = useMemo(() => [
    { type: 'breakfast', label: 'Breakfast', icon: <Sunrise size={14} /> },
    { type: 'lunch', label: 'Lunch', icon: <Sun size={14} /> },
    { type: 'dinner', label: 'Dinner', icon: <Moon size={14} /> }
  ], []);

  // Memoized click handlers for each meal type
  const createMealClickHandler = useCallback((mealType: string) => {
    return () => onAddMeal(dayStr, mealType);
  }, [dayStr, onAddMeal]);

  return (
    <div className={`transition-all duration-200 ${
      isCurrentDay 
        ? 'bg-primary/5 rounded-xl border border-primary/20 shadow-sm' 
        : 'bg-card rounded-lg border border-border'
    }`}>
      <WeekdayHeader date={date} isCurrentDay={isCurrentDay} />
      
      {/* Meals Container - Better Spacing */}
      <div className="space-y-3 p-2 sm:p-3">
        {mealConfig.map(meal => (
          <MealSlotItem 
            key={meal.type}
            mealData={dayPlan?.[meal.type] || { mealType: meal.type, recipe: null }}
            onClick={createMealClickHandler(meal.type)}
            mealLabel={meal.label}
            icon={meal.icon}
          />
        ))}
      </div>
    </div>
  );
});

DayColumn.displayName = 'DayColumn';
