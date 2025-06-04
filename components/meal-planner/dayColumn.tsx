import { format } from "date-fns";
import { Clock } from "lucide-react";
import { WeekdayHeader } from "./calendar";
import { MealSlotItem } from "./mealslot";

interface DayColumnProps {
  date: Date;
  dayPlan: Record<string, { mealType: string; recipe: any } | null>;
  onAddMeal: (dayStr: string, mealType: string) => void;
  isCurrentDay: boolean;
}

export const DayColumn = ({ date, dayPlan, onAddMeal, isCurrentDay }: DayColumnProps) => {
  const dayStr = format(date, 'EEE');
  
  const mealConfig = [
    { type: 'breakfast', label: 'Breakfast', icon: <Clock size={16} /> },
    { type: 'lunch', label: 'Lunch', icon: <Clock size={16} /> },
    { type: 'dinner', label: 'Dinner', icon: <Clock size={16} /> }
  ];
  return (
    <div className={`${isCurrentDay ? 'bg-purple-50 rounded-lg' : ''}`}>
      <WeekdayHeader date={date} isCurrentDay={isCurrentDay} />
      <div className="space-y-3 p-2">
        {mealConfig.map(meal => (
          <MealSlotItem 
            key={meal.type}
            mealData={dayPlan?.[meal.type] || { mealType: meal.type, recipe: null }}
            onClick={() => onAddMeal(dayStr, meal.type)}
            mealLabel={meal.label}
            icon={meal.icon}
          />
        ))}
      </div>
    </div>
  );
};
