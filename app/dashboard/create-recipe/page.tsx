"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { createRecipe } from "@/app/api/(recipe)/adminRecipe";
import { uploadToCloudinary } from "@/app/api/(recipe)/uploadImage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";
import { categoryOptions } from "@/utils";
const CreateRecipePage = () => {
  const { user, token } = useAuthStore();
  console.log(user, token)
  const router = useRouter();
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "" }
  ]);
  const [steps, setSteps] = useState<{ description: string }[]>([{ description: "" }]);
  const [tips, setTips] = useState([{ description: "" }]); 
  const [previewImage, setPreviewImage] = useState<string | undefined | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [titleForGeneration, setTitleForGeneration] = useState("");
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: "",
      description: "",
      cookingTime: "",
      servings: "",
      difficulty: "medium",
      category: "",
      featuredImage: ""
    }
  });
  const watchedTitle = watch("title");
  useEffect(() => {
    if (watchedTitle && watchedTitle.length > 3) {
      setTitleForGeneration(watchedTitle);
      setShowGenerateButton(true);
    } else {
      setShowGenerateButton(false);
    }
  }, [watchedTitle]);

// GENEARTE COMPLECTED RECIPE
// Add this function to handle problematic AI-generated JSON
const generateCompleteRecipe = async () => {
  if (!titleForGeneration || titleForGeneration.length < 3) {
    toast.error("Please enter a recipe title first");
    return;
  }

  setIsGenerating(true);
  const loadingToastId = toast.loading("Generating recipe content...");
  
  try {
    // Initialize Gemini AI
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    // Create a structured prompt for the AI
    // The key difference: we'll ask for field-by-field responses instead of JSON
    const prompt = `Create a detailed recipe for "${titleForGeneration}".
    
    I need the following information (answer with ONLY the requested information for each field, no explanations):
    
    1. DESCRIPTION: Write a detailed description of the dish (4-6 sentences).
    2. COOKING_TIME: How many minutes to prepare and cook (just the number)?
    3. SERVINGS: How many people does this serve (number between 1-8)?
    4. DIFFICULTY: Is this Easy, Medium, or Hard to make?
    5. CATEGORY: Which one best fits: ${categoryOptions.join(", ")}?
    6. INGREDIENTS: List 5-10 ingredients with quantities and units (one per line, format: quantity unit name).
    7. STEPS: List 4-8 detailed preparation steps (one per line, numbered).
    8. TIPS: Provide 3-5 useful cooking tips (one per line).
    
    Be practical, accurate, and detailed in your responses.`;
  
    // Generate content
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    console.log("AI response:", response);
    
    // Parse the response using a line-by-line approach instead of JSON parsing
    const sections: any = {
      description: "",
      cookingTime: "",
      servings: "",
      difficulty: "",
      category: "",
      ingredients: [],
      steps: [],
      tips: []
    };
    
    // Extract each section using regex patterns
    const descriptionMatch = response.match(/DESCRIPTION:?\s*(.*?)(?=\d+\.\s*COOKING_TIME|$)/s);
    if (descriptionMatch && descriptionMatch[1]) {
      sections.description = descriptionMatch[1].trim();
    }
    
    const cookingTimeMatch = response.match(/COOKING_TIME:?\s*(\d+)/);
    if (cookingTimeMatch && cookingTimeMatch[1]) {
      sections.cookingTime = cookingTimeMatch[1].trim();
    }
    
    const servingsMatch = response.match(/SERVINGS:?\s*(\d+)/);
    if (servingsMatch && servingsMatch[1]) {
      sections.servings = servingsMatch[1].trim();
    }
    
    const difficultyMatch = response.match(/DIFFICULTY:?\s*(Easy|Medium|Hard)/i);
    if (difficultyMatch && difficultyMatch[1]) {
      sections.difficulty = difficultyMatch[1].toLowerCase();
    }
    
    const categoryMatch = response.match(/CATEGORY:?\s*([^0-9\n]+)(?=\d|$)/);
    if (categoryMatch && categoryMatch[1]) {
      const category = categoryMatch[1].trim();
      // Find the closest match in categoryOptions
      const matchedCategory = categoryOptions.find(c => 
        c.toLowerCase() === category.toLowerCase()
      ) || categoryOptions[0];
      sections.category = matchedCategory;
    }
    
    // Extract ingredients section
    const ingredientsSection = response.match(/INGREDIENTS:?\s*([\s\S]*?)(?=\d+\.\s*STEPS|$)/);
    if (ingredientsSection && ingredientsSection[1]) {
      const ingredientLines = ingredientsSection[1].trim().split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('INGREDIENTS'));
      
      sections.ingredients = ingredientLines.map(line => {
        // Try to extract quantity, unit, and name
        const parts = line.split(' ');
        if (parts.length >= 3) {
          // Assume first part is quantity, second is unit, rest is name
          return {
            quantity: parts[0],
            unit: parts[1],
            name: parts.slice(2).join(' ').replace(/^\W+|\W+$/g, '') // Remove non-word chars from start/end
          };
        } else if (parts.length === 2) {
          // Assume first part is quantity, no unit, second is name
          return {
            quantity: parts[0],
            unit: '',
            name: parts[1].replace(/^\W+|\W+$/g, '')
          };
        } else {
          // Just a name
          return {
            quantity: '',
            unit: '',
            name: line.replace(/^\W+|\W+$/g, '')
          };
        }
      }).filter(ing => ing.name.trim());
    }
    
    // Extract steps section
    const stepsSection = response.match(/STEPS:?\s*([\s\S]*?)(?=\d+\.\s*TIPS|$)/);
    if (stepsSection && stepsSection[1]) {
      const stepLines = stepsSection[1].trim().split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('STEPS'));
      
      sections.steps = stepLines.map(line => {
        // Remove numbers and periods from the beginning
        return { description: line.replace(/^\d+\.?\s*/, '').trim() };
      }).filter(step => step.description);
    }
    
    // Extract tips section
    const tipsSection = response.match(/TIPS:?\s*([\s\S]*?)(?=\d+\.|$)/s);
    if (tipsSection && tipsSection[1]) {
      const tipLines = tipsSection[1].trim().split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('TIPS'));
      
      sections.tips = tipLines.map(line => {
        // Remove bullets, numbers, etc. from the beginning
        return { description: line.replace(/^[-•*\d]+\.?\s*/, '').trim() };
      }).filter(tip => tip.description);
    }
    
    // Fill the form with generated data
    setValue("title", titleForGeneration);
    
    if (sections.description) {
      setValue("description", sections.description);
    }
    
    if (sections.cookingTime) {
      setValue("cookingTime", sections.cookingTime);
    }
    
    if (sections.servings) {
      setValue("servings", sections.servings);
    }
    
    if (sections.difficulty) {
      setValue("difficulty", sections.difficulty);
    }
    
    if (sections.category) {
      setValue("category", sections.category);
    }
    
    // Set ingredients
    if (sections.ingredients.length > 0) {
      setIngredients(sections.ingredients);
    }
    
    // Set steps
    if (sections.steps.length > 0) {
      setSteps(sections.steps);
    }
    
    // Set tips
    if (sections.tips.length > 0) {
      setTips(sections.tips);
    }
    
    toast.success("Recipe generated successfully! Feel free to edit any details.", {
      id: loadingToastId,
      duration: 4000
    });
  } catch (error) {
    console.error("Error generating recipe:", error);
    toast.error("Failed to generate recipe. Please try again or enter details manually.", {
      id: loadingToastId
    });
  } finally {
    setIsGenerating(false);
  }
};
const fixBrokenJson = (brokenJson: any) => {
  // Very basic JSON repair - only for emergency cases
  // This is not a comprehensive solution
  try {
    // Try to construct a valid object structure
    let fixed = brokenJson;
    
    // Ensure the string starts with { and ends with }
    if (!fixed.startsWith('{')) fixed = '{' + fixed;
    if (!fixed.endsWith('}')) fixed = fixed + '}';
    
    // Replace multiple commas with a single comma
    fixed = fixed.replace(/,\s*,/g, ',');
    
    // Remove trailing commas before closing brackets
    fixed = fixed.replace(/,\s*}/g, '}');
    fixed = fixed.replace(/,\s*]/g, ']');
    
    return fixed;
  } catch (e) {
    console.error("JSON repair failed:", e);
    return brokenJson; // Return original if repair fails
  }
};


// Replace the useMutation hook with a regular async function
const [isSubmitting, setIsSubmitting] = useState(false);

// Regular function to handle recipe creation
const handleCreateRecipe = async (recipeData: any) => {
  try {
    setIsSubmitting(true);
    
    if (!token) {
      toast.error("You must be logged in to create recipes");
      return;
    }
    
    console.log({recipeData});
    
    const response = await createRecipe(recipeData, token, user?.role);
    
    if (response.success) {
      toast.success("Recipe created successfully!");

      // Reset form after successful submission
      reset();
      setIngredients([{ name: "", quantity: "", unit: "" }]);
      setSteps([{ description: "" }]);
      setTips([{ description: "" }]);
      setPreviewImage(null);

      // Redirect to admin recipes list after a short delay
      setTimeout(() => {
        router.push("/dashboard/my-recipes");
      }, 1500);
    } else {
      // API returned a success:false response
      toast.error(response.message || "Failed to create recipe");
    }
  } catch (error: any) {
    console.error("Error creating recipe:", error);

    if (error.message === "Authentication required") {
      toast.error("You must be logged in to create recipes");
    } else {
      toast.error(error.response?.data?.message || "Failed to create recipe");
    }
  } finally {
    setIsSubmitting(false);
  }
};
  const addIngredient = () => {
    setIngredients([...ingredients, { name: "", quantity: "", unit: "" }]);
  };

  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      const newIngredients = [...ingredients];
      newIngredients.splice(index, 1);
      setIngredients(newIngredients);
    }
  };

  const updateIngredient = (index: number, field: string, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = {
      ...newIngredients[index],
      [field]: value
    };
    setIngredients(newIngredients);
  };

  const addStep = () => {
    setSteps([...steps, { description: "" }]);
  };

  const removeStep = (index: number) => {
    if (steps.length > 1) {
      const newSteps = [...steps];
      newSteps.splice(index, 1);
      setSteps(newSteps);
    }
  };

  const updateStep = (index: number, value: string) => {
    const newSteps = [...steps];
    newSteps[index].description = value;
    setSteps(newSteps);
  };

  // Tips functions
  const addTip = () => {
    setTips([...tips, { description: "" }]);
  };

  const removeTip = (index: number) => {
    if (tips.length > 1) {
      const newTips = [...tips];
      newTips.splice(index, 1);
      setTips(newTips);
    }
  };

  const updateTip = (index: number, value: string) => {
    const newTips = [...tips];
    newTips[index].description = value;
    setTips(newTips);
  };

  const [isUploading, setIsUploading] = useState(false);
  const [featuredImage, setFeaturedImage] = useState("")
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        try {
          setIsUploading(true);
          setPreviewImage(URL.createObjectURL(file));

          // Upload to Cloudinary
          const cloudinaryUrl = await uploadToCloudinary(file);
          console.log({cloudinaryUrl})
          setPreviewImage(cloudinaryUrl);
          setFeaturedImage(cloudinaryUrl);

          toast.success("Image uploaded successfully");
        } catch (error) {
          console.error("Upload failed:", error);
          toast.error("Failed to upload image. Please try again.");
          setPreviewImage(null);
        } finally {
          setIsUploading(false);
        }
      }
    }
  };
  const validateIngredients = () => {
    // Check if at least one ingredient has a name
    return ingredients.some((ingredient) => ingredient.name.trim() !== "");
  };

  const validateSteps = () => {
    // Check if at least one step has a description
    return steps.some((step) => step.description.trim() !== "");
  };
  const validTips = () => {
    return tips.some((tip) => tip.description.trim() !== "");
  }

  const onSubmit = async (data: any) => {
    // Validate ingredients and steps
    if (!validateIngredients()) {
      toast.error("Please add at least one ingredient with a name");
      return;
    }

    if (!validateSteps()) {
      toast.error("Please add at least one step with a description");
      return;
    }

    if (!validTips()) {
      toast.error("Please add at least one Tip with a description");
      return;
    }
    // Filter out empty ingredients and steps
    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() !== ""
    );
    const validSteps = steps
      .filter((step) => step.description.trim() !== "")
      .map((step) => step.description);

    // Filter out empty tips
    const validTipss = tips
      .filter((tip) => tip.description.trim() !== "")
      .map((tip) => tip.description);
    

    // Use the ingredients array directly instead of formatting them as strings
    // This keeps the object structure that your backend expects
    const formattedIngredients = validIngredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity || "0",
      unit: ing.unit || ""
    }));

    // Compile form data with ingredients, steps and tips
    const recipeData = {
      ...data,
      ingredients: formattedIngredients, 
      steps: validSteps,
      tips: validTipss,
      cookingTime: Number(data.cookingTime),
      servings: Number(data.servings),
      featuredImage: previewImage || ""
    };

    // Submit with React Query mutation
    await handleCreateRecipe(recipeData);
  };

  // Check if user is authenticated
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-gray-200 mb-4">
          Authentication Required
        </h2>
        <p className="text-gray-400 mb-6">
          You need to be logged in to create recipes
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg"
        >
          Sign In
        </button>
      </div>
    );
  }

  // Rest of your component remains the same...
  return (
    <div className="pb-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
          Create Recipe
        </h1>
        <p className="text-gray-400 mt-2">
          Share your culinary masterpiece with the world
        </p>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        {/* Basic Info Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 overflow-hidden relative"
        >
          {/* ... Basic Info content stays the same ... */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-pink-500 rounded-full filter blur-3xl -ml-20 -mb-20"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center mr-3 text-white text-sm">
                1
              </span>
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="text-gray-300 text-sm font-medium">
                  Recipe Title*
                </label>
                {showGenerateButton && (
                  <button
                    type="button"
                    className={`text-sm px-4 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-md hover:from-purple-700 hover:to-pink-700 transition flex items-center ${
                      isGenerating ? "opacity-70 cursor-wait" : ""
                    }`}
                    onClick={generateCompleteRecipe}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin mr-2"></div>
                        Creating Recipe...
                      </>
                    ) : (
                      <>
                        <svg 
                          viewBox="0 0 24 24" 
                          fill="currentColor" 
                          className="w-4 h-4 mr-2"
                        >
                          <path d="M19 11h-6V5c0-.6-.4-1-1-1s-1 .4-1 1v6H5c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1v-6h6c.6 0 1-.4 1-1s-.4-1-1-1z"/>
                        </svg>
                        Generate Full Recipe
                      </>
                    )}
                  </button>
                )}
              </div>
              <input
                {...register("title", { required: "Recipe title is required" })}
                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                placeholder="Enter recipe title (e.g., Creamy Garlic Parmesan Pasta)"
              />
              {errors.title && (
                <p className="text-pink-500 text-sm mt-1">{errors.title.message}</p>
              )}
              {watchedTitle && watchedTitle.length > 0 && watchedTitle.length < 4 && (
                <p className="text-blue-400 text-sm mt-1">
                  Continue typing to enable AI recipe generation
                </p>
              )}
            </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-gray-300 text-sm flex items-center">
                  Description
                  <span className="ml-1 text-pink-500">*</span>
                </label>
                <textarea
                  {...register("description", {
                    required: "Description is required"
                  })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none"
                  placeholder="Describe your recipe"
                ></textarea>
                {errors.description && (
                  <p className="text-pink-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm flex items-center">
                  Cooking Time (minutes)
                  <span className="ml-1 text-pink-500">*</span>
                </label>
                <input
                  {...register("cookingTime", {
                    required: "Cooking time is required"
                  })}
                  type="number"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="30"
                />
                {errors.cookingTime && (
                  <p className="text-pink-500 text-xs mt-1">
                    {errors.cookingTime.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm flex items-center">
                  Servings
                  <span className="ml-1 text-pink-500">*</span>
                </label>
                <input
                  {...register("servings", {
                    required: "Number of servings is required"
                  })}
                  type="number"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="4"
                />
                {errors.servings && (
                  <p className="text-pink-500 text-xs mt-1">
                    {errors.servings.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Difficulty</label>
                <select
                  {...register("difficulty")}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-gray-300 text-sm">Category</label>
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
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-gray-300 text-sm block mb-2">
                  Featured Image
                </label>
                <div className="flex items-start space-x-6">
                  <div className="flex-1">
                    <label className="flex flex-col items-center px-4 py-6 bg-gray-900/50 text-gray-300 rounded-lg border border-gray-700 cursor-pointer hover:bg-gray-900/70 transition-all">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-10 w-10"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="mt-2 text-sm">
                        Click to select an image
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isUploading}
                      />
                    </label>
                  </div>

                  {previewImage && (
                    <div className="w-32 h-32 relative rounded-lg overflow-hidden border border-gray-700">
                      {isUploading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/70 z-10">
                          <div className="loader">
                            <div className="h-8 w-8 rounded-full border-3 border-t-purple-500 border-r-transparent border-b-pink-500 border-l-transparent animate-spin"></div>
                          </div>
                        </div>
                      )}
                      <Image
                        src={previewImage}
                        alt="Preview"
                        className="object-cover w-full h-full"
                        width={32}
                        height={32}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Ingredients Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 overflow-hidden relative"
        >
          {/* ... Ingredients content stays the same ... */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-80 h-80 bg-blue-500 rounded-full filter blur-3xl -ml-20 -mt-20"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-cyan-500 rounded-full filter blur-3xl -mr-20 -mb-20"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center mr-3 text-white text-sm">
                2
              </span>
              Ingredients
            </h2>

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
                    <label className="text-gray-300 text-sm">Name</label>
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
                      className="px-3 py-3 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
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
        </motion.div>

        {/* Steps Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 overflow-hidden relative"
        >
          {/* ... Steps content stays the same ... */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-80 h-80 bg-green-500 rounded-full filter blur-3xl -mr-20 -mt-20"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500 rounded-full filter blur-3xl -ml-20 -mb-20"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center mr-3 text-white text-sm">
                3
              </span>
              Preparation Steps
            </h2>

            {steps.map((step, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="h-px bg-gray-700 flex-grow"></div>
                  <span className="text-gray-400 text-sm">
                    Step {index + 1}
                  </span>
                  <div className="h-px bg-gray-700 flex-grow"></div>
                </div>

                <div className="flex space-x-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex-shrink-0 flex items-center justify-center text-gray-300">
                    {index + 1}
                  </div>

                  <div className="flex-grow">
                    <textarea
                      value={step.description}
                      onChange={(e) => updateStep(index, e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500/50 resize-none"
                      placeholder="Describe this step"
                      rows={3}
                    ></textarea>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeStep(index)}
                    className="px-3 py-3 bg-red-500/20 text-red-400 rounded-lg h-min hover:bg-red-500/30 transition-colors self-start"
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
            ))}

            <div className="mt-6">
              <button
                type="button"
                onClick={addStep}
                className="px-4 py-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 rounded-lg flex items-center hover:from-green-500/30 hover:to-emerald-500/30 transition-colors"
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
                Add Step
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tips Section - NEW */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 overflow-hidden relative"
        >
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-80 h-80 bg-amber-500 rounded-full filter blur-3xl -ml-20 -mt-20"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-500 rounded-full filter blur-3xl -mr-20 -mb-20"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-xl font-semibold text-white mb-6 flex items-center">
              <span className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center mr-3 text-white text-sm">
                4
              </span>
              Chef's Tips 
            </h2>

            {tips.map((tip, index) => (
              <div key={index} className="mb-6 last:mb-0">
                <div className="flex items-center space-x-4 mb-2">
                  <div className="h-px bg-gray-700 flex-grow"></div>
                  <span className="text-gray-400 text-sm">
                    Tip {index + 1}
                  </span>
                  <div className="h-px bg-gray-700 flex-grow"></div>
                </div>

                <div className="flex space-x-4">
                  <div className="w-10 h-10 rounded-full bg-amber-600/30 flex-shrink-0 flex items-center justify-center text-amber-400">
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
                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                      />
                    </svg>
                  </div>

                  <div className="flex-grow">
                    <textarea
                      value={tip.description}
                      onChange={(e) => updateTip(index, e.target.value)}
                      className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
                      placeholder="Share a helpful tip about this recipe"
                      rows={2}
                    ></textarea>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeTip(index)}
                    className="px-3 py-3 bg-red-500/20 text-red-400 rounded-lg h-min hover:bg-red-500/30 transition-colors self-start"
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
            ))}

            <div className="mt-6">
              <button
                type="button"
                onClick={addTip}
                className="px-4 py-2 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/30 text-amber-400 rounded-lg flex items-center hover:from-amber-500/30 hover:to-yellow-500/30 transition-colors"
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
                Add Tip
              </button>
            </div>
          </div>
        </motion.div>

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="flex justify-end"
        >
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl flex items-center hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                Creating Recipe...
              </>
            ) : (
              <>
                Create Recipe
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 ml-2"
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
              </>
            )}
          </button>
        </motion.div>
      </form>
    </div>
  );
};

export default CreateRecipePage;