import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  ChevronDown,
  ChevronRight,
  Check,
  Download,
  Printer,
  AlertCircle,
  RefreshCw,
  X,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { getCategorizedShoppingList, getPrintableShoppingList } from "../../app/api/(shopping-list)/shoppingList";
import { useAuthStore } from "@/app/store/authStore";

interface ShoppingListItem {
  name: string;
  recipes: string[];
  items: {
    quantity: string;
    unit: string;
    recipe: string;
  }[];
}

interface CategorizedList {
  [category: string]: ShoppingListItem[];
}

interface ShoppingListData {
  mealPlanId: string;
  mealPlanName: string;
  week: string;
  numberOfRecipes: number;
  categorizedIngredients: CategorizedList;
}

interface ShoppingListProps {
  mealPlanId: string;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ mealPlanId }) => {
    const {token} = useAuthStore()
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [shoppingData, setShoppingData] = useState<ShoppingListData | null>(null);
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
    const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem(`shopping-checks-${mealPlanId}`);
      if (savedItems) {
        setCheckedItems(JSON.parse(savedItems));
      }
    } catch (e) {
      console.error("Error loading saved shopping list state", e);
    }
  }, [mealPlanId]);

  useEffect(() => {
    if (Object.keys(checkedItems).length) {
      localStorage.setItem(`shopping-checks-${mealPlanId}`, JSON.stringify(checkedItems));
    }
  }, [checkedItems, mealPlanId]);

  const fetchShoppingList = useCallback(async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getCategorizedShoppingList(
        token,
        mealPlanId
      );
      
      if (response && response.data && response.data.success) {
        setShoppingData(response.data.data);
        
        if (response.data.data.categorizedIngredients) {
          const categories = Object.keys(response.data.data.categorizedIngredients);
          const initialExpanded = categories.reduce((acc, category) => {
            acc[category] = true;
            return acc;
          }, {} as Record<string, boolean>);
          
          setExpandedCategories(initialExpanded);
        }
      } else {
        setError("Failed to load shopping list data");
      }
    } catch (err) {
      setError("An error occurred while fetching the shopping list");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token, mealPlanId]);

  // Fetch data on component mount
  useEffect(() => {
    fetchShoppingList();
  }, [fetchShoppingList]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  // Toggle item checked state
  const toggleItemCheck = (category: string, itemName: string) => {
    const key = `${category}-${itemName.toLowerCase()}`;
    setCheckedItems((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  // Calculate progress
  const calculateProgress = useCallback(() => {
    if (!shoppingData || !shoppingData.categorizedIngredients) return 0;
    
    let totalItems = 0;
    let checkedCount = 0;
    
    Object.entries(shoppingData.categorizedIngredients).forEach(([category, items]) => {
      items.forEach((item) => {
        totalItems++;
        const key = `${category}-${item.name.toLowerCase()}`;
        if (checkedItems[key]) {
          checkedCount++;
        }
      });
    });
    
    return totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  }, [shoppingData, checkedItems]);

  // Reset checked items
  const resetCheckedItems = () => {
    if (window.confirm("Are you sure you want to reset your shopping list progress?")) {
      setCheckedItems({});
      localStorage.removeItem(`shopping-checks-${mealPlanId}`);
    }
  };

  // Download shopping list as text
  const downloadShoppingList = async () => {
    if (!token) return;
    
    try {
      const response = await getPrintableShoppingList(
        token,
        mealPlanId
      );
      
      if (response && response.data && response.data.success) {
        // Convert to plain text format
        let textOutput = `SHOPPING LIST FOR: ${response.data.data.mealPlanName}\n`;
        textOutput += `WEEK OF: ${response.data.data.week}\n\n`;
        
        response.data.data.items.forEach((item: any) => {
          textOutput += `□ ${item.name}:\n`;
          item.items.forEach((subItem: any) => {
            textOutput += `    ${subItem.quantity} ${subItem.unit}\n`;
          });
          textOutput += '\n';
        });
        
        // Create and download file
        const blob = new Blob([textOutput], { type: "text/plain" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `shopping-list-${format(new Date(), "yyyy-MM-dd")}.txt`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Failed to generate downloadable shopping list");
      }
    } catch (err) {
      console.error("Error downloading shopping list", err);
      alert("An error occurred while downloading the shopping list");
    }
  };

  // Print shopping list
  const printShoppingList = async () => {
    if (!token || !shoppingData) return;
    
    const printWindow = window.open("", "_blank");
    
    if (!printWindow) {
      alert("Please allow pop-ups to print the shopping list");
      return;
    }
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Shopping List - ${shoppingData.mealPlanName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; line-height: 1.5; }
          h1 { font-size: 24px; margin-bottom: 10px; }
          h2 { font-size: 18px; margin-top: 20px; margin-bottom: 10px; background: #f3f4f6; padding: 5px 10px; }
          .date { color: #666; margin-bottom: 20px; }
          .category { margin-bottom: 25px; }
          ul { padding-left: 20px; }
          li { margin-bottom: 12px; list-style-type: none; position: relative; }
          li::before { content: "□"; position: absolute; left: -20px; }
          .item-detail { color: #666; font-size: 14px; margin-left: 10px; }
          .recipe-ref { font-style: italic; font-size: 13px; color: #888; margin-top: 5px; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Shopping List: ${shoppingData.mealPlanName}</h1>
        <div class="date">Week of ${format(new Date(shoppingData.week), "MMMM d, yyyy")}</div>
        
        ${Object.entries(shoppingData.categorizedIngredients)
          .map(([category, items]) => `
            <div class="category">
              <h2>${category}</h2>
              <ul>
                ${items.map(item => `
                  <li>
                    <div><strong>${item.name}</strong></div>
                    <div class="item-detail">
                      ${item.items.map(subItem => 
                        `${subItem.quantity} ${subItem.unit}`
                      ).join(', ')}
                    </div>
                    <div class="recipe-ref">Used in: ${item.recipes.join(', ')}</div>
                  </li>
                `).join('')}
              </ul>
            </div>
          `).join('')}
        
        <div style="margin-top: 30px; text-align: center;">
          <button onclick="window.print()" style="padding: 10px 20px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Print Shopping List
          </button>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
  
  // Mark all items in a category as checked/unchecked
  const toggleAllInCategory = (category: string) => {
    if (!shoppingData) return;
    
    const categoryItems = shoppingData.categorizedIngredients[category];
    const newCheckedItems = { ...checkedItems };
    
    // Check if all items in category are already checked
    const allChecked = categoryItems.every(
      item => checkedItems[`${category}-${item.name.toLowerCase()}`]
    );
    
    // Toggle all items
    categoryItems.forEach(item => {
      const key = `${category}-${item.name.toLowerCase()}`;
      newCheckedItems[key] = !allChecked;
    });
    
    setCheckedItems(newCheckedItems);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-64 bg-black/40 backdrop-blur-sm border border-purple-900/30 rounded-xl">
        <div className="w-12 h-12 border-4 border-t-purple-500 border-purple-500/30 rounded-full animate-spin mb-4"></div>
        <p className="text-purple-300">Loading your shopping list...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-black/40 backdrop-blur-sm border border-red-500/30 rounded-xl">
        <div className="flex items-center text-red-400 mb-3">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <h3 className="font-medium">Failed to load shopping list</h3>
        </div>
        <p className="text-sm text-red-300/80 mb-4">{error}</p>
        <button 
          onClick={fetchShoppingList}
          className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-white rounded-lg border border-purple-600/30 flex items-center"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> 
          Try Again
        </button>
      </div>
    );
  }

  // No data state
  if (!shoppingData || !shoppingData.categorizedIngredients || 
      Object.keys(shoppingData.categorizedIngredients).length === 0) {
    return (
      <div className="p-8 bg-black/40 backdrop-blur-sm border border-purple-900/30 rounded-xl text-center">
        <ShoppingBag className="w-12 h-12 text-purple-400 mx-auto opacity-50 mb-4" />
        <h3 className="text-xl font-medium text-white mb-2">No ingredients found</h3>
        <p className="text-purple-300 mb-6">This meal plan doesn't have any recipes with ingredients.</p>
        <button 
          onClick={fetchShoppingList}
          className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 text-white rounded-lg border border-purple-600/30 flex items-center mx-auto"
        >
          <RefreshCw className="w-4 h-4 mr-2" /> 
          Refresh
        </button>
      </div>
    );
  }

  // Calculate progress
  const progress = calculateProgress();

  return (
    <div className="bg-black/40 mt-3 backdrop-blur-sm border border-purple-900/30 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600/80 to-pink-600/80 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-medium text-white text-lg flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Shopping List
            </h3>
            <p className="text-xs text-white/70">
              Week of {format(new Date(shoppingData.week), "MMMM d, yyyy")}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={printShoppingList}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Print shopping list"
              aria-label="Print shopping list"
            >
              <Printer className="w-4 h-4 text-white" />2
            </button>
            <button
              onClick={downloadShoppingList}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Download as text"
              aria-label="Download as text"
            >
              <Download className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={resetCheckedItems}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Reset progress"
              aria-label="Reset progress"
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 mb-1 bg-black/20 h-2 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-green-400 to-teal-500"
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          ></motion.div>
        </div>
        <div className="flex justify-between items-center text-xs text-white/80">
          <span className="font-medium">{progress}% complete</span>
          <span>{shoppingData.numberOfRecipes} recipes</span>
        </div>
      </div>
      
      {/* Shopping list content */}
      <div className="p-4 space-y-4">
        <AnimatePresence>
          {Object.entries(shoppingData.categorizedIngredients).map(([category, items]) => {
            // Check if all items in this category are checked
            const allChecked = items.every(
              (item) => checkedItems[`${category}-${item.name.toLowerCase()}`]
            );
            const anyChecked = items.some(
              (item) => checkedItems[`${category}-${item.name.toLowerCase()}`]
            );
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-purple-900/10 rounded-xl border border-purple-800/30 overflow-hidden"
              >
                {/* Category header */}
                <div className="flex items-center justify-between bg-purple-900/30 px-4 py-3">
                  <button
                    onClick={() => toggleCategory(category)}
                    className="flex-1 flex items-center text-left focus:outline-none"
                    aria-expanded={expandedCategories[category]}
                  >
                    {expandedCategories[category] ? (
                      <ChevronDown className="w-5 h-5 text-purple-300 mr-2" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-purple-300 mr-2" />
                    )}
                    <span className="font-medium text-white">{category}</span>
                    <span className="ml-2 text-xs bg-purple-700/40 px-2 py-0.5 rounded-full text-white">
                      {items.length}
                    </span>
                  </button>
                  
                  <button
                    onClick={() => toggleAllInCategory(category)}
                    className={`p-1.5 rounded-md transition-colors ${
                      allChecked 
                        ? "bg-green-500/20 text-green-300 hover:bg-green-500/30" 
                        : anyChecked 
                          ? "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30"
                          : "bg-purple-700/20 text-purple-300 hover:bg-purple-700/30"
                    }`}
                    title={allChecked ? "Uncheck all" : "Check all"}
                  >
                    {allChecked ? (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="sr-only">Uncheck all in {category}</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span className="sr-only">Check all in {category}</span>
                      </>
                    )}
                  </button>
                </div>
                
                {/* Category items */}
                <AnimatePresence>
                  {expandedCategories[category] && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="p-3 space-y-2">
                        {items.map((item) => {
                          const itemKey = `${category}-${item.name.toLowerCase()}`;
                          const isChecked = !!checkedItems[itemKey];
                          
                          return (
                            <motion.div
                              key={itemKey}
                              className={`p-3 border ${
                                isChecked 
                                  ? "bg-green-900/10 border-green-700/30" 
                                  : "bg-purple-900/10 border-purple-800/30"
                              } rounded-lg flex items-start`}
                              whileHover={{ scale: 1.005 }}
                              transition={{ duration: 0.1 }}
                            >
                              <button
                                onClick={() => toggleItemCheck(category, item.name.toLowerCase())}
                                className={`flex-shrink-0 w-5 h-5 rounded mr-3 flex items-center justify-center ${
                                  isChecked 
                                    ? "bg-green-500" 
                                    : "border border-purple-500/50"
                                }`}
                                aria-checked={isChecked}
                                role="checkbox"
                              >
                                {isChecked && <Check className="w-3 h-3 text-white" />}
                              </button>
                              
                              <div className="flex-1">
                                <div className={`font-medium ${isChecked ? "text-green-200 line-through" : "text-white"}`}>
                                  {item.name}
                                </div>
                                
                                <div className="mt-1.5 space-y-1.5">
                                  {item.items.map((subItem, idx) => (
                                    <div
                                      key={idx}
                                      className={`text-sm ${
                                        isChecked 
                                          ? "text-green-300/60 line-through" 
                                          : "text-purple-300"
                                      }`}
                                    >
                                      {subItem.quantity} {subItem.unit}
                                      <span className="text-xs ml-1.5 text-purple-400/60">
                                        ({subItem.recipe})
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                
                                <div className="mt-2 text-xs text-purple-400/60">
                                  Used in: {item.recipes.join(", ")}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Auto-organize suggestion */}
      {progress === 0 && (
        <div className="px-4 pb-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-3 text-center"
          >
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4 text-pink-400 mr-2" />
              <span className="text-sm font-medium text-white">Shopping tip</span>
            </div>
            <p className="text-xs text-purple-200">
              Shop by category to save time! Start at the top and work your way down.
            </p>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;