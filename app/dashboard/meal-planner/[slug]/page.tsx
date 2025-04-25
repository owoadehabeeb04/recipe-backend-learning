
// This ensures the component is rendered on the client side
'use client';
import React from 'react';
import { notFound } from 'next/navigation';
import { format, parseISO, addDays } from 'date-fns';
import { useAuthStore } from '@/app/store/authStore';


export default function MealPlanPage({ params }: { params: { weekId: string } }) {
  const { weekId } = params;
  const { token } = useAuthStore();
  const [mealPlan, setMealPlan] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchMealPlan = async () => {
      try {
        setLoading(true);
        // This is where you'd call your API to get the meal plan for the specified week
        const response = await getMealPlanByWeek(weekId, token);
        if (response.success) {
          setMealPlan(response.data);
        } else {
          throw new Error(response.message || 'Failed to load meal plan');
        }
      } catch (err) {
        console.error('Error fetching meal plan:', err);
        setError('Unable to load this meal plan. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMealPlan();
  }, [weekId, token]);

  // Handle loading state
  if (loading) {
    return <MealPlannerDetailsSkeleton />;
  }

  // Handle error state
  if (error || !mealPlan) {
    return <MealPlannerError error={error} />;
  }

  return <MealPlannerDetails mealPlan={mealPlan} weekId={weekId} />;
}

// Loading skeleton component
const MealPlannerDetailsSkeleton = () => (
  <div className="p-6 max-w-7xl mx-auto">
    <div className="h-12 w-1/3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg mb-8 animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {Array(7).fill(0).map((_, i) => (
        <div key={i} className="bg-black/10 backdrop-blur-sm border border-purple-900/10 rounded-xl p-4">
          <div className="h-6 w-24 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded mb-4 animate-pulse"></div>
          {Array(3).fill(0).map((_, j) => (
            <div key={j} className="mb-4">
              <div className="h-4 w-20 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded mb-2 animate-pulse"></div>
              <div className="h-24 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-lg animate-pulse"></div>
            </div>
          ))}
        </div>
      ))}
    </div>
  </div>
);

// Error component
const MealPlannerError = ({ error }: { error: string | null }) => (
  <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
    <div className="w-20 h-20 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-full flex items-center justify-center mb-6">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Meal Plan Not Found</h2>
    <p className="text-purple-300/70 text-center max-w-md mb-6">{error || 'This meal plan could not be loaded. It may have been deleted or you may not have permission to view it.'}</p>
    <a href="/dashboard/meal-planner" className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition">
      Return to Meal Planner
    </a>
  </div>
);