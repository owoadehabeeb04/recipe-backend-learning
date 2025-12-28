"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getAllRecipes } from "@/app/api/(recipe)/userRecipes";
import toast from "react-hot-toast";
import { Loader, Plus, ArrowRight, Star, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function FeaturedRecipes() {
  const [featuredRecipes, setFeaturedRecipes] = useState<any>([]);
  const [isLoadingRecipes, setIsLoadingRecipes] = useState(true);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setIsLoadingRecipes(true);
        const response = await getAllRecipes({
          limit: 10,
          sort: "rating",
        });

        if (response.success && Array.isArray(response.data)) {
          const sortedRecipes = [...response.data].sort(
            (a, b) => (b.averageRating || 0) - (a.averageRating || 0)
          );
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

  return (
    <section className="py-12 sm:py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 sm:mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4 sm:px-0">Top-Rated Recipes</h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-2xl mx-auto px-4 sm:px-0">
            Discover our most popular and highly-rated culinary creations
          </p>
        </div>

        {isLoadingRecipes ? (
          <div className="flex justify-center items-center py-12 sm:py-16">
            <Loader className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary" />
            <span className="ml-3 text-sm sm:text-base text-muted-foreground">Loading top recipes...</span>
          </div>
        ) : featuredRecipes.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            {featuredRecipes.map((recipe: any) => (
              <Link key={recipe._id} href={`/dashboard/recipe/${recipe._id}`}>
                <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 h-full">
                  <div className="relative aspect-video w-full overflow-hidden">
                    <Image
                      src={recipe.image || "https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg"}
                      alt={recipe.title}
                      fill
                      className="object-cover"
                    />
                    {recipe.averageRating > 0 && (
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md">
                        <Star className="h-3 w-3 fill-current" />
                        {recipe.averageRating.toFixed(1)}
                      </div>
                    )}
                  </div>
                  <CardHeader>
                    <CardTitle className="line-clamp-2">{recipe.title}</CardTitle>
                    {recipe.description && (
                      <CardDescription className="line-clamp-2">
                        {recipe.description}
                      </CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {recipe.cookingTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{recipe.cookingTime} min</span>
                        </div>
                      )}
                      {recipe.difficulty && (
                        <span className="capitalize">{recipe.difficulty}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12 bg-muted/30 rounded-xl border border-border mx-4 sm:mx-0">
            <p className="text-muted-foreground mb-4 text-base sm:text-lg px-4">No recipes available at this time.</p>
            <Link
              href="/dashboard/create-recipe"
              className="inline-flex items-center text-primary hover:opacity-80 transition-opacity font-medium text-sm sm:text-base"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create the first recipe
            </Link>
          </div>
        )}

        <div className="text-center px-4 sm:px-0">
          <Link
            href="/dashboard/all-recipes"
            className="group inline-flex items-center text-primary hover:opacity-80 transition-opacity font-medium text-base sm:text-lg"
          >
            View all recipes
            <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}

