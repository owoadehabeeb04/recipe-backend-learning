"use client";
import React, { useEffect, useState } from "react";
import { useAuthStore } from "../store/authStore";
 
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import {
  getStatistics,
  getYourRecentRecipes
} from "@/app/api/(recipe)/adminRecipe";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { formatDistance } from "date-fns";
import { getAllRecipes } from "../api/(recipe)/userRecipes";
import { getAllUsers } from "../api/(users)";
import { DashboardCharts } from "@/components/charts/dashboardCharts";
import DashboardUser from "@/components/userDashboard/dashboardUser";
import { Recipe } from "@/types/recipe";

// Define types for our data
interface Statistics {
  totalRecipes: number;
  myRecipes: number;
  publishedRecipes: number;
  unpublishedRecipes: number;
}

const Dashboard = () => {
  const { user, token } = useAuthStore();
  const [isClient, setIsClient] = useState(false);

  // Set isClient to true when the component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  // React Query for statistics
  interface GetStatisticsResponse {
    success: boolean;
    data: Statistics;
  }

  const { data: statsData, isLoading: statsLoading } = useQuery<any>({
    queryKey: ["statistics"],
    queryFn: () => getStatistics(token || ""),
    enabled: !!token && isClient
    // Error handling can be done here or in the queryFn
  });

  // React Query for recent recipes
  const { data: recipesData, isLoading: recipesLoading } = useQuery<{
    success: boolean;
    data: Recipe[] | null;
  }>({
    queryKey: ["recentRecipes"],
    queryFn: async (): Promise<{ success: boolean; data: Recipe[] | null }> => {
      const response = await getYourRecentRecipes(token || "");
      if (response.success && response.data === null) {
        throw new Error("Data is null");
      }
      return response;
    },
    enabled: !!token && isClient
    // Error handling is done in the queryFn or using the error property from the query result
  });
  // Error handling can be done here or in the queryFn
  const statistics: any = statsData?.success
    ? statsData.data
    : {
        totalRecipes: 0,
        myRecipes: 0,
        publishedRecipes: 0,
        unpublishedRecipes: 0
      };

  const recentRecipes: Recipe[] = recipesData?.data || [];
  // Format timestamps
  const formatTimeAgo = (timestamp: string) => {
    try {
      return formatDistance(new Date(timestamp), new Date(), {
        addSuffix: true
      });
    } catch (error) {
      return "Unknown date";
    }
  };
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const getRecipes = async () => {
    try {
      const response: any = await getAllRecipes({
        limit: 1000,
        page: 1
      });
      setRecipes(response.data);
      return response;
    } catch (error) {
      console.error("Error fetching all recipes:", error);
    }
  };
  useEffect(() => {
    getRecipes();
  }, []);
  const [users, setUsers] = useState<any[]>([]);
  const currentPage = 1;
  const limit = 1000;
  const getUsers = async () => {
    const params = new URLSearchParams();
    params.append("page", currentPage.toString());
    params.append("limit", limit.toString());
    try {
      const response: any = await getAllUsers(token, params.toString());
      setUsers(response.data || response || []);
    } catch (error) {
      console.error("Error fetching all users:", error);
    }
  };
  useEffect(() => {
    // No curly braces needed around the conditional
    if (user && user.role === "super_admin" && token) {
      getUsers();
    }
  }, [user, token]);
  const unpublishedRecipes = recipes.filter((recipe) => !recipe.isPublished);
  const publishedRecipes = recipes.filter((recipe) => recipe.isPublished);

  const thePublishedRecipeToUse =
    user?.role === "admin"
      ? statistics.publishedRecipes
      : publishedRecipes.length;
  const theUnpublishedRecipeToUse =
    user?.role === "admin"
      ? statistics.unpublishedRecipes
      : unpublishedRecipes.length;

  // Define stats with data from API
  const stats = [
    {
      title: "Total Recipes",
      value: statsLoading ? "..." : statistics.allRecipes,
      color: "from-purple-500 to-indigo-500",
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      )
    },
    {
      title: "My Recipes",
      value: statsLoading ? "..." : statistics.myRecipes,
      color: "from-pink-500 to-rose-500",
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      )
    },
    {
      title: "Published",
      value: statsLoading ? "..." : thePublishedRecipeToUse,
      color: "from-blue-500 to-cyan-500",
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
          />
        </svg>
      )
    },
    {
      title: "Unpublished",
      value: statsLoading ? "..." : theUnpublishedRecipeToUse,
      color: "from-amber-500 to-orange-500",
      icon: (
        <svg
          className="w-6 h-6 text-white"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>
      )
    }
  ];

  // Loading skeleton for stats
  const StatsSkeleton = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6"
        >
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
      <h2 className="text-xl font-semibold text-white mb-4">Loading...</h2>
      <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden p-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="flex justify-between items-center py-4 border-b border-gray-700 last:border-0"
          >
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
      <div
        //{ opacity: 0, y: 20 }}
        // opacity: 1, y: 0 }}
        // duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Welcome, {user?.username || "Chef"}
        </h1>
        <p className="text-gray-400 mt-2">Here's what's cooking today</p>
      </div>

      {/* Stats */}
      {statsLoading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
          {stats.map((stat, index) => (
            <div
              key={stat.title}
              //{ opacity: 0, y: 20 }}
              // opacity: 1, y: 0 }}
              // duration: 0.5, delay: 0.1 * index }}
              className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:shadow-lg hover:shadow-purple-500/10 transition-all"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-4`}
              >
                {stat.icon}
              </div>
              <h2 className="text-2xl font-bold text-white">{stat.value}</h2>
              <p className="text-gray-400">{stat.title}</p>
            </div>
          ))}
        </div>
      )}

      {/* Recent Recipes */}
      {user?.role === "admin" && (
        <div>
          {recipesLoading ? (
            <RecipesSkeleton />
          ) : (
            <div
              //{ opacity: 0, y: 20 }}
              // opacity: 1, y: 0 }}
              // duration: 0.5, delay: 0.5 }}
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
                          <th className="px-6 py-4 text-gray-400 text-right">
                            Actions
                          </th>
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
                    <svg
                      className="w-8 h-8 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-white text-lg font-medium mb-2">
                    No recipes yet
                  </h3>
                  <p className="text-gray-400 mb-6">
                    You haven't created any recipes yet. Get started by creating
                    your first recipe.
                  </p>
                  <Link href="/dashboard/create-recipe">
                    <button className="px-5 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors">
                      Create Recipe
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Super Admin Dashboard Section */}
      {user?.role === "super_admin" && (
        <div>
          {recipesLoading ? (
            <RecipesSkeleton />
          ) : (
            <div
              //{ opacity: 0, y: 20 }}
              // opacity: 1, y: 0 }}
              // duration: 0.5, delay: 0.5 }}
              className="mt-8"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">
                  Platform Overview
                </h2>
                <div className="flex gap-3">
                  <Link href="/dashboard/users">
                    <span className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      Manage Users
                    </span>
                  </Link>
                  <Link href="/dashboard/all-recipes">
                    <span className="text-sm text-purple-400 hover:text-purple-300 transition-colors">
                      All Recipes →
                    </span>
                  </Link>
                </div>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-sm border border-purple-800/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Total Recipes</p>
                      <h3 className="text-2xl font-bold text-white">
                        {recipes.length || "..."}
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-700/30 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-pink-900/40 to-pink-800/20 backdrop-blur-sm border border-pink-800/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-pink-300 text-sm">Total Users</p>
                      <h3 className="text-2xl font-bold text-white">
                        {users.length || "..."}
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-pink-700/30 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-pink-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 backdrop-blur-sm border border-blue-800/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-300 text-sm">Published</p>
                      <h3 className="text-2xl font-bold text-white">
                        {publishedRecipes.length || "..."}
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-blue-700/30 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-blue-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/20 backdrop-blur-sm border border-purple-800/30 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-300 text-sm">Unpublished</p>
                      <h3 className="text-2xl font-bold text-white">
                        {unpublishedRecipes.length || "..."}
                      </h3>
                    </div>
                    <div className="w-12 h-12 bg-purple-700/30 rounded-full flex items-center justify-center">
                      <svg
                        className="w-6 h-6 text-purple-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
                {/* <div className="bg-gradient-to-br from-green-900/40 to-green-800/20 backdrop-blur-sm border border-green-800/30 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-300 text-sm">New Today</p>
                <h3 className="text-2xl font-bold text-white">{newToday || '0'}</h3>
              </div>
              <div className="w-12 h-12 bg-green-700/30 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div> */}
              </div>

              {/* Recent Content Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Recipes */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                  <div className="px-6 py-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-medium text-white">Latest Recipes</h3>
                    <Link href="/dashboard/all-recipes">
                      <span className="text-xs text-purple-400 hover:text-purple-300">
                        View all
                      </span>
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-white/10">
                        <tr>
                          <th className="px-6 py-3 text-xs text-gray-400">
                            Title
                          </th>
                          <th className="px-6 py-3 text-xs text-gray-400">
                            Admin
                          </th>
                          <th className="px-6 py-3 text-xs text-gray-400">
                            Status
                          </th>
                          <th className="px-6 py-3 text-xs text-gray-400 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {recipes.slice(0, 5).map((recipe) => (
                          <tr
                            key={recipe._id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-6 py-3 text-white text-sm">
                              <Link href={`/dashboard/recipe/${recipe._id}`}>
                                <span className="hover:text-purple-400 transition-colors">
                                  {recipe.title.length > 25
                                    ? recipe.title.substring(0, 25) + "..."
                                    : recipe.title}
                                </span>
                              </Link>
                            </td>
                            <td className="px-6 py-3 text-gray-300 text-sm">
                              {recipe.adminDetails?.name || "Unknown"}
                            </td>
                            <td className="px-6 py-3">
                              {recipe.isPublished ? (
                                <span className="px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full text-xs">
                                  Published
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-900/30 text-amber-400 rounded-full text-xs">
                                  Draft
                                </span>
                              )}
                            </td>
                            <td className="px-6 py-3 text-right">
                              <div className="flex justify-end space-x-2">
                                <Link href={`/dashboard/recipe/${recipe._id}`}>
                                  <span className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
                                    View
                                  </span>
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Recent Users */}
                <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                  <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-white/10 flex justify-between items-center">
                    <h3 className="font-medium text-white text-sm sm:text-base">Latest Users</h3>
                    <Link href="/dashboard/users">
                      <span className="text-[10px] sm:text-xs text-purple-400 hover:text-purple-300">
                        View all
                      </span>
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="border-b border-white/10">
                        <tr>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs text-gray-400">
                            User
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs text-gray-400">
                            Role
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs text-gray-400">
                            Joined
                          </th>
                          <th className="px-3 sm:px-6 py-2 sm:py-3 text-[10px] sm:text-xs text-gray-400 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {users?.slice(0, 5).map((user) => (
                          <tr
                            key={user._id}
                            className="hover:bg-white/5 transition-colors"
                          >
                            <td className="px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm">
                              <div className="flex items-center">
                                {user?.profileImage && user?.profileImage ? (
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full overflow-hidden relative mr-2 sm:mr-3 flex-shrink-0">
                                    <Image
                                      src={
                                        user?.profileImage ||
                                        "/default-profile.png"
                                      }
                                      alt={user?.username}
                                      width={40}
                                      height={40}
                                      className="w-full h-full object-cover"
                                      style={{ borderRadius: "50%" }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center overflow-hidden mr-2 sm:mr-3 flex-shrink-0">
                                    <span className="text-[10px] sm:text-xs text-white">
                                      {user?.username?.charAt(0).toUpperCase() ||
                                        "U"}
                                    </span>
                                  </div>
                                )}
                                <span className="text-white font-medium line-clamp-1">
                                  {user?.username || "Unknown"}
                                </span>
                              </div>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-3">
                              <span
                                className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${
                                  user.role === "admin"
                                    ? "bg-purple-900/30 text-purple-300"
                                    : user.role === "super_admin"
                                    ? "bg-pink-900/30 text-pink-300"
                                    : "bg-blue-900/30 text-blue-300"
                                }`}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-3 text-gray-400 text-[10px] sm:text-xs">
                              {formatTimeAgo(user.createdAt)}
                            </td>
                            <td className="px-3 sm:px-6 py-2 sm:py-3 text-right">
                              <Link
                                href={`/dashboard/users/${user._id}`}
                              >
                                <span className="text-[10px] sm:text-xs text-purple-400 hover:text-purple-300 transition-colors">
                                  View
                                </span>
                              </Link>
                            </td>
                          </tr>
                        ))}

                        {(!users || users.length === 0) && (
                          <tr>
                            <td
                              colSpan={4}
                              className="px-3 sm:px-6 py-6 sm:py-8 text-center text-gray-400 text-xs sm:text-sm"
                            >
                              No users found
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      <div
        //{ opacity: 0, y: 20 }}
        // opacity: 1, y: 0 }}
        // duration: 0.5, delay: 0.5 }}
        className="mt-8"
      >
        <DashboardCharts
          statistics={{
            allRecipes: stats[0].value,
            myRecipes: stats[1].value || 0,
            publishedRecipes: stats[2].value,
            unpublishedRecipes: stats[3].value
          }}
          isLoading={recipesLoading}
        />
      </div>
      {/* <DashboardUser /> */}
    </div>
  );
};

export default Dashboard;
