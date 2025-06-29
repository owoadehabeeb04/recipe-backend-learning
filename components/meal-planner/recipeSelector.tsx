import { BookOpen, Trash2, Search, Sparkles } from "lucide-react";
import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { getAllRecipes } from "@/app/api/(recipe)/userRecipes";
import { useAuthStore } from "@/app/store/authStore";
import { Recipe } from "@/types/recipe";
import { RecipeCard } from "../recipesComponent/recipeCardAll";
import { getFavorites } from "@/app/api/(favorites)/favorites";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Debounce hook for search optimization
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Memoized Recipe Card wrapper
const MemoizedRecipeCard = memo(({ recipe, onClick }: { recipe: any; onClick: () => void }) => (
  <div 
    onClick={onClick} 
    className="cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1"
  >
    <RecipeCard recipe={recipe} />
  </div>
));

MemoizedRecipeCard.displayName = 'MemoizedRecipeCard';

// Enhanced Current Recipe Display
const CurrentRecipeDisplay = memo(({ 
  currentRecipe, 
  onRemoveRecipe, 
  onClose 
}: { 
  currentRecipe: any; 
  onRemoveRecipe: () => void; 
  onClose: () => void; 
}) => (
  <div className="mb-3 p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <div className="h-10 w-10 rounded-lg overflow-hidden mr-2 flex-shrink-0 shadow-md">
          {currentRecipe.featuredImage ? (
            <Image
              src={currentRecipe.featuredImage}
              alt={currentRecipe.title}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-white/20 text-white">
              <BookOpen size={16} />
            </div>
          )}
        </div>
        <div>
          <p className="text-white text-xs font-medium">Currently selected:</p>
          <p className="text-white/90 text-sm font-semibold line-clamp-1">{currentRecipe.title}</p>
        </div>
      </div>

      <button
        onClick={() => {
          onRemoveRecipe();
          onClose();
        }}
        className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center transition-colors shadow-md"
      >
        <Trash2 size={14} className="mr-1.5" />
        <span className="text-xs font-medium">Remove</span>
      </button>
    </div>
  </div>
));

CurrentRecipeDisplay.displayName = 'CurrentRecipeDisplay';

// Enhanced Filter Button
const FilterButton = memo(({ 
  active, 
  onClick, 
  children,
  count
}: { 
  active: boolean; 
  onClick: () => void; 
  children: React.ReactNode;
  count?: number;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
      active
        ? "bg-white text-purple-600 shadow-md transform scale-105"
        : "bg-white/20 hover:bg-white/30 text-white"
    }`}
  >
    <span>{children}</span>
    {count !== undefined && (
      <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] ${
        active ? 'bg-purple-100 text-purple-600' : 'bg-white/20 text-white/80'
      }`}>
        {count}
      </span>
    )}
  </button>
));

FilterButton.displayName = 'FilterButton';

