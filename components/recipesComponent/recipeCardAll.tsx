"use client";
 
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/app/store/authStore";
import {
  addToFavorites,
  checkFavoriteStatus,
  removeFromFavorites
} from "@/app/api/(favorites)/favorites";
import { Recipe } from "@/types/recipe";
import { usePathname } from "next/navigation";
import { Heart, Star, Clock, CheckCircle2, CircleAlert } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const RecipeCard = ({ recipe }: { recipe: any }) => {
  // Get user and token from auth store
  const { user, token } = useAuthStore();

  // Local state to track favorite status
  const [isFavorite, setIsFavorite] = useState(recipe?.isFavorited || false);

  const [isAnimating, setIsAnimating] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const difficultyColors = {
    easy: "bg-green-500/10 text-green-700 dark:text-green-400 border border-green-500/30",
    medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/30",
    hard: "bg-red-500/10 text-red-700 dark:text-red-400 border border-red-500/30"
  };

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
    // Prevent navigation when clicking the favorite button
    e.preventDefault();
    e.stopPropagation();

    if (!token) {
      toast.error("Please log in to save favorites");
      return;
    }

    if (isCheckingStatus) {
      return; // Prevent multiple clicks while checking status
    }

    // Store previous state for rollback if API call fails
    const previousState = isFavorite;

    // Optimistically update UI
    setIsFavorite(!isFavorite);
    setIsAnimating(true);

    try {
      if (previousState) {
        // Remove from favorites
        await removeFromFavorites(recipe?._id, token);
        toast.success("Removed from favorites", {
          icon: "💔",
          position: "bottom-center",
          duration: 2000
        });
      } else {
        // Add to favorites
        await addToFavorites(recipe?._id, token);
        toast.success("Added to favorites", {
          icon: "❤️",
          position: "bottom-center",
          duration: 2000
        });
      }
    } catch (error) {
      // Revert UI state if API call fails
      setIsFavorite(previousState);
      toast.error("Failed to update favorites");
      console.error("Error updating favorites:", error);
    } finally {
      // End animation after a short delay
      setTimeout(() => setIsAnimating(false), 300);
    }
  };
  const pathname = usePathname();
  const isInMealPlanner = pathname?.includes("/dashboard/meal-planner");

  const CardWrapper = ({ children, href }: { children: React.ReactNode; href?: string }) => {
    if (isInMealPlanner) {
      return <div className="relative">{children}</div>;
    }
    return (
      <Link href={href || `/dashboard/recipe/${recipe?._id}`} className="relative">
        {children}
      </Link>
    );
  };

  return (
    <CardWrapper href={isInMealPlanner ? undefined : `/dashboard/recipe/${recipe?._id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full">
        <div className="relative aspect-video w-full overflow-hidden">
          <Image
            src={recipe?.featuredImage || recipe?.image || "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg"}
            alt={recipe?.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          
          {/* Favorite Button */}
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
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFavorite ? "fill-current text-primary-foreground" : "text-primary"}`}
                  strokeWidth={isFavorite ? 0 : 2}
                />
              )}
            </button>
          )}

          {/* Rating Badge */}
          {recipe?.averageRating > 0 && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-primary text-primary-foreground px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-semibold flex items-center gap-0.5 sm:gap-1 shadow-md">
              <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
              {recipe.averageRating.toFixed(1)}
            </div>
          )}

          {/* Published Status Badge - only show if no favorite button or if admin */}
          {recipe?.isPublished !== undefined && (!user || user?.role !== "user") && (
            <div className={`absolute ${user?.role === "user" ? "top-2 left-2 sm:top-3 sm:left-3" : "top-2 right-2 sm:top-3 sm:right-3"} z-10`}>
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
                </div>

        <CardHeader className="p-3 sm:p-6">
          <CardTitle className="line-clamp-2 text-sm sm:text-base">{recipe?.title}</CardTitle>
          {recipe?.description && (
            <CardDescription className="line-clamp-2 text-xs sm:text-sm mt-1">
              {recipe.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="p-3 sm:p-6 pt-0">
          <div className="flex items-center justify-between text-xs sm:text-sm mb-2 sm:mb-3">
            {recipe?.cookingTime && (
              <div className="flex items-center gap-1 text-foreground">
                <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span>{recipe.cookingTime} min</span>
              </div>
            )}
            {recipe?.difficulty && (
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

          {recipe?.category && (
            <div className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">
              {recipe.category}
        </div>
      )}
        </CardContent>
      </Card>
    </CardWrapper>
  );
};
