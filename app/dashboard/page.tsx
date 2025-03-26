"use client";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getStatistics, getYourRecentRecipes } from "@/app/api/(recipe)/adminRecipe";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { formatDistance } from "date-fns";

// Define types for our data
interface Statistics {
  totalRecipes: number;
  myRecipes: number;
  publishedRecipes: number;
  unpublishedRecipes: number;
}

interface Recipe {
  _id: string;
  title: string;
  category: string;
  createdAt: string;
  isPublished?: boolean;
}

const Dashboard = () => {
  const { user, token } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when the component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // React Query for statistics
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['statistics'],
    queryFn: () => getStatistics(token || ""),
    enabled: !!token && isClient,
    onError: (error) => {
      toast.error("Failed to load statistics");
      console.error("Statistics error:", error);
    }
  });

  // React Query for recent recipes
  const { data: recipesData, isLoading: recipesLoading } = useQuery({
    queryKey: ['recentRecipes'],
    queryFn: () => getYourRecentRecipes(token || ""),
    enabled: !!token && isClient,
    onError: (error) => {
      toast.error("Failed to load recent recipes");
      console.error("Recent recipes error:", error);
    }
  });

  // Extract and format data
  const statistics: Statistics = statsData?.success ? statsData.data : {
    totalRecipes: 0,
    myRecipes: 0,
    publishedRecipes: 0,
    unpublishedRecipes: 0
  };

  const recentRecipes: Recipe[] = recipesData?.success ? recipesData.data : [];
console.log({recentRecipes});
console.log({statistics})
  // Format timestamps
  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistance(new Date(timestamp), new Date(), { addSuffix: true });
    } catch (error) {
      return "Unknown date";
    }
  };

  // Define stats with data from API
  const stats = [
    {
      title: "Total Recipes",
      value: statsLoading ? "..." : statistics.allRecipes,
      color: "from-purple-500 to-indigo-500",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      )
    },
    { 
      title: "My Recipes", 
      value: statsLoading ? "..." : statistics.myRecipes, 
      color: "from-pink-500 to-rose-500",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      )
    },
    { 
      title: "Published", 
      value: statsLoading ? "..." : statistics.publishedRecipes, 
      color: "from-blue-500 to-cyan-500",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
      )
    },
    {
      title: "Unpublished", 
      value: statsLoading ? "..." : statistics.unpublishedRecipes,
      color: "from-amber-500 to-orange-500",
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      )
    }
  ];

  // Loading skeleton for stats
  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="w-12 h-12 rounded-xl bg-gray-700 animate-pulse mb-4"></div>
          <div className="h-8 w-16 bg-gray-700 animate-pulse mb-2 rounded"></div>
          <div className="h-4 w-24 bg-gray-700 animate-pulse rounded"></div>
        </div>
      ))}
    </div>
  );

  // Loading skeleton for recipes
  const RecipesSkeleton = () => (
    <div className="mt-8">
      <h2 className="text-xl font-semibold text-white mb-4">Recent Recipes</h2>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden p-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex justify-between items-center py-4 border-b border-gray-700 last:border-0">
            <div className="h-6 w-40 bg-gray-700 animate-pulse rounded"></div>
            <div className="h-5 w-20 bg-gray-700 animate-pulse rounded"></div>
            <div className="h-5 w-24 bg-gray-700 animate-pulse rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Welcome, {user?.username || "Chef"}
        </h1>
        <p className="text-gray-400 mt-2">Here's what's cooking today</p>
      </motion.div>

      {/* Stats */}
      {statsLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 * index }}
              className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
              >
                {stat.icon}
              </div>
              <h2 className="text-2xl font-bold text-white">{stat.value}</h2>
              <p className="text-gray-400">{stat.title}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Recent Recipes */}
      {recipesLoading ? (
        <RecipesSkeleton />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-8"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              Recent Recipes
            </h2>
            <Link href="/dashboard/my-recipes">
              <span className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                View all recipes →
              </span>
            </Link>
          </div>
          
          {recentRecipes.length > 0 ? (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 text-gray-400">Name</th>
                      <th className="px-6 py-4 text-gray-400">Category</th>
                      <th className="px-6 py-4 text-gray-400">Status</th>
                      <th className="px-6 py-4 text-gray-400">Created</th>
                      <th className="px-6 py-4 text-gray-400 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentRecipes.map((recipe) => (
                      <tr
                        key={recipe._id}
                        className="hover:bg-white/5 transition-colors"
                      >
                        <td className="px-6 py-4 text-white">
                          <Link href={`/dashboard/recipe/${recipe._id}`}>
                            <span className="hover:text-purple-400 transition-colors">
                              {recipe.title}
                            </span>
                          </Link>
                        </td>
                        <td className="px-6 py-4 text-gray-300 capitalize">
                          {recipe.category}
                        </td>
                        <td className="px-6 py-4">
                          {recipe.isPublished ? (
                            <span className="px-2 py-1 bg-green-900/30 text-green-400 rounded-full text-xs">
                              Published
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-amber-900/30 text-amber-400 rounded-full text-xs">
                              Draft
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-gray-400">
                          {formatTimeAgo(recipe.createdAt)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link href={`/dashboard/recipe/${recipe._id}`}>
                            <span className="text-purple-400 hover:text-purple-300 transition-colors">
                              View
                            </span>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-700/50 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} 
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-white text-lg font-medium mb-2">No recipes yet</h3>
              <p className="text-gray-400 mb-6">You haven't created any recipes yet. Get started by creating your first recipe.</p>
              <Link href="/dashboard/create-recipe">
                <button className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors">
                  Create Recipe
                </button>
              </Link>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;