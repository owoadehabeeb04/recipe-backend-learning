"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import { useAuthStore } from "@/app/store/authStore";
import { uploadToCloudinary } from "@/app/api/(recipe)/uploadImage";
import toast from "react-hot-toast";
import Image from "next/image";
import { editRecipe, getRecipeBySlug } from "@/app/api/(recipe)/adminRecipe";
import { getRecipeDetails } from "@/app/api/(recipe)/userRecipes";

interface RecipeFormData {
  title: string;
  description: string;
  category: string;
  cookingTime: number;
  difficulty: string;
  servings: number;
  steps: { value: string }[];
  tips: { value: string }[];
  ingredients: string; // Changed to string instead of array
  featuredImage: string;
}

const difficultyOptions = ["Easy", "Medium", "Hard"];

const categoryOptions = [
  "Breakfast",
  "Lunch",
  "Dinner",
  "Appetizer",
  "Dessert",
  "Snack",
  "Soup",
  "Salad",
  "Main Course",
  "Side Dish",
  "Drink",
  "Baking",
  "Vegetarian",
  "Vegan",
  "Gluten-Free",
  "Other"
];

const EditRecipe = () => {
  const { slug } = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [fetchingRecipe, setFetchingRecipe] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm<RecipeFormData>({
    defaultValues: {
      title: "",
      description: "",
      category: categoryOptions[0], // Set default category
      cookingTime: 30,
      difficulty: difficultyOptions[0], // Set default difficulty
      servings: 4,
      steps: [{ value: "" }],
      tips: [{ value: "" }],
      ingredients: "", // Single string for ingredients
      featuredImage: ""
    }
  });

  const {
    fields: stepFields,
    append: appendStep,
    remove: removeStep
  } = useFieldArray({
    control,
    name: "steps"
  });

  const {
    fields: tipFields,
    append: appendTip,
    remove: removeTip
  } = useFieldArray({
    control,
    name: "tips"
  });

  // Fetch recipe data when the component mounts
  useEffect(() => {
    const fetchRecipe = async () => {
      if (!slug || typeof slug !== 'string') {
        toast.error("Invalid recipe slug");
        router.push("/dashboard");
        return;
      }

      try {
        setFetchingRecipe(true);
        const response = await getRecipeDetails(slug);
        
        if (!response.success) {
          toast.error(response.message || "Failed to fetch recipe");
          router.push("/dashboard");
          return;
        }

        const recipe = response.data;
        setRecipeId(recipe._id);

        // Set form values with recipe data
        setValue("title", recipe.title);
        setValue("description", recipe.description);
        setValue("cookingTime", recipe.cookingTime);
        setValue("difficulty", recipe.difficulty || difficultyOptions[0]);
        setValue("category", recipe.category || categoryOptions[0]);
        setValue("featuredImage", recipe.featuredImage);
        setValue("servings", recipe.servings);
        
        // Handle ingredients - format as a comma-separated string
        if (Array.isArray(recipe.ingredients)) {
          // Check if ingredients are objects with name, quantity, unit
          if (recipe.ingredients.length > 0 && typeof recipe.ingredients[0] === 'object') {
            const ingredientStrings = recipe.ingredients.map(ing => {
              if (ing.quantity && ing.unit) {
                return `${ing.quantity} ${ing.unit} ${ing.name}`;
              }
              return ing.name;
            });
            setValue("ingredients", ingredientStrings.join(", "));
          } else {
            // Handle simple string array
            setValue("ingredients", recipe.ingredients.join(", "));
          }
        }
        
        // Set steps
        if (Array.isArray(recipe.steps)) {
          setValue(
            "steps",
            recipe.steps.map((step) => ({ value: step }))
          );
        }
        
        // Set tips if present
        if (Array.isArray(recipe.tips) && recipe.tips.length > 0) {
          setValue(
            "tips",
            recipe.tips.map((tip) => ({ value: tip }))
          );
        }
        
        // Set the preview image using featuredImage
        setPreviewImage(recipe.featuredImage);
      } catch (error) {
        console.error("Error fetching recipe:", error);
        toast.error("Failed to load recipe data");
      } finally {
        setFetchingRecipe(false);
      }
    };

    fetchRecipe();
  }, [slug, setValue, router]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview the image immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setUploadingImage(true);
      toast.loading("Uploading image...", { id: "imageUpload" });

      // Use the uploadToCloudinary function
      const cloudinaryUrl = await uploadToCloudinary(file);
      setValue("featuredImage", cloudinaryUrl); // Make sure this matches your form field name
      
      toast.success("Image uploaded successfully", { id: "imageUpload" });
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image", { id: "imageUpload" });
    } finally {
      setUploadingImage(false);
    }
  };

  const onSubmit = async (data: RecipeFormData) => {
    if (!token) {
      toast.error("You must be logged in to edit a recipe");
      return;
    }

    if (!recipeId) {
      toast.error("Recipe ID is missing");
      return;
    }

    setLoading(true);
    try {
      // Format ingredients as objects with name, quantity, unit
      const ingredients = data.ingredients.split(",").map(item => {
        const trimmedItem = item.trim();
        const parts = trimmedItem.split(" ");
        
        if (parts.length >= 3) {
          // Assume format: "2 g flour" (quantity unit name)
          return {
            quantity: parts[0],
            unit: parts[1],
            name: parts.slice(2).join(" ")
          };
        }
        
        return { name: trimmedItem };
      }).filter(item => item.name);

      // Transform the data into the format expected by the API
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category,
        cookingTime: data.cookingTime,
        difficulty: data.difficulty,
        servings: data.servings,
        steps: data.steps.map(step => step.value).filter(Boolean),
        tips: data.tips.map(tip => tip.value).filter(Boolean),
        ingredients: ingredients,
        featuredImage: data.featuredImage
      };

      const response = await editRecipe(recipeId, payload, token);

      if (response.success) {
        toast.success("Recipe updated successfully");
        router.push(`/recipe/${slug}`);
      } else {
        toast.error(response.message || "Failed to update recipe");
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  // Check if user is admin
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast.error("Only admins can edit recipes");
      router.push("/dashboard");
    }
  }, [user, router]);

  if (fetchingRecipe) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Edit Recipe
        </h1>
        <p className="text-gray-400 mt-2">
          Update your recipe information and details
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Basic Information</h2>
          
          <div className="space-y-6">
            {/* Recipe Title */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Recipe Title*
              </label>
              <input
                {...register("title", { required: "Title is required" })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white"
                placeholder="Enter recipe title"
              />
              {errors.title && (
                <p className="text-pink-500 text-sm mt-1">{errors.title.message}</p>
              )}
            </div>

            {/* Recipe Image */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Featured Image
              </label>
              <div className="flex items-start space-x-4">
                <div className="flex-1">
                  <label
                    className={`flex justify-center items-center w-full h-32 border-2 border-dashed rounded-xl ${
                      uploadingImage
                        ? "border-gray-600 bg-gray-800/30"
                        : "border-gray-600 hover:border-purple-500 cursor-pointer bg-gray-900/30 hover:bg-gray-800/30"
                    }`}
                  >
                    {uploadingImage ? (
                      <div className="text-center">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-purple-500 mb-2"></div>
                        <p className="text-sm text-gray-400">Uploading...</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="mx-auto h-8 w-8 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        <p className="mt-1 text-sm text-gray-400">
                          Click to upload a new image
                        </p>
                      </div>
                    )}
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {previewImage && (
                  <div className="w-32 h-32 relative rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={previewImage}
                      alt="Recipe preview"
                      layout="fill"
                      objectFit="cover"
                      className="rounded-xl"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Description*
              </label>
              <textarea
                {...register("description", {
                  required: "Description is required"
                })}
                rows={3}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white resize-none"
                placeholder="Describe your recipe"
              />
              {errors.description && (
                <p className="text-pink-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Ingredients */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Ingredients*
              </label>
              <textarea
                {...register("ingredients", {
                  required: "Ingredients are required"
                })}
                rows={4}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white resize-none"
                placeholder="Enter ingredients separated by commas (e.g., 2 cups flour, 1 cup sugar, 3 eggs)"
              />
              {errors.ingredients && (
                <p className="text-pink-500 text-sm mt-1">{errors.ingredients.message}</p>
              )}
              <p className="text-gray-400 text-xs mt-1">Separate ingredients with commas</p>
            </div>

            {/* Cooking Time, Difficulty, Servings in a row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Cooking Time (minutes)*
                </label>
                <input
                  {...register("cookingTime", {
                    required: "Cooking time is required",
                    min: { value: 1, message: "Must be at least 1 minute" }
                  })}
                  type="number"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white"
                />
                {errors.cookingTime && (
                  <p className="text-pink-500 text-sm mt-1">
                    {errors.cookingTime.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Difficulty*
                </label>
                <select
                  {...register("difficulty", {
                    required: "Difficulty is required"
                  })}
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white"
                >
                  {difficultyOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.difficulty && (
                  <p className="text-pink-500 text-sm mt-1">
                    {errors.difficulty.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Servings*
                </label>
                <input
                  {...register("servings", {
                    required: "Servings is required",
                    min: { value: 1, message: "Must be at least 1 serving" }
                  })}
                  type="number"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white"
                />
                {errors.servings && (
                  <p className="text-pink-500 text-sm mt-1">
                    {errors.servings.message}
                  </p>
                )}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">
                Category*
              </label>
              <select
                {...register("category", {
                  required: "Category is required"
                })}
                className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white"
              >
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-pink-500 text-sm mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Steps */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Steps</h2>
          <div className="space-y-4">
            {stepFields.map((field, index) => (
              <div key={field.id} className="flex items-start mb-3">
                <div className="bg-purple-500 rounded-full h-6 w-6 flex-shrink-0 flex items-center justify-center mt-3">
                  <span className="text-white text-sm font-medium">
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    {...register(`steps.${index}.value` as const, {
                      required: index === 0 ? "Add at least one step" : false
                    })}
                    rows={2}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white resize-none"
                    placeholder={`Step ${index + 1}`}
                  />
                  {index === 0 && errors.steps?.[0]?.value && (
                    <p className="text-pink-500 text-sm mt-1">
                      {errors.steps[0].value?.message}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeStep(index)}
                  disabled={stepFields.length === 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50 mt-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendStep({ value: "" })}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white text-sm flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Step
            </button>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Tips (optional)
          </h2>
          <div className="space-y-3">
            {tipFields.map((field, index) => (
              <div key={field.id} className="flex items-start mb-3">
                <div className="flex-1">
                  <input
                    {...register(`tips.${index}.value` as const)}
                    className="w-full bg-gray-900/50 border border-gray-700 rounded-xl px-4 py-3 text-white"
                    placeholder={`Tip ${index + 1}`}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeTip(index)}
                  disabled={tipFields.length === 1}
                  className="p-2 text-gray-400 hover:text-white disabled:opacity-50"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendTip({ value: "" })}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-xl text-white text-sm flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              Add Tip
            </button>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-600 rounded-full text-gray-300 hover:bg-gray-700 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || uploadingImage}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-70 flex items-center"
          >
            {(loading || uploadingImage) && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
            )}
            {loading ? "Updating..." : "Update Recipe"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditRecipe;