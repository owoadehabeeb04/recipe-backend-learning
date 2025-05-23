import { format } from "date-fns";
import { motion } from "framer-motion";
import React, { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/app/store/authStore";
import { toast } from "react-hot-toast";
import { Calendar as CalendarIcon, Check, X, Clock, AlertCircle } from "lucide-react";
import { connectMealPlanToGoogleCalendar, disconnectMealPlanFromGoogleCalendar, openGoogleAuthPopup } from "@/app/api/(meal-planner)/googleMealPlanner";


interface SavedPlan {
  id: string;
  name: string;
  date: Date;
  plan: any;
  notes?: string;
  connectedToCalendar?: boolean;
  calendarConnectionDate?: string;
}

interface SavedPlanDetailsModalProps {
  plan: SavedPlan;
  countMeals: (plan: any) => number;
  onClose: () => void;
  onViewDetails: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onLoad: (plan: SavedPlan) => void;
  id: string; // Meal plan ID
}

export const SavedPlanDetailsModal: React.FC<SavedPlanDetailsModalProps> = ({
  plan,
  countMeals,
  onClose,
  onViewDetails,
  onDelete,
  onDuplicate,
  onLoad,
  id
}) => {
  const { token } = useAuthStore();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [mealTimes, setMealTimes] = useState({
    breakfast: { hour: 8, minute: 0 },
    lunch: { hour: 12, minute: 30 },
    dinner: { hour: 19, minute: 0 },
    snack: { hour: 16, minute: 0 }
  });

  // Format time for display
  const formatTime = (hour: number, minute: number) => {
    const time = new Date();
    time.setHours(hour, minute);
    return time.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Update meal time
  const updateMealTime = (meal: string, field: 'hour' | 'minute', value: number) => {
    setMealTimes(prev => ({
      ...prev,
      [meal]: {
        ...prev[meal as keyof typeof prev],
        [field]: parseInt(value.toString(), 10)
      }
    }));
  };

  // Handle Google auth message
  const handleAuthMessage = useCallback(async (event: MessageEvent) => {
    // Verify origin for security
    if (event.origin !== window.location.origin) return;
    
    if (event.data && event.data.type === 'GOOGLE_AUTH_SUCCESS') {
      try {
        const accessToken = event.data.accessToken;
        
        if (isConnecting) {
          const response = await connectMealPlanToGoogleCalendar(
            id,
            accessToken,
            { mealTimes },
            token
          );

          if (response.success) {
            toast.success("Your meal plan has been connected to Google Calendar!");
            plan.connectedToCalendar = true;
            plan.calendarConnectionDate = new Date().toISOString();
          } else {
            toast.error(response.message || "Failed to connect to Google Calendar");
          }
          setIsConnecting(false);
          setShowTimeSettings(false);
        } else if (isDisconnecting) {
          const response = await disconnectMealPlanFromGoogleCalendar(
            id,
            accessToken,
            token
          );

          if (response.success) {
            toast.success("Your meal plan has been disconnected from Google Calendar");
            plan.connectedToCalendar = false;
            plan.calendarConnectionDate = undefined;
          } else {
            toast.error(response.message || "Failed to disconnect from Google Calendar");
          }
          setIsDisconnecting(false);
        }
      } catch (error) {
        console.error("Error with Google Calendar operation:", error);
        toast.error("An error occurred with Google Calendar");
        setIsConnecting(false);
        setIsDisconnecting(false);
        setShowTimeSettings(false);
      }
    } else if (event.data && event.data.type === 'GOOGLE_AUTH_ERROR') {
      toast.error(event.data.error || "Google authentication failed");
      setIsConnecting(false);
      setIsDisconnecting(false);
      setShowTimeSettings(false);
    }
  }, [id, token, mealTimes, plan, isConnecting, isDisconnecting]);

  // Set up message listener for the popup
  useEffect(() => {
    window.addEventListener('message', handleAuthMessage);
    
    return () => {
      window.removeEventListener('message', handleAuthMessage);
    };
  }, [handleAuthMessage]);

  // Connect to Google Calendar
  const handleConnectToGoogleCalendar = async () => {
    if (!token) {
      toast.error("You must be logged in to connect to Google Calendar");
      return;
    }

    setIsConnecting(true);
    try {
      openGoogleAuthPopup();
    } catch (error) {
      console.error("Error opening Google auth popup:", error);
      toast.error(error instanceof Error ? error.message : "Failed to open Google authentication");
      setIsConnecting(false);
    }
  };

  // Disconnect from Google Calendar
  const handleDisconnectFromGoogleCalendar = async () => {
    if (!token) {
      toast.error("You must be logged in to disconnect from Google Calendar");
      return;
    }

    if (!confirm("Are you sure you want to disconnect this meal plan from Google Calendar? All calendar events will be removed.")) {
      return;
    }

    setIsDisconnecting(true);
    try {
      openGoogleAuthPopup();
    } catch (error) {
      console.error("Error opening Google auth popup:", error);
      toast.error(error instanceof Error ? error.message : "Failed to open Google authentication");
      setIsDisconnecting(false);
    }
  };

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
            {format(new Date(plan.date), "MMMM d, yyyy")}
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
          {/* Calendar Connection Status */}
          <div className={`mb-6 p-4 rounded-xl border ${
            plan.connectedToCalendar 
              ? "bg-green-50 border-green-100" 
              : "bg-blue-50 border-blue-100"
          }`}>
            <div className="flex items-center mb-2">
              <CalendarIcon className={`h-5 w-5 mr-2 ${
                plan.connectedToCalendar ? "text-green-600" : "text-blue-600"
              }`} />
              <h3 className={`text-sm font-medium ${
                plan.connectedToCalendar ? "text-green-800" : "text-blue-800"
              }`}>
                {plan.connectedToCalendar 
                  ? "Connected to Google Calendar" 
                  : "Not connected to Google Calendar"}
              </h3>
            </div>
            
            {plan.connectedToCalendar && plan.calendarConnectionDate && (
              <p className="text-xs text-gray-600 mb-3">
                Connected on {format(new Date(plan.calendarConnectionDate), "MMMM d, yyyy 'at' h:mm a")}
              </p>
            )}
            
            {plan.connectedToCalendar ? (
              <button
                onClick={handleDisconnectFromGoogleCalendar}
                disabled={isDisconnecting}
                className="w-full py-2 px-3 mt-2 bg-white border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition duration-200 flex items-center justify-center shadow-sm text-sm"
              >
                {isDisconnecting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-t-red-500 border-red-500/30 rounded-full animate-spin mr-2"></div>
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <X className="h-4 w-4 mr-1.5" />
                    Disconnect from Calendar
                  </>
                )}
              </button>
            ) : (
              <>
                {showTimeSettings ? (
                  <div className="mt-3 bg-white p-4 rounded-lg border border-blue-100">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-blue-500" />
                      Meal Times Settings
                    </h4>
                    
                    {/* Time settings form */}
                    <div className="space-y-3 mb-4">
                      {['breakfast', 'lunch', 'dinner', 'snack'].map((meal) => (
                        <div key={meal} className="flex items-center justify-between">
                          <label className="text-sm capitalize text-gray-700">{meal}:</label>
                          <div className="flex items-center space-x-1">
                            <select 
                              value={mealTimes[meal as keyof typeof mealTimes].hour}
                              onChange={(e) => updateMealTime(meal, 'hour', parseInt(e.target.value))}
                              className="text-xs p-1 border border-gray-300 rounded"
                            >
                              {Array.from({ length: 24 }, (_, i) => (
                                <option key={i} value={i}>{i.toString().padStart(2, '0')}</option>
                              ))}
                            </select>
                            <span>:</span>
                            <select 
                              value={mealTimes[meal as keyof typeof mealTimes].minute}
                              onChange={(e) => updateMealTime(meal, 'minute', parseInt(e.target.value))}
                              className="text-xs p-1 border border-gray-300 rounded"
                            >
                              {[0, 15, 30, 45].map((min) => (
                                <option key={min} value={min}>{min.toString().padStart(2, '0')}</option>
                              ))}
                            </select>
                            <span className="text-xs text-gray-500">
                              {formatTime(
                                mealTimes[meal as keyof typeof mealTimes].hour, 
                                mealTimes[meal as keyof typeof mealTimes].minute
                              )}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={handleConnectToGoogleCalendar}
                        disabled={isConnecting}
                        className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center shadow-sm text-sm"
                      >
                        {isConnecting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-t-white border-white/30 rounded-full animate-spin mr-2"></div>
                            Connecting...
                          </>
                        ) : (
                          <>
                            <CalendarIcon className="h-4 w-4 mr-1.5" />
                            Sign In With Google
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setShowTimeSettings(false)}
                        className="py-2 px-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition duration-200 flex items-center justify-center shadow-sm text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowTimeSettings(true)}
                    className="w-full py-2 px-3 mt-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 flex items-center justify-center shadow-sm text-sm"
                  >
                    <CalendarIcon className="h-4 w-4 mr-1.5" />
                    Connect to Google Calendar
                  </button>
                )}
              </>
            )}
          </div>
          
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