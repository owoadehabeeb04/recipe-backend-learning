"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { SearchBar } from "@/components/recipesComponent/search";
import { RecipeCard } from "@/components/recipesComponent/recipeCardAll";
import { CategoryFilter } from "@/components/recipesComponent/category";
import { SortOptions } from "@/components/recipesComponent/sort";
import { useAuthStore } from "@/app/store/authStore";
import Link from "next/link";
import toast from "react-hot-toast";
import { getFavorites } from "@/app/api/(favorites)/favorites";

// Recipe type definition
export interface Recipe {
  _id: string;
  title: string;
  category: string;
  cookingTime: number;
  difficulty: string;
  featuredImage: string;
  averageRating: number;
  adminName: string;
  createdAt: string;
  isPublished?: boolean;
  adminDetails: {
    name: string;
    email: string;
  };
  isFavorited: boolean;
  recipe: {
    _id: string;
    title: string;
    category: string;
    cookingTime: number;
    difficulty: string;
    featuredImage: string;
    averageRating: number;
    adminName: string;
    createdAt: string;
    isPublished?: boolean;
    adminDetails: {
      name: string;
      email: string;
    };
    isFavorited: boolean;
  }
}

// Empty state component for when no favorites exist
const EmptyFavorites = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-96 text-center px-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="w-32 h-32 mb-8 rounded-full bg-gradient-to-br from-pink-600/20 to-purple-600/20 border border-pink-500/20 flex items-center justify-center"
      >
        <svg
          className="w-16 h-16 text-pink-400/70"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </svg>
      </motion.div>
      <h2 className="text-2xl font-bold text-white mb-3">No Favorites Yet</h2>
      <p className="text-gray-400 max-w-md mb-8">
        You haven't added any recipes to your favorites. Browse our recipes and
        click the heart icon to save your favorites for easy access later!
      </p>
      <Link href="/dashboard/all-recipes">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Browse Recipes
        </motion.button>
      </Link>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
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
      <h3 className="text-xl font-medium text-white mb-2">No favorites found</h3>
      <p className="text-gray-400 max-w-md">
        {searchQuery
          ? `We couldn't find any favorites matching "${searchQuery}"${
              category !== "all" ? ` in ${category}` : ""
            }.`
          : `No favorites found${category !== "all" ? ` in ${category}` : ""}.`}
      </p>
      <button
        onClick={clearFilters}
        className="mt-4 px-4 py-2 bg-gray-800/70 rounded-full text-gray-300 hover:bg-gray-700 transition-all"
      >
        Clear filters
      </button>
    </motion.div>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
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
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
    </motion.div>
  );
};

