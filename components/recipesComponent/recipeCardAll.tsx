import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

// Recipe Card Component
// Recipe type definition
interface Recipe {
  id: string;
  title: string;
  category: string;
  cookingTime: number;
  difficulty: string;
  featuredImage: string;
  averageRating: number;
  adminName: string;
  createdAt: string;
  adminDetails: {
    name: string;
    email: string;
  }
}
export const RecipeCard = ({ recipe }: { recipe: Recipe }) => {
  const difficultyColors = {
    easy: "from-green-500 to-emerald-700",
    medium: "from-amber-500 to-amber-700",
    hard: "from-red-500 to-red-700"
  };

  return (
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

          {/* Author */}
          <p className="text-gray-400 text-xs flex items-center mt-4">
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
        </div>
      </motion.div>
    </Link>
  );
};
