"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import { useAuthStore } from "@/app/store/authStore";
import { uploadToCloudinary } from "@/app/api/(recipe)/uploadImage";
import toast from "react-hot-toast";
import Image from "next/image";
import {
  editRecipe,
  editUserRecipe,
  getRecipeBySlug
} from "@/app/api/(recipe)/adminRecipe";
import { getRecipeDetails } from "@/app/api/(recipe)/userRecipes";
import { categoryOptions } from "@/utils";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { calculateNutrition } from "@/utils";
import { NutritionData } from "@/types/recipe";

interface Ingredient {
  name: string;
  quantity: string;
  unit: string;
}

interface RecipeFormData {
  title: string;
  description: string;
  category: string;
  ingredients: string[];
  cookingTime: number;
  difficulty: string;
  servings: number;
  steps: { value: string }[];
  tips: { value: string }[];
  featuredImage: string;
}

const difficultyOptions = ["Easy", "Medium", "Hard"];

const EditRecipe = () => {
  const { slug } = useParams();
  const router = useRouter();
  const { token, user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [recipeId, setRecipeId] = useState<string | null>(null);
  const [fetchingRecipe, setFetchingRecipe] = useState(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { name: "", quantity: "", unit: "" }
  ]);
  const [nutrition, setNutrition] = useState<NutritionData | null>(null);
  const [isCalculatingNutrition, setIsCalculatingNutrition] = useState(false);
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [recipe, setRecipe] = useState<any>(null);
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
      category: categoryOptions[0],
      cookingTime: 30,
      difficulty: difficultyOptions[0],
      servings: 4,
      steps: [{ value: "" }],
      tips: [{ value: "" }],
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

  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };
  const removeIngredient = (index: number) => {
    if (ingredients.length === 1) return;
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const updateIngredient = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = value;
    setIngredients(updatedIngredients);
  };

  const handleCalculateNutrition = async () => {
    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() !== ""
    );
    if (validIngredients.length === 0) {
      toast.error(
        "Please add at least one ingredient before calculating nutrition"
      );
      return;
    }

    setIsCalculatingNutrition(true);
    const loadingToastId = toast.loading(
      "Calculating nutritional information..."
    );

    try {
      const genAI = new GoogleGenerativeAI(
        process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
      );
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const ingredientsList = validIngredients
        .map((ing) => `${ing.quantity} ${ing.unit} ${ing.name}`)
        .join("\n");
      console.log({ ingredientsList });
      console.log("Ingredients list for AI:", ingredientsList);

      const prompt = `
      I need detailed nutritional information for a recipe with the following ingredients:
      
      ${ingredientsList}
      
      Please analyze each ingredient carefully, accounting for:
      - Precise measurements and units (grams, cups, tablespoons, etc.)
      - Different states of ingredients (raw, cooked, diced, whole)
      - Specific varieties or brands when specified
      
      Calculate the TOTAL nutrition facts for the entire recipe and format your response EXACTLY as follows with ONLY numeric values:
      
      CALORIES: [number]
      PROTEIN: [number]
      CARBS: [number]
      FAT: [number]
      SUGAR: [number]
      FIBER: [number]
      
      Do not include units in the actual values, additional explanations, serving size calculations, or any other text. If any ingredient lacks sufficient information for accurate calculation, make a reasonable estimate based on similar ingredients and note this in a separate section AFTER providing the formatted nutrition data.
      `;

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      console.log("AI nutrition response:", response);

      const caloriesMatch = response.match(
        /CALORIES:?\s*(\d+)|calories:?\s*(\d+)|calories\D*(\d+)|(\d+)\s*calories/i
      );
      const proteinMatch = response.match(
        /PROTEIN:?\s*(\d+)|protein:?\s*(\d+)|protein\D*(\d+)|(\d+)\s*g\s*protein/i
      );
      const carbsMatch = response.match(
        /CARBS:?\s*(\d+)|carbs:?\s*(\d+)|carbohydrates:?\s*(\d+)|carbs\D*(\d+)|(\d+)\s*g\s*carbs/i
      );
      const fatMatch = response.match(
        /FAT:?\s*(\d+)|fat:?\s*(\d+)|fat\D*(\d+)|(\d+)\s*g\s*fat/i
      );
      const sugarMatch = response.match(
        /SUGAR:?\s*(\d+)|sugar:?\s*(\d+)|sugar\D*(\d+)|(\d+)\s*g\s*sugar/i
      );
      const fiberMatch = response.match(
        /FIBER:?\s*(\d+)|fiber:?\s*(\d+)|fiber\D*(\d+)|(\d+)\s*g\s*fiber/i
      );

      const extractFirstMatch = (match: RegExpMatchArray | null): number => {
        if (!match) return 0;
        for (let i = 1; i < match.length; i++) {
          if (match[i]) return parseInt(match[i]);
        }
        return 0;
      };

      const nutritionData = {
        calories: extractFirstMatch(caloriesMatch),
        protein: extractFirstMatch(proteinMatch),
        carbs: extractFirstMatch(carbsMatch),
        fat: extractFirstMatch(fatMatch),
        sugar: extractFirstMatch(sugarMatch),
        fiber: extractFirstMatch(fiberMatch)
      };

      console.log({ nutritionData });
      setNutrition(nutritionData);

      toast.success("Nutritional information calculated!", {
        id: loadingToastId
      });
    } catch (error) {
      console.error("Error calculating nutrition:", error);
      toast.error("Failed to calculate nutritional information", {
        id: loadingToastId
      });
    } finally {
      setIsCalculatingNutrition(false);
    }
  };

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!slug || typeof slug !== "string") {
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
        if (response.success) {
          // Set all other recipe fields...
          setIsPrivate(response.data.isPrivate || false);
        }

        const recipe = response.data;
        setRecipe(recipe);
        setRecipeId(recipe._id);
        console.log(recipe.difficulty);
        setValue("title", recipe.title);
        setValue("description", recipe.description);
        setValue("cookingTime", recipe.cookingTime);

        if (recipe.difficulty) {
          const normalizedDifficulty =
            recipe.difficulty.charAt(0).toUpperCase() +
            recipe.difficulty.slice(1).toLowerCase();
          setValue("difficulty", normalizedDifficulty);
        }
        if (recipe.category) {
          const normalizedCategory =
            recipe.category.charAt(0).toUpperCase() +
            recipe.category.slice(1).toLowerCase();
          setValue("category", normalizedCategory);
        }
        setValue("featuredImage", recipe.featuredImage);
        setValue("servings", recipe.servings);

        if (Array.isArray(recipe.ingredients)) {
          if (recipe.ingredients.length > 0) {
            if (typeof recipe.ingredients[0] === "object") {
              setIngredients(
                recipe.ingredients.map(
                  (ing: { name: any; quantity: any; unit: any }) => ({
                    name: ing.name || "",
                    quantity: ing.quantity || "",
                    unit: ing.unit || ""
                  })
                )
              );
            } else {
              setIngredients(
                recipe.ingredients.map((ing: { toString: () => any }) => ({
                  name: ing.toString(),
                  quantity: "",
                  unit: ""
                }))
              );
            }
          }
        }

        if (Array.isArray(recipe.steps)) {
          setValue(
            "steps",
            recipe.steps.map((step: any) => ({ value: step }))
          );
        }

        if (Array.isArray(recipe.tips) && recipe.tips.length > 0) {
          setValue(
            "tips",
            recipe.tips.map((tip: any) => ({ value: tip }))
          );
        } else {
          setValue("tips", [{ value: "" }]);
        }

        setPreviewImage(recipe.featuredImage);

        if (recipe.nutrition) {
          setNutrition(recipe.nutrition);
        }
      } catch (error) {
        console.error("Error fetching recipe:", error);
        toast.error("Failed to load recipe data");
      } finally {
        setFetchingRecipe(false);
      }
    };

    fetchRecipe();
  }, [slug, setValue, router]);
  useEffect(() => {
    console.log({ nutrition });
  }, []);
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);

    try {
      setUploadingImage(true);
      toast.loading("Uploading image...", { id: "imageUpload" });

      const cloudinaryUrl = await uploadToCloudinary(file);
      setValue("featuredImage", cloudinaryUrl);

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

    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() !== ""
    );
    if (validIngredients.length === 0) {
      toast.error("Please add at least one ingredient");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: data.title,
        description: data.description,
        category: data.category.toLocaleLowerCase(),
        cookingTime: data.cookingTime,
        difficulty: data.difficulty.toLocaleLowerCase(),
        servings: data.servings,
        steps: data.steps.map((step) => step.value).filter(Boolean),
        tips: data.tips.map((tip) => tip.value).filter(Boolean),
        ingredients: validIngredients.map((ing) => ({
          name: ing.name.trim(),
          quantity: ing.quantity.trim(),
          unit: ing.unit.trim()
        })),
        featuredImage: data.featuredImage,
        nutrition: nutrition,
        isPrivate: isPrivate,
      };

      console.log("Submitting recipe with ID:", recipeId);
      console.log("Payload:", payload);
      if (user?.role === "admin") {
        const response = await editRecipe(recipeId, payload, token);

        if (response.success) {
          toast.success("Recipe updated successfully");
          router.push(`/dashboard/recipe/${slug}`);
        } else {
          toast.error(response.message || "Failed to update recipe");
        }
      } else {
        const response = await editUserRecipe(recipeId, payload, token);

        if (response.success) {
          toast.success("Recipe updated successfully");
          router.push(`/dashboard/recipe/${slug}`);
        } else {
          toast.error(response.message || "Failed to update recipe");
        }
      }
    } catch (error) {
      console.error("Error updating recipe:", error);
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(()=> {
if (user?.role === "super_admin") {
      toast.error("Only admins/users can edit recipes");
      router.push("/dashboard");
    }
  }, [user, router])

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
          <h2 className="text-xl font-semibold text-white mb-6">
            Basic Information
          </h2>

          <div className="space-y-6">
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
                <p className="text-pink-500 text-sm mt-1">
                  {errors.title.message}
                </p>
              )}
            </div>

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
                <p className="text-pink-500 text-sm mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

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

        <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Ingredients</h2>

          {ingredients.map((ingredient, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <div className="flex items-center space-x-4 mb-2">
                <div className="h-px bg-gray-700 flex-grow"></div>
                <span className="text-gray-400 text-sm">
                  Ingredient {index + 1}
                </span>
                <div className="h-px bg-gray-700 flex-grow"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-gray-300 text-sm">Name*</label>
                  <input
                    type="text"
                    value={ingredient.name}
                    onChange={(e) =>
                      updateIngredient(index, "name", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Ingredient name"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-300 text-sm">Quantity</label>
                  <input
                    type="text"
                    value={ingredient.quantity}
                    onChange={(e) =>
                      updateIngredient(index, "quantity", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="Amount"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-gray-300 text-sm">Unit</label>
                  <input
                    type="text"
                    value={ingredient.unit}
                    onChange={(e) =>
                      updateIngredient(index, "unit", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    placeholder="g, ml, tbsp"
                  />
                </div>

                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    disabled={ingredients.length === 1}
                    className="px-3 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-6">
            <button
              type="button"
              onClick={addIngredient}
              className="px-4 py-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 rounded-lg flex items-center hover:from-blue-500/30 hover:to-cyan-500/30 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              Add Ingredient
            </button>
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">
              Nutritional Information
            </h2>
            <button
              type="button"
              onClick={handleCalculateNutrition}
              disabled={isCalculatingNutrition}
              className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:opacity-90 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCalculatingNutrition ? (
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
                  Calculating...
                </>
              ) : (
                <>Recalculate Nutrition</>
              )}
            </button>
          </div>

          {nutrition ? (
            <div className="space-y-4">
              {/* Calories */}
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-medium text-white">
                    {nutrition.calories} calories
                  </span>
                  <span className="text-sm text-gray-400">per serving</span>
                </div>
              </div>

              {/* Protein */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-purple-400">Protein</span>
                  <span className="text-gray-300">
                    {nutrition.protein}g (
                    {Math.round(
                      ((nutrition.protein * 4) /
                        Math.max(
                          1,
                          nutrition.protein * 4 +
                            nutrition.carbs * 4 +
                            nutrition.fat * 9
                        )) *
                        100
                    )}
                    %)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-purple-600 h-2.5 rounded-full"
                    style={{
                      width: `${Math.round(
                        ((nutrition.protein * 4) /
                          Math.max(
                            1,
                            nutrition.protein * 4 +
                              nutrition.carbs * 4 +
                              nutrition.fat * 9
                          )) *
                          100
                      )}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Carbs */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-blue-400">Carbs</span>
                  <span className="text-gray-300">
                    {nutrition.carbs}g (
                    {Math.round(
                      ((nutrition.carbs * 4) /
                        Math.max(
                          1,
                          nutrition.protein * 4 +
                            nutrition.carbs * 4 +
                            nutrition.fat * 9
                        )) *
                        100
                    )}
                    %)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-blue-500 h-2.5 rounded-full"
                    style={{
                      width: `${Math.round(
                        ((nutrition.carbs * 4) /
                          Math.max(
                            1,
                            nutrition.protein * 4 +
                              nutrition.carbs * 4 +
                              nutrition.fat * 9
                          )) *
                          100
                      )}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Fat */}
              <div>
                <div className="flex justify-between mb-1">
                  <span className="font-medium text-amber-400">Fat</span>
                  <span className="text-gray-300">
                    {nutrition.fat}g (
                    {Math.round(
                      ((nutrition.fat * 9) /
                        Math.max(
                          1,
                          nutrition.protein * 4 +
                            nutrition.carbs * 4 +
                            nutrition.fat * 9
                        )) *
                        100
                    )}
                    %)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div
                    className="bg-amber-500 h-2.5 rounded-full"
                    style={{
                      width: `${Math.round(
                        ((nutrition.fat * 9) /
                          Math.max(
                            1,
                            nutrition.protein * 4 +
                              nutrition.carbs * 4 +
                              nutrition.fat * 9
                          )) *
                          100
                      )}%`
                    }}
                  ></div>
                </div>
              </div>

              {/* Additional nutrition info in a grid */}
              <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
                {nutrition.sugar !== undefined && (
                  <div>
                    <span className="text-sm text-gray-400">Sugar</span>
                    <p className="font-medium text-white">{nutrition.sugar}g</p>
                  </div>
                )}

                {nutrition.fiber !== undefined && (
                  <div>
                    <span className="text-sm text-gray-400">Fiber</span>
                    <p className="font-medium text-white">{nutrition.fiber}g</p>
                  </div>
                )}
              </div>

              <div className="mt-4 text-xs text-gray-500">
                <p>* Nutritional values are estimated based on ingredients</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
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
                    strokeWidth="2"
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  ></path>
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                No Nutrition Data
              </h3>
              <p className="text-gray-400 mb-4 max-w-md mx-auto">
                Click the "Recalculate Nutrition" button to generate nutritional
                information based on the current ingredients.
              </p>
            </div>
          )}
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Steps</h2>
          <div className="space-y-4">
            {stepFields.map((field, index) => (
              <div key={field.id} className="flex items-start space-x-2">
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

{/* Privacy Settings - only show for user recipes */}
{user && user.role === "user" && (
  <div className="mt-6 pt-4 border-t border-gray-700">
    <h3 className="text-lg font-medium text-white mb-3">Recipe Privacy</h3>
    
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex-1">
        <p className="text-gray-300 mb-1">                Do you wish to make this recipe {isPrivate ? 'Public' : 'Private'}? it is currently {isPrivate ? 'visible to only you' : 'visible to everybody '}
        </p>
        <p className="text-xs text-gray-500">Private recipes are only visible to you</p>
      </div>
      
      <div className="flex space-x-2">
        <button
          type="button"
          onClick={() => setIsPrivate(true)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            isPrivate
              ? "bg-purple-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Private
        </button>
        <button
          type="button"
          onClick={() => setIsPrivate(false)}
          className={`px-4 py-2 rounded-md text-sm font-medium transition ${
            !isPrivate
              ? "bg-purple-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Public
        </button>
      </div>
    </div>
    
    {/* Visual indicator of current status */}
    <div 
         className={`mt-3 p-3 rounded-lg border flex items-center gap-3 text-sm ${
           isPrivate 
             ? "bg-purple-900/20 border-purple-800/30 text-purple-300" 
             : "bg-green-900/20 border-green-800/30 text-green-300"
         }`}
    >
      {isPrivate ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span>This recipe will only be visible to you</span>
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>This recipe will be visible to everyone</span>
        </>
      )}
    </div>
  </div>
)}
          </div>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-white mb-6">
            Tips (optional)
          </h2>
          <div className="space-y-3">
            {tipFields.map((field, index) => (
              <div key={field.id} className="flex items-center space-x-2">
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

        {/* {(user &&user.role === "user" && (recipe.user === user._id || recipe.roleCreated === "user")  &&     <>
            <div className="flex items-center  gap-2 pt-3 border-t border-gray-700">
              <label className="text-gray-300">
                Do you wish to make this recipe {isPrivate ? 'Public' : 'Private'}? it is currently {isPrivate ? 'visible to only you' : 'visible to everybody '}
              </label>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setIsPrivate(true)}
                  className={`px-4 py-1.5 rounded-md cursor-pointer text-sm font-medium transition ${
                    isPrivate
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  Yes
                </button>
                <button
                  type="button"
                  onClick={() => setIsPrivate(false)}
                  className={`px-4 py-1.5 rounded-md cursor-pointer text-sm font-medium transition ${
                    !isPrivate
                      ? "bg-purple-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                  }`}
                >
                  No
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {isPrivate ? "Only visible to you" : "Visible to everyone"}
            </div>
          </>
        )} */}

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
