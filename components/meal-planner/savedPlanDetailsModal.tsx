// import { format } from "date-fns";
// import { motion } from "framer-motion";
// import React, { useEffect, useState } from "react";
// import { mealPlanStats } from "@/app/api/(meal-planner)/mealplanner";
// import { useAuthStore } from "@/app/store/authStore";
// import { Loader2 } from "lucide-react";
// import { PlanStats, SavedPlanDetailsModalProps } from "@/types/recipe";
// import Link from "next/link";

// export const SavedPlanDetailsModal: React.FC<SavedPlanDetailsModalProps> = ({
//   id,
//   plan,
//   countMeals,
//   onClose,
//   onViewDetails,
//   onDelete,
//   onDuplicate,
//   onLoad
// }) => {
//   console.log({ id });
//   const { token } = useAuthStore();
//   const [stats, setStats] = useState<PlanStats | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [copied, setCopied] = useState(false);
//   console.log({ token });
//   // Get the plan ID, considering both id and _id fields
//   const planId = id;

//   useEffect(() => {
//     const fetchStats = async () => {
//       if (!planId) {
//         console.error("No plan ID available");
//         setError("Cannot load stats: Missing plan ID");
//         return;
//       }

//       console.log("Fetching stats for plan ID:", planId);
//       setIsLoading(true);
//       setError(null);

//       try {
//         const response = await mealPlanStats(planId, token);

//         if (response.success && response.data) {
//           console.log("Stats loaded successfully:", response.data);
//           setStats(response.data);
//         } else {
//           console.error("Failed to load stats:", response.message);
//           setError(response.message || "Failed to fetch meal plan statistics");
//         }
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchStats();
//   }, [planId, token]);

//   // Generate a shareable URL for this meal plan
//   const shareableUrl = `/dashboard/meal-planner/stats/${planId}`;

//   // Function to copy URL to clipboard
//   const copyShareableLink = () => {
//     const fullUrl = `${window?.location?.origin || ""}${shareableUrl}`;
//     try {
//       navigator.clipboard.writeText(fullUrl);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//     } catch (err) {
//       console.error("Failed to copy link:", err);
//     }
//   };
//   console.log({ stats });
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
//     >
//       <motion.div
//         initial={{ scale: 0.9, y: 20 }}
//         animate={{ scale: 1, y: 0 }}
//         exit={{ scale: 0.9, y: 20 }}
//         className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
//       >
//         {/* Header with gradient background */}
//         <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 relative">
//           <h2 className="text-2xl font-bold text-white mb-1">{plan.name}</h2>
//           <p className="text-indigo-100 text-sm">
//             Created on {format(new Date(plan.date), "MMMM d, yyyy")}
//           </p>
//           <button
//             onClick={onClose}
//             className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
//             aria-label="Close"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               width="24"
//               height="24"
//               viewBox="0 0 24 24"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth="2"
//               strokeLinecap="round"
//               strokeLinejoin="round"
//             >
//               <line x1="18" y1="6" x2="6" y2="18"></line>
//               <line x1="6" y1="6" x2="18" y2="18"></line>
//             </svg>
//           </button>
//         </div>

//         <div className="p-6">
//           {/* Notes section */}
//           {plan.notes && (
//             <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
//               <h3 className="text-sm font-medium text-indigo-800 mb-2">
//                 Notes
//               </h3>
//               <p className="text-gray-700">{plan.notes}</p>
//             </div>
//           )}

//           {/* Statistics */}
//           <div className="mb-6">
//             {isLoading ? (
//               <div className="flex justify-center items-center py-4">
//                 <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
//               </div>
//             ) : error ? (
//               <div className="text-red-500 text-center py-2 text-sm">
//                 {error}
//               </div>
//             ) : stats ? (
//               <div className="space-y-4">
//                 {/* Basic Stats */}
//                 <div className="flex space-x-3">
//                   <div className="w-1/2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100/50">
//                     <div className="text-3xl font-bold text-indigo-600 mb-1">
//                       {stats.totalMeals}
//                     </div>
//                     <div className="text-sm text-gray-600">Total meals</div>
//                   </div>
//                   <div className="w-1/2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border border-purple-100/50">
//                     <div className="text-3xl font-bold text-purple-600 mb-1">
//                       {stats.uniqueRecipes}
//                     </div>
//                     <div className="text-sm text-gray-600">Unique recipes</div>
//                   </div>
//                 </div>

