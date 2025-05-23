import React from 'react';
import { format } from 'date-fns';
import { BookOpen, CalendarIcon, Plus } from 'lucide-react';
import { SavedPlan } from '@/types/recipe';

interface SavedPlansViewProps {
  savedPlans: SavedPlan[];
  isLoading: boolean;
  onViewPlan: (plan: SavedPlan) => void;
  onSetActiveTab: (tab: string) => void;
}

const SavedPlansView: React.FC<SavedPlansViewProps> = ({
  savedPlans,
  isLoading,
  onViewPlan,
  onSetActiveTab
}) => {
  const countMeals = (plan: any) => {
    let count = 0;
    for (const day in plan) {
      if (plan[day]?.breakfast?.recipe) count++; 
      if (plan[day]?.lunch?.recipe) count++;     
      if (plan[day]?.dinner?.recipe) count++;    
    }
    return count;
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl text-gray-700 font-bold mb-4">
          Your Saved Plans
        </h2>
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }

  if (savedPlans.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl text-gray-700 font-bold mb-4">
          Your Saved Plans
        </h2>
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-purple-500 mb-4">
            <BookOpen size={24} />
          </div>
          <h3 className="text-lg font-medium text-gray-800">
            No saved plans yet
          </h3>
          <p className="mt-1 text-gray-500">
            Create and save your first meal plan
          </p>
          <button
            onClick={() => onSetActiveTab("planner")}
            className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium"
          >
            Create a Plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl text-gray-700 font-bold mb-4">
        Your Saved Plans
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedPlans.map((plan) => (
          <div
            key={plan.id || plan._id}
            onClick={() => onViewPlan(plan)}
            className="bg-gradient-to-b from-gray-900 to-gray-800 backdrop-blur-sm border border-[color:var(--purple-900)]/30 rounded-xl overflow-hidden hover:shadow-lg hover:shadow-[color:var(--purple-600)]/20 cursor-pointer transition group"
          >
            <div className="p-5">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-white text-lg group-hover:text-white/90 transition">
                  {plan.name}
                </h4>
                <span className="text-xs bg-[color:var(--purple-900)]/40 text-white px-3 py-1 rounded-full border border-[color:var(--purple-700)]/40">
                  {format(plan.date, "MMM d, yyyy")}
                </span>
              </div>

              <div className="flex items-center text-sm text-white/80 mb-4">
                <div className="flex items-center mr-4">
                  <CalendarIcon className="h-4 w-4 mr-1.5 text-white" />
                  <span>7 days</span>
                </div>
                <div className="flex items-center">
                  <Plus className="h-4 w-4 mr-1.5 text-white" />
                  <span>{countMeals(plan.plan)} meals</span>
                </div>
              </div>

              <div className="flex -space-x-1.5 mb-5">
                {["breakfast", "lunch", "dinner"].map((mealType) => (
                  <div
                    key={mealType}
                    className={`w-5 h-5 rounded-full border ${
                      mealType === "breakfast"
                        ? "bg-[color:var(--amber-600)]/50 border-[color:var(--amber-500)]/30"
                        : mealType === "lunch"
                          ? "bg-[color:var(--emerald-600)]/50 border-[color:var(--emerald-500)]/30"
                          : "bg-[color:var(--blue-600)]/50 border-[color:var(--blue-500)]/30"
                    }`}
                    title={`${mealType.charAt(0).toUpperCase() + mealType.slice(1)} meals`}
                  ></div>
                ))}
                <div className="w-5 h-5 rounded-full bg-[color:var(--purple-800)]/50 border border-[color:var(--purple-700)]/30 text-white flex items-center justify-center text-xs">
                  +
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedPlansView;