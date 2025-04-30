import { motion } from "framer-motion";
import { BookOpen, Trash2 } from "lucide-react";
import React, { useState, useEffect } from "react";
import { getAllRecipes } from "@/app/api/(recipe)/userRecipes";
import { useAuthStore } from "@/app/store/authStore";
import { Recipe } from "@/types/recipe";
import { RecipeCard } from "../recipesComponent/recipeCardAll";
import { getFavorites } from "@/app/api/(favorites)/favorites";
import { useRouter } from "next/navigation";
import Image from "next/image";

export const RecipeSelector: React.FC<any> = ({
  mealType,
  onSelectRecipe,
  onClose,
  currentRecipe = null, // Pass the currently selected recipe, if any
  onRemoveRecipe = null // Pass a function to remove the recipe
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();
  const [showQuickCreateModal, setShowQuickCreateModal] = useState(false);
  const router = useRouter();

  // Fetch recipes based on active filter
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);

      try {
        let recipeData;

        if (activeFilter === "favorites") {
          // Fetch favorite recipes
          const response = await getFavorites(token);
          if (response.success) {
            recipeData = response.data;
            console.log({ recipeData });
          } else {
            throw new Error(
              response.message || "Failed to fetch favorite recipes"
            );
          }
        } else {
          // Fetch all recipes
          const response = await getAllRecipes({
            page: 1,
            limit: 50
          });
          console.log({ response });
          if (response.status === 200) {
            recipeData = response.data;
          } else {
            throw new Error(response.message || "Failed to fetch recipes");
          }
        }

        setRecipes(recipeData);
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setError("Failed to load recipes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, [activeFilter, token]);

  // Filter recipes
  const getFilteredRecipes = () => {
    let filteredRecipes = [...recipes];

    // Apply meal type filters
    if (activeFilter === "breakfast") {
      filteredRecipes = filteredRecipes.filter(
        (recipe) => recipe.category?.toLowerCase() === "breakfast"
      );
    } else if (activeFilter === "lunch") {
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          recipe.category?.toLowerCase() === "main dish" ||
          recipe.category?.toLowerCase() === "lunch"
      );
    } else if (activeFilter === "dinner") {
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          recipe.category?.toLowerCase() === "main dish" ||
          recipe.category?.toLowerCase() === "dinner"
      );
    }

    // Apply search term filter
    if (searchTerm) {
      filteredRecipes = filteredRecipes.filter(
        (recipe) =>
          recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          recipe.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filteredRecipes;
  };

  const handleRecipeCreated = (newRecipe: Recipe) => {
    // Add the new recipe to the current recipes list
    setRecipes((prevRecipes) => [newRecipe, ...prevRecipes]);
    // Select the new recipe in the meal plan
    onSelectRecipe(newRecipe);
    // Close the quick create modal
    setShowQuickCreateModal(false);
  };

  const filteredRecipes = getFilteredRecipes();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gray-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl border border-gray-800"
      >
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">
              {currentRecipe ? "Manage" : "Select a"} Recipe for {mealType}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/20 transition text-2xl"
              aria-label="Close"
            >
              &times;
            </button>
          </div>

          {/* If there's a current recipe, show remove option */}
          {currentRecipe && onRemoveRecipe && (
            <div className="mt-3 mb-4 p-3 bg-red-900/30 border border-red-800/40 rounded-lg flex justify-between items-center">
              <div className="flex items-center">
                <div className="h-12 w-12 rounded-lg overflow-hidden mr-3 flex-shrink-0">
                  {currentRecipe.featuredImage ? (
                    <Image
                      src={currentRecipe.featuredImage}
                      alt={currentRecipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-400">
                      <BookOpen size={20} />
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">Currently selected:</p>
                  <p className="text-white/80 text-sm">{currentRecipe.title}</p>
                </div>
              </div>

              <button
                onClick={() => {
                  onRemoveRecipe();
                  onClose();
                }}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center transition-colors"
              >
                <Trash2 size={16} className="mr-1.5" />
                Remove
              </button>
            </div>
          )}

          <div className="mt-3">
            <input
              type="text"
              placeholder="Search recipes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <div className="flex items-center justify-between mt-4">
            <div className="flex  space-x-2 overflow-x-auto pb-1 scrollbar-hide">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === "all"
                    ? "bg-white text-purple-600"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                All Recipes
              </button>
              <button
                onClick={() => setActiveFilter("breakfast")}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === "breakfast"
                    ? "bg-white text-purple-600"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                Breakfast
              </button>
              <button
                onClick={() => setActiveFilter("lunch")}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === "lunch"
                    ? "bg-white text-purple-600"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                Lunch
              </button>
              <button
                onClick={() => setActiveFilter("dinner")}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === "dinner"
                    ? "bg-white text-purple-600"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                Dinner
              </button>
              <button
                onClick={() => setActiveFilter("favorites")}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${
                  activeFilter === "favorites"
                    ? "bg-white text-purple-600"
                    : "bg-white/20 hover:bg-white/30"
                }`}
              >
                Favorites
              </button>
            </div>
            {/* Add a persistent quick create button */}
            <div className=" border-gray-800 text-center">
              <button
                onClick={() => router.push("/dashboard/create-recipe")}
                className="px-4 py-2 bg-white/10 text-white hover:bg-white/20 rounded-lg flex items-center mx-auto"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Your Own Recipe
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-y-auto p-4 flex-grow bg-gray-900">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              Loadingg....{" "}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-red-900/20 text-red-400 rounded-full flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">{error}</h3>
              <button
                onClick={() => setActiveFilter("all")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                Try Again
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecipes.map((recipe) => (
                  <div
                    key={
                      activeFilter === "favorites"
                        ? recipe._id || recipe.recipe._id
                        : recipe._id
                    }
                    onClick={() =>
                      onSelectRecipe(
                        activeFilter === "favorites" ? recipe.recipe : recipe
                      )
                    }
                    className="cursor-pointer"
                  >
                    {activeFilter === "favorites" && recipe.recipe ? (
                      <RecipeCard recipe={recipe.recipe || recipe} />
                    ) : (
                      <RecipeCard recipe={recipe} />
                    )}
                  </div>
                ))}
              </div>

              {filteredRecipes.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto bg-purple-900/20 rounded-full flex items-center justify-center text-purple-400 mb-4">
                    <BookOpen size={24} />
                  </div>
                  <h3 className="text-lg font-medium text-white">
                    No recipes found
                  </h3>
                  <p className="mt-1 text-gray-400 mb-6">
                    Try adjusting your search or filters
                  </p>

                  {/* Quick Recipe Creation Button */}
                  <button
                    onClick={() => router.push("/dashboard/create-recipe")}
                    className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg flex items-center mx-auto hover:opacity-90 transition"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Quick Recipe
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>

      {/* Quick Create Recipe Modal */}
      {/* {showQuickCreateModal && (
        <QuickRecipeCreator 
          mealType={mealType}
          onClose={() => setShowQuickCreateModal(false)}
          onRecipeCreated={handleRecipeCreated}
        />
      )} */}
    </div>
  );
};
