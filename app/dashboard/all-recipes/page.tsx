"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { SearchBar } from "@/components/recipesComponent/search";
import { RecipeCard } from "@/components/recipesComponent/recipeCardAll";
import { SortOptions } from "@/components/recipesComponent/sort";
import { CategoryFilter } from "@/components/recipesComponent/category";
import { getAllRecipes } from "@/app/api/(recipe)/userRecipes";
import { useAuthStore } from "@/app/store/authStore";

// Recipe type definition
interface Recipe {
  _id: string;
  id: string;
  title: string;
  category: string;
  cookingTime: number;
  difficulty: string;
  featuredImage: string;
  averageRating: number;
  adminName: string;
  createdAt: string;
  isPublished?: boolean;
}

// Empty state component for better UX
const EmptyState = () => {
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
      </motion.div>
      <h2 className="text-2xl font-bold text-white mb-3">No Recipes Yet</h2>
      <p className="text-gray-400 max-w-md mb-8">
        It looks like there aren't any recipes available at the moment. Check
        back soon as our chefs are always cooking up something new!
      </p>
      <Link href="/dashboard">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:from-purple-700 hover:to-pink-700 transition-all"
        >
          Return to Dashboard
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
const AllRecipesPage = () => {
  const { user, token} = useAuthStore()
  console.log({token})
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
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const recipesPerPage = 10;

  // Fetch recipes function
  const fetchRecipes = async () => {
    setIsLoading(true);
    setHasError(false);
  
    try {
      const response = await getAllRecipes( {
        page: currentPage,
        limit: recipesPerPage,
        search: searchQuery || undefined,
        category: category !== "all" ? category : undefined,
        sort: sortBy
      });
  
      console.log("API Response:", response); // Log the full response for debugging
  
      if (response && response.status === 200) {
        setRecipes(response.data || []);
  
        // Extract pagination info
        if (response.pagination) {
          setTotalPages(response.pagination.pages);
        }
  
        // Extract unique categories if this is first load
        if (isFirstLoad && response.data?.length > 0) {
          const uniqueCategories = Array.from(
            new Set(response.data.map((recipe: Recipe) => recipe.category))
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

  // Fetch recipes on mount and when filters change
  useEffect(() => {
    fetchRecipes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, category, sortBy]);

  // Handle search with explicit button click or Enter key
  const handleSearch = () => {
    setCurrentPage(1);
    fetchRecipes();
  };

  return (
    <div className="px-4 py-8 md:px-8 max-w-7xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          All Recipes
        </h1>
        <p className="text-gray-400 mt-2">
          Discover and explore delicious recipes from our community
        </p>
      </motion.div>

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
          <SortOptions value={sortBy} onChange={handleSortChange} />
        </div>

        {categories.length > 0 && (
          <div className="mt-4">
          <CategoryFilter
            categories={categories}
            selectedCategory={category}
            onChange={handleCategoryChange}
          />
          </div>
        )}
      </motion.div>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center h-64">
          <div className="w-16 h-16 mb-4 border-t-4 border-b-4 border-purple-500 rounded-full animate-spin"></div>
          <p className="text-gray-400">Loading tasty recipes...</p>
        </div>
      ) : hasError ? (
        <ErrorState message={errorMessage} retry={fetchRecipes} />
      ) : recipes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recipes.map((recipe, index) => (
              <motion.div
                key={recipe._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.05 * index }}
              >
                <RecipeCard recipe={recipe} />
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
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
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
        <EmptyState />
      )}
    </div>
  );
};

export default AllRecipesPage;
