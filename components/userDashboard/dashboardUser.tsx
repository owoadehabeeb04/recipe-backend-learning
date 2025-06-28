import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import WelcomeMessage from './welcomeMessage';
import RecipeCard from './recipeCardUser';
import ProgressStats from './progressStats';
import MealPlanPreview from './mealPlan';

// Components


// Types
type Recipe = {
  id: string;
  title: string;
  image: string;
  prepTime: number;
  difficulty: string;
  cuisine: string;
};

const DashboardUser: React.FC = () => {
  const userName = 'Chef';
  
  // Sample data - replace with API calls
  const [recommendedRecipes, setRecommendedRecipes] = useState<Recipe[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Recipe[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<Recipe[]>([]);
  const [trendingRecipes, setTrendingRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API calls
    const fetchDashboardData = async () => {
      try {
        // These would be real API calls in production
        setRecommendedRecipes([
          { id: '1', title: 'Creamy Garlic Pasta', image: '/images/pasta.jpg', prepTime: 25, difficulty: 'Easy', cuisine: 'Italian' },
          { id: '2', title: 'Spicy Thai Curry', image: '/images/curry.jpg', prepTime: 40, difficulty: 'Medium', cuisine: 'Thai' },
          { id: '3', title: 'Classic Beef Burger', image: '/images/burger.jpg', prepTime: 30, difficulty: 'Easy', cuisine: 'American' },
          { id: '4', title: 'Mediterranean Salad', image: '/images/salad.jpg', prepTime: 15, difficulty: 'Easy', cuisine: 'Mediterranean' },
        ]);
        
        setRecentlyViewed([
          { id: '5', title: 'Chicken Tikka Masala', image: '/images/tikka.jpg', prepTime: 45, difficulty: 'Medium', cuisine: 'Indian' },
          { id: '6', title: 'Vegetable Stir Fry', image: '/images/stirfry.jpg', prepTime: 20, difficulty: 'Easy', cuisine: 'Asian' },
        ]);

        setSavedRecipes([
          { id: '7', title: 'Homemade Pizza', image: '/images/pizza.jpg', prepTime: 60, difficulty: 'Medium', cuisine: 'Italian' },
          { id: '8', title: 'Chocolate Brownies', image: '/images/brownies.jpg', prepTime: 35, difficulty: 'Easy', cuisine: 'Dessert' },
          { id: '9', title: 'Avocado Toast', image: '/images/avocado.jpg', prepTime: 10, difficulty: 'Easy', cuisine: 'Breakfast' },
          { id: '10', title: 'Beef Tacos', image: '/images/tacos.jpg', prepTime: 25, difficulty: 'Easy', cuisine: 'Mexican' },
        ]);
        
        setTrendingRecipes([
          { id: '11', title: 'Summer Berry Smoothie', image: '/images/smoothie.jpg', prepTime: 5, difficulty: 'Easy', cuisine: 'Breakfast' },
          { id: '12', title: 'Grilled Salmon', image: '/images/salmon.jpg', prepTime: 20, difficulty: 'Medium', cuisine: 'Seafood' },
          { id: '13', title: 'Roasted Vegetables', image: '/images/vegetables.jpg', prepTime: 35, difficulty: 'Easy', cuisine: 'Sides' },
        ]);
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Stats data
  const userStats = {
    cookedThisWeek: 5,
    topCuisine: 'Indian',
    savedThisMonth: 3,
  };

  // Quick access tools data
  const quickAccessTools = [
    { icon: '🛒', title: 'Grocery List', link: '/grocery-list' },
    { icon: '🧾', title: 'Upload Recipe', link: '/upload-recipe' },
    { icon: '🍽️', title: 'Leftovers Helper', link: '/leftovers' },
    { icon: '🔍', title: 'Ingredient Search', link: '/search' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Welcome Section */}
      <WelcomeMessage name={userName} />
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mt-8">
        {/* Left Column - 8/12 on desktop */}
        <div className="md:col-span-8 space-y-8">
          {/* Personalized Recipe Feed */}
          <section 
            //{ opacity: 0, y: 20 }}
            // opacity: 1, y: 0 }}
            // duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Your Recommended Recipes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {recommendedRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>

          {/* Continue Where You Left Off */}
          <section 
            //{ opacity: 0, y: 20 }}
            // opacity: 1, y: 0 }}
            // duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Recently Viewed Recipes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {recentlyViewed.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>

          {/* Saved Recipes */}
          <section 
            //{ opacity: 0, y: 20 }}
            // opacity: 1, y: 0 }}
            // duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Your Favorites</h2>
              <Link href="/saved-recipes">
                <span className="text-primary hover:text-primary-dark transition-colors text-sm font-medium">View All →</span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4">
              {savedRecipes.slice(0, 4).map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          </section>
        </div>

        {/* Right Column - 4/12 on desktop */}
        <div className="md:col-span-4 space-y-6">
          {/* Meal Plan Preview */}
          <section 
            //{ opacity: 0, x: 20 }}
            // opacity: 1, x: 0 }}
            // duration: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">This Week's Meal Plan</h2>
              <Link href="/meal-plan">
                <span className="text-primary hover:text-primary-dark transition-colors text-sm font-medium">View Full Plan →</span>
              </Link>
            </div>
            <MealPlanPreview />
          </section>

          {/* Quick Access Tools */}
          <section 
            //{ opacity: 0, x: 20 }}
            // opacity: 1, x: 0 }}
            // duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Access Tools</h2>
            <div className="grid grid-cols-2 gap-3">
              {quickAccessTools.map((tool, index) => (
                <Link key={index} href={tool.link}>
                  <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <span className="text-2xl mb-2">{tool.icon}</span>
                    <span className="text-sm font-medium text-center">{tool.title}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Progress & Stats */}
          <section 
            //{ opacity: 0, x: 20 }}
            // opacity: 1, x: 0 }}
            // duration: 0.5, delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Your Cooking Stats</h2>
            <ProgressStats stats={userStats} />
          </section>

          {/* Recipe of the Day */}
          <section 
            //{ opacity: 0, x: 20 }}
            // opacity: 1, x: 0 }}
            // duration: 0.5, delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4">Today's Pick</h2>
            <div className="relative w-full h-48 rounded-lg overflow-hidden mb-3">
              <Image 
                src="/images/today-pick.jpg" 
                alt="Recipe of the day" 
                layout="fill" 
                objectFit="cover"
              />
            </div>
            <h3 className="font-bold text-lg">Honey Glazed Salmon Bowl</h3>
            <p className="text-sm text-gray-600 mt-1">A perfect balance of protein and veggies with a sweet glaze.</p>
            <Link href="/recipes/honey-glazed-salmon">
              <button className="mt-3 w-full py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors">
                View Recipe
              </button>
            </Link>
          </section>
        </div>
      </div>

      {/* Trending Recipes - Full Width */}
      <section 
        //{ opacity: 0, y: 20 }}
        // opacity: 1, y: 0 }}
        // duration: 0.5, delay: 0.5 }}
        className="mt-8 bg-white rounded-xl shadow-sm p-6"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Trending This Week</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
          {trendingRecipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default DashboardUser;