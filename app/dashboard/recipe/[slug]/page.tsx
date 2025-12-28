"use client";

import React, { useState, useEffect } from "react";
 
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { getRecipeDetails } from "@/app/api/(recipe)/userRecipes";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/app/store/authStore";
import { toggleRecipePublishStatus } from "@/app/api/(recipe)/adminRecipe";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import ReviewsAndRatings from "@/components/recipesComponent/reviewsAndComments";
import CookingController from "@/components/recipesComponent/recipesController";

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface Recipe {
  _id: string;
  title: string;
  category: string;
  cookingTime: number;
  difficulty: string;
  featuredImage: string;
  description: string;
  ingredients: Ingredient[];
  steps: string[];
  tips: string[];
  servings: number;
  averageRating?: number;
  adminName?: string;
  isPublished?: boolean;
  createdAt: string;
  updatedAt?: string;
  adminDetails?: {
    name: string;
    email: string;
    role: string;
    _id: string;
  };
  instructions?: string[];
  reviews?: any;
  images?: string[];
  userDetails?: {
    name: string;
    email: string;
    role: string;
    _id: string;
  }
  nutrition?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    sugar?: number;
    fiber?: number;
  };
}

const RecipeDetailPage = () => {
  const { user: currentUser, token } = useAuthStore();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug;
  const [servings, setServings] = useState(4);

  // React Query hook for fetching recipe details
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["recipe", slug],
    queryFn: () => getRecipeDetails(slug as string),
    enabled: !!slug // Only run query if slug exists
  });

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to load recipe");
    }
  }, [error]);

  // Set servings when recipe data loads
  useEffect(() => {
    if (data?.success && data.data) {
      setServings(data.data.servings);
    }
  }, [data]);

  const recipe: Recipe | null = data?.success ? data.data : null;
  const adjustServingQuantity = (
    ingredient: Ingredient,
    originalServings: number
  ) => {
    const ratio = servings / originalServings;

    // Try to parse as number
    const qty = parseFloat(ingredient.quantity);

    // If it's a valid number, scale it, otherwise return original
    if (!isNaN(qty)) {
      const scaled = (qty * ratio).toFixed(1).replace(/\.0$/, "");
      return scaled;
    }

    return ingredient.quantity;
  };

  const difficultyColors = {
    easy: "from-green-500 to-emerald-700",
    medium: "from-amber-500 to-amber-700",
    hard: "from-red-500 to-red-700"
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // toggle fucntion
  const [isUpdating, setIsUpdating] = useState(false);

  const queryClient = useQueryClient();

  const togglePublishMutation = useMutation({
    mutationFn: async ({
      recipeId,
      token
    }: {
      recipeId: string;
      token: string | undefined;
    }) => {
      if (!token) {
        throw new Error("Authentication required");
      }
      return await toggleRecipePublishStatus(recipeId, token);
    },
    onMutate: () => {
      setIsUpdating(true);
    },
    onSuccess: (result) => {
      if (result.success) {
        const message = recipe?.isPublished
          ? "Recipe unpublished successfully"
          : "Recipe published successfully";

        toast.success(message);

        // Invalidate and refetch the recipe data
        queryClient.invalidateQueries({ queryKey: ["recipe", slug] });
      } else {
        toast.error(result.message || "Failed to update recipe status");
      }
    },
    onError: (error) => {
      console.error("Error updating publish status:", error);
      toast.error("Failed to update recipe status");
    },
    onSettled: () => {
      setIsUpdating(false);
    }
  });

  // Add this to your component to handle the toggle button click
  const handleTogglePublish = async () => {
    if (!recipe?._id) {
      toast.error("Recipe ID not found");
      return;
    }

    togglePublishMutation.mutate({
      recipeId: recipe._id,
      token: token ?? undefined
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[70vh] px-2">
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isError || !recipe) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mb-4 sm:mb-6 rounded-full bg-card border border-border flex items-center justify-center">
          <svg
            className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M9 16h6l.5-1.5a4.535 4.535 0 00-7 0L9 16z"
            ></path>
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2 text-center">Recipe Not Found</h2>
        <p className="text-muted-foreground mb-6 text-center max-w-md text-sm sm:text-base">
          We couldn't find the recipe you're looking for. It might have been
          removed or doesn't exist.
        </p>
        <Link href="/dashboard/all-recipes">
          <button className="px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-all text-sm sm:text-base">
            Browse All Recipes
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-6 md:py-8 md:px-8">
      <div
        //{ opacity: 0, y: 20 }}
        // opacity: 1, y: 0 }}
        // duration: 0.5 }}
      >
        {/* Breadcrumb Navigation */}
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-6 flex-wrap gap-1 sm:gap-0">
          <Link
            href="/dashboard"
            className="hover:text-foreground transition-colors"
          >
            Dashboard
          </Link>
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
          <Link
            href="/dashboard/all-recipes"
            className="hover:text-foreground transition-colors"
          >
            Recipes
          </Link>
          <svg
            className="w-3 h-3 sm:w-4 sm:h-4 mx-1 sm:mx-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 5l7 7-7 7"
            ></path>
          </svg>
          <span className="text-foreground line-clamp-1 max-w-[150px] sm:max-w-[200px]">
            {recipe.title}
          </span>
        </div>

        {/* Recipe Hero Section */}
        <div className="relative rounded-xl sm:rounded-2xl md:rounded-3xl overflow-hidden mb-6 sm:mb-8 md:mb-10">
          <div className="absolute inset-0">
            <Image
              src={recipe.featuredImage || "/placeholder-recipe.jpg"}
              alt={recipe.title}
              fill
              className="object-cover"
              sizes="100vw"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/60 to-black/40" />
          </div>

          <div className="relative pt-20 sm:pt-24 md:pt-32 pb-8 sm:pb-12 md:pb-16 px-4 sm:px-6 md:px-10 flex flex-col items-center text-center">
            {/* changing published status  */}
            {currentUser?.role === "super_admin" && (
              <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-10">
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
                  <span
                    className={`text-[10px] sm:text-xs font-medium ${
                      recipe?.isPublished ? "text-green-400" : "text-amber-400"
                    }`}
                  >
                    {recipe?.isPublished ? "Published" : "Draft"}
                  </span>

                  {/* Toggle Switch */}
                  <button
                    onClick={handleTogglePublish}
                    disabled={isUpdating}
                    className="relative inline-flex h-5 w-9 sm:h-6 sm:w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                    role="switch"
                    aria-checked={recipe?.isPublished || false}
                  >
                    <span
                      className={`${
                        isUpdating
                          ? "bg-muted"
                          : recipe?.isPublished
                            ? "bg-green-600"
                            : "bg-amber-600"
                      } w-9 h-5 sm:w-11 sm:h-6 rounded-full transition-colors ease-in-out duration-200`}
                    />
                    <span
                      className={`${
                        recipe?.isPublished ? "translate-x-4 sm:translate-x-6" : "translate-x-0.5 sm:translate-x-1"
                      } inline-block h-4 w-4 transform rounded-full bg-primary-foreground transition ease-in-out duration-200 ${
                        isUpdating ? "opacity-70" : ""
                      }`}
                      aria-hidden="true"
                    />

                    {/* Loading indicator (spins inside the toggle when updating) */}
                    {isUpdating && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        <svg
                          className="animate-spin h-2.5 w-2.5 sm:h-3 sm:w-3 text-primary-foreground"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                      </span>
                    )}
                  </button>

                  <div className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-card/80 backdrop-blur-sm border border-border">
                    {recipe?.isPublished ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <svg
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          ></path>
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          ></path>
                        </svg>
                        Visible
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-amber-400">
                        <svg
                          className="w-2.5 h-2.5 sm:w-3 sm:h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                          ></path>
                        </svg>
                        Hidden
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div></div>

            <span
              className={`px-2 sm:px-3 py-0.5 sm:py-1 mb-3 sm:mb-4 text-[10px] sm:text-xs font-medium uppercase tracking-wider rounded-full bg-gradient-to-r ${
                difficultyColors[
                  recipe.difficulty as keyof typeof difficultyColors
                ] || "from-amber-500 to-amber-700"
              } text-white`}
            >
              {recipe.difficulty}
            </span>

            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 max-w-3xl">
              {recipe.title}
            </h1>

            <div className="flex flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center mb-4 sm:mb-6">
              <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white mr-1 sm:mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  ></path>
                </svg>
                <span className="text-white text-xs sm:text-sm">
                  {recipe.cookingTime} min
                </span>
              </div>

              <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white mr-1 sm:mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  ></path>
                </svg>
                <span className="text-white text-xs sm:text-sm">
                  Serves {recipe.servings}
                </span>
              </div>

              {recipe.averageRating && (
                <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                  <svg
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white mr-1 sm:mr-1.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                  </svg>
                  <span className="text-white text-xs sm:text-sm">
                    {recipe.averageRating.toFixed(1)} Rating
                  </span>
                </div>
              )}

              <div className="flex items-center px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
                <svg
                  className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white mr-1 sm:mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  ></path>
                </svg>
                <span className="text-white text-xs sm:text-sm capitalize">
                  {recipe.category}
                </span>
              </div>
            </div>

            <p className="text-white/90 max-w-2xl mb-6 sm:mb-8 text-sm sm:text-base px-2">{recipe.description}</p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-0 text-xs sm:text-sm text-white/90">
              <div className="flex items-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold">
                  {recipe?.adminDetails?.name.charAt(0).toUpperCase() ||
                    recipe?.userDetails?.name.charAt(0).toUpperCase() ||
                    ""}
                </div>
                <span className="ml-2 text-white">
                  By{" "}
                  {recipe?.adminDetails?.name ||
                    recipe?.userDetails?.name ||
                    "Chef"}
                </span>
              </div>
              <span className="hidden sm:inline mx-3 text-white/60">•</span>
              <span className="text-white/90">{formatDate(recipe.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Recipe Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
          {/* Left Side - Ingredients */}
          <div className="lg:col-span-1">
            <div className="bg-card backdrop-blur-sm border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-foreground">Ingredients</h2>
                <div className="flex items-center">
                  <button
                    onClick={() => setServings(Math.max(1, servings - 1))}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted hover:bg-muted/80 border border-border flex items-center justify-center transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M20 12H4"
                      ></path>
                    </svg>
                  </button>
                  <span className="mx-2 sm:mx-3 text-foreground font-medium text-sm sm:text-base">
                    {servings} servings
                  </span>
                  <button
                    onClick={() => setServings(servings + 1)}
                    className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-muted hover:bg-muted/80 border border-border flex items-center justify-center transition-colors"
                  >
                    <svg
                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v12M6 12h12"
                      ></path>
                    </svg>
                  </button>
                </div>
              </div>

              <ul className="space-y-2 sm:space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <li
                    key={index}
                    className="flex items-center pb-2 sm:pb-3 border-b border-border last:border-0"
                  >
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-primary/20 flex items-center justify-center mr-2 sm:mr-3 flex-shrink-0">
                      <svg
                        className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        ></path>
                      </svg>
                    </div>
                    <span className="text-foreground text-sm sm:text-base">
                      {adjustServingQuantity(ingredient, recipe.servings)}{" "}
                      {ingredient.unit} {ingredient.name}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Print button */}
              <button
                onClick={() => window.print()}
                className="mt-4 sm:mt-6 w-full py-2.5 sm:py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg sm:rounded-xl flex items-center justify-center transition-colors text-sm sm:text-base"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  ></path>
                </svg>
                Print Recipe
              </button>
            </div>
          </div>

          {/* Nutritional Information Section */}
          {recipe.nutrition && (
            <div className="lg:col-span-1 order-3 lg:order-none">
              <div className="bg-card backdrop-blur-sm border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8 lg:mt-0">
                <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
                  Nutritional Information
                </h2>

                {/* Calories */}
                <div className="mb-4 sm:mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base sm:text-lg font-medium text-foreground">
                      {recipe.nutrition.calories} calories
                    </span>
                    <span className="text-xs sm:text-sm text-muted-foreground">per serving</span>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  {/* Protein */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-primary text-sm sm:text-base">
                        Protein
                      </span>
                      <span className="text-foreground text-xs sm:text-sm">
                        {recipe.nutrition.protein}g (
                        {Math.round(
                          ((recipe.nutrition.protein * 4) /
                            (recipe.nutrition.protein * 4 +
                              recipe.nutrition.carbs * 4 +
                              recipe.nutrition.fat * 9)) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 sm:h-2.5">
                      <div
                        className="bg-primary h-2 sm:h-2.5 rounded-full transition-all"
                        style={{
                          width: `${Math.round(
                            ((recipe.nutrition.protein * 4) /
                              (recipe.nutrition.protein * 4 +
                                recipe.nutrition.carbs * 4 +
                                recipe.nutrition.fat * 9)) *
                              100
                          )}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Carbs */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-primary text-sm sm:text-base">Carbs</span>
                      <span className="text-foreground text-xs sm:text-sm">
                        {recipe.nutrition.carbs}g (
                        {Math.round(
                          ((recipe.nutrition.carbs * 4) /
                            (recipe.nutrition.protein * 4 +
                              recipe.nutrition.carbs * 4 +
                              recipe.nutrition.fat * 9)) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 sm:h-2.5">
                      <div
                        className="bg-primary h-2 sm:h-2.5 rounded-full transition-all"
                        style={{
                          width: `${Math.round(
                            ((recipe.nutrition.carbs * 4) /
                              (recipe.nutrition.protein * 4 +
                                recipe.nutrition.carbs * 4 +
                                recipe.nutrition.fat * 9)) *
                              100
                          )}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Fat */}
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="font-medium text-primary text-sm sm:text-base">Fat</span>
                      <span className="text-foreground text-xs sm:text-sm">
                        {recipe.nutrition.fat}g (
                        {Math.round(
                          ((recipe.nutrition.fat * 9) /
                            (recipe.nutrition.protein * 4 +
                              recipe.nutrition.carbs * 4 +
                              recipe.nutrition.fat * 9)) *
                            100
                        )}
                        %)
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2 sm:h-2.5">
                      <div
                        className="bg-primary h-2 sm:h-2.5 rounded-full transition-all"
                        style={{
                          width: `${Math.round(
                            ((recipe.nutrition.fat * 9) /
                              (recipe.nutrition.protein * 4 +
                                recipe.nutrition.carbs * 4 +
                                recipe.nutrition.fat * 9)) *
                              100
                          )}%`
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Additional nutrition info in a grid */}
                  <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border">
                    {recipe.nutrition.sugar !== undefined && (
                      <div>
                        <span className="text-xs sm:text-sm text-muted-foreground">Sugar</span>
                        <p className="font-medium text-foreground text-sm sm:text-base">
                          {recipe.nutrition.sugar}g
                        </p>
                      </div>
                    )}

                    {recipe.nutrition.fiber !== undefined && (
                      <div>
                        <span className="text-xs sm:text-sm text-muted-foreground">Fiber</span>
                        <p className="font-medium text-foreground text-sm sm:text-base">
                          {recipe.nutrition.fiber}g
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted-foreground">
                  <p>* Nutritional values are estimated based on ingredients</p>
                </div>
              </div>
            </div>
          )}

          {/* Right Side - Instructions */}
          <div className="lg:col-span-2">
            <div className="bg-card backdrop-blur-sm border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-foreground mb-4 sm:mb-6">
                Instructions
              </h2>

              <ol className="space-y-4 sm:space-y-6">
                {recipe.steps.map((step, index) => (
                  <li
                    key={index}
                    //{ opacity: 0, y: 10 }}
                    // opacity: 1, y: 0 }}
                    // duration: 0.3, delay: index * 0.05 }}
                    className="flex"
                  >
                    <div className="mr-3 sm:mr-4 flex-shrink-0">
                      <span className="flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground font-medium text-sm sm:text-base">
                        {index + 1}
                      </span>
                    </div>
                    <div className="pt-0.5 sm:pt-1 flex-1">
                      <p className="text-foreground text-sm sm:text-base leading-relaxed">{step}</p>
                    </div>
                  </li>
                ))}
              </ol>

              {/* Tips Section */}

              {recipe?.tips && (
                <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-primary mr-2"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                        clipRule="evenodd"
                      ></path>
                    </svg>
                    <h3 className="text-base sm:text-lg font-medium text-foreground">
                      Chef's Tips
                    </h3>
                  </div>
                  <ul className="space-y-2 sm:space-y-3 text-foreground">
                    {recipe.tips &&
                      recipe.tips.map((tip, index) => (
                        <li
                          key={index}
                          //{ opacity: 0, y: 10 }}
                          // opacity: 1, y: 0 }}
                          // duration: 0.3, delay: index * 0.05 }}
                          className="flex items-start"
                        >
                          <svg
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 sm:mt-1 mr-2 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8-2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                          </svg>
                          <span className="text-sm sm:text-base">{tip}</span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
            {currentUser && (
      <CookingController
        recipeId={recipe._id}
        recipeName={recipe.title}
        recipeImage={recipe.images?.[0] || ''}
        totalSteps={recipe.instructions?.length || 0}
        onCookingStatusChange={(status) => {
          // You can update UI or trigger other actions based on status changes
        }}
      />
    )}
            {/* Rating and Comments Section */}
            {currentUser?.role === "user" && (
              <ReviewsAndRatings
                recipeId={recipe._id}
                currentUser={currentUser}
                initialReviews={recipe.reviews || []}
                initialAverageRating={recipe.averageRating || 0}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeDetailPage;
