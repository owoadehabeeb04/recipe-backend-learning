import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useState } from "react";

interface SavePlanModalProps {
  onSave: (name: string, notes?: string) => void;
  onClose: () => void;
  isLoading?: boolean;
}

export const SavePlanModal: React.FC<SavePlanModalProps> = ({ 
  onSave, 
  onClose, 
  isLoading = false 
}) => {
  const [planName, setPlanName] = useState("");
  const [notes, setNotes] = useState("");
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim()) return;
    onSave(planName, notes);
  };
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto bg-purple-100 rounded-full flex items-center justify-center text-purple-500 mb-4">
            <Save size={24} />
          </div>
          <h2 className="text-xl font-bold text-gray-800">Save Your Meal Plan</h2>
          <p className="text-gray-500 mt-1">You can reuse this plan in the future</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="planName" className="block text-sm font-medium mb-1 text-gray-700">Plan Name</label>
            <input
              id="planName"
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="w-full p-3 border text-gray-800 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
              placeholder="e.g., Weekly Meal Plan"
              required
              autoFocus
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="planNotes" className="block text-sm font-medium mb-1 text-gray-700">Notes (Optional)</label>
            <textarea
              id="planNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special notes for this plan..."
              className="w-full text-gray-800 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-24 resize-none"
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 justify-end">
            <button 
              type="button" 
              onClick={onClose}
              className="px-5 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-5 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:opacity-90 transition flex items-center"
              disabled={isLoading || !planName.trim()}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                'Save Plan'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};