// import { useState } from "react";
// import { motion } from "framer-motion";
// import { useForm } from "react-hook-form";
// import { useAuthStore } from "@/app/store/authStore";
// import { uploadToCloudinary } from "@/app/api/(recipe)/uploadImage";
// import toast from "react-hot-toast";
// import Image from "next/image";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { createRecipe } from "@/app/api/(recipe)/adminRecipe";

// interface QuickRecipeCreatorProps {
//   mealType?: string;
//   onClose: () => void;
//   onRecipeCreated: (recipe: any) => void;
// }

// export const QuickRecipeCreator: React.FC<QuickRecipeCreatorProps> = ({
//   mealType,
//   onClose,
//   onRecipeCreated
// }) => {
//   const { token, user } = useAuthStore();
//   const [loading, setLoading] = useState(false);
//   const [uploadingImage, setUploadingImage] = useState(false);
//   const [previewImage, setPreviewImage] = useState<string | null>(null);
//   const [isPrivate, setIsPrivate] = useState(false);
//   const [isGenerating, setIsGenerating] = useState(false);

//   const {
//     register,
//     handleSubmit,
//     setValue,
//     watch,
//     formState: { errors }
//   } = useForm({
//     defaultValues: {
//       title: "",
//       description: "",
//       ingredients: "",
//       instructions: "",
//       category: mealType?.toLowerCase() || "main dish",
//       featuredImage: "",
//     }
//   });

//   const watchIngredients = watch("ingredients");

//   // Handle image upload
//   const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
//     const file = e.target.files?.[0];
//     if (!file) return;

//     // Preview the image immediately
//     const reader = new FileReader();
//     reader.onloadend = () => {
//       setPreviewImage(reader.result as string);
//     };
//     reader.readAsDataURL(file);

//     try {
//       setUploadingImage(true);
//       toast.loading("Uploading image...", { id: "imageUpload" });

//       const cloudinaryUrl = await uploadToCloudinary(file);
//       setValue("featuredImage", cloudinaryUrl);
      
//       toast.success("Image uploaded successfully", { id: "imageUpload" });
//     } catch (error) {
//       console.error("Error uploading image:", error);
//       toast.error("Failed to upload image", { id: "imageUpload" });
//     } finally {
//       setUploadingImage(false);
//     }
//   };

//   // Generate recipe details using AI
//   const generateRecipeDetails = async () => {
//     if (!watchIngredients || watchIngredients.trim() === "") {
//       toast.error("Please enter ingredients first");
//       return;
//     }

//     setIsGenerating(true);
//     toast.loading("Generating recipe details...", { id: "generating" });

//     try {
//       // Initialize Gemini AI
//       const genAI = new GoogleGenerativeAI(
//         process.env.NEXT_PUBLIC_GEMINI_API_KEY || ""
//       );
//       const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
//       // Create prompt for recipe generation
//       const prompt = `
//         Based on these ingredients:
//         ${watchIngredients}
        
//         Please create a recipe with the following details:
//         1. A creative title for this recipe
//         2. A short description (1-2 sentences)
//         3. Step-by-step cooking instructions
//         4. An appropriate cooking time in minutes
//         5. Difficulty level (easy, medium, or hard)
//         6. Number of servings
        
//         Format your response as follows:
//         TITLE: [Recipe Title]
//         DESCRIPTION: [Short description]
//         INSTRUCTIONS: [Step by step instructions with each step on a new line]
//         COOKING_TIME: [number]
//         DIFFICULTY: [easy/medium/hard]
//         SERVINGS: [number]
//       `;
      
//       // Generate content
//       const result = await model.generateContent(prompt);
//       const response = result.response.text();
      
//       // Parse the response
//       const titleMatch = response.match(/TITLE:\s*(.*)/i);
//       const descMatch = response.match(/DESCRIPTION:\s*(.*?)\n/is);
//       const instrMatch = response.match(/INSTRUCTIONS:\s*([\s\S]*?)(?=COOKING_TIME:|$)/i);
//       const timeMatch = response.match(/COOKING_TIME:\s*(\d+)/i);
//       const difficultyMatch = response.match(/DIFFICULTY:\s*(\w+)/i);
//       const servingsMatch = response.match(/SERVINGS:\s*(\d+)/i);
      
//       // Set form values with generated content
//       if (titleMatch && titleMatch[1]) setValue("title", titleMatch[1].trim());
//       if (descMatch && descMatch[1]) setValue("description", descMatch[1].trim());
//       if (instrMatch && instrMatch[1]) setValue("instructions", instrMatch[1].trim());
      
//       toast.success("Recipe details generated!", { id: "generating" });
//     } catch (error) {
//       console.error("Error generating recipe:", error);
//       toast.error("Failed to generate recipe details", { id: "generating" });
//     } finally {
//       setIsGenerating(false);
//     }
//   };

//   // Submit the form
//   const onSubmit = async (data: { ingredients: string; instructions: string; title: any; description: any; }) => {
//     if (!token) {
//       toast.error("You must be logged in to create a recipe");
//       return;
//     }

//     setLoading(true);
//     const loadingToastId = toast.loading("Creating your recipe...");

//     try {
//       // Transform ingredients from text to array
//       const ingredientsArray = data.ingredients
//         .split('\n')
//         .filter((line: string) => line.trim() !== '')
//         .map((line : string) => {
//           // Try to parse quantity and unit
//           const match = line.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)?\s+(.+)$/);
//           if (match) {
//             return {
//               quantity: match[1] || '',
//               unit: match[2] || '',
//               name: match[3] || line.trim()
//             };
//           }
//           // Default if no pattern matches
//           return { quantity: '', unit: '', name: line.trim() };
//         });

//       // Transform instructions from text to array
//       const instructionsArray = data.instructions
//         .split('\n')
//         .filter(line => line.trim() !== '');

//       // Create payload
//       const payload = {
//         title: data.title,
//         description: data.description,
//         // ingredients: ingredientsArray,
//         // steps: instructionsArray,
//         // category: data.category,
//         // isPrivate: isPrivate, // Add the privacy setting
//         // featuredImage: data.featuredImage || undefined,
//         // cookingTime: 30, // Default if not provided
//         // difficulty: "easy", // Default if not provided
//         // servings: 2, // Default if not provided
//         // roleCreated: "user" // Mark as user-created
//       };

//       // Send to API
//       const response = await createRecipe(payload, token);

//       if (response.success) {
//         toast.success("Recipe created successfully", { id: loadingToastId });
//         onRecipeCreated(response.data);
//       } else {
//         toast.error(response.message || "Failed to create recipe", { id: loadingToastId });
//       }
//     } catch (error) {
//       console.error("Error creating recipe:", error);
//       toast.error("An unexpected error occurred", { id: loadingToastId });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-4 backdrop-blur-sm">
//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl border border-gray-700"
//       >
//         <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
//           <div className="flex justify-between items-center">
//             <h2 className="text-xl font-bold text-white">Create Quick Recipe</h2>
//             <button
//               onClick={onClose}
//               className="p-1 rounded-full hover:bg-white/20 transition text-2xl text-white"
//               aria-label="Close"
//             >
//               &times;
//             </button>
//           </div>
//         </div>

//         <div className="overflow-y-auto p-6 flex-grow">
//           <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
//             {/* Title */}
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">
//                 Recipe Title*
//               </label>
//               <input
//                 {...register("title", { required: "Title is required" })}
//                 className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white"
//                 placeholder="Enter recipe name"
//               />
//               {errors.title && (
//                 <p className="text-pink-500 text-xs mt-1">{errors.title.message}</p>
//               )}
//             </div>

//             {/* Recipe Image */}
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">
//                 Recipe Image
//               </label>
//               <div className="flex items-start space-x-4">
//                 <div className="flex-1">
//                   <label
//                     className={`flex justify-center items-center w-full h-28 border-2 border-dashed rounded-lg ${
//                       uploadingImage
//                         ? "border-gray-600 bg-gray-800/30"
//                         : "border-gray-600 hover:border-purple-500 cursor-pointer bg-gray-800/30 hover:bg-gray-700/30"
//                     }`}
//                   >
//                     {uploadingImage ? (
//                       <div className="text-center">
//                         <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-purple-500 mb-2"></div>
//                         <p className="text-sm text-gray-400">Uploading...</p>
//                       </div>
//                     ) : (
//                       <div className="text-center">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           className="mx-auto h-8 w-8 text-gray-400"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           stroke="currentColor"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
//                           />
//                         </svg>
//                         <p className="mt-1 text-sm text-gray-400">
//                           Upload image (optional)
//                         </p>
//                       </div>
//                     )}
//                     <input
//                       type="file"
//                       className="hidden"
//                       accept="image/*"
//                       onChange={handleImageChange}
//                       disabled={uploadingImage}
//                     />
//                   </label>
//                 </div>
//                 {previewImage && (
//                   <div className="w-28 h-28 relative rounded-lg overflow-hidden flex-shrink-0">
//                     <Image
//                       src={previewImage}
//                       alt="Recipe preview"
//                       layout="fill"
//                       objectFit="cover"
//                     />
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Description */}
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">
//                 Description
//               </label>
//               <textarea
//                 {...register("description")}
//                 rows={2}
//                 className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white resize-none"
//                 placeholder="Briefly describe your recipe"
//               />
//             </div>

