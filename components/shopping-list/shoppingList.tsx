import React, { useState, useEffect, useCallback } from "react";
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
import { useAuthStore } from "@/app/store/authStore";
import { toast } from "react-hot-toast";
import { 
  getShoppingListStatus, 
  toggleShoppingListItem, 
  toggleShoppingListCategory,
  toggleAllShoppingListItems, 
  resetShoppingList 
} from "../../app/api/(meal-planner)/mealplanner";

interface ShoppingListItem {
  name: string;
  recipes: string[];
  items: {
    quantity: string;
    unit: string;
    recipe: string;
  }[];
  checked: boolean;
}

interface CategorizedList {
  [category: string]: ShoppingListItem[];
}

interface CategoryStats {
  [category: string]: {
    total: number;
    checked: number;
  }
}

interface ShoppingListData {
  mealPlanId: string;
  mealPlanName: string;
  week: string;
  numberOfRecipes: number;
  categorizedIngredients: CategorizedList;
  categoryStats: CategoryStats;
  checkedItems: string[];
  lastUpdated: string | null;
}

interface ShoppingListProps {
  mealPlanId: string;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ mealPlanId }) => {
  const { token } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shoppingData, setShoppingData] = useState<ShoppingListData | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  // Fetch shopping list from the API
  const fetchShoppingList = useCallback(async () => {
    if (!token) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await getShoppingListStatus(mealPlanId, token);
      
      if (response.success && response.data) {
        setShoppingData(response.data);
        
        if (response.data.categorizedIngredients) {
          const categories = Object.keys(response.data.categorizedIngredients);
          const initialExpanded = categories.reduce((acc, category) => {
            acc[category] = true;
            return acc;
          }, {} as Record<string, boolean>);
          
          setExpandedCategories(initialExpanded);
        }
      } else {
        setError(response.message || "Failed to load shopping list data");
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

  // Toggle item checked state with server persistence
  const handleToggleItem = async (category: string, itemName: string, isCurrentlyChecked: boolean) => {
    if (!token || !shoppingData) return;
    
    try {
      setIsSaving(true);
      
      // Optimistically update UI
      const updatedData = {...shoppingData};
      const items = updatedData.categorizedIngredients[category];
      const item = items.find(i => i.name.toLowerCase() === itemName.toLowerCase());
      
      if (item) {
        item.checked = !isCurrentlyChecked;
        
        // Update the checked items array
        if (!isCurrentlyChecked) {
          updatedData.checkedItems.push(itemName.toLowerCase());
        } else {
          updatedData.checkedItems = updatedData.checkedItems.filter(
            i => i !== itemName.toLowerCase()
          );
        }
        
        // Update category stats
        if (updatedData.categoryStats && updatedData.categoryStats[category]) {
          updatedData.categoryStats[category].checked += !isCurrentlyChecked ? 1 : -1;
        }
        
        setShoppingData(updatedData);
      }
      
      // Call API to persist the change
      const response = await toggleShoppingListItem(
        mealPlanId,
        itemName,
        !isCurrentlyChecked,
        token
      );
      
      if (!response.success) {
        // Revert optimistic update on failure
        toast.error("Failed to update shopping list");
        fetchShoppingList();
      }
    } catch (err) {
      console.error("Error toggling item:", err);
      toast.error("Failed to update item status");
      fetchShoppingList();
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle all items in a category
  const toggleAllInCategory = async (category: string) => {
    if (!token || !shoppingData) return;
    
    try {
      setIsSaving(true);
      
      // Check if all items in category are already checked
      const categoryItems = shoppingData.categorizedIngredients[category];
      const allChecked = categoryItems.every(item => item.checked);
      
      // Optimistically update UI
      const updatedData = {...shoppingData};
      const items = updatedData.categorizedIngredients[category];
      
      items.forEach(item => {
        item.checked = !allChecked;
      });
      
      // Update checked items array
      const itemNames = items.map(item => item.name.toLowerCase());
      
      if (allChecked) {
        // Remove all category items from checked items
        updatedData.checkedItems = updatedData.checkedItems.filter(
          item => !itemNames.includes(item)
        );
      } else {
        // Add all category items to checked items
        const currentCheckedItems = new Set(updatedData.checkedItems);
        itemNames.forEach(name => currentCheckedItems.add(name));
        updatedData.checkedItems = Array.from(currentCheckedItems);
      }
      
      // Update category stats
      if (updatedData.categoryStats && updatedData.categoryStats[category]) {
        updatedData.categoryStats[category].checked = allChecked ? 0 : items.length;
      }
      
      setShoppingData(updatedData);
      
      // Call API to persist the change
      const response = await toggleShoppingListCategory(
        mealPlanId,
        category,
        !allChecked,
        token
      );
      
      if (!response.success) {
        // Revert optimistic update on failure
        toast.error("Failed to update category items");
        fetchShoppingList();
      }
    } catch (err) {
      console.error("Error toggling category:", err);
      toast.error("Failed to update category items");
      fetchShoppingList();
    } finally {
      setIsSaving(false);
    }
  };

  // Reset all checked items
  const handleResetCheckedItems = async () => {
    if (!token || !shoppingData) return;
    
    if (window.confirm("Are you sure you want to reset your shopping list progress?")) {
      try {
        setIsSaving(true);
        
        // Optimistically update UI
        const updatedData = {...shoppingData};
        
        // Clear all checked items
        updatedData.checkedItems = [];
        
        // Set all items to unchecked
        Object.keys(updatedData.categorizedIngredients).forEach(category => {
          updatedData.categorizedIngredients[category].forEach(item => {
            item.checked = false;
          });
          
          // Update category stats
          if (updatedData.categoryStats && updatedData.categoryStats[category]) {
            updatedData.categoryStats[category].checked = 0;
          }
        });
        
        setShoppingData(updatedData);
        
        // Call API to persist the reset
        const response = await resetShoppingList(mealPlanId, token);
        
        if (response.success) {
          toast.success("Shopping list reset successfully");
        } else {
          // Revert optimistic update on failure
          toast.error("Failed to reset shopping list");
          fetchShoppingList();
        }
      } catch (err) {
        console.error("Error resetting shopping list:", err);
        toast.error("Failed to reset shopping list");
        fetchShoppingList();
      } finally {
        setIsSaving(false);
      }
    }
  };

  // Calculate progress
  const calculateProgress = useCallback(() => {
    if (!shoppingData || !shoppingData.categorizedIngredients) return 0;
    
    let totalItems = 0;
    let checkedCount = 0;
    
    Object.entries(shoppingData.categorizedIngredients).forEach(([category, items]) => {
      totalItems += items.length;
      checkedCount += items.filter(item => item.checked).length;
    });
    
    return totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0;
  }, [shoppingData]);

  // Download shopping list as text
  const downloadShoppingList = () => {
    if (!shoppingData) return;
    
    try {
      // Convert to plain text format
      let textOutput = `SHOPPING LIST FOR: ${shoppingData.mealPlanName}\n`;
      textOutput += `WEEK OF: ${format(new Date(shoppingData.week), "MMMM d, yyyy")}\n\n`;
      
      Object.entries(shoppingData.categorizedIngredients).forEach(([category, items]) => {
        textOutput += `==== ${category} ====\n\n`;
        
        items.forEach(item => {
          textOutput += `□ ${item.name}:\n`;
          item.items.forEach(subItem => {
            textOutput += `    ${subItem.quantity} ${subItem.unit}\n`;
          });
          textOutput += '\n';
        });
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
    } catch (err) {
      console.error("Error downloading shopping list", err);
      toast.error("Failed to download shopping list");
    }
  };

  // Print shopping list
  const printShoppingList = () => {
    if (!shoppingData) return;
    
    const printWindow = window.open("", "_blank");
    
    if (!printWindow) {
      toast.error("Please allow pop-ups to print the shopping list");
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
          .checked::before { content: "☑"; }
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
                  <li class="${item.checked ? 'checked' : ''}">
                    <div><strong>${item.name}</strong> ${item.checked ? '(Checked)' : ''}</div>
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
    <div className={`bg-black/40 mt-3 backdrop-blur-sm border border-purple-900/30 rounded-xl overflow-hidden ${isSaving ? 'opacity-70 pointer-events-none' : ''}`}>
      {isSaving && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-10">
          <div className="w-8 h-8 border-4 border-t-purple-500 border-purple-500/30 rounded-full animate-spin"></div>
        </div>
      )}
      
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
              {shoppingData.lastUpdated && (
                <span className="ml-2 opacity-60">
                  • Updated {format(new Date(shoppingData.lastUpdated), "MMM d, h:mm a")}
                </span>
              )}
            </p>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={printShoppingList}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Print shopping list"
              aria-label="Print shopping list"
              disabled={isSaving}
            >
              <Printer className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={downloadShoppingList}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Download as text"
              aria-label="Download as text"
              disabled={isSaving}
            >
              <Download className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={handleResetCheckedItems}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              title="Reset progress"
              aria-label="Reset progress"
              disabled={isSaving}
            >
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 mb-1 bg-black/20 h-2 rounded-full overflow-hidden">
        <div 
  className="h-full bg-gradient-to-r from-green-400 to-teal-500"
  style={{ width: `${progress}%` }}
></div>
        </div>
        <div className="flex justify-between items-center text-xs text-white/80">
          <span className="font-medium">{progress}% complete</span>
          <span>{shoppingData.numberOfRecipes} recipes</span>
        </div>
      </div>
      
      {/* Shopping list content */}
      <div className="p-4 space-y-4">
          {Object.entries(shoppingData.categorizedIngredients).map(([category, items]) => {
            // Get category stats
            const stats = shoppingData.categoryStats?.[category] || { total: items.length, checked: 0 };
            const allChecked = stats.checked === stats.total;
            const anyChecked = stats.checked > 0;
            
            return (
              <div
                key={category}
                //{ opacity: 0, y: 20 }}
                // opacity: 1, y: 0 }}
                // duration: 0.2 }}
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
                    {stats.checked > 0 && (
                      <span className="ml-2 text-xs bg-green-700/40 px-2 py-0.5 rounded-full text-white">
                        {stats.checked}/{stats.total} checked
                      </span>
                    )}
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
                    disabled={isSaving}
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
                  {expandedCategories[category] && (
                    <div
                      //{ opacity: 0, height: 0 }}
                      // opacity: 1, height: "auto" }}
                      // duration: 0.2 }}
                    >
                      <div className="p-3 space-y-2">
                        {items.map((item) => (
                          <div
                            key={`${category}-${item.name}`}
                            className={`p-3 border ${
                              item.checked 
                                ? "bg-green-900/10 border-green-700/30" 
                                : "bg-purple-900/10 border-purple-800/30"
                            } rounded-lg flex items-start`}
                             // scale: 1.005 }}
                            // duration: 0.1 }}
                          >
                            <button
                              onClick={() => handleToggleItem(category, item.name, item.checked)}
                              className={`flex-shrink-0 w-5 h-5 rounded mr-3 flex items-center justify-center ${
                                item.checked 
                                  ? "bg-green-500" 
                                  : "border border-purple-500/50"
                              }`}
                              aria-checked={item.checked}
                              role="checkbox"
                              disabled={isSaving}
                            >
                              {item.checked && <Check className="w-3 h-3 text-white" />}
                            </button>
                            
                            <div className="flex-1">
                              <div className={`font-medium ${item.checked ? "text-green-200 line-through" : "text-white"}`}>
                                {item.name}
                              </div>
                              
                              <div className="mt-1.5 space-y-1.5">
                                {item.items.map((subItem, idx) => (
                                  <div
                                    key={idx}
                                    className={`text-sm ${
                                      item.checked 
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
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            );
          })}
      </div>

      {/* Auto-organize suggestion */}
      {progress === 0 && (
        <div className="px-4 pb-4">
          <div 
            //{ opacity: 0, y: 10 }}
            // opacity: 1, y: 0 }}
            // delay: 0.5 }}
            className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg p-3 text-center"
          >
            <div className="flex items-center justify-center mb-2">
              <Sparkles className="w-4 h-4 text-pink-400 mr-2" />
              <span className="text-sm font-medium text-white">Shopping tip</span>
            </div>
            <p className="text-xs text-purple-200">
              Shop by category to save time! Start at the top and work your way down.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingList;