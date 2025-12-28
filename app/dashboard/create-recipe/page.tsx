"use client";
import React, { useEffect, useState } from "react";

import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore";
import { useMutation } from "@tanstack/react-query";
import { createRecipe } from "@/app/api/(recipe)/adminRecipe";
import { uploadToCloudinary } from "@/app/api/(recipe)/uploadImage";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Image from "next/image";
import {
  categoryOptions,
  generateCompleteRecipe,
  generateRecipeImage
} from "@/utils";
import { useNutritionCalculator } from "@/hooks/useNutritionalCalculator";
import NutritionSection from "@/components/create-recipe-component/nutitionalSection";
import CalculateNutritionButton from "@/components/create-recipe-component/calculateNutritionButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Upload, X, Sparkles } from "lucide-react";

const CreateRecipePage = () => {
  const { user, token } = useAuthStore();
  const router = useRouter();
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "" }
  ]);
  const [steps, setSteps] = useState<{ description: string }[]>([
    { description: "" }
  ]);
  const [tips, setTips] = useState([{ description: "" }]);
  const [previewImage, setPreviewImage] = useState<string | undefined | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [titleForGeneration, setTitleForGeneration] = useState("");
  const [showGenerateButton, setShowGenerateButton] = useState(false);
  const [recipeImage, setRecipeImage] = useState<string>("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isPrivate, setIsPrivate] = useState(true);

  // nutrition hook
  const {
    nutrition,
    isCalculatingNutrition,
    setNutrition,
    setIsCalculatingNutrition,
    calculateIngredientNutrition
  } = useNutritionCalculator(ingredients, isGenerating);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
    getValues
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

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateRecipe = async (recipeData: any) => {
    try {
      setIsSubmitting(true);

      if (!token) {
        toast.error("You must be logged in to create recipes");
        return;
      }

      const response = await createRecipe(recipeData, token);

      if (response.success) {
        toast.success("Recipe created successfully!");

        reset();
        setIngredients([{ name: "", quantity: "", unit: "" }]);
        setSteps([{ description: "" }]);
        setTips([{ description: "" }]);
        setPreviewImage(null);

        setTimeout(() => {
          if (user?.role === "admin") {
            router.push("/dashboard/my-recipes");
          } else {
            router.push("/dashboard/favorites");
          }
        }, 1500);
      } else {
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
  const [featuredImage, setFeaturedImage] = useState("");
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        try {
          setIsUploading(true);
          setPreviewImage(URL.createObjectURL(file));

          const cloudinaryUrl = await uploadToCloudinary(file);
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
    return ingredients.some((ingredient) => ingredient.name.trim() !== "");
  };

  const validateSteps = () => {
    return steps.some((step) => step.description.trim() !== "");
  };
  const validTips = () => {
    return tips.some((tip) => tip.description.trim() !== "");
  };

  const onSubmit = async (data: any) => {
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

    const validIngredients = ingredients.filter(
      (ing) => ing.name.trim() !== ""
    );
    const validSteps = steps
      .filter((step) => step.description.trim() !== "")
      .map((step) => step.description);

    const validTipss = tips
      .filter((tip) => tip.description.trim() !== "")
      .map((tip) => tip.description);

    const formattedIngredients = validIngredients.map((ing) => ({
      name: ing.name,
      quantity: ing.quantity || "0",
      unit: ing.unit || ""
    }));

    const recipeData = {
      ...data,
      ingredients: formattedIngredients,
      steps: validSteps,
      tips: validTipss,
      cookingTime: Number(data.cookingTime),
      servings: Number(data.servings),
      featuredImage: previewImage || "",
      nutrition: nutrition,
      ...(user?.role === "user" && { isPrivate })
    };
    await handleCreateRecipe(recipeData);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          Authentication Required
        </h2>
        <p className="text-muted-foreground mb-6">
          You need to be logged in to create recipes
        </p>
        <Button onClick={() => router.push("/login")}>Sign In</Button>
      </div>
    );
  }

  const handleGenerateRecipe = () => {
    const titleForGeneration = watch("title");

    generateCompleteRecipe({
      titleForGeneration,
      setValue: setValue,
      setIngredients,
      setSteps,
      setTips,
      setIsGenerating,
      categoryOptions: [
        "Breakfast",
        "Lunch",
        "Dinner",
        "Dessert",
        "Snack",
        "Appetizer"
      ],
      calculateNutrition: calculateIngredientNutrition
    });
  };

  return (
    <div className="pb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create Recipe</h1>
        <p className="text-muted-foreground mt-2">
          Share your culinary masterpiece with the world
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info Section */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                1
              </span>
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="md:col-span-2 space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="title">
                    Recipe Title <span className="text-destructive">*</span>
                  </Label>
                  {showGenerateButton && (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={handleGenerateRecipe}
                      disabled={isGenerating}
                      className="gap-2"
                    >
                      {isGenerating ? (
                        <>
                          <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin"></div>
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate Full Recipe
                        </>
                      )}
                    </Button>
                  )}
                </div>
                <Input
                  id="title"
                  {...register("title", {
                    required: "Recipe title is required"
                  })}
                  placeholder="Enter recipe title (e.g., Creamy Garlic Parmesan Pasta)"
                />
                {errors.title && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.title.message as string}
                  </p>
                )}
                {watchedTitle &&
                  watchedTitle.length > 0 &&
                  watchedTitle.length < 4 && (
                    <p className="text-muted-foreground text-sm mt-1">
                      Continue typing to enable AI recipe generation
                    </p>
                  )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label htmlFor="description">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="description"
                  {...register("description", {
                    required: "Description is required"
                  })}
                  rows={4}
                  placeholder="Describe your recipe"
                />
                {errors.description && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.description.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="cookingTime">
                  Cooking Time (minutes){" "}
                  <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="cookingTime"
                  {...register("cookingTime", {
                    required: "Cooking time is required"
                  })}
                  type="number"
                  placeholder="30"
                />
                {errors.cookingTime && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.cookingTime.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="servings">
                  Servings <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="servings"
                  {...register("servings", {
                    required: "Number of servings is required"
                  })}
                  type="number"
                  placeholder="4"
                />
                {errors.servings && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.servings.message as string}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="difficulty">Difficulty</Label>
                <select
                  id="difficulty"
                  {...register("difficulty")}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">
                  Category <span className="text-destructive">*</span>
                </Label>
                <select
                  id="category"
                  {...register("category", {
                    required: "Category is required"
                  })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">Select a category</option>
                  {categoryOptions.map((option) => (
                    <option key={option} value={option.toLowerCase()}>
                      {option}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="text-destructive text-sm mt-1">
                    {errors.category.message as string}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Featured Image</Label>
                <div className="flex flex-col space-y-4">
                  <div className="flex items-start gap-4">
                    <label className="flex flex-col items-center justify-center px-4 py-6 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-accent transition-colors w-full">
                      <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                      <span className="text-sm text-muted-foreground">
                        Click to upload an image
                      </span>
                      <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={isUploading || isGeneratingImage}
                      />
                    </label>

                    {previewImage && previewImage.startsWith("http") && (
                      <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-border group flex-shrink-0">
                        {(isUploading || isGeneratingImage) && (
                          <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                          </div>
                        )}
                        <Image
                          src={previewImage}
                          alt="Preview"
                          className="object-cover w-full h-full"
                          width={128}
                          height={128}
                        />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            onClick={() => {
                              setPreviewImage("");
                              setValue("featuredImage", "");
                            }}
                            className="h-8 w-8"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Ingredients Section */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                2
              </span>
              Ingredients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ingredients.map((ingredient, index) => (
              <div
                key={index}
                className="space-y-3 p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px bg-border flex-grow"></div>
                  <span className="text-sm text-muted-foreground">
                    Ingredient {index + 1}
                  </span>
                  <div className="h-px bg-border flex-grow"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="md:col-span-2 space-y-2">
                    <Label>Name</Label>
                    <Input
                      type="text"
                      value={ingredient.name}
                      onChange={(e) =>
                        updateIngredient(index, "name", e.target.value)
                      }
                      placeholder="Ingredient name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Quantity</Label>
                    <Input
                      type="text"
                      value={ingredient.quantity}
                      onChange={(e) =>
                        updateIngredient(index, "quantity", e.target.value)
                      }
                      placeholder="Amount"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input
                      type="text"
                      value={ingredient.unit}
                      onChange={(e) =>
                        updateIngredient(index, "unit", e.target.value)
                      }
                      placeholder="g, ml, tbsp"
                    />
                  </div>

                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => removeIngredient(index)}
                      disabled={ingredients.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addIngredient}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Ingredient
            </Button>

            <CalculateNutritionButton
              ingredients={ingredients}
              isCalculatingNutrition={isCalculatingNutrition}
              setNutrition={setNutrition}
              setIsCalculatingNutrition={setIsCalculatingNutrition}
            />
          </CardContent>
        </Card>

        {/* Steps Section */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                3
              </span>
              Preparation Steps
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="space-y-3 p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px bg-border flex-grow"></div>
                  <span className="text-sm text-muted-foreground">
                    Step {index + 1}
                  </span>
                  <div className="h-px bg-border flex-grow"></div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 flex items-center justify-center text-foreground font-semibold">
                    {index + 1}
                  </div>

                  <div className="flex-grow">
                    <Textarea
                      value={step.description}
                      onChange={(e) => updateStep(index, e.target.value)}
                      placeholder="Describe this step"
                      rows={3}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeStep(index)}
                    disabled={steps.length === 1}
                    className="self-start"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addStep}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Step
            </Button>
          </CardContent>
        </Card>

        {/* Tips Section */}
        <Card className="h-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                4
              </span>
              Chef's Tips
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="space-y-3 p-4 border border-border rounded-lg"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-px bg-border flex-grow"></div>
                  <span className="text-sm text-muted-foreground">
                    Tip {index + 1}
                  </span>
                  <div className="h-px bg-border flex-grow"></div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex-shrink-0 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-foreground" />
                  </div>

                  <div className="flex-grow">
                    <Textarea
                      value={tip.description}
                      onChange={(e) => updateTip(index, e.target.value)}
                      placeholder="Share a helpful tip about this recipe"
                      rows={2}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    onClick={() => removeTip(index)}
                    disabled={tips.length === 1}
                    className="self-start"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addTip}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Tip
            </Button>
          </CardContent>
        </Card>

        {nutrition && (
          <NutritionSection
            nutrition={nutrition}
            ingredients={ingredients}
            isCalculatingNutrition={isCalculatingNutrition}
            setNutrition={setNutrition}
            setIsCalculatingNutrition={setIsCalculatingNutrition}
          />
        )}

        {user?.role === "user" && (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <Label className="text-base">Make this recipe private?</Label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={isPrivate ? "default" : "outline"}
                    onClick={() => setIsPrivate(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={!isPrivate ? "default" : "outline"}
                    onClick={() => setIsPrivate(false)}
                  >
                    No
                  </Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                {isPrivate ? "Only visible to you" : "Visible to everyone"}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            size="lg"
            className="min-w-[200px]"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-t-transparent border-current rounded-full animate-spin mr-2"></div>
                Creating Recipe...
              </>
            ) : (
              <>
                Create Recipe
                <Plus className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CreateRecipePage;
