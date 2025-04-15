"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { Recipe } from "@/types/recipe";
import { RecipeFilter } from "@/components/recipesComponent/recipeFilter";
import { RecipeCard } from "@/components/recipesComponent/recipeCard";
import { getAdminRecipes, deleteRecipe, toggleRecipePublishStatus } from "@/app/api/(recipe)/adminRecipe";
import { toast } from "react-hot-toast";

const MyRecipesPage = () => {
  const { token } = useAuthStore();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState("");
  const router = useRouter();

  // Filter recipes based on current filter
  const filteredRecipes = recipes.filter((recipe) => {
    if (filter === "all") return true;
    if (filter === "published") return recipe.isPublished;
    if (filter === "drafts") return !recipe.isPublished;
    return true;
  });

  const fetchRecipes = async () => {
    setIsLoading(true);
    setError("");
    
    if (!token) {
      setError("Authentication required");
      setIsLoading(false);
      return;
    }
    
    try {
      const response = await getAdminRecipes(token, currentPage, 10);
      
      if (response.success) {
        setRecipes(response.data || []);
        if (response.pagination) {
          setTotalPages(response.pagination.totalPages || response.pagination.pages);
        }
      } else {
        setError(response.message || "Failed to fetch recipes");
        toast.error(response.message || "Failed to fetch recipes");
      }
    } catch (err) {
      console.error("Error fetching recipes:", err);
      setError("An unexpected error occurred");
      toast.error("Failed to load recipes");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRecipe = () => {
    router.push("/dashboard/create-recipe");
  };

  const handleEditRecipe = (id: string) => {
    router.push(`/dashboard/edit-recipe/${id}`);
  };

  // const handleDeleteRecipe = async (id: string) => {
  //   if (!token) {
  //     toast.error("Authentication required");
  //     return;
  //   }
    
  //   if (confirm("Are you sure you want to delete this recipe?")) {
  //     try {
  //       const response = await deleteRecipe(id, token);
        
  //       if (response.success) {
  //         setRecipes(recipes.filter((recipe) => recipe._id !== id));
  //         toast.success("Recipe deleted successfully");
  //       } else {
  //         toast.error(response.message || "Failed to delete recipe");
  //       }
  //     } catch (err) {
  //       console.error("Error deleting recipe:", err);
  //       toast.error("An error occurred while deleting the recipe");
  //     }
  //   }
  // };

  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    if (!token) {
      toast.error("Authentication required");
      return;
    }
    
    // This will publish if currentStatus is false, and unpublish if currentStatus is true
    const newStatus = !currentStatus;
    
    try {
      const response = await toggleRecipePublishStatus(id, token);
      
      if (response.success) {
        setRecipes(
          recipes.map((recipe) =>
            recipe._id === id ? { ...recipe, isPublished: newStatus } : recipe
          )
        );
        toast.success(response.message || `Recipe ${newStatus ? 'published' : 'unpublished'} successfully`);
      } else {
        toast.error(response.message || "Failed to update recipe status");
      }
    } catch (err) {
      console.error("Error updating recipe status:", err);
      toast.error("An error occurred while updating the recipe");
    }
  };

  // Change page handler
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Fetch recipes when page changes or on initial load
  useEffect(() => {
    fetchRecipes();
  }, [currentPage, token]);

  // Check if user is authenticated
  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">
          Authentication Required
        </h2>
        <p className="text-gray-400 mb-6">
          You need to be logged in to view your recipes
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-8 md:px-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
            My Recipes
          </h1>
          <p className="text-gray-400 mt-2">
            Manage and organize your culinary creations
          </p>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onClick={handleCreateRecipe}
          className="mt-4 md:mt-0 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center shadow-lg shadow-purple-600/20"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            ></path>
          </svg>
          Create New Recipe
        </motion.button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <RecipeFilter activeFilter={filter} onFilterChange={setFilter} />
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <div className="w-16 h-16 mb-4 rounded-full bg-red-900/30 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Error Loading Recipes</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={fetchRecipes}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:from-purple-700 hover:to-pink-700 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : filteredRecipes.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 * index }}
              >
                <RecipeCard
                  recipe={recipe}
                  onEdit={() => handleEditRecipe(recipe._id)}
                  // onDelete={() => (recipe._id)}
                  refreshData={fetchRecipes}
                  onTogglePublish={() => handleTogglePublish(recipe._id, recipe.isPublished)}
                />
              </motion.div>
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <div className="flex space-x-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentPage === page
                        ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
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
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              ></path>
            </svg>
          </div>
          <h3 className="text-xl font-medium text-white mb-2">
            No recipes found
          </h3>
          <p className="text-gray-400 mb-6">
            {filter === "all"
              ? "You haven't created any recipes yet."
              : `You don't have any ${filter} recipes.`}
          </p>
          <button
            onClick={handleCreateRecipe}
            className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              ></path>
            </svg>
            Create Your First Recipe
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default MyRecipesPage;