//                 {/* Meals by Type */}
//                 <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
//                   <h3 className="text-sm font-medium text-gray-700 mb-3">
//                     Meals by Type
//                   </h3>
//                   <div className="flex space-x-3">
//                     <div className="flex-1 text-center">
//                       <div className="w-8 h-8 mx-auto rounded-full bg-amber-100 flex items-center justify-center mb-1">
//                         <span className="text-amber-600 text-xs">🍳</span>
//                       </div>
//                       <div className="text-lg font-semibold text-amber-600">
//                         {stats?.mealsByType?.breakfast}
//                       </div>
//                       <div className="text-xs text-gray-500">Breakfast</div>
//                     </div>
//                     <div className="flex-1 text-center">
//                       <div className="w-8 h-8 mx-auto rounded-full bg-emerald-100 flex items-center justify-center mb-1">
//                         <span className="text-emerald-600 text-xs">🥗</span>
//                       </div>
//                       <div className="text-lg font-semibold text-emerald-600">
//                         {stats?.mealsByType?.lunch}
//                       </div>
//                       <div className="text-xs text-gray-500">Lunch</div>
//                     </div>
//                     <div className="flex-1 text-center">
//                       <div className="w-8 h-8 mx-auto rounded-full bg-blue-100 flex items-center justify-center mb-1">
//                         <span className="text-blue-600 text-xs">🍽️</span>
//                       </div>
//                       <div className="text-lg font-semibold text-blue-600">
//                         {stats?.mealsByType?.dinner}
//                       </div>
//                       <div className="text-xs text-gray-500">Dinner</div>
//                     </div>
//                   </div>
//                 </div>

//                 {/* Nutrition Summary */}
//                 {stats.nutritionSummary && (
//                   <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100/50">
//                     <h3 className="text-sm font-medium text-indigo-800 mb-3">
//                       Daily Nutrition (Average)
//                     </h3>
//                     <div className="grid grid-cols-2 gap-3">
//                       <div className="bg-white/60 p-2 rounded-lg">
//                         <div className="text-lg font-bold text-pink-600">
//                           {Math.round(
//                             stats.nutritionSummary.averageDaily.calories
//                           )}
//                           <span className="text-xs font-normal ml-1">kcal</span>
//                         </div>
//                         <div className="text-xs text-gray-500">Calories</div>
//                       </div>
//                       <div className="bg-white/60 p-2 rounded-lg">
//                         <div className="text-lg font-bold text-purple-600">
//                           {Math.round(
//                             stats.nutritionSummary.averageDaily.protein
//                           )}
//                           <span className="text-xs font-normal ml-1">g</span>
//                         </div>
//                         <div className="text-xs text-gray-500">Protein</div>
//                       </div>
//                       <div className="bg-white/60 p-2 rounded-lg">
//                         <div className="text-lg font-bold text-indigo-600">
//                           {Math.round(
//                             stats.nutritionSummary.averageDaily.carbs
//                           )}
//                           <span className="text-xs font-normal ml-1">g</span>
//                         </div>
//                         <div className="text-xs text-gray-500">Carbs</div>
//                       </div>
//                       <div className="bg-white/60 p-2 rounded-lg">
//                         <div className="text-lg font-bold text-blue-600">
//                           {Math.round(stats.nutritionSummary.averageDaily.fat)}
//                           <span className="text-xs font-normal ml-1">g</span>
//                         </div>
//                         <div className="text-xs text-gray-500">Fat</div>
//                       </div>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             ) : (
//               <div className="flex space-x-3">
//                 <div className="w-1/2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 mr-2 border border-indigo-100/50">
//                   <div className="text-3xl font-bold text-indigo-600 mb-1">
//                     {countMeals(plan.plan)}
//                   </div>
//                   <div className="text-sm text-gray-600">Total meals</div>
//                 </div>
//                 <div className="w-1/2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 ml-2 border border-purple-100/50">
//                   <div className="text-3xl font-bold text-purple-600 mb-1">
//                     7
//                   </div>
//                   <div className="text-sm text-gray-600">Days planned</div>
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* Main action buttons */}
//           <div className="flex space-x-3 mb-3">
//             {/* Load Plan Button */}
//             <button
//               onClick={() => {
//                 onLoad(plan);
//                 onClose();
//               }}
//               className="w-1/2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition duration-200 flex items-center justify-center shadow-sm font-medium"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 mr-2"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
//                 />
//               </svg>
//               Load Plan
//             </button>

//             {/* View Details Button */}
//             <button
//               onClick={() => {
//                 onViewDetails();
//                 onClose();
//               }}
//               className="w-1/2 py-3 px-4 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition duration-200 flex items-center justify-center shadow-sm font-medium"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 mr-2 text-gray-600"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
//                 />
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
//                 />
//               </svg>
//               View Details
//             </button>
//           </div>

//           {/* Secondary actions */}
//           <div className="flex space-x-3 mb-3">
//             <button
//               onClick={onDuplicate}
//               className="w-1/2 py-2.5 px-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition duration-200 flex items-center justify-center shadow-sm"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 mr-1.5 text-indigo-500"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
//                 />
//               </svg>
//               Duplicate
//             </button>

