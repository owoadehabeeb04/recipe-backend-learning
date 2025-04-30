"use client";
import React, { use, useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { getMealPlanByWeek } from "@/app/api/(meal-planner)/mealplanner";
import MealPlannerDetails from "@/components/meal-planner/mealPlannerDetails";
import Link from "next/link";

export default function MealPlanPage({
  params
}: {
  params:any
}) {
  const unwrappedParams = params instanceof Promise ? use(params) : params;
  const { slug } = unwrappedParams;
  const { token } = useAuthStore();

  const [isLoading, setIsLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState(null);
  const [error, setError] = useState<string | null>(null);

  const fetchMealPlanByWeek = async (
    slug: string | Date,
    token: string | null
  ) => {
    try {
      setIsLoading(true);
      const response: any = await getMealPlanByWeek(slug, token);
      
      console.log("API response:", response); // For debugging
      
      // First check if we have a response
      if (!response) {
        setMealPlan(null);
        setError("No response received from the server");
        return;
      }
      
      // Then check if the response indicates success
      if (!response.success) {
        setMealPlan(null);
        setError(response.message || "Failed to load meal plan");
        return;
      }
      
      // Then check if we have the data structure we expect
      if (!response.data) {
        setMealPlan(null);
        setError("Response missing expected data structure");
        return;
      }
      
      // Finally, set the meal plan data
      setMealPlan(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching meal plan:", error);
      setMealPlan(null);
      setError(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (slug && token) {
      fetchMealPlanByWeek(slug, token);
    }
  }, [slug, token]);

  // Handle loading state
  if (isLoading) {
    return <MealPlannerDetailsSkeleton />;
  }

  // Better error handling with more specific checks
  if (error) {
    console.log({ error });
    console.error("API request failed:", error);
    return (
      <MealPlannerError
        error={
          error ||
          "An error occurred while fetching the meal plan. Please try again."}
      />
    );
  }

  if (!mealPlan) {
    console.error("No response received from API");
    return <MealPlannerError error="No response received from server" />;
  }

  // Check if we have actual meal plan data
  if (!mealPlan) {
    console.error("No meal plan data in response",);
    return <MealPlannerError error="No meal plan data found for this week" />;
  }

  // Everything looks good, render the meal plan
  return <MealPlannerDetails mealPlan={mealPlan} weekId={slug} />;
}

// Loading skeleton component
const MealPlannerDetailsSkeleton = () => (
  <div className="p-6 max-w-7xl mx-auto">
    <div className="h-12 w-1/3 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-lg mb-8 animate-pulse"></div>
    <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
      {Array(7)
        .fill(0)
        .map((_, i) => (
          <div
            key={i}
            className="bg-black/10 backdrop-blur-sm border border-purple-900/10 rounded-xl p-4"
          >
            <div className="h-6 w-24 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded mb-4 animate-pulse"></div>
            {Array(3)
              .fill(0)
              .map((_, j) => (
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
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 text-pink-600"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    </div>
    <h2 className="text-2xl font-bold text-white mb-2">Meal Plan Not Found</h2>
    <p className="text-purple-300/70 text-center max-w-md mb-6">
      {error ||
        "This meal plan could not be loaded. It may have been deleted or you may not have permission to view it."}
    </p>
    <Link
      href="/dashboard/meal-planner"
      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition"
    >
      Return to Meal Planner
    </Link>
  </div>
);
