"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/recipesComponent/search";
import { RecipeCard } from "@/components/recipesComponent/recipeCardAll";
import { SortOptions } from "@/components/recipesComponent/sort";
import { CategoryFilter } from "@/components/recipesComponent/category";
import { CookingTimeFilter } from "@/components/recipesComponent/cookingTimeFilter";
import { getAllRecipes } from "@/app/api/(recipe)/userRecipes";
import { useAuthStore } from "@/app/store/authStore";
import { RecipeCardEditDelete } from "@/components/recipesComponent/recipeCard";
import { useRouter } from "next/navigation";
import { Recipe } from "@/types/recipe";

// Recipe type definition
// export interface Recipe {
//   _id: string;
//   title: string;
//   category: string;
//   cookingTime: number;
//   difficulty: string;
//   featuredImage: string;
//   averageRating: number;
//   adminName: string;
//   createdAt: string;
//   isPublished?: boolean;
//   adminDetails: {
//     name: string;
//     email: string;
//   };
//   roleCreated: string;
//   user: {
//     name: string;
//     email: string;
//   }
// }

// Empty state component for better UX
const EmptyState = () => {
  return (
    <div
      //{ opacity: 0 }}
      // opacity: 1 }}
      // duration: 0.5 }}
      className="flex flex-col items-center justify-center h-96 text-center px-4"
    >
      <div
        //{ scale: 0.8, opacity: 0 }}
        // scale: 1, opacity: 1 }}
        // delay: 0.2, duration: 0.5 }}
        className="w-32 h-32 mb-8 rounded-full bg-gradient-to-br from-purple-600/20 to-pink-600/20 border border-purple-500/20 flex items-center justify-center"
      >
        <svg
          className="w-16 h-16 text-purple-400/70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
          />
        </svg>
      </div>
      <h2 className="text-2xl font-bold text-white mb-3">No Recipes Yet</h2>
      <p className="text-gray-400 max-w-md mb-8">
        It looks like there aren't any recipes available at the moment. Check
        back soon as our chefs are always cooking up something new!
      </p>
      <Link href="/dashboard">
        <button
           // scale: 1.05 }}
          // whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Return to Dashboard
        </button>
      </Link>
    </div>
  );
};

// No search results component
const NoSearchResults = ({
  searchQuery,
  category,
  clearFilters
}: {
  searchQuery: string;
  category: string;
  clearFilters: () => void;
}) => {
  return (
    <div
      //{ opacity: 0 }}
      // opacity: 1 }}
      // duration: 0.5 }}
      className="flex flex-col items-center justify-center h-64 text-center"
    >
      <div className="w-16 h-16 mb-4 rounded-full bg-gray-800/70 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M9 16h6l.5-1.5a4.535 4.535 0 00-7 0L9 16z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-white mb-2">No recipes found</h3>
      <p className="text-gray-400 max-w-md">
        {searchQuery
          ? `We couldn't find any recipes matching "${searchQuery}"${
              category !== "all" ? ` in ${category}` : ""
            }.`
          : `No recipes found${category !== "all" ? ` in ${category}` : ""}.`}
      </p>
      <button
        onClick={clearFilters}
        className="mt-4 px-4 py-2 bg-gray-800/70 rounded-full text-gray-300 hover:bg-gray-700 transition-all"
      >
        Clear filters
      </button>
    </div>
  );
};

// Error state component
const ErrorState = ({
  message,
  retry
}: {
  message: string;
  retry: () => void;
}) => {
  return (
    <div
      //{ opacity: 0 }}
      // opacity: 1 }}
      // duration: 0.5 }}
      className="flex flex-col items-center justify-center h-64 text-center"
    >
      <div className="w-16 h-16 mb-4 rounded-full bg-red-900/20 flex items-center justify-center">
        <svg
          className="w-8 h-8 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 9 0 11-18 0 9 9 9 0 0118 0z"
          />
        </svg>
      </div>
      <h3 className="text-xl font-medium text-white mb-2">
        Something went wrong
      </h3>
      <p className="text-gray-400 max-w-md mb-4">{message}</p>
      <button
        onClick={retry}
        className="px-4 py-2 bg-gray-800/70 rounded-full text-gray-300 hover:bg-gray-700 transition-all"
      >
        Try again
      </button>
    </div>
  );
};

