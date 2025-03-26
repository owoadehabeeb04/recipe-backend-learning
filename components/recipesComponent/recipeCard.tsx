import { useAuthStore } from "@/app/store/authStore";
import { Recipe } from "@/types/recipe";
import { motion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Recipe Card Component
export const RecipeCard = ({
  recipe,
  onEdit,
  onDelete,
  onTogglePublish
}: {
  recipe: Recipe;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, currentStatus: boolean) => void;
}) => {
  const difficultyColors = {
    easy: "from-green-500 to-emerald-700",
    medium: "from-amber-500 to-amber-700",
    hard: "from-red-500 to-red-700"
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    });
  };

  const {user} = useAuthStore();
  const router = useRouter();
  const goToEdit = () => {
    router.push(`/dashboard/recipe/${recipe._id}`);
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden"
    >
      {/* Status badge */}
      <div
        className={`absolute top-3 right-3 z-10 px-3 py-1 rounded-full text-xs font-medium ${
          recipe.isPublished
            ? "bg-green-500/20 text-green-300 border border-green-500/30"
            : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
        }`}
      >
        {recipe.isPublished ? "Published" : "Draft"}
      </div>

      {/* Featured Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={recipe.featuredImage}
          alt={recipe.title}
          fill
          className="object-cover transition-transform duration-300 hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />

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
        <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
          {recipe.title}
        </h3>
        {user?.role === "admin" && (
  <button 
    className="absolute cursor-pointer top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-1.5 z-10"
    onClick={(e) => {
      e.stopPropagation();
      goToEdit();
    }}
  >
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5">
      <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
      <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
    </svg>
    Edit
  </button>
)}
        </div>

        <div className="flex justify-between items-center mb-4">
          {/* Difficulty */}
          <span
            className={`text-xs font-medium px-2 py-1 rounded-full bg-gradient-to-r ${
              difficultyColors[
                recipe.difficulty as keyof typeof difficultyColors
              ]
            }`}
          >
            {recipe.difficulty.charAt(0).toUpperCase() +
              recipe.difficulty.slice(1)}
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
              {recipe.averageRating.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Date */}
        <p className="text-gray-400 text-xs">
          Created on {formatDate(recipe.createdAt)}
        </p>

        {/* Actions */}
        <div className="mt-5 flex justify-between items-center pt-4 border-t border-gray-700">
          <div className="space-x-2">
            <button
              onClick={() => onEdit(recipe.id)}
              className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onTogglePublish(recipe.id, recipe.isPublished)}
              className="text-xs px-3 py-1.5 rounded-lg bg-purple-700/40 hover:bg-purple-700/60 text-white transition-colors"
            >
              {recipe.isPublished ? "Unpublish" : "Publish"}
            </button>
          </div>
          <button
            onClick={() => onDelete(recipe.id)}
            className="text-xs px-3 py-1.5 rounded-lg bg-red-700/40 hover:bg-red-700/60 text-white transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </motion.div>
  );
};
