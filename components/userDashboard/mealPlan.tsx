import React from 'react';
import Image from 'next/image';

const MealPlanPreview: React.FC = () => {
  // This would come from your API or state management
  const mealPlan = [
    {
      day: 'Monday',
      meals: [
        { id: '101', name: 'Vegetable Omelette', image: '/images/omelette.jpg', type: 'Breakfast' },
        { id: '102', name: 'Chicken Salad', image: '/images/chicken-salad.jpg', type: 'Dinner' }
      ]
    },
    {
      day: 'Tuesday',
      meals: [
        { id: '103', name: 'Overnight Oats', image: '/images/oats.jpg', type: 'Breakfast' },
        { id: '104', name: 'Pasta Primavera', image: '/images/pasta-primavera.jpg', type: 'Dinner' }
      ]
    },
    {
      day: 'Wednesday',
      meals: [
        { id: '105', name: 'Avocado Toast', image: '/images/avocado-toast.jpg', type: 'Breakfast' },
        { id: '106', name: 'Fish Tacos', image: '/images/fish-tacos.jpg', type: 'Dinner' }
      ]
    }
  ];

  return (
    <div className="space-y-3 sm:space-y-4">
      {mealPlan.slice(0, 2).map((day) => (
        <div key={day.day} className="border-b border-border pb-3 last:border-b-0 last:pb-0">
          <h3 className="font-medium text-foreground mb-2 text-sm sm:text-base">{day.day}</h3>
          {day.meals.map((meal) => (
            <div key={meal.id} className="flex items-center mb-2 last:mb-0">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden mr-2 sm:mr-3 flex-shrink-0">
                <Image 
                  src={meal.image} 
                  alt={meal.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 40px, 48px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs sm:text-sm font-medium text-foreground truncate">{meal.name}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">{meal.type}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MealPlanPreview;