//             {/* Ingredients */}
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">
//                 Ingredients*
//               </label>
//               <textarea
//                 {...register("ingredients", { required: "Ingredients are required" })}
//                 rows={4}
//                 className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white resize-none"
//                 placeholder="Enter one ingredient per line (e.g. 2 cups flour)"
//               />
//               {errors.ingredients && (
//                 <p className="text-pink-500 text-xs mt-1">{errors.ingredients.message}</p>
//               )}
//             </div>

//             {/* Instructions */}
//             <div>
//               <div className="flex justify-between items-center mb-1">
//                 <label className="block text-sm font-medium text-gray-300">
//                   Instructions*
//                 </label>
//                 <button
//                   type="button"
//                   onClick={generateRecipeDetails}
//                   disabled={isGenerating || !watchIngredients}
//                   className="text-xs bg-purple-600/30 text-purple-400 px-2 py-1 rounded hover:bg-purple-600/40 disabled:opacity-50 flex items-center"
//                 >
//                   {isGenerating ? (
//                     <>
//                       <svg className="animate-spin -ml-0.5 mr-1 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Generating...
//                     </>
//                   ) : (
//                     <>
//                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
//                       </svg>
//                       Generate with AI
//                     </>
//                   )}
//                 </button>
//               </div>
//               <textarea
//                 {...register("instructions", { required: "Instructions are required" })}
//                 rows={4}
//                 className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white resize-none"
//                 placeholder="Enter cooking instructions"
//               />
//               {errors.instructions && (
//                 <p className="text-pink-500 text-xs mt-1">{errors.instructions.message}</p>
//               )}
//             </div>

//             {/* Category */}
//             <div>
//               <label className="block text-sm font-medium text-gray-300 mb-1">
//                 Category
//               </label>
//               <select
//                 {...register("category")}
//                 className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2.5 text-white"
//               >
//                 <option value="breakfast">Breakfast</option>
//                 <option value="lunch">Lunch</option>
//                 <option value="dinner">Dinner</option>
//                 <option value="snack">Snack</option>
//                 <option value="dessert">Dessert</option>
//                 <option value="main dish">Main Dish</option>
//                 <option value="side dish">Side Dish</option>
//               </select>
//             </div>

//             {/* Privacy Toggle */}
//             <div className="flex items-center justify-between pt-3 border-t border-gray-700">
//               <div className="flex items-center">
//                 <label htmlFor="isPrivate" className="text-gray-300 mr-3">Make this recipe private</label>
//                 <div className="relative">
//                   <input 
//                     type="checkbox"
//                     id="isPrivate"
//                     checked={isPrivate}
//                     onChange={() => setIsPrivate(!isPrivate)}
//                     className="sr-only"
//                   />
//                   <div className={`block w-14 h-7 rounded-full transition ${isPrivate ? 'bg-purple-600' : 'bg-gray-600'}`}></div>
//                   <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition transform ${isPrivate ? 'translate-x-7' : ''}`}></div>
//                 </div>
//               </div>
//               <div className="text-xs text-gray-500">
//                 {isPrivate ? 'Only visible to you' : 'Visible to everyone'}
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div className="flex justify-end space-x-3">
//               <button
//                 type="button"
//                 onClick={onClose}
//                 className="px-4 py-2 border border-gray-700 rounded-lg text-white hover:bg-gray-800"
//                 disabled={loading}
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 disabled={loading || uploadingImage}
//                 className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 flex items-center"
//               >
//                 {loading && (
//                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                 )}
//                 {loading ? 'Creating...' : 'Create Recipe'}
//               </button>
//             </div>
//           </form>
//         </div>
//       </motion.div>
//     </div>
//   );
// };