//             <button
//               onClick={onDelete}
//               className="w-1/2 py-2.5 px-3 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition duration-200 flex items-center justify-center shadow-sm"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 mr-1.5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
//                 />
//               </svg>
//               Delete
//             </button>
//           </div>

//           {/* Shareable Link */}
//           {/* <div className="flex space-x-3 mb-3">
//             <Link
//               href={shareableUrl}
//               className="w-1/2 flex"
//               target="_blank"
//               rel="noopener noreferrer"
//             >
//               <button className="w-full py-2.5 px-3 bg-white border border-blue-200 text-blue-600 rounded-xl hover:bg-blue-50 transition duration-200 flex items-center justify-center shadow-sm">
//                 <svg
//                   xmlns="http://www.w3.org/2000/svg"
//                   className="h-5 w-5 mr-1.5"
//                   fill="none"
//                   viewBox="0 0 24 24"
//                   stroke="currentColor"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
//                   />
//                 </svg>
//                 View Stats
//               </button>
//             </Link>

//             <button
//               onClick={copyShareableLink}
//               className="w-1/2 py-2.5 px-3 bg-white border border-green-200 text-green-600 rounded-xl hover:bg-green-50 transition duration-200 flex items-center justify-center shadow-sm"
//             >
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 className="h-5 w-5 mr-1.5"
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path
//                   strokeLinecap="round"
//                   strokeLinejoin="round"
//                   strokeWidth={2}
//                   d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
//                 />
//               </svg>
//               {copied ? "Copied!" : "Copy Link"}
//             </button>
//           </div> */}

//           <button
//             onClick={onClose}
//             className="w-full py-2.5 px-3 text-gray-500 hover:text-gray-700 rounded-xl transition-colors text-sm font-medium"
//           >
//             Cancel
//           </button>
//         </div>
//       </motion.div>
//     </motion.div>
//   );
// };





import { format } from "date-fns";
import { motion } from "framer-motion";
import React from "react";

interface SavedPlan {
  id: string;
  name: string;
  date: Date;
  plan: any;
  notes?: string;
}

interface SavedPlanDetailsModalProps {
  plan: SavedPlan;
  countMeals: (plan: any) => number;
  onClose: () => void;
  onViewDetails: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onLoad: (plan: SavedPlan) => void; // Added onLoad prop
}

export const SavedPlanDetailsModal: React.FC<SavedPlanDetailsModalProps> = ({
  plan,
  countMeals,
  onClose,
  onViewDetails,
  onDelete,
  onDuplicate,
  onLoad // Added to component props
}) => {
  console.log({plan})
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-md"
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 relative">
          <h2 className="text-2xl font-bold text-white mb-1">{plan.name}</h2>
          <p className="text-indigo-100 text-sm">
            Created on {format(new Date(plan.date), "MMMM d, yyyy")}
          </p>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {/* Notes section */}
          {plan.notes && (
            <div className="mb-6 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
              <h3 className="text-sm font-medium text-indigo-800 mb-2">Notes</h3>
              <p className="text-gray-700">{plan.notes}</p>
            </div>
          )}
          
          {/* Statistics */}
          <div className="flex mb-6">
            <div className="w-1/2 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 mr-2 border border-indigo-100/50">
              <div className="text-3xl font-bold text-indigo-600 mb-1">
                {countMeals(plan.plan)}
              </div>
              <div className="text-sm text-gray-600">Total meals</div>
            </div>
            <div className="w-1/2 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 ml-2 border border-purple-100/50">
              <div className="text-3xl font-bold text-purple-600 mb-1">7</div>
              <div className="text-sm text-gray-600">Days planned</div>
            </div>
          </div>
          
          {/* Main action buttons */}
          <div className="flex space-x-3 mb-3">
            {/* Load Plan Button */}
            <button
              onClick={() => {
                onLoad(plan);
                onClose();
              }}
              className="w-1/2 py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition duration-200 flex items-center justify-center shadow-sm font-medium"
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
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Load Plan
            </button>
            
            {/* View Details Button */}
            <button
              onClick={() => {
                onViewDetails();
                onClose();
              }}
              className="w-1/2 py-3 px-4 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition duration-200 flex items-center justify-center shadow-sm font-medium"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
              View Details
            </button>
          </div>
          
          {/* Secondary actions */}
          <div className="flex space-x-3 mb-3">
            <button
              onClick={onDuplicate}
              className="w-1/2 py-2.5 px-3 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition duration-200 flex items-center justify-center shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1.5 text-indigo-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Duplicate
            </button>
            
            <button
              onClick={onDelete}
              className="w-1/2 py-2.5 px-3 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition duration-200 flex items-center justify-center shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1.5"
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
              Delete
            </button>
          </div>
          
          <button
            onClick={onClose}
            className="w-full py-2.5 px-3 text-gray-500 hover:text-gray-700 rounded-xl transition-colors text-sm font-medium"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};