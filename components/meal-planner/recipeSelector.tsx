import {
  BookOpen,
  Trash2,
  Search,
  Sparkles,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { getAllRecipes } from "@/app/api/(recipe)/userRecipes";
import { useAuthStore } from "@/app/store/authStore";
import { Recipe } from "@/types/recipe";
import { RecipeCard } from "../recipesComponent/recipeCardAll";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";

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
const MemoizedRecipeCard = memo(
  ({ recipe, onClick }: { recipe: any; onClick: () => void }) => (
    <div
      onClick={onClick}
      className="cursor-pointer transform transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1"
    >
      <RecipeCard recipe={recipe} />
    </div>
  )
);

MemoizedRecipeCard.displayName = "MemoizedRecipeCard";

// Enhanced Current Recipe Display
const CurrentRecipeDisplay = memo(
  ({
    currentRecipe,
    onRemoveRecipe,
    onClose
  }: {
    currentRecipe: any;
    onRemoveRecipe: () => void;
    onClose: () => void;
  }) => (
    <Card className="mb-2 sm:mb-3 p-2 sm:p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center flex-1 min-w-0">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg overflow-hidden mr-2 flex-shrink-0 shadow-md">
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
              <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
                <BookOpen size={14} className="sm:h-4 sm:w-4" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-muted-foreground text-[10px] sm:text-xs font-medium">
              Currently selected:
            </p>
            <p className="text-foreground text-xs sm:text-sm font-semibold line-clamp-1">
              {currentRecipe.title}
            </p>
          </div>
        </div>

        <Button
          variant="destructive"
          size="sm"
          onClick={() => {
            onRemoveRecipe();
            onClose();
          }}
          className="flex-shrink-0"
        >
          <Trash2 size={12} className="sm:mr-1.5 sm:h-3.5 sm:w-3.5" />
          <span className="text-[10px] sm:text-xs font-medium hidden sm:inline">
            Remove
          </span>
        </Button>
      </div>
    </Card>
  )
);

CurrentRecipeDisplay.displayName = "CurrentRecipeDisplay";

// Enhanced Filter Button
const FilterButton = memo(
  ({
    active,
    onClick,
    children
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
  }) => (
    <button
      onClick={onClick}
      className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-medium transition-all duration-200 ${
        active
          ? "bg-background text-foreground shadow-md transform scale-105"
          : "bg-background/20 hover:bg-background/30 text-white border border-background/30"
      }`}
    >
      <span>{children}</span>
    </button>
  )
);

FilterButton.displayName = "FilterButton";

// Paginated Recipe Grid with improved design
const PaginatedRecipeGrid = memo(
  ({
    recipes,
    onSelectRecipe,
    currentPage,
    totalPages,
    onPageChange
  }: {
    recipes: any[];
    onSelectRecipe: (recipe: Recipe) => void;
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  }) => {
    // Generate page numbers to show
    const getPageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisible = 5;

      if (totalPages <= maxVisible) {
        // Show all pages if total is small
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show first page
        pages.push(1);

        if (currentPage > 3) {
          pages.push("...");
        }

        // Show pages around current
        const start = Math.max(2, currentPage - 1);
        const end = Math.min(totalPages - 1, currentPage + 1);

        for (let i = start; i <= end; i++) {
          if (i !== 1 && i !== totalPages) {
            pages.push(i);
          }
        }

        if (currentPage < totalPages - 2) {
          pages.push("...");
        }

        // Show last page
        if (totalPages > 1) {
          pages.push(totalPages);
        }
      }

      return pages;
    };

    return (
      <div className="flex flex-col h-full min-h-0">
        <div className="overflow-y-auto flex-grow min-h-0">
          {recipes.length === 0 ? (
            <div className="flex items-center justify-center h-full p-6">
              <p className="text-white/70 text-sm">No recipes found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 p-2 sm:p-3">
              {recipes.map((recipe, index) => (
                <MemoizedRecipeCard
                  key={recipe._id || recipe.id || index}
                  recipe={recipe}
                  onClick={() => onSelectRecipe(recipe)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Enhanced Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between px-2 sm:px-4 py-2 sm:py-3 border-t border-border bg-muted/30 flex-shrink-0 gap-2 sm:gap-0">
            <div className="flex items-center gap-1 sm:gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              <div className="flex items-center gap-0.5 sm:gap-1">
                {getPageNumbers().map((page, index) => {
                  if (page === "...") {
                    return (
                      <span
                        key={`ellipsis-${index}`}
                        className="px-1 sm:px-2 text-white/70 text-xs sm:text-sm"
                      >
                        ...
                      </span>
                    );
                  }

                  const pageNum = page as number;
                  const isActive = pageNum === currentPage;

                  return (
                    <Button
                      key={pageNum}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => onPageChange(pageNum)}
                      className={`h-8 w-8 sm:h-9 sm:w-9 p-0 text-xs sm:text-sm ${isActive ? "" : "hover:bg-accent"}`}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="h-8 w-8 sm:h-9 sm:w-9 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <span className="text-xs sm:text-sm text-white/70">
              Page {currentPage} of {totalPages}
            </span>
          </div>
        )}
      </div>
    );
  }
);

PaginatedRecipeGrid.displayName = "PaginatedRecipeGrid";

export const RecipeSelector: React.FC<any> = memo(
  ({
    mealType,
    onSelectRecipe,
    onClose,
    currentRecipe = null,
    onRemoveRecipe = null
  }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const recipesPerPage = 10;
    const { token } = useAuthStore();
    const router = useRouter();

    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    // Determine backend filter parameters
    const filterParams = useMemo(() => {
      const params: any = {
        page: currentPage,
        limit: recipesPerPage
      };

      if (debouncedSearchTerm) {
        params.search = debouncedSearchTerm;
      }

      // Use backend filters
      if (activeFilter === "breakfast") {
        params.breakfast = true;
      } else if (activeFilter === "lunch") {
        params.lunch = true;
      } else if (activeFilter === "dinner") {
        params.dinner = true;
      } else if (activeFilter === "favorites") {
        params.favorites = true;
      }

      return params;
    }, [activeFilter, currentPage, debouncedSearchTerm]);

    // Fetch recipes with React Query and pagination using backend filters
    const {
      data: recipesResponse,
      isLoading: loading,
      error: queryError
    } = useQuery({
      queryKey: ["recipes", filterParams],
      queryFn: async () => {
        const response = await getAllRecipes(filterParams);

        if (response.status === 200 || response.success) {
          const recipeData = response.data || [];

          return {
            data: recipeData,
            pagination: response.pagination || {
              pages: 1,
              currentPage: 1,
              total: recipeData.length
            }
          };
        }

        throw new Error(response.message || "Failed to fetch recipes");
      },
      enabled: !!token,
      staleTime: 30000
    });

    const recipes = recipesResponse?.data || [];
    const pagination = recipesResponse?.pagination || {
      pages: 1,
      page: 1,
      total: 0
    };
    const error = queryError
      ? "Failed to load recipes. Please try again."
      : null;

    // Reset to page 1 when filter or search changes
    useEffect(() => {
      setCurrentPage(1);
    }, [activeFilter, debouncedSearchTerm]);

    // Fetch filter counts separately for accurate numbers - using proper pagination
    const { data: allCount } = useQuery({
      queryKey: ["recipes-count", "all"],
      queryFn: async () => {
        const response = await getAllRecipes({ page: 1, limit: 10 });
        return response.pagination?.total || 0;
      },
      enabled: !!token,
      staleTime: 60000 // Cache for 1 minute
    });

    const { data: breakfastCount } = useQuery({
      queryKey: ["recipes-count", "breakfast"],
      queryFn: async () => {
        const response = await getAllRecipes({
          page: 1,
          limit: 10,
          breakfast: true
        });
        return response.pagination?.total || 0;
      },
      enabled: !!token,
      staleTime: 60000
    });

    const { data: lunchCount } = useQuery({
      queryKey: ["recipes-count", "lunch"],
      queryFn: async () => {
        const response = await getAllRecipes({
          page: 1,
          limit: 10,
          lunch: true
        });
        return response.pagination?.total || 0;
      },
      enabled: !!token,
      staleTime: 60000
    });

    const { data: dinnerCount } = useQuery({
      queryKey: ["recipes-count", "dinner"],
      queryFn: async () => {
        const response = await getAllRecipes({
          page: 1,
          limit: 10,
          dinner: true
        });
        return response.pagination?.total || 0;
      },
      enabled: !!token,
      staleTime: 60000
    });

    const { data: favoritesCount } = useQuery({
      queryKey: ["recipes-count", "favorites"],
      queryFn: async () => {
        const response = await getAllRecipes({
          page: 1,
          limit: 10,
          favorites: true
        });
        return response.pagination?.total || 0;
      },
      enabled: !!token,
      staleTime: 60000
    });

    const filterCounts = useMemo(() => {
      return {
        all: allCount || 0,
        breakfast: breakfastCount || 0,
        lunch: lunchCount || 0,
        dinner: dinnerCount || 0,
        favorites: favoritesCount || 0
      };
    }, [allCount, breakfastCount, lunchCount, dinnerCount, favoritesCount]);

    // Recipes are already filtered by API, no need for additional client-side filtering
    const filteredRecipes = recipes;

    // Memoized handlers - FIXED: Better recipe selection for favorites
    const handleRecipeSelect = useCallback(
      (recipe: Recipe) => {
        // For favorites, the recipe is already in the correct format
        // For other filters, use the recipe as-is
        onSelectRecipe(recipe);
      },
      [onSelectRecipe]
    );

    const handleFilterChange = useCallback((filter: string) => {
      console.log("Changing filter to:", filter); // Debug log
      setActiveFilter(filter);
    }, []);

    const handleCreateRecipe = useCallback(() => {
      router.push("/dashboard/create-recipe");
    }, [router]);

    return (
      <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className="max-w-4xl w-full mx-2 sm:mx-4 max-h-[90vh] sm:max-h-[95vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="bg-primary text-primary-foreground p-3 sm:p-4 rounded-t-lg flex-shrink-0">
            <div className="flex justify-between items-start mb-2 sm:mb-3">
              <div className="flex-1 pr-2">
                <DialogTitle className="text-lg sm:text-xl font-bold mb-1 text-white">
                  {currentRecipe ? "Manage" : "Select a"} Recipe for {mealType}
                </DialogTitle>
              </div>
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
            <div className="relative mb-2 sm:mb-3">
              <Search
                className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-primary-foreground/60"
                size={14}
              />
              <Input
                type="text"
                placeholder={
                  activeFilter === "favorites"
                    ? "Search favorites..."
                    : "Search recipes..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 sm:pl-9 pr-2 sm:pr-3 py-2 sm:py-2.5 text-sm sm:text-base bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground border-primary-foreground/30 focus:ring-primary-foreground/50 focus:border-primary-foreground/50"
              />
            </div>

            {/* Enhanced Filter Buttons */}
            <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2 sm:mb-3">
              {[
                { key: "all", label: "All Recipes" },
                { key: "breakfast", label: "Breakfast" },
                { key: "lunch", label: "Lunch" },
                { key: "dinner", label: "Dinner" },
                { key: "favorites", label: "Favorites" }
              ].map((filter) => (
                <FilterButton
                  key={filter.key}
                  active={activeFilter === filter.key}
                  onClick={() => handleFilterChange(filter.key)}
                >
                  {filter.label}
                </FilterButton>
              ))}
            </div>

            {/* Create Recipe Button */}
            <div className="flex justify-center">
              <Button
                onClick={handleCreateRecipe}
                variant="secondary"
                size="sm"
                className="bg-background/20 hover:bg-background/30 text-white border-background/30 text-xs sm:text-sm"
              >
                <Sparkles className="mr-1 sm:mr-1.5" size={14} />
                <span className="hidden sm:inline">Create Your Own Recipe</span>
                <span className="sm:hidden">Create Recipe</span>
              </Button>
            </div>
          </DialogHeader>

          {/* Content Area */}
          <div className="flex-grow bg-background relative overflow-hidden min-h-0 flex flex-col">
            {loading ? (
              <div className="flex items-center justify-center h-full p-6">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-white font-medium text-sm">
                    Loading recipes...
                  </p>
                </div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center h-full p-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-destructive/20 text-destructive rounded-full flex items-center justify-center mb-3">
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-base font-medium text-white mb-2">
                    {error}
                  </h3>
                  <Button
                    onClick={() => handleFilterChange("all")}
                    variant="default"
                    size="sm"
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            ) : filteredRecipes.length === 0 ? (
              <div className="flex items-center justify-center h-full p-6">
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto bg-primary/20 rounded-full flex items-center justify-center text-primary mb-3">
                    <BookOpen size={20} />
                  </div>
                  <h3 className="text-base font-medium text-white mb-2">
                    {activeFilter === "favorites"
                      ? "No favorite recipes found"
                      : "No recipes found"}
                  </h3>
                  <p className="text-white/70 mb-4 text-sm">
                    {activeFilter === "favorites"
                      ? "Add some recipes to your favorites first"
                      : "Try adjusting your search or filters"}
                  </p>
                  <Button
                    onClick={handleCreateRecipe}
                    variant="default"
                    size="sm"
                  >
                    <Sparkles className="mr-1.5" size={16} />
                    Create Quick Recipe
                  </Button>
                </div>
              </div>
            ) : (
              <PaginatedRecipeGrid
                recipes={filteredRecipes}
                onSelectRecipe={handleRecipeSelect}
                currentPage={currentPage}
                totalPages={pagination.pages || 1}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);

RecipeSelector.displayName = "RecipeSelector";
