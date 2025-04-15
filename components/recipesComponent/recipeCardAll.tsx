import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useAuthStore } from "@/app/store/authStore";
import axios from 'axios';
import { addToFavorites, checkFavoriteStatus, removeFromFavorites } from "@/app/api/(favorites)/favorites";

// Recipe type definition
interface Recipe {
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
  isFavorited?: boolean; // Track if recipe is favorited
}


export const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  // Get user and token from auth store
  const { user, token } = useAuthStore();

  // Local state to track favorite status
  const [isFavorite, setIsFavorite] = useState(recipe.isFavorited || false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  const difficultyColors = {
    easy: "from-green-500 to-emerald-700",
    medium: "from-amber-500 to-amber-700",
    hard: "from-red-500 to-red-700"
  };

  // Check favorite status on mount
  useEffect(() => {
    if (user && token) {
      const checkStatus = async () => {
        try {
          setIsCheckingStatus(true);
          const status = await checkFavoriteStatus(recipe._id, token);
          setIsFavorite(status);
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
  }, [recipe._id, token, user]);

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
        await removeFromFavorites(recipe._id, token);
        toast.success("Removed from favorites", {
          icon: '💔',
          position: "bottom-center",
          duration: 2000
        });
      } else {
        // Add to favorites
        await addToFavorites(recipe._id, token);
        toast.success("Added to favorites", {
          icon: '❤️',
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

  return (
    <div className="relative">
      {/* Favorite Button - positioned above the card */}
      {user?.role === "user" && (
        <button
          onClick={handleFavoriteClick}
          disabled={isCheckingStatus}
          className={`absolute top-3 left-3 z-20 cursor-pointer w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
            isCheckingStatus 
              ? "bg-gray-700/50 text-gray-400"
              : isFavorite
                ? "bg-pink-500 text-white"
                : "bg-gray-800/70 text-gray-300 backdrop-blur-sm border border-white/10 hover:bg-gray-700/90"
          }`}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          {isCheckingStatus ? (
            <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <motion.svg
              animate={
                isAnimating
                  ? { scale: [1, 1.5, 1], rotate: [0, 5, -5, 0] }
                  : { scale: 1 }
              }
              transition={{ duration: 0.3 }}
              className={`w-4 h-4 ${
                isFavorite ? "fill-current" : "stroke-current fill-none"
              }`}
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              strokeWidth={isFavorite ? "0" : "2"}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </motion.svg>
          )}
        </button>
      )}

      <Link href={`/dashboard/recipe/${recipe._id}`}>
        <motion.div
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden cursor-pointer group"
        >
          {/* Featured Image */}
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={recipe.featuredImage}
              alt={recipe.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-110"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />

            {/* Published Status Badge - top right */}
            <div className="absolute top-3 right-3 z-10">
              {recipe.isPublished !== false ? (
                <span className="flex items-center text-xs px-2 py-1 rounded-full bg-green-900/70 text-green-300 backdrop-blur-sm border border-green-600/30">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Published
                </span>
              ) : (
                <span className="flex items-center text-xs px-2 py-1 rounded-full bg-amber-900/70 text-amber-300 backdrop-blur-sm border border-amber-600/30">
                  <svg
                    className="w-3 h-3 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Draft
                </span>
              )}
            </div>

            {/* Category */}
            <span className="absolute bottom-3 left-3 text-xs uppercase tracking-wider px-2 py-1 rounded-full bg-gray-800/70 text-gray-300 backdrop-blur-sm border border-white/10">
              {recipe.category}
            </span>

            {/* Cooking time */}
            <span className="absolute bottom-3 right-3 text-xs flex items-center px-2 py-1 rounded-full bg-gray-800/70 text-gray-300 backdrop-blur-sm border border-white/10">
              <svg
                className="w-3 h-3 mr-1"
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
              {recipe.cookingTime} min
            </span>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-600 transition-all duration-300">
              {recipe.title}
            </h3>

            <div className="flex justify-between items-center mb-4">
              {/* Difficulty */}
             {/* Difficulty */}
<span
  className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${
    recipe.difficulty && difficultyColors[
      recipe.difficulty as keyof typeof difficultyColors
    ] || "from-gray-500 to-gray-700"
  }`}
>
  {recipe.difficulty 
    ? recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)
    : "Unknown"}
</span>

              {/* Rating */}
              <div className="flex items-center">
                <svg
                  className="w-4 h-4 text-yellow-500 mr-1"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                </svg>
                <span className="text-white text-sm font-medium">
                  {recipe.averageRating
                    ? recipe.averageRating.toFixed(1)
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Author and publish date */}
            <div className="flex justify-between items-center mt-4">
              {/* Author */}
              <p className="text-gray-400 text-xs flex items-center">
                <svg
                  className="w-3.5 h-3.5 mr-1 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
                By {recipe?.adminDetails?.name || ""}
              </p>

              {/* Date */}
              <p className="text-gray-400 text-xs flex items-center">
                <svg
                  className="w-3.5 h-3.5 mr-1 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                {new Date(recipe.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </motion.div>
      </Link>
    </div>
  );
};
