import { Check, ShoppingBag } from "lucide-react";

interface GroceryListProps {
  weekPlan: any;
}

export const GroceryList = ({ weekPlan }: GroceryListProps) => {
    // This would normally calculate ingredients from recipes
    // For now, just show a placeholder implementation
    
    const groceryItems = [
      { name: "Avocados", quantity: "2", category: "Produce", checked: false },
      { name: "Whole Grain Bread", quantity: "1 loaf", category: "Bakery", checked: false },
      { name: "Chicken Breast", quantity: "500g", category: "Meat", checked: false },
      { name: "Pasta", quantity: "250g", category: "Pantry", checked: false },
      { name: "Mixed Vegetables", quantity: "1 bag", category: "Produce", checked: false },
      { name: "Eggs", quantity: "12", category: "Dairy", checked: false },
      { name: "Milk", quantity: "1L", category: "Dairy", checked: false },
      { name: "Olive Oil", quantity: "1 bottle", category: "Pantry", checked: false },
    ];
    
    // Group by category
    const groupedItems = groceryItems.reduce<Record<string, typeof groceryItems>>((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {});
    
    return (
      <div className="bg-white rounded-xl p-5 shadow-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center">
            <ShoppingBag className="mr-2 text-purple-500" size={20} />
            Grocery List
          </h3>
          <button className="text-sm text-purple-600 font-medium hover:text-purple-700">
            Export List
          </button>
        </div>
        
        <div className="max-h-80 overflow-y-auto pr-2">
          {Object.entries(groupedItems).map(([category, items]) => (
            <div key={category} className="mb-4">
              <h4 className="font-medium text-gray-700 mb-2">{category}</h4>
              <ul className="space-y-2">
                {items.map((item, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg">
                    <div className="w-5 h-5 border border-purple-300 rounded flex items-center justify-center">
                      {item.checked && <Check size={12} className="text-purple-500" />}
                    </div>
                    <span className="flex-1">{item.name}</span>
                    <span className="text-sm text-gray-500">{item.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <button className="mt-4 w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition flex items-center justify-center">
          <ShoppingBag className="mr-2" size={18} />
          Generate Complete List
        </button>
      </div>
    );
  };