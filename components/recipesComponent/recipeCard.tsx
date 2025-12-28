import { useAuthStore } from "@/app/store/authStore";
import { Recipe } from "@/types/recipe";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { deleteRecipe, deleteUserRecipe } from "@/app/api/(recipe)/adminRecipe";
import {
  addToFavorites,
  checkFavoriteStatus,
  removeFromFavorites
} from "@/app/api/(favorites)/favorites";
import toast from "react-hot-toast";
import Link from "next/link";
import { Heart, Star, Clock, CheckCircle2, CircleAlert, Edit, Trash2, Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Recipe Card Component
export const RecipeCardEditDelete = ({
  recipe,
  onEdit,
  // onDelete,
  onTogglePublish,
  refreshData
}: {
  recipe: Recipe;
  onEdit: (id: string) => void;
  // onDelete: (id: string) => void;
  onTogglePublish?: (id: string, currentStatus: boolean | undefined) => void;
  refreshData?: () => void;
}) => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Add favorites state
  const [isFavorite, setIsFavorite] = useState(recipe?.isFavorited || false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const difficultyColors = {
    easy: "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30",
    medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30",
    hard: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30"
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const { user, token } = useAuthStore();
  const router = useRouter();

  // Check favorite status on mount
  useEffect(() => {
    if (user && token) {
      const checkStatus = async () => {
        try {
          setIsCheckingStatus(true);
          if (user?.role === "user") {
            const status = await checkFavoriteStatus(recipe._id, token);
            setIsFavorite(status);
          }
        } catch (error) {
          console.error("Error checking favorite status:", error);
        } finally {
          setIsCheckingStatus(false);
        }
      };
      checkStatus();
    } else {
      setIsCheckingStatus(false);
    }
  }, [recipe?._id, token, user]);

  // Handle favorite toggle
  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error("Please log in to save favorites");
      return;
    }

    if (isCheckingStatus) {
      return;
    }

    const previousState = isFavorite;
    setIsFavorite(!isFavorite);
    setIsAnimating(true);

    try {
      if (previousState) {
        await removeFromFavorites(recipe?._id, token);
        toast.success("Removed from favorites", {
          icon: "💔",
          position: "bottom-center",
          duration: 2000
        });
      } else {
        await addToFavorites(recipe?._id, token);
        toast.success("Added to favorites", {
          icon: "❤️",
          position: "bottom-center",
          duration: 2000
        });
      }
    } catch (error) {
      setIsFavorite(previousState);
      toast.error("Failed to update favorites");
      console.error("Error updating favorites:", error);
    } finally {
      setTimeout(() => setIsAnimating(false), 300);
    }
  };

  const goToEdit = () => {
    router.push(`/dashboard/edit-recipe/${recipe._id}`);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteModal(true);
  };

  console.log({ recipe });
  
  const confirmDelete = async () => {
    if (!token || !recipe._id) {
      toast.error("Unable to delete recipe");
      return;
    }

    setIsDeleting(true);
    try {
      if (user?.role === "admin") {
        const result = await deleteRecipe(recipe._id, token);
        if (result.success) {
          toast.success("Recipe deleted successfully");
          setShowDeleteModal(false);
          if (refreshData) {
            refreshData();
          }
        } else {
          toast.error(result.message || "Failed to delete recipe");
          if (result.success) {
            toast.success("Recipe deleted successfully");
            setShowDeleteModal(false);
            if (refreshData) {
              refreshData();
            }
          } else {
            toast.error(result.message || "Failed to delete recipe");
            setShowDeleteModal(false);
            if (refreshData) {
              refreshData();
            }
          }
        }
      } else if (user?.role === "user") {
        const result = await deleteUserRecipe(recipe._id, token);
        toast.success("Recipe deleted successfully");
      }
    } catch (error) {
      toast.error("An error occurred while deleting the recipe");
      console.error(error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full relative">
        {/* Featured Image */}
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={recipe.featuredImage || "/placeholder-recipe.jpg"}
            alt={recipe.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Favorite Button - Top Left */}
          {user?.role === "user" && (
            <button
              onClick={handleFavoriteClick}
              disabled={isCheckingStatus}
              className={`absolute top-2 left-2 sm:top-3 sm:left-3 z-20 w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
                isCheckingStatus
                  ? "bg-background/80 backdrop-blur-sm border-2 border-muted-foreground"
                  : isFavorite
                  ? "bg-primary text-primary-foreground border-2 border-primary-foreground"
                  : "bg-background/80 backdrop-blur-sm border-2 border-primary text-primary hover:bg-primary/10"
              }`}
              aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            >
              {isCheckingStatus ? (
                <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Heart
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-all duration-300 ${isAnimating ? 'animate-pulse scale-125' : ''} ${
                    isFavorite ? "fill-current text-primary-foreground" : "text-primary"
                  }`}
                  strokeWidth={isFavorite ? 0 : 2}
                />
              )}
            </button>
          )}

          {/* "Mine" Badge - Top Left (if favorite button not shown) or below it */}
          {user && (recipe.user === user._id || recipe.createdBy === user._id) && (
            <div className={`absolute ${user?.role === "user" ? "top-2 left-10 sm:top-3 sm:left-12" : "top-2 left-2 sm:top-3 sm:left-3"} z-10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-primary/20 text-primary border border-primary/30 flex items-center gap-0.5 sm:gap-1 backdrop-blur-sm`}>
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-current" />
              Mine
            </div>
          )}

          {/* Rating Badge - Top Right */}
          {recipe.averageRating > 0 && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-primary text-primary-foreground px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1 shadow-md">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
              {recipe.averageRating.toFixed(1)}
            </div>
          )}

          {/* Published Status Badge - Below rating if present */}
          {recipe.isPublished !== undefined && (
            <div className={`absolute ${recipe.averageRating > 0 ? "top-10 right-2 sm:top-12 sm:right-3" : "top-2 right-2 sm:top-3 sm:right-3"} z-10`}>
              {recipe.isPublished !== false ? (
                <span className="flex items-center text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 backdrop-blur-sm">
                  <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  Published
                </span>
              ) : (
                <span className="flex items-center text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 backdrop-blur-sm">
                  <CircleAlert className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                  Draft
                </span>
              )}
            </div>
          )}

          {/* Edit Button - Top Right (if no rating) or positioned appropriately */}
          {user &&
            (user.role === "admin" ||
              (user.role === "user" &&
                (recipe.user === user._id ||
                  recipe.roleCreated === "user"))) && (
              <Button
                size="sm"
                variant="default"
                className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  goToEdit();
                }}
              >
                <Edit className="h-2.5 w-2.5 sm:h-3 sm:w-3 sm:mr-1" />
                <span className="hidden sm:inline">Edit</span>
              </Button>
            )}
        </div>

        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="line-clamp-2 text-sm sm:text-base">{recipe.title}</CardTitle>
        </CardHeader>

        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2 sm:mb-3">
            {recipe.cookingTime && (
              <div className="flex items-center gap-1 text-foreground">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{recipe.cookingTime} min</span>
              </div>
            )}
            {recipe.difficulty && (
              <span
                className={`px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium border ${
                  difficultyColors[recipe.difficulty as keyof typeof difficultyColors] ||
                  "bg-muted text-muted-foreground border-border"
                }`}
              >
                {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
              </span>
            )}
          </div>

          {recipe.category && (
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3">
              {recipe.category}
            </div>
          )}

          {/* Actions Footer */}
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
            <div className="flex items-center gap-2 flex-wrap">
              {user?.role === "super_admin" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    onTogglePublish?.(recipe._id, recipe.isPublished);
                  }}
                >
                  {recipe.isPublished ? (
                    <>
                      <EyeOff className="h-2.5 w-2.5 sm:h-3 sm:w-3 sm:mr-1" />
                      <span className="hidden sm:inline">Unpublish</span>
                    </>
                  ) : (
                    <>
                      <Eye className="h-2.5 w-2.5 sm:h-3 sm:w-3 sm:mr-1" />
                      <span className="hidden sm:inline">Publish</span>
                    </>
                  )}
                </Button>
              )}
              <p className="text-[10px] sm:text-xs text-muted-foreground flex items-center">
                By {recipe?.adminDetails?.name || recipe?.userDetails?.name || "Chef"}
              </p>
            </div>
            {user &&
              (user.role === "admin" ||
                (user.role === "user" &&
                  (recipe.user === user._id ||
                    recipe.roleCreated === "user"))) && (
                <Button
                  size="sm"
                  variant="destructive"
                  className="h-6 sm:h-7 px-1.5 sm:px-2 text-[10px] sm:text-xs"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDeleteClick(e);
                  }}
                >
                  <Trash2 className="h-2.5 w-2.5 sm:h-3 sm:w-3 sm:mr-1" />
                  <span className="hidden sm:inline">Delete</span>
                </Button>
              )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-background/80 backdrop-blur-sm">
          <Card className="max-w-md w-full mx-2 sm:mx-0">
            <CardContent className="p-4 sm:p-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-destructive/10 rounded-full flex items-center justify-center">
                <Trash2 className="h-6 w-6 sm:h-8 sm:w-8 text-destructive" />
              </div>

              <h3 className="text-lg sm:text-xl font-bold text-foreground text-center mb-2">
                Delete Recipe
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground text-center mb-4 sm:mb-6">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-foreground">
                  "{recipe.title}"
                </span>
                ? This action cannot be undone.
              </p>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 sm:space-x-3">
                <Button
                  variant="outline"
                  className="flex-1 text-sm sm:text-base"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 text-sm sm:text-base"
                  onClick={confirmDelete}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-destructive-foreground border-t-transparent rounded-full animate-spin mr-2"></div>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete Recipe
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};