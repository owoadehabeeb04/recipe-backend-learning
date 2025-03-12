"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import Image from "next/image";

const CreateRecipePage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [ingredients, setIngredients] = useState([
    { name: "", quantity: "", unit: "" }
  ]);
  const [steps, setSteps] = useState([{ description: "" }]);
  const [previewImage, setPreviewImage] = useState<string | ArrayBuffer | any>(
    null
  );

  const {
    register,
    handleSubmit,
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
    const newIngredients: any = [...ingredients];
    newIngredients[index][field] = value;
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewImage(reader.result);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const onSubmit = async (data: any) => {
    setIsLoading(true);

    try {
      // Compile form data with ingredients and steps
      const recipeData = {
        ...data,
        ingredients,
        steps: steps.map((step) => step.description)
      };

      console.log("Recipe data:", recipeData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Recipe created successfully!");
    } catch (error) {
      toast.error("Failed to create recipe");
    } finally {
      setIsLoading(false);
    }
  };

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
              <div className="space-y-2 md:col-span-2">
                <label className="text-gray-300 text-sm flex items-center">
                  Recipe Title
                  <span className="ml-1 text-pink-500">*</span>
                </label>
                <input
                  {...register("title", { required: "Title is required" })}
                  type="text"
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  placeholder="Enter recipe title"
                />
                {errors.title && (
                  <p className="text-pink-500 text-xs mt-1">
                    {errors.title.message}
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
                  {...register("category")}
                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 appearance-none"
                >
                  <option value="">Select a category</option>
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="dessert">Dessert</option>
                  <option value="snack">Snack</option>
                  <option value="beverage">Beverage</option>
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
                      />
                    </label>
                  </div>

                  {previewImage && (
                    <div className="w-32 h-32 relative rounded-lg overflow-hidden border border-gray-700">
                      <img
                        src={previewImage}
                        alt="Preview"
                        className="object-cover w-full h-full"
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

        {/* Submit Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-end"
        >
          <button
            type="submit"
            disabled={isLoading}
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl flex items-center hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 disabled:opacity-50"
          >
            {isLoading ? (
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