// Main Page Component
const FavoriteRecipes = () => {
  const { user, token } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [categories, setCategories] = useState<string[]>([]);
  const recipesPerPage = 10;
console.log({recipes})



  // Fetch favorites function
  const fetchFavorites = async () => {
    if (!token) {
      toast.error("You must be logged in to view favorites");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    try {
      const response = await getFavorites(token, {
        page: currentPage,
        limit: recipesPerPage,
        search: searchQuery || undefined,
        category: category !== "all" ? category : undefined,
        sort: sortBy
      });

      if (response && response.data) {
        // Mark all recipes as favorited since they're in the favorites list
        const favoriteRecipes = response.data.map((recipe: Recipe) => ({
          ...recipe,
          isFavorited: true
        }));
        setRecipes(favoriteRecipes);

        // Extract pagination info
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
        }

        // Extract unique categories if available
        console.log({favoriteRecipes})
        if (favoriteRecipes.length > 0) {

          const uniqueCategories = Array.from(
            new Set(favoriteRecipes.map((recipe: Recipe) => recipe.recipe.category))
          ).filter(Boolean);
          console.log({uniqueCategories})
          setCategories(uniqueCategories as string[]);
        }
      } else {
        setHasError(true);
        setErrorMessage(response?.message || "Failed to fetch favorites");
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setHasError(true);
      setErrorMessage("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear filters handler
  const clearFilters = () => {
    setSearchQuery("");
    setCategory("all");
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

  // Sort change handler
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setCurrentPage(1); // Reset to first page when changing sort
  };

  // Paginate function
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Fetch favorites on mount and when filters change
  useEffect(() => {
    if (token) {
      fetchFavorites();
    } else {
      setIsLoading(false);
    }
  }, [currentPage, category, sortBy, token]);

  // Handle search with explicit button click
  const handleSearch = () => {
    setCurrentPage(1);
    fetchFavorites();
  };

  // Update favorites list when a recipe is unfavorited
  const handleUnfavorite = (recipeId: string) => {
    setRecipes((prev) => prev.filter((recipe) => recipe._id !== recipeId));
  };

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold text-white mb-4">Sign In Required</h2>
        <p className="text-gray-400 mb-6">
          Please sign in to view your favorite recipes
        </p>
        <Link href="/login">
          <button className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white">
            Sign In
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-pink-400 to-purple-600">
          My Favorite Recipes
        </h1>
        <p className="text-gray-400 mt-2">
          Your personalized collection of saved recipes
        </p>
      </motion.div>

      {/* Search and Filter Options */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <SearchBar value={searchQuery} onChange={handleSearchChange} />
            <button
              onClick={handleSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 px-3 py-1 rounded-full bg-gray-700/50 text-white hover:bg-gray-600/50 transition-all"
            >
              Search
            </button>
          </div>
          {/* <SortOptions value={sortBy} onChange={handleSortChange} /> */}
        </div>

        {/* Category filters */}
        {categories.length > 0 && (
          <div className="mt-4">
            <CategoryFilter
              categories={categories}
              selectedCategory={category}
              onChange={handleCategoryChange}
            />
          </div>
        )}

        {/* Active filters display */}
        {(searchQuery || category !== "all" || sortBy !== "newest") && (
          <div className="flex items-center space-x-2 mt-4">
            <span className="text-sm text-gray-400">Active filters:</span>
            <div className="flex flex-wrap gap-2">
              {searchQuery && (
                <span className="px-2 py-1 bg-gray-800/70 text-gray-300 rounded-full text-xs flex items-center">
                  Search: {searchQuery}
                  <button 
                    onClick={() => setSearchQuery("")}
                    className="ml-1 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {category !== "all" && (
                <span className="px-2 py-1 bg-gray-800/70 text-gray-300 rounded-full text-xs flex items-center">
                  Category: {category}
                  <button 
                    onClick={() => setCategory("all")}
                    className="ml-1 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              
              {sortBy !== "newest" && (
                <span className="px-2 py-1 bg-gray-800/70 text-gray-300 rounded-full text-xs flex items-center">
                  Sort: {sortBy}
                  <button 
                    onClick={() => setSortBy("newest")}
                    className="ml-1 text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              )}
              
              <button
                onClick={clearFilters}
                className="px-2 py-1 bg-pink-900/30 text-pink-300 rounded-full text-xs hover:bg-pink-900/50 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Content Area */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="w-16 h-16 mb-4 border-t-4 border-b-4 border-pink-500 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading your favorites...</p>
        </div>
      ) : hasError ? (
        <ErrorState message={errorMessage} retry={fetchFavorites} />
      ) : recipes.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <p className="text-sm text-gray-400">
              Showing <span className="text-white">{recipes.length}</span> favorite{recipes.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
              >
                <RecipeCard recipe={recipe.recipe} />
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-12">
              <div className="inline-flex items-center space-x-1">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5"
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
                        <span className="px-3 py-1 text-gray-500">...</span>
                      )}
                      <button
                        onClick={() => paginate(number)}
                        className={`px-3 py-1 rounded-lg ${
                          currentPage === number
                            ? "bg-gradient-to-r from-pink-600 to-purple-600 text-white"
                            : "bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50"
                        }`}
                      >
                        {number}
                      </button>
                    </React.Fragment>
                  ))}

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 rounded-lg bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5"
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
        </>
      ) : searchQuery || category !== "all" ? (
        <NoSearchResults
          searchQuery={searchQuery}
          category={category}
          clearFilters={clearFilters}
        />
      ) : (
        <EmptyFavorites />
      )}
    </div>
  );
};

export default FavoriteRecipes;