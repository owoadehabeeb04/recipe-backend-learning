"use client";

import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Search,
  PlusCircle,
  Trash2,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Sparkles
} from "lucide-react";
import { format, isToday, isYesterday } from "date-fns";
import { createChat, getChats, searchChats, deleteChat as deleteApiChat } from "@/app/api/(chatbot)/chat";
import { useAuthStore } from "@/app/store/authStore";
import { useInView } from 'react-intersection-observer';
import { useRouter } from 'next/navigation';

// Chat interfaces
interface ApiChat {
  _id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
  messageCount?: number;
  messageMatchCount?: number;
}

interface ChatHistoryProps {
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  isMobile?: boolean;
  onCloseMobile?: () => void;
}

// Type for categorized chats
interface CategorizedChats {
  today: ApiChat[];
  yesterday: ApiChat[];
  previous7Days: ApiChat[];
  previous30Days: ApiChat[];
  earlier: ApiChat[];
}

// Filtering logic for chats
// const filterChats = (chats: ApiChat[]): ApiChat[] => {
//   return chats.filter(chat => {    
//     return true;
//   });
// };

const ChatHistory: React.FC<ChatHistoryProps> = ({ 
  selectedChatId, 
  onSelectChat,
  isMobile = false,
  onCloseMobile
}) => {
  const { token } = useAuthStore();
  const [chats, setChats] = useState<ApiChat[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    today: true,
    yesterday: true,
    previous7Days: true,
    previous30Days: true,
    earlier: true,
  });
  const router = useRouter();
  
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Load chats on component mount
  useEffect(() => {
    if (token) {
      loadChats();
    }
  }, [token]);

  // Function to load all chats
  const loadChats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getChats(token);
      if (response.success) {
        // Apply filtering to the chats before setting state
        // const filteredChats = filterChats(response.data || []);
        setChats(response.data || []);
      } else {
        throw new Error(response.message || "Failed to load chats");
      }
    } catch (err: any) {
      console.error("Error loading chats:", err);
      setError(err.message || "Failed to load chat history");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle search
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      await loadChats();
      return;
    }

    setIsSearching(true);
    setError(null);
    try {
      const response = await searchChats(token, searchQuery);
      if (response.success) {
        // Apply filtering to search results too
        // const filteredChats = filterChats(response.data || []);
        setChats(response.data);
      } else {
        throw new Error(response.message || "Search failed");
      }
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Search failed");
    } finally {
      setIsSearching(false);
    }
  };

  // Handle create new chat
  const handleCreateNewChat = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await createChat(token);
      if (result.success && result.data) {
        onSelectChat(result.data._id);
        await loadChats(); // Refresh the chat list
      } else {
        throw new Error("Failed to create new chat");
      }
    } catch (err: any) {
      console.error("Error creating chat:", err);
      setError(err.message || "Failed to create new chat");
    } finally {
      setIsLoading(false);
    }
    
    // Close mobile sidebar if applicable
    if (isMobile && onCloseMobile) {
      onCloseMobile();
    }
  };

  // Handle delete chat
  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this chat?")) return;

    try {
      setIsLoading(true);
      const result = await deleteApiChat(token, chatId);
      if (result.success) {
        setChats(chats.filter(chat => chat._id !== chatId));
        if (selectedChatId === chatId) {
          onSelectChat("new");
        }
      } else {
        throw new Error("Failed to delete chat");
      }
    } catch (err: any) {
      console.error("Error deleting chat:", err);
      setError(err.message || "Failed to delete chat");
    } finally {
      setIsLoading(false);
    }
  };

  // Format the date for display
  const formatDate = (date: Date): string => {
    if (isToday(date)) return `Today, ${format(date, "h:mm a")}`;
    if (isYesterday(date)) return `Yesterday, ${format(date, "h:mm a")}`;
    return format(date, "MMM d, yyyy");
  };

  // Group chats by date category
  const categorizeChats = (chats: ApiChat[]): CategorizedChats => {
    const now = new Date();
    const categorized: CategorizedChats = {
      today: [],
      yesterday: [],
      previous7Days: [],
      previous30Days: [],
      earlier: []
    };

    // Helper function to get days difference
    const getDaysDifference = (date1: Date, date2: Date): number => {
      const diffTime = Math.abs(date2.getTime() - date1.getTime());
      return Math.floor(diffTime / (1000 * 60 * 60 * 24));
    };

    chats?.forEach(chat => {
      const chatDate = new Date(chat.updatedAt);
      const daysDiff = getDaysDifference(now, chatDate);
      
      if (isToday(chatDate)) {
        categorized.today.push(chat);
      } else if (isYesterday(chatDate)) {
        categorized.yesterday.push(chat);
      } else if (daysDiff < 7) {
        // More than yesterday but less than 7 days old
        categorized.previous7Days.push(chat);
      } else if (daysDiff < 30) {
        // Between 7 and 30 days old
        categorized.previous30Days.push(chat);
      } else {
        // Older than 30 days
        categorized.earlier.push(chat);
      }
    });

    return categorized;
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const categorizedChats = categorizeChats(chats);
  
  // Animation variants
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  // Handle going back to dashboard
  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  // Update the category names in the render section
  const categoryNames: Record<string, string> = {
    today: "Today",
    yesterday: "Yesterday",
    previous7Days: "Previous 7 Days",
    previous30Days: "Previous 30 Days",
    earlier: "Earlier"
  };

  return (
    <div 
      ref={ref} 
      className="h-[97vh] w-full flex flex-col overflow-hidden bg-gradient-to-b from-gray-900 via-gray-900 to-gray-950 border-r border-gray-800 shadow-xl relative"
    >
      {/* Logo and title area - enhanced with gradient */}
      <div className="px-4 py-5 border-b mt-12 border-gray-800/80 backdrop-blur-sm bg-black/20 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 p-0.5 shadow-lg">
              <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-purple-300" />
              </div>
            </div>
            <h1 className="text-xl font-bold ml-3 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-400">
              Aria
            </h1>
          </div>
          
          {isMobile && (
            <button 
              onClick={onCloseMobile}
              className="p-1.5 rounded-full hover:bg-gray-800/80 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* New chat button - enhanced with better gradient */}
      <div className="px-3 pt-4 pb-3 flex-shrink-0">
        <button
          onClick={handleCreateNewChat}
          className="group w-full flex items-center justify-center p-3 relative bg-gradient-to-br from-purple-600/10 to-pink-600/10 hover:from-purple-600/20 hover:to-pink-600/20 rounded-lg border border-purple-900/40 hover:border-purple-500/40 transition-all duration-300"
          disabled={isLoading}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <PlusCircle className="w-5 h-5 mr-2 text-purple-300" />
          <span className="font-medium text-purple-50">New conversation</span>
        </button>
      </div>

      {/* Search area - refined design */}
      <div className="px-3 pb-4 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search conversations..."
            className="w-full px-9 py-2.5 bg-gray-800/60 border border-gray-700/80 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/50 transition-all"
          />
          <Search 
            className="absolute left-3 top-3.5 w-4.5 h-4.5 text-gray-500" 
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-3.5 w-4.5 h-4.5 text-purple-400 animate-spin" />
          )}
        </div>
      </div>

      {/* Error message - slightly enhanced */}
      {error && (
        <div className="mx-3 p-2.5 mb-2 bg-red-900/20 border border-red-700/30 rounded-lg text-sm text-red-300 flex items-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Chat list - ensure it takes available space and scrolls, with bottom padding for the fixed button */}
      <div 
        className="flex-1 min-h-0 overflow-y-auto px-2 py-1 pb-16 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
         //inView ? "visible" : "hidden"}
      >
        {/* Categorized chats */}
        {Object.entries(categorizedChats).map(([category, categoryChats]) => {
          if (categoryChats.length === 0) return null;
          
          return (
            <div key={category} className="mb-3">
              {/* Category header - enhanced */}
              <button 
                className="w-full flex items-center justify-between px-3 py-1.5 text-gray-400 hover:text-gray-300 text-sm font-medium bg-gradient-to-r from-gray-800/20 to-transparent rounded-md"
                onClick={() => toggleCategory(category)}
              >
                <span className="text-gray-300">{categoryNames[category]}</span>
                <div className="h-5 w-5 flex items-center justify-center rounded-full bg-gray-800/80">
                  {expandedCategories[category] ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>
              
              {/* Category chats with enhanced styling */}
              {expandedCategories[category] && (
                <div className="mt-1 space-y-0.5 pl-1">
                  {categoryChats.map((chat: any) => (
                    <div
                      key={chat._id}
                      className={`p-2.5 rounded-lg cursor-pointer group flex items-center justify-between relative overflow-hidden ${
                        selectedChatId === chat._id
                          ? "bg-gradient-to-r from-purple-700/30 to-pink-700/20 text-white shadow-sm"
                          : "hover:bg-gray-800/40 text-gray-300"
                      } transition-all duration-200`}
                      onClick={() => {
                        onSelectChat(chat._id);
                        if (isMobile && onCloseMobile) onCloseMobile();
                      }}
                    >
                      {/* Subtle gradient overlay for selected items */}
                      {selectedChatId === chat._id && (
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-400/5 to-pink-400/5"></div>
                      )}
                      
                      <div className="flex items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          selectedChatId === chat._id 
                            ? "bg-gradient-to-br from-purple-600/60 to-pink-600/60" 
                            : "bg-gray-800"
                        }`}>
                          <MessageSquare className="w-3.5 h-3.5 text-purple-200" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`truncate text-sm font-medium ${
                            selectedChatId === chat._id ? "text-white" : ""
                          }`}>
                            {chat.title || "New conversation"}
                          </p>
                          <p className={`text-xs truncate ${
                            selectedChatId === chat._id ? "text-purple-200/70" : "text-gray-500"
                          }`}>
                            {formatDate(new Date(chat.updatedAt))}
                          </p>
                        </div>
                      </div>
                      
                      {/* Delete button with enhanced hover effect */}
                      <button
                        onClick={(e) => handleDeleteChat(chat._id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-red-500/20 text-gray-400 hover:text-red-400 transition-all z-10"
                        aria-label="Delete chat"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        
        {/* Empty state - enhanced */}
        {chats.length === 0 && !isLoading && (
          <div 
            className="text-center py-12"
          >
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-purple-300/50" />
            </div>
            <p className="text-gray-300 font-medium">No conversations yet</p>
            <p className="text-sm mt-1 text-gray-500">Start a new conversation to chat with Aria</p>
          </div>
        )}
        
        {/* Loading state - enhanced */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-gray-800 rounded-full"></div>
              <div className="absolute inset-0 border-t-2 border-purple-500 rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Back to dashboard link - fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-800/50 bg-gradient-to-b from-gray-900/80 via-gray-900/95 to-gray-950 backdrop-blur-sm flex-shrink-0 z-20">
        <button 
          onClick={handleBackToDashboard}
          className="flex items-center cursor-pointer text-gray-400 hover:text-white p-3 mx-3 my-2 rounded-lg hover:bg-gradient-to-r hover:from-gray-800/60 hover:to-gray-800/20 w-[calc(100%-24px)] transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default ChatHistory;