// Virtualized Recipe Grid
const VirtualizedRecipeGrid = memo(({ 
  recipes, 
  onSelectRecipe 
}: { 
  recipes: any[]; 
  onSelectRecipe: (recipe: Recipe) => void; 
}) => {
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
  const [containerRef, setContainerRef] = useState<HTMLDivElement | null>(null);

  const handleScroll = useCallback(() => {
    if (!containerRef) return;
    
    const scrollTop = containerRef.scrollTop;
    const itemHeight = 300;
    const containerHeight = containerRef.clientHeight;
    const itemsPerRow = window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
    
    const start = Math.max(0, Math.floor(scrollTop / itemHeight) * itemsPerRow - itemsPerRow);
    const end = Math.min(
      start + Math.ceil(containerHeight / itemHeight) * itemsPerRow + itemsPerRow * 2,
      recipes.length
    );
    
    setVisibleRange({ start, end });
  }, [containerRef, recipes.length]);

  useEffect(() => {
    if (!containerRef) return;
    
    const container = containerRef;
    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef, handleScroll]);

  const visibleRecipes = useMemo(() => 
    recipes.slice(visibleRange.start, visibleRange.end),
    [recipes, visibleRange]
  );

  const totalHeight = Math.ceil(recipes.length / 3) * 300;

  return (
    <div 
      ref={setContainerRef}
      className="overflow-y-auto max-h-[55vh] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800"
      style={{ height: '55vh' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div 
          style={{ 
            transform: `translateY(${Math.floor(visibleRange.start / 3) * 300}px)`,
            position: 'absolute',
            width: '100%'
          }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-3">
            {visibleRecipes.map((recipe, index) => {
              const actualIndex = visibleRange.start + index;
              return (
                <MemoizedRecipeCard
                  key={recipe._id || recipe.id || actualIndex}
                  recipe={recipe}
                  onClick={() => onSelectRecipe(recipe)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
});

VirtualizedRecipeGrid.displayName = 'VirtualizedRecipeGrid';

export const RecipeSelector: React.FC<any> = memo(({
  mealType,
  onSelectRecipe,
  onClose,
  currentRecipe = null,
  onRemoveRecipe = null
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [favoriteRecipes, setFavoriteRecipes] = useState<Recipe[]>([]); // Add separate state for favorites
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuthStore();
  const router = useRouter();

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch recipes based on active filter - FIXED: Added missing useEffect
  useEffect(() => {
    const fetchRecipes = async () => {
      setLoading(true);
      setError(null);

      try {
        let recipeData;

        if (activeFilter === "favorites") {
          const response = await getFavorites(token);
          console.log("Favorites response:", response); // Debug log
          if (response.success) {
            // Handle different favorite data structures
            const favoritesData = response.data || [];
            console.log("Favorites data:", favoritesData); // Debug log
            
            // Transform favorites data to match Recipe interface
            const transformedFavorites = favoritesData.map((fav: any) => {
              // Handle different data structures
              const recipe = fav.recipe || fav;
              return {
                _id: recipe._id || recipe.id,
                id: recipe.id || recipe._id,
                title: recipe.title || recipe.name,
                category: recipe.category,
                difficulty: recipe.difficulty,
                cookingTime: recipe.cookingTime || recipe.prepTime,
                featuredImage: recipe.featuredImage || recipe.image,
                description: recipe.description,
                ingredients: recipe.ingredients || [],
                instructions: recipe.instructions || [],
                tags: recipe.tags || [],
                isFavorite: true, // Mark as favorite
                image: recipe.featuredImage || recipe.image
              };
            });
            
            console.log("Transformed favorites:", transformedFavorites); // Debug log
            recipeData = transformedFavorites;
            setFavoriteRecipes(transformedFavorites);
          } else {
            throw new Error(response.message || "Failed to fetch favorite recipes");
          }
        } else {
          // Fetch all recipes for other filters
          const response = await getAllRecipes({ page: 1, limit: 100 });
          console.log("All recipes response:", response); // Debug log
          if (response.status === 200 || response.success) {
            recipeData = response.data || [];
            
            // Also fetch favorites to mark them in all recipes
            try {
              const favResponse = await getFavorites(token);
              if (favResponse.success && favResponse.data) {
                const favoriteIds = new Set(
                  favResponse.data.map((fav: any) => {
                    const recipe = fav.recipe || fav;
                    return recipe._id || recipe.id;
                  })
                );
                
                // Mark recipes as favorites
                recipeData = recipeData.map((recipe: any) => ({
                  ...recipe,
                  isFavorite: favoriteIds.has(recipe._id) || favoriteIds.has(recipe.id)
                }));
              }
            } catch (favError) {
              console.warn("Could not fetch favorites for marking:", favError);
            }
          } else {
            throw new Error(response.message || "Failed to fetch recipes");
          }
        }

        setRecipes(recipeData || []);
      } catch (err) {
        console.error("Error fetching recipes:", err);
        setError("Failed to load recipes. Please try again.");
        setRecipes([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchRecipes();
    } else {
      setLoading(false);
      setError("Please log in to view recipes");
    }
  }, [activeFilter, token]);

  // Memoized filter functions with counts - FIXED: Better favorites handling
  const { filteredRecipes, filterCounts } = useMemo(() => {
    // Use different data source based on active filter
    const sourceRecipes = activeFilter === "favorites" ? favoriteRecipes : recipes;
    let filtered: any = [...sourceRecipes];
    
    const counts = {
      all: recipes.length,
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      favorites: favoriteRecipes.length // Use favoriteRecipes length
    };

    // Count recipes by category from all recipes
    recipes.forEach(recipe => {
      if (recipe.category?.toLowerCase() === "breakfast") counts.breakfast++;
      if (recipe.category?.toLowerCase() === "main dish" || 
          recipe.category?.toLowerCase() === "lunch") counts.lunch++;
      if (recipe.category?.toLowerCase() === "main dish" || 
          recipe.category?.toLowerCase() === "dinner") counts.dinner++;
    });

    // Apply meal type filters (skip if already showing favorites)
    if (activeFilter !== "favorites") {
      if (activeFilter === "breakfast") {
        filtered = filtered.filter((recipe: any) => recipe.category?.toLowerCase() === "breakfast");
      } else if (activeFilter === "lunch") {
        filtered = filtered.filter((recipe: any) =>
          recipe.category?.toLowerCase() === "main dish" ||
          recipe.category?.toLowerCase() === "lunch"
        );
      } else if (activeFilter === "dinner") {
        filtered = filtered.filter((recipe: any) =>
          recipe.category?.toLowerCase() === "main dish" ||
          recipe.category?.toLowerCase() === "dinner"
        );
      }
    }

    // Apply search filter
    if (debouncedSearchTerm) {
      const searchLower = debouncedSearchTerm.toLowerCase();
      filtered = filtered.filter((recipe: any) =>
        recipe.title?.toLowerCase().includes(searchLower) ||
        recipe.category?.toLowerCase().includes(searchLower) ||
        recipe.description?.toLowerCase().includes(searchLower)
      );
    }

    console.log("Filtered recipes:", filtered); // Debug log
    console.log("Filter counts:", counts); // Debug log

    return { filteredRecipes: filtered, filterCounts: counts };
  }, [recipes, favoriteRecipes, activeFilter, debouncedSearchTerm]);

  // Memoized handlers - FIXED: Better recipe selection for favorites
  const handleRecipeSelect = useCallback((recipe: Recipe) => {
    // For favorites, the recipe is already in the correct format
    // For other filters, use the recipe as-is
    onSelectRecipe(recipe);
  }, [onSelectRecipe]);

  const handleFilterChange = useCallback((filter: string) => {
    console.log("Changing filter to:", filter); // Debug log
    setActiveFilter(filter);
  }, []);

  const handleCreateRecipe = useCallback(() => {
    router.push("/dashboard/create-recipe");
  }, [router]);

  // Loading state
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl p-6 shadow-2xl">
          <div className="flex flex-col items-center">
            <div className="w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-gray-700 font-medium text-sm">Loading recipes...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-3 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl max-w-4xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-gray-700">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h2 className="text-xl font-bold mb-1">
                {currentRecipe ? "Manage" : "Select a"} Recipe for {mealType}
              </h2>
              <p className="text-white/80 text-sm">
                {activeFilter === "favorites" 
                  ? `Choose from ${filteredRecipes.length} favorite recipes`
                  : `Choose from ${filteredRecipes.length} available recipes`
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Current Recipe Display */}
          {currentRecipe && onRemoveRecipe && (
            <CurrentRecipeDisplay 
              currentRecipe={currentRecipe}
              onRemoveRecipe={onRemoveRecipe}
              onClose={onClose}
            />
          )}

          {/* Enhanced Search */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60" size={16} />
            <input
              type="text"
              placeholder={activeFilter === "favorites" ? "Search favorites..." : "Search recipes..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 rounded-lg bg-white/10 text-white placeholder-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm text-sm"
            />
          </div>
          
          {/* Enhanced Filter Buttons */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {[
              { key: "all", label: "All Recipes", count: filterCounts.all },
              { key: "breakfast", label: "Breakfast", count: filterCounts.breakfast },
              { key: "lunch", label: "Lunch", count: filterCounts.lunch },
              { key: "dinner", label: "Dinner", count: filterCounts.dinner },
              { key: "favorites", label: "Favorites", count: filterCounts.favorites }
            ].map((filter) => (
              <FilterButton
                key={filter.key}
                active={activeFilter === filter.key}
                onClick={() => handleFilterChange(filter.key)}
                count={filter.count}
              >
                {filter.label}
              </FilterButton>
            ))}
          </div>
            
          {/* Create Recipe Button */}
          <div className="flex justify-center">
            <button
              onClick={handleCreateRecipe}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-lg flex items-center transition-all duration-200 hover:scale-105 text-sm"
            >
              <Sparkles className="mr-1.5" size={16} />
              Create Your Own Recipe
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-grow bg-gray-900 relative">
          {error ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-red-900/20 text-red-400 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base font-medium text-white mb-2">{error}</h3>
                <button
                  onClick={() => handleFilterChange("all")}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredRecipes.length === 0 ? (
            <div className="flex items-center justify-center h-full p-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto bg-purple-900/20 rounded-full flex items-center justify-center text-purple-400 mb-3">
                  <BookOpen size={20} />
                </div>
                <h3 className="text-base font-medium text-white mb-2">
                  {activeFilter === "favorites" 
                    ? "No favorite recipes found" 
                    : "No recipes found"
                  }
                </h3>
                <p className="text-gray-400 mb-4 text-sm">
                  {activeFilter === "favorites" 
                    ? "Add some recipes to your favorites first" 
                    : "Try adjusting your search or filters"
                  }
                </p>
                <button
                  onClick={handleCreateRecipe}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg flex items-center mx-auto hover:opacity-90 transition-opacity text-sm"
                >
                  <Sparkles className="mr-1.5" size={16} />
                  Create Quick Recipe
                </button>
              </div>
            </div>
          ) : (
            <VirtualizedRecipeGrid 
              recipes={filteredRecipes}
              onSelectRecipe={handleRecipeSelect}
            />
          )}
        </div>
      </div>
    </div>
  );
});

RecipeSelector.displayName = 'RecipeSelector';
