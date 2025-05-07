"use client";

import React from "react";
import { useParams } from "next/navigation";
import { mealPlanStats } from "@/app/api/(meal-planner)/mealplanner";
import { useAuthStore } from "@/app/store/authStore";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { PlanStats } from "@/types/recipe";
import { useQuery } from "@tanstack/react-query";

export default function MealPlanStatsPage() {
  const params = useParams();
  const planId = params.id as string;
  const { token } = useAuthStore();

  // Use React Query for data fetching
  const { 
    data: statsResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['mealPlanStats', planId, token],
    queryFn: () => mealPlanStats(planId, token),
    enabled: !!planId && !!token, 
    staleTime: 5 * 60 * 1000, 
  });

  // Extract the stats from the response
  const stats: PlanStats | null = statsResponse?.data?.data || null;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 text-purple-500 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !statsResponse?.success) {
    const errorMessage = statsResponse?.message || "An error occurred while fetching stats";
    return (
      <div className="max-w-3xl mx-auto p-6 mt-12 text-center">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-red-600 mb-3">Error Loading Meal Plan Stats</h1>
          <p className="text-red-500 mb-4">{errorMessage}</p>
          <Link
            href="/dashboard/meal-planner"
            className="inline-block px-5 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Meal Planner
          </Link>
        </div>
      </div>
    );
  }

  // No stats available
  if (!stats) {
    return (
      <div className="max-w-3xl mx-auto p-6 mt-12 text-center">
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <h1 className="text-xl font-bold text-yellow-600 mb-3">No Stats Available</h1>
          <p className="text-yellow-500 mb-4">No statistics found for this meal plan.</p>
          <Link
            href="/dashboard/meal-planner"
            className="inline-block px-5 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Return to Meal Planner
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/meal-planner"
          className="text-indigo-600 hover:text-indigo-800 transition-colors flex items-center"
        >
          ← Back to Meal Planner
        </Link>
      </div>

      {/* Stats Display */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6">
          <h1 className="text-2xl font-bold text-white">{stats.title || "Meal Plan"}</h1>
          <p className="text-purple-100 mt-1">
            {stats.startDate ? new Date(stats.startDate).toLocaleDateString() : "-"} -{" "}
            {stats.endDate ? new Date(stats.endDate).toLocaleDateString() : "-"}
          </p>
        </div>

        <div className="p-6">
          {/* Description */}
          {stats.description && (
            <div className="mb-6">
              <p className="text-gray-700">{stats.description}</p>
            </div>
          )}

          {/* Notes */}
          {stats.notes && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">Notes</h3>
              <p className="text-gray-700">{stats.notes}</p>
            </div>
          )}

          {/* Basic Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-4">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100/50">
              <div className="text-3xl font-bold text-indigo-600 mb-1">{stats.totalMeals || 0}</div>
              <div className="text-sm text-gray-600">Total meals</div>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100/50">
              <div className="text-3xl font-bold text-purple-600 mb-1">{stats.uniqueRecipes || 0}</div>
              <div className="text-sm text-gray-600">Unique recipes</div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-xl p-4 border border-pink-100/50">
              <div className="text-3xl font-bold text-pink-600 mb-1">{stats.numberOfDays || 0}</div>
              <div className="text-sm text-gray-600">Days</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-4 border border-amber-100/50">
              <div className="text-3xl font-bold text-amber-600 mb-1">
                {stats.totalMeals && stats.numberOfDays
                  ? Math.round((stats.totalMeals / stats.numberOfDays) * 10) / 10
                  : 0}
              </div>
              <div className="text-sm text-gray-600">Avg. meals/day</div>
            </div>
          </div>

          {/* Meals by Type */}
          {stats.mealsByType && (
            <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 mb-6">
              <h3 className="text-lg font-medium text-gray-700 mb-4">Meals by Type</h3>
              <div className="flex space-x-6 justify-center">
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-2">
                    <span className="text-amber-600 text-lg">🍳</span>
                  </div>
                  <div className="text-2xl font-semibold text-amber-600">{stats.mealsByType.breakfast || 0}</div>
                  <div className="text-sm text-gray-500">Breakfast</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-2">
                    <span className="text-emerald-600 text-lg">🥗</span>
                  </div>
                  <div className="text-2xl font-semibold text-emerald-600">{stats.mealsByType.lunch || 0}</div>
                  <div className="text-sm text-gray-500">Lunch</div>
                </div>
                <div className="flex-1 text-center">
                  <div className="w-12 h-12 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-2">
                    <span className="text-blue-600 text-lg">🍽️</span>
                  </div>
                  <div className="text-2xl font-semibold text-blue-600">{stats.mealsByType.dinner || 0}</div>
                  <div className="text-sm text-gray-500">Dinner</div>
                </div>
              </div>
            </div>
          )}

          {/* Nutrition Summary */}
          {stats.nutritionSummary && stats.nutritionSummary.averageDaily && (
            <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100/50 mb-6">
              <h3 className="text-lg font-medium text-indigo-800 mb-4">Daily Nutrition (Average)</h3>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-pink-600">
                    {Math.round(stats.nutritionSummary.averageDaily.calories || 0)}
                    <span className="text-sm font-normal ml-1">kcal</span>
                  </div>
                  <div className="text-sm text-gray-500">Calories</div>
                </div>
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {Math.round(stats.nutritionSummary.averageDaily.protein || 0)}
                    <span className="text-sm font-normal ml-1">g</span>
                  </div>
                  <div className="text-sm text-gray-500">Protein</div>
                </div>
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-indigo-600">
                    {Math.round(stats.nutritionSummary.averageDaily.carbs || 0)}
                    <span className="text-sm font-normal ml-1">g</span>
                  </div>
                  <div className="text-sm text-gray-500">Carbs</div>
                </div>
                <div className="bg-white/60 p-3 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {Math.round(stats.nutritionSummary.averageDaily.fat || 0)}
                    <span className="text-sm font-normal ml-1">g</span>
                  </div>
                  <div className="text-sm text-gray-500">Fat</div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 text-center text-sm text-gray-500">
            <p>Last updated: {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleString() : "-"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}