// Main Page Component
const AllRecipesPage = () => {
  const { user, token } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [cookingTime, setCookingTime] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const recipesPerPage = 10;
  const router = useRouter();
  const filterByCookingTime = (recipes: Recipe[]) => {
    if (cookingTime === "all") return recipes;

    return recipes.filter((recipe) => {
      const time = recipe.cookingTime || 0;
      switch (cookingTime) {
        case "quick":
          return time < 15;
        case "medium":
          return time >= 15 && time <= 30;
        case "long":
          return time > 30;
        default:
          return true;
      }
    });
  };

  const fetchRecipes = async () => {
    setIsLoading(true);
    setHasError(false);

    try {
      const response = await getAllRecipes({
        page: currentPage,
        limit: recipesPerPage,
        search: searchQuery || undefined,
        category: category !== "all" ? category : undefined,
        sort: sortBy
      });

      if (response && response.status === 200) {
        const allRecipes = response.data || [];
        const filteredRecipes =
          cookingTime !== "all" ? filterByCookingTime(allRecipes) : allRecipes;
        setRecipes(filteredRecipes);

        // Extract pagination info
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
        }

        // Extract unique categories if this is first load
        if (isFirstLoad && allRecipes.length > 0) {
          const uniqueCategories = Array.from(
            new Set(allRecipes.map((recipe: Recipe) => recipe.category))
          ).filter(Boolean);
          setCategories(uniqueCategories as string[]);
          setIsFirstLoad(false);
        }
      } else {
        setHasError(true);
        setErrorMessage(response?.message || "Failed to fetch recipes");
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
      setHasError(true);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const handleEditRecipe = (id: string) => {
    router.push(`/dashboard/edit-recipe/${id}`);
  };

  // Clear filters handler
  const clearFilters = () => {
    setSearchQuery("");
    setCategory("all");
    setCookingTime("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Search query change handler
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Category change handler
  const handleCategoryChange = (value: string) => {
    setCategory(value);
    setCurrentPage(1); // Reset to first page when changing category
  };

  // Cooking time change handler
  const handleCookingTimeChange = (value: string) => {
    setCookingTime(value);
    setCurrentPage(1); // Reset to first page when changing cooking time
  };

  // Sort change handler
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page when changing sort
  };

  // Paginate function
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Fetch recipes on mount and when filters change
  useEffect(() => {
    fetchRecipes();
  }, [currentPage, category, cookingTime, sortBy]);

  // Handle search with explicit button click or Enter key
  const handleSearch = () => {
    setCurrentPage(1);
    fetchRecipes();
  };

  return (
    <div className="px-4 py-6 sm:py-8 md:px-8 max-w-7xl mx-auto">
      {/* Improve heading responsiveness */}
      <div
        //{ opacity: 0, y: 20 }}
        // opacity: 1, y: 0 }}
        // duration: 0.5 }}
        className="mb-6 sm:mb-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          All Recipes
        </h1>
        <p className="text-sm sm:text-base text-gray-400 mt-2">
          Discover and explore delicious recipes from our community
        </p>
      </div>

      {/* Improve search and filter responsiveness */}
      <div
        //{ opacity: 0, y: 10 }}
        // opacity: 1, y: 0 }}
        // duration: 0.5, delay: 0.1 }}
        className="mb-6 sm:mb-8 space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div className="relative w-full sm:max-w-md">
            <SearchBar value={searchQuery} onChange={handleSearchChange} />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 sm:px-3 py-1 rounded-full bg-gray-700/50 text-white text-sm hover:bg-gray-600/50 transition-all"
            >
              Search
            </button>
          </div>
        </div>

        {/* Improve filter layout */}
        <div className="space-y-3 sm:space-y-4">
          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selectedCategory={category}
              onChange={handleCategoryChange}
            />
          )}

          <CookingTimeFilter
            selectedTime={cookingTime}
            onChange={handleCookingTimeChange}
          />
        </div>
      </div>

      {/* Recipe grid - improve for mobile */}
      {!isLoading && !hasError && recipes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {recipes.map((recipe, index) => (
            <div
              key={recipe._id}
              //{ opacity: 0, y: 20 }}
              // opacity: 1, y: 0 }}
              // duration: 0.3, delay: 0.05 * index }}
            >
              {user?.role === "user" ? (
                <RecipeCardEditDelete
                  recipe={recipe}
                  onEdit={() => handleEditRecipe(recipe._id)}
                  refreshData={fetchRecipes}
                />
              ) : (
                <RecipeCard recipe={recipe} />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Improve pagination for mobile */}
      {!isLoading && !hasError && recipes.length > 0 && totalPages > 1 && (
        <div className="flex justify-center mt-8 sm:mt-12">
          <div className="inline-flex items-center space-x-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Previous page"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(
                (num) =>
                  num === 1 ||
                  num === totalPages ||
                  (num >= currentPage - 1 && num <= currentPage + 1)
              )
              .map((number, i, array) => (
                <React.Fragment key={number}>
                  {i > 0 && array[i - 1] !== number - 1 && (
                    <span className="px-2 py-1 text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => paginate(number)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg ${
                      currentPage === number
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
                    }`}
                    aria-label={`Page ${number}`}
                    aria-current={currentPage === number ? "page" : undefined}
                  >
                    {number}
                  </button>
                </React.Fragment>
              ))}

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Next page"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Make loading state responsive */}
      {isLoading && (
        <div className="flex flex-col justify-center items-center h-48 sm:h-64">
          <div className="w-12 h-12 sm:w-16 sm:h-16 mb-3 sm:mb-4 border-t-3 sm:border-t-4 border-b-3 sm:border-b-4 border-purple-500 rounded-full animate-spin"></div>
          <p className="text-sm sm:text-base text-gray-400">Loading tasty recipes...</p>
        </div>
      )}

      {/* Make error state responsive */}
      {!isLoading && hasError && (
        <ErrorState message={errorMessage} retry={fetchRecipes} />
      )}

      {/* Make empty states responsive */}
      {!isLoading && !hasError && recipes.length === 0 && (searchQuery || category !== "all" || cookingTime !== "all") && (
        <NoSearchResults
          searchQuery={searchQuery}
          category={category}
          clearFilters={clearFilters}
        />
      )}

      {!isLoading && !hasError && recipes.length === 0 && !searchQuery && category === "all" && cookingTime === "all" && (
        <EmptyState />
      )}
    </div>
  );
};

export default AllRecipesPage;