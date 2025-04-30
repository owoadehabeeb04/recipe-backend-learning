import { useAuthStore } from "@/app/store/authStore";
import { Recipe } from "@/types/recipe";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteRecipe, deleteUserRecipe } from "@/app/api/(recipe)/adminRecipe";
import toast from "react-hot-toast";
import Link from "next/link";

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

  const { user, token } = useAuthStore();
  const router = useRouter();

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
          }
        }
      } else if (user?.role === "user") {
        const result = await deleteUserRecipe(recipe._id, token);
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
            src={recipe.featuredImage || "/placeholder-recipe.jpg"}
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
            <Link href={`/dashboard/recipe/${recipe._id}`}>
              {" "}
              <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">
                {recipe.title}
              </h3>
            </Link>
            {/* Edit button - show only if user is admin or creator of the recipe */}
            {user &&
              (user.role === "admin" ||
                (user.role === "user" &&
                  (recipe.user === user._id ||
                    recipe.roleCreated === "user"))) && (
                <button
                  className="absolute cursor-pointer top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-1.5 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToEdit();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
                    <path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
                  </svg>
                  Edit
                </button>
              )}

            {/* Delete button - add this next to the edit button */}
            {user &&
              (user.role === "admin" ||
                (user.role === "user" &&
                  (recipe.user === user._id ||
                    recipe.roleCreated === "user"))) && (
                <button
                  className="absolute cursor-pointer top-3 right-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-1.5 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    goToEdit();
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-3.5 h-3.5"
                  >
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
                {recipe.averageRating?.toFixed(1) || "0.0"}
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
              {/* <button
                onClick={() => goToEdit()}
                className="text-xs px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-white transition-colors flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                  <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
                </svg>
                Edit
              </button> */}
              {user?.role === "super_admin" && (
                <button
                  onClick={() =>
                    onTogglePublish?.(recipe._id, recipe.isPublished)
                  }
                  className="text-xs px-3 py-1.5 rounded-lg bg-purple-700/40 hover:bg-purple-700/60 text-white transition-colors flex items-center"
                >
                  {recipe.isPublished ? (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Unpublish
                    </>
                  ) : (
                    <>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-3.5 w-3.5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path
                          fillRule="evenodd"
                          d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Publish
                    </>
                  )}
                </button>
              )}
            </div>
            {user &&
              (user.role === "admin" ||
                (user.role === "user" &&
                  (recipe.user === user._id ||
                    recipe.roleCreated === "user"))) && (
                <button
                  onClick={handleDeleteClick}
                  className="text-xs px-3 py-1.5 rounded-lg bg-red-700/40 hover:bg-red-700/60 text-white transition-colors flex items-center"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-3.5 w-3.5 mr-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Delete
                </button>
              )}
          </div>
        </div>
      </motion.div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden max-w-md w-full shadow-2xl"
            >
              <div className="p-6">
                <div className="w-16 h-16 mx-auto mb-4 bg-red-500/10 rounded-full flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-red-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>

                <h3 className="text-xl font-bold text-white text-center mb-2">
                  Delete Recipe
                </h3>
                <p className="text-gray-300 text-center mb-6">
                  Are you sure you want to delete{" "}
                  <span className="font-semibold text-white">
                    "{recipe.title}"
                  </span>
                  ? This action cannot be undone.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 rounded-xl text-white font-medium transition-colors"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 rounded-xl text-white font-medium transition-colors flex items-center justify-center"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Delete Recipe
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
