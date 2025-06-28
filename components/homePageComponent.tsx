"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { RecipeCard } from "./recipesComponent/recipeCardAll";
import { getAllRecipes } from "@/app/api/(recipe)/userRecipes";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import mealplanningpicture from "../public/Screenshot 2025-06-27 at 12.25.45 PM.png"
import ARIACHATOTPICTURE from "../public/Screenshot 2025-06-27 at 12.26.36 PM.png";

const LandingPage = () => {
  // Sample recipe data for featured recipes
  
  // Replace your featuredRecipes state initialization
  const [featuredRecipes, setFeaturedRecipes] = useState<any>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Add this useEffect to fetch recipes when the component mounts
  // Replace your recipe fetching code in the useEffect
  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoadingRecipes(true);
        
        // Get recipes with a sufficient limit and sort by rating
        const response = await getAllRecipes({
          limit: 10, // Fetch more to find highest rated ones
          sort: "rating", // Sort by rating if your API supports it
        });
        
        if (response.success && Array.isArray(response.data)) {
          // Sort by average rating (highest first)
          const sortedRecipes = [...response.data].sort((a, b) => 
            (b.averageRating || 0) - (a.averageRating || 0)
          );
          
          // Take the top 3
          setFeaturedRecipes(sortedRecipes.slice(0, 3));
        } else {
          console.error("Failed to fetch recipes:", response.message);
          toast.error("Couldn't load featured recipes");
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
        toast.error("An error occurred while loading recipes");
      } finally {
        setIsLoadingRecipes(false);
      }
    };

    fetchRecipes();
  }, []);

  // Categories with icons
  const categories = [
    {
      name: "Breakfast",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      name: "Lunch",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      name: "Dinner",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
  
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 to-gray-800 text-gray-100">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-gray-900/80 border-b border-gray-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
              Recipia
            </h1>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="hidden md:flex items-center space-x-8"
          >
            <Link href="#features" className="text-gray-300 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="/dashboard/aria" className="text-gray-300 hover:text-white transition-colors">
              AI Assistant
            </Link>
            <Link href="/dashboard/meal-planner" className="text-gray-300 hover:text-white transition-colors">
              Meal Planning
            </Link>
            <Link href="/dashboard/all-recipes" className="text-gray-300 hover:text-white transition-colors">
              Recipes
            </Link>
            <Link href="/login" className="text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link
              href="/signup"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-purple-900/50"
            >
              Get Started
            </Link>
          </motion.div>

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            <svg
              className={`w-6 h-6 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </motion.button>
        </nav>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ 
            height: isMobileMenuOpen ? 'auto' : 0,
            opacity: isMobileMenuOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="md:hidden overflow-hidden bg-gray-900/95 backdrop-blur-lg border-t border-gray-700"
        >
          <div className="px-4 py-6 space-y-4">
            <Link 
              href="#features" 
              className="block text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </Link>
            <Link 
              href="/dashboard/aria" 
              className="block text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              AI Assistant
            </Link>
            <Link 
              href="/dashboard/meal-planner" 
              className="block text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Meal Planning
            </Link>
            <Link 
              href="/dashboard/all-recipes" 
              className="block text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Recipes
            </Link>
            <Link 
              href="/login" 
              className="block text-gray-300 hover:text-white transition-colors py-2 border-b border-gray-800"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="block bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-full transition-all hover:shadow-lg hover:shadow-purple-900/50 text-center mt-4"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:w-1/2"
            >
              <h2 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-400 to-pink-300">
                Discover & Create Delicious Recipes
              </h2>
              <p className="mt-6 text-xl text-gray-300 max-w-2xl">
                AI-powered recipe discovery and personalization. Create, share,
                and experience food like never before.
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
                className="mt-10"
              >
                <Link
                  href="/signup"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full text-lg font-medium hover:shadow-xl hover:shadow-purple-900/30 transition-all duration-300 inline-flex items-center group"
                >
                  Begin Your Journey
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </Link>
              </motion.div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="lg:w-1/2"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 to-pink-500/30 rounded-3xl transform rotate-3"></div>
                <div className="relative overflow-hidden rounded-3xl shadow-xl">
                  <Image
                    src="https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg"
                    alt="Gourmet dish with fresh ingredients"
                    width={600}
                    height={400}
                    className="w-full h-auto object-cover"
                    priority
                  />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background decorations - more subtle in dark theme */}
        <div className="absolute top-32 right-10 w-64 h-64 rounded-full bg-purple-900/20 blur-3xl opacity-30 -z-10"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 rounded-full bg-pink-900/20 blur-3xl opacity-30 -z-10"></div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              Explore Recipe Categories
            </h3>
            <div className="w-20 h-1 mx-auto bg-gradient-to-r from-purple-400 to-pink-400"></div>
            <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
              Browse through our diverse collection of recipes categorized for every occasion
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                viewport={{ once: true }}
                whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.3)" }}
                className="bg-gray-800 rounded-xl p-6 text-center shadow-lg shadow-black/20 hover:shadow-xl hover:shadow-black/30 transition-all cursor-pointer border border-gray-700"
              >
                <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center text-purple-400">
                  {category.icon}
                </div>
                <h4 className="font-semibold text-lg text-gray-100">{category.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
{/* Featured Recipes Section */}
<section className="py-20">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="text-center mb-12"
    >
      <h3 className="text-3xl font-bold text-white mb-4">
        Top-Rated Recipes
      </h3>
      <div className="w-20 h-1 mx-auto bg-gradient-to-r from-purple-400 to-pink-400"></div>
      <p className="mt-4 text-gray-300 max-w-2xl mx-auto">
        Discover our most popular and highly-rated culinary creations
      </p>
    </motion.div>

    {isLoadingRecipes ? (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-400">Loading top recipes...</span>
      </div>
    ) : featuredRecipes.length > 0 ? (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuredRecipes.map((recipe: any) => (
          <motion.div
            key={recipe._id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            {recipe.averageRating > 0 && (
              <div className="absolute top-4 right-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-medium z-10 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {recipe.averageRating.toFixed(1)}
              </div>
            )}
            <RecipeCard recipe={recipe} />
          </motion.div>
        ))}
      </div>
    ) : (
      <div className="text-center py-8">
        <p className="text-gray-400">No recipes available at this time.</p>
        <Link 
          href="/dashboard/create-recipe"
          className="mt-4 inline-flex items-center text-purple-400 hover:text-purple-300"
        >
          Create the first recipe
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    )}
    
    <div className="mt-12 text-center">
      <Link 
        href="/dashboard/all-recipes"
        className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors font-medium"
      >
        View all recipes
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 ml-1" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </div>
  </div>
</section>

{/* Comprehensive Features Section - Add this before AI Features Section */}
<section id="features" className="py-20 bg-gray-900/50 relative overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h3 className="text-4xl font-bold text-white mb-4">
        Everything You Need for Culinary Excellence
      </h3>
      <div className="w-20 h-1 mx-auto bg-gradient-to-r from-purple-400 to-pink-400 mb-6"></div>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
        From AI-powered recipe discovery to smart meal planning, we've got all your cooking needs covered
      </p>
    </motion.div>

    {/* Feature Grid */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
      {/* AI Chat Assistant */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 group"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <h4 className="text-xl font-semibold text-white mb-4">AI Chat Assistant</h4>
        <p className="text-gray-300 mb-6">
          Chat with Aria, your intelligent cooking companion. Get instant recipe suggestions, cooking tips, and personalized meal recommendations through natural conversation.
        </p>
        {/* <Link 
          href="/dashboard/aria"
          className="inline-flex items-center text-purple-400 hover:text-purple-300 transition-colors font-medium"
        >
          Try Aria Now
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link> */}
      </motion.div>

      {/* Weekly Meal Planning */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-green-500/50 transition-all duration-300 group"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        <h4 className="text-xl font-semibold text-white mb-4">Smart Meal Planning</h4>
        <p className="text-gray-300 mb-6">
          Create personalized weekly meal plans with AI assistance. Balance nutrition, manage dietary restrictions, and streamline your cooking schedule effortlessly.
        </p>
        {/* <Link 
          href="/dashboard/meal-planner"
          className="inline-flex items-center text-green-400 hover:text-green-300 transition-colors font-medium"
        >
          Start Planning
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link> */}
      </motion.div>

      {/* Google Calendar Integration */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="text-xl font-semibold text-white mb-4">Calendar Integration</h4>
        <p className="text-gray-300 mb-6">
          Sync your meal plans directly with Google Calendar. Set cooking reminders, prep time alerts, and never miss a meal preparation deadline.
        </p>
        {/* <Link 
          href="/dashboard/calendar-sync"
          className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors font-medium"
        >
          Connect Calendar
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link> */}
      </motion.div>

      {/* Smart Shopping Lists */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-orange-500/50 transition-all duration-300 group"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h4 className="text-xl font-semibold text-white mb-4">Printable Shopping Lists</h4>
        <p className="text-gray-300 mb-6">
          Automatically generate organized shopping lists from your meal plans. Print or share lists categorized by store sections for efficient grocery shopping.
        </p>
        {/* <Link 
          href="/dashboard/shopping-lists"
          className="inline-flex items-center text-orange-400 hover:text-orange-300 transition-colors font-medium"
        >
          Generate List
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link> */}
      </motion.div>

      {/* Cooking Progress Tracking */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300 group"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-yellow-600 to-amber-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h4 className="text-xl font-semibold text-white mb-4">Cooking Progress Tracker</h4>
        <p className="text-gray-300 mb-6">
          Step-by-step cooking guidance with progress tracking. Mark completed steps, set timers, and never lose your place in complex recipes.
        </p>
        {/* <Link 
          href="/dashboard/cooking-tracker"
          className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
        >
          Start Cooking
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link> */}
      </motion.div>

      {/* Recipe Rating & Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        viewport={{ once: true }}
        className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-gray-700 hover:border-pink-500/50 transition-all duration-300 group"
      >
        <div className="w-16 h-16 bg-gradient-to-br from-pink-600 to-rose-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </div>
        <h4 className="text-xl font-semibold text-white mb-4">Advanced Rating System</h4>
        <p className="text-gray-300 mb-6">
          Rate and review recipes with detailed feedback. Discover top-rated dishes, share your cooking experiences, and help the community find the best recipes.
        </p>
        {/* <Link 
          href="/dashboard/all-recipes"
          className="inline-flex items-center text-pink-400 hover:text-pink-300 transition-colors font-medium"
        >
          Explore Recipes
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link> */}
      </motion.div>
    </div>

    {/* Admin & User Features */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6, duration: 0.7 }}
      viewport={{ once: true }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      {/* Admin Recipe Creation */}
      <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-2xl p-8 border border-purple-500/30">
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">Admin Recipe Management</h4>
            <p className="text-gray-300">
              Authorized administrators can create, edit, and curate premium recipes. Ensure quality content with professional recipe validation and featured recipe selection.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 bg-purple-600/30 text-purple-300 rounded-full text-sm">Content Curation</span>
          <span className="px-3 py-1 bg-indigo-600/30 text-indigo-300 rounded-full text-sm">Quality Control</span>
          <span className="px-3 py-1 bg-pink-600/30 text-pink-300 rounded-full text-sm">Featured Recipes</span>
        </div>
      </div>

      {/* User Favorites & Collections */}
      <div className="bg-gradient-to-br from-rose-900/50 to-pink-900/50 rounded-2xl p-8 border border-rose-500/30">
        <div className="flex items-start space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-600 to-pink-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">Personal Recipe Collections</h4>
            <p className="text-gray-300">
              Save your favorite recipes, create custom collections, and build your personal cookbook. Share collections with friends and discover new favorites from the community.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <span className="px-3 py-1 bg-rose-600/30 text-rose-300 rounded-full text-sm">Favorites</span>
          <span className="px-3 py-1 bg-pink-600/30 text-pink-300 rounded-full text-sm">Collections</span>
          <span className="px-3 py-1 bg-red-600/30 text-red-300 rounded-full text-sm">Share & Discover</span>
        </div>
      </div>
    </motion.div>

    {/* Call to Action */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.7 }}
      viewport={{ once: true }}
      className="text-center mt-16"
    >
      <h4 className="text-2xl font-bold text-white mb-4">
        Ready to revolutionize your cooking experience?
      </h4>
      <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
        Join thousands of home cooks and professional chefs who've transformed their kitchens with Recipia's intelligent features.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link
          href="/signup"
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-900/30 inline-flex items-center justify-center group"
        >
          Get Started Free
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <Link
          href="/dashboard/aria"
          className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 border border-gray-600 hover:border-gray-500 inline-flex items-center justify-center group"
        >
          Try AI Assistant
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </Link>
      </div>
    </motion.div>
  </div>

  {/* Background Elements */}
  <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-purple-900/10 blur-3xl opacity-60 -z-10"></div>
  <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-pink-900/10 blur-3xl opacity-60 -z-10"></div>
  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-blue-900/5 blur-3xl opacity-40 -z-10"></div>
</section>

{/* AI Features Section */}
<section className="py-20 relative overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h3 className="text-4xl font-bold text-white mb-4">
        Powered by Advanced AI Technology
      </h3>
      <div className="w-20 h-1 mx-auto bg-gradient-to-r from-purple-400 to-pink-400 mb-6"></div>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
        Experience the future of cooking with our intelligent AI assistant that understands your needs
      </p>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      {/* AI Features List */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="space-y-8"
      >
        {/* Voice Interaction */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">Voice Commands</h4>
            <p className="text-gray-300">
              Talk naturally to Aria! Ask for recipes, cooking tips, or ingredient substitutions using your voice. 
              Perfect for hands-free cooking assistance.
            </p>
          </div>
        </div>

        {/* Image Recognition */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">Smart Image Analysis</h4>
            <p className="text-gray-300">
              Upload photos of ingredients, dishes, or your fridge contents. Aria will identify them and suggest 
              perfect recipes you can make right now.
            </p>
          </div>
        </div>

        {/* Intelligent Text Chat */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-pink-600 to-red-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">Intelligent Conversations</h4>
            <p className="text-gray-300">
              Chat naturally with Aria about cooking techniques, dietary restrictions, meal planning, and get 
              personalized recipe recommendations.
            </p>
          </div>
        </div>

        {/* Meal Planning */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">Smart Meal Planning</h4>
            <p className="text-gray-300">
              Let Aria create personalized weekly meal plans based on your preferences, dietary needs, and schedule. 
              Complete with shopping lists and prep instructions.
            </p>
          </div>
        </div>
      </motion.div>

      {/* AI Interface Screenshots */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative"
      >
        {/* Main Chat Interface */}
        <div className="relative z-10 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 shadow-2xl border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h5 className="text-white font-semibold">Aria AI Assistant</h5>
            </div>
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
          
          {/* Aria Chat Preview Image */}
          <div className="relative overflow-hidden rounded-lg mb-4">
            <Image
              src={ARIACHATOTPICTURE}
              alt="Aria AI Chat Interface Preview"
              width={500}
              height={300}
              className="w-full h-auto object-cover"
            />
          </div>
          
          {/* Input Area */}
          <div className="flex items-center space-x-2 p-3 bg-gray-700 rounded-lg">
            <button className="p-2 rounded-full bg-purple-600 hover:bg-purple-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <input 
              type="text" 
              placeholder="Ask Aria anything about cooking..."
              className="flex-1 bg-transparent text-gray-300 placeholder-gray-500 border-none outline-none"
              disabled
            />
            <button className="p-2 rounded-full bg-pink-600 hover:bg-pink-700 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 to-pink-600/20 rounded-2xl blur-xl transform scale-110 -z-10"></div>
      </motion.div>
    </div>

    {/* CTA for AI Features */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.7 }}
      viewport={{ once: true }}
      className="text-center mt-16"
    >
      <Link
        href="/dashboard/aria"
        className="inline-flex items-center bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-purple-900/30 group"
      >
        Try Aria AI Now
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </Link>
    </motion.div>
  </div>

  {/* Background Elements */}
  <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-purple-900/10 blur-2xl opacity-60 -z-10"></div>
  <div className="absolute bottom-20 right-10 w-40 h-40 rounded-full bg-pink-900/10 blur-2xl opacity-60 -z-10"></div>
</section>

{/* Meal Planning Feature Section */}
<section className="py-20 bg-gray-800/30 relative overflow-hidden">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 0.7 }}
      viewport={{ once: true }}
      className="text-center mb-16"
    >
      <h3 className="text-4xl font-bold text-white mb-4">
        Smart Meal Planning Made Simple
      </h3>
      <div className="w-20 h-1 mx-auto bg-gradient-to-r from-green-400 to-teal-400 mb-6"></div>
      <p className="text-xl text-gray-300 max-w-3xl mx-auto">
        Plan your entire week with intelligent meal suggestions, automated shopping lists, and nutritional tracking
      </p>
    </motion.div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      {/* Meal Planning Interface Preview */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="relative"
      >
        {/* Meal Planning Preview Image */}
        <div className="relative overflow-hidden rounded-2xl shadow-2xl border border-gray-700">
          <Image
            src={mealplanningpicture}
            alt="Meal Planning Interface Preview"
            width={600}
            height={400}
            className="w-full h-auto object-cover"
          />
        </div>
      </motion.div>

      {/* Features List */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="space-y-8"
      >
        {/* Personalized Planning */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-600 to-teal-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">Personalized Planning</h4>
            <p className="text-gray-300">
              AI analyzes your preferences, dietary restrictions, cooking skills, and schedule to create perfect weekly meal plans tailored just for you.
            </p>
          </div>
        </div>

        {/* Smart Shopping Lists */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">Automated Shopping Lists</h4>
            <p className="text-gray-300">
              Automatically generates organized shopping lists with exact quantities, categorized by store sections. Never forget an ingredient again!
            </p>
          </div>
        </div>

        {/* Nutritional Tracking */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012-2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">Nutritional Intelligence</h4>
            <p className="text-gray-300">
              Track calories, macros, and nutrients automatically. Get balanced meal suggestions that align with your health and fitness goals.
            </p>
          </div>
        </div>

        {/* Flexible Scheduling */}
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-xl flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xl font-semibold text-white mb-2">Flexible Scheduling</h4>
            <p className="text-gray-300">
              Adapt to your busy lifestyle with quick 15-minute meals for hectic days and elaborate weekend cooking projects when you have time.
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="pt-6">
          <Link
            href="/dashboard/meal-planner"
            className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white px-8 py-4 rounded-full text-lg font-medium transition-all duration-300 shadow-lg hover:shadow-xl hover:shadow-green-900/30 group"
          >
            Start Planning Meals
            {/* <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg> */}
          </Link>
        </div>
      </motion.div>
    </div>

    {/* Statistics */}
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.7 }}
      viewport={{ once: true }}
      className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
    >
      <div className="text-center">
        <div className="text-3xl font-bold text-white mb-2">2.5 hrs</div>
        <p className="text-gray-400">Average time saved per week</p>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-white mb-2">30%</div>
        <p className="text-gray-400">Reduction in food waste</p>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-white mb-2">100+</div>
        <p className="text-gray-400">Meal plan templates available</p>
      </div>
    </motion.div>
  </div>

  {/* Background Elements */}
  <div className="absolute top-20 right-10 w-32 h-32 rounded-full bg-green-900/10 blur-2xl opacity-60 -z-10"></div>
  <div className="absolute bottom-20 left-10 w-40 h-40 rounded-full bg-teal-900/10 blur-2xl opacity-60 -z-10"></div>
</section>

      {/* User Reviews Section */}
      <section className="py-20 bg-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.7 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h3 className="text-3xl font-bold text-white mb-4">
              What Users Are Saying
            </h3>
            <div className="w-20 h-1 mx-auto bg-gradient-to-r from-purple-400 to-pink-400"></div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                quote: "Recipia transformed how I cook. The AI suggestions are brilliant and always match my preferences!",
                author: "Tobiloba Owoade",
                role: "Home Chef"
              },
              {
                quote: "As a professional chef, I'm impressed by the innovation and precision of the recipes. Great for inspiration!",
                author: "Abdul Razaq Tiamiyu",
                role: "Executive Chef"
              },
              {
                quote: "Finally found recipes that match my dietary needs perfectly. The personalization is amazing!",
                author: "Barakat Temidayo",
                role: "Fitness Enthusiast"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.2, duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-700"
              >
                <svg
                  className="h-10 w-10 text-purple-400 mb-4"
                  fill="currentColor"
                  viewBox="0 0 32 32"
                >
                  <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                </svg>
                <p className="text-gray-300 mb-4">{testimonial.quote}</p>
                <p className="font-semibold text-white">{testimonial.author}</p>
                <p className="text-purple-400 text-sm">{testimonial.role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="absolute inset-0 -z-10 opacity-20">
          <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40L40 0M20 40L40 20M0 20L20 0" fill="none" stroke="currentColor" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
            Ready to Transform Your Cooking?
          </h2>
          <p className="mt-6 text-xl text-gray-300">
            Join thousands of food enthusiasts revolutionizing their culinary experience
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7 }}
            viewport={{ once: true }}
            className="mt-10"
          >
            <Link
              href="/signup"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-4 rounded-full text-lg font-medium inline-flex items-center group shadow-xl shadow-purple-900/30"
            >
              Create Your Account
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
            <div>
              <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                Recipia
              </h3>
              <p className="text-gray-400">
                Revolutionizing the way you discover, create, and share culinary experiences.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href=""
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <Link
                    href=""
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Careers
                  </Link>
                </li>
                <li>
                  <Link
                    href=""
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">
                Features
              </h4>
              <ul className="space-y-2">
                <li>
                  <Link
                    href=""
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Recipe Library
                  </Link>
                </li>
                <li>
                  <Link
                    href=""
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    AI Assistant
                  </Link>
                </li>
                <li>
                  <Link
                    href=""
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    Community
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Connect</h4>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <span className="sr-only">Twitter</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <span className="sr-only">Instagram</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-purple-400 transition-colors"
                >
                  <span className="sr-only">GitHub</span>
                  <svg
                    className="h-6 w-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fillRule="evenodd"
                      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </a>
              </div>
              
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500">
              &copy; {new Date().getFullYear()} Recipia. All rights reserved.
            </p>
            <div className="mt-4 md:mt-0 flex space-x-6">
              <Link
                href="/privacy"
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
              Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-gray-500 hover:text-gray-300 transition-colors"
              >
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;