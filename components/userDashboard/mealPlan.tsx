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
    <div className="space-y-4">
      {mealPlan.slice(0, 2).map((day) => (
        <div key={day.day} className="border-b pb-3 last:border-b-0 last:pb-0">
          <h3 className="font-medium text-gray-700 mb-2">{day.day}</h3>
          {day.meals.map((meal) => (
            <div key={meal.id} className="flex items-center mb-2 last:mb-0">
              <div className="relative w-12 h-12 rounded-full overflow-hidden mr-3">
                <Image 
                  src={meal.image} 
                  alt={meal.name}
                  layout="fill" 
                  objectFit="cover"
                />
              </div>
              <div>
                <p className="text-sm font-medium">{meal.name}</p>
                <p className="text-xs text-gray-500">{meal.type}</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export default MealPlanPreview;