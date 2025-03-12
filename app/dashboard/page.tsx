"use client";
import React from "react";
import { useAuthStore } from "../store/authStore";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuthStore();

  const stats = [
    {
      title: "Total Recipes",
      value: "24",
      color: "from-purple-500 to-indigo-500"
    },
    { title: "My Recipes", value: "12", color: "from-pink-500 to-rose-500" },
    { title: "Favorites", value: "8", color: "from-blue-500 to-cyan-500" },
    {
      title: "Recipe Views",
      value: "1.2k",
      color: "from-amber-500 to-orange-500"
    }
  ];

  const recentRecipes = [
    {
      id: 1,
      name: "Chocolate Cake",
      category: "Dessert",
      createdAt: "2 days ago"
    },
    {
      id: 2,
      name: "Chicken Parmesan",
      category: "Main Course",
      createdAt: "1 week ago"
    },
    { id: 3, name: "Greek Salad", category: "Salad", createdAt: "2 weeks ago" }
  ];

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
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                ></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">{stat.value}</h2>
            <p className="text-gray-400">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Recipes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8"
      >
        <h2 className="text-xl font-semibold text-white mb-4">
          Recent Recipes
        </h2>
        <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 text-gray-400">Name</th>
                  <th className="px-6 py-4 text-gray-400">Category</th>
                  <th className="px-6 py-4 text-gray-400">Created</th>
                </tr>
              </thead>
              <tbody>
                {recentRecipes.map((recipe) => (
                  <tr
                    key={recipe.id}
                    className="hover:bg-white/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-white">{recipe.name}</td>
                    <td className="px-6 py-4 text-gray-300">
                      {recipe.category}
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {recipe.createdAt}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
