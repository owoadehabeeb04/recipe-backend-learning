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
      className="h-full w-full flex flex-col overflow-hidden bg-card border-r border-border relative"
    >
      {/* Logo and title area */}
      <div className="px-4 py-4 border-b border-border bg-card flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
            </div>
            <h1 className="text-lg font-semibold ml-2 text-foreground">
              Aria
            </h1>
          </div>
          
          {isMobile && (
            <button 
              onClick={onCloseMobile}
              className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
      
      {/* New chat button */}
      <div className="px-3 pt-4 pb-3 flex-shrink-0">
        <button
          onClick={handleCreateNewChat}
          className="w-full flex items-center justify-center p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-colors font-medium"
          disabled={isLoading}
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          <span>New conversation</span>
        </button>
      </div>

      {/* Search area */}
      <div className="px-3 pb-4 flex-shrink-0">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Search conversations..."
            className="w-full px-9 py-2.5 bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
          <Search 
            className="absolute left-3 top-3.5 w-4.5 h-4.5 text-muted-foreground" 
          />
          {isSearching && (
            <Loader2 className="absolute right-3 top-3.5 w-4.5 h-4.5 text-primary animate-spin" />
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-3 p-2.5 mb-2 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive flex items-center flex-shrink-0">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Chat list - ensure it takes available space and scrolls, with bottom padding for the fixed button */}
      <div 
        className="flex-1 min-h-0 overflow-y-auto px-2 py-1 pb-20 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent"
      >
        {/* Categorized chats */}
        {Object.entries(categorizedChats).map(([category, categoryChats]) => {
          if (categoryChats.length === 0) return null;
          
          return (
            <div key={category} className="mb-3">
              {/* Category header */}
              <button 
                className="w-full flex items-center justify-between px-3 py-1.5 text-muted-foreground hover:text-foreground text-sm font-medium hover:bg-muted/50 rounded-md transition-colors"
                onClick={() => toggleCategory(category)}
              >
                <span className="text-foreground">{categoryNames[category]}</span>
                <div className="h-5 w-5 flex items-center justify-center rounded-full bg-muted">
                  {expandedCategories[category] ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>
              
              {/* Category chats */}
              {expandedCategories[category] && (
                <div className="mt-1 space-y-0.5 pl-1">
                  {categoryChats.map((chat: any) => (
                    <div
                      key={chat._id}
                      className={`p-2.5 rounded-lg cursor-pointer group flex items-center justify-between relative overflow-hidden ${
                        selectedChatId === chat._id
                          ? "bg-primary/10 text-foreground border border-primary/30"
                          : "hover:bg-muted text-foreground"
                      } transition-all duration-200`}
                      onClick={() => {
                        onSelectChat(chat._id);
                        if (isMobile && onCloseMobile) onCloseMobile();
                      }}
                    >
                      <div className="flex items-center z-10">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                          selectedChatId === chat._id 
                            ? "bg-primary text-primary-foreground" 
                            : "bg-muted text-muted-foreground"
                        }`}>
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {chat.title || "New conversation"}
                          </p>
                          <p className="text-xs truncate text-muted-foreground">
                            {formatDate(new Date(chat.updatedAt))}
                          </p>
                        </div>
                      </div>
                      
                      {/* Delete button */}
                      <button
                        onClick={(e) => handleDeleteChat(chat._id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-all z-10"
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
        
        {/* Empty state */}
        {chats.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-foreground font-medium">No conversations yet</p>
            <p className="text-sm mt-1 text-muted-foreground">Start a new conversation to chat with Aria</p>
          </div>
        )}
        
        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <div className="relative">
              <div className="w-10 h-10 border-2 border-muted rounded-full"></div>
              <div className="absolute inset-0 border-t-2 border-primary rounded-full animate-spin"></div>
            </div>
          </div>
        )}
      </div>
      
      {/* Back to dashboard button - fixed at bottom, more prominent */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-border bg-card backdrop-blur-sm flex-shrink-0 z-20 shadow-lg">
        <button 
          onClick={handleBackToDashboard}
          className="flex items-center justify-center w-full mx-3 my-3 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-medium transition-colors shadow-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
          </svg>
          <span>Back to Dashboard</span>
        </button>
      </div>
    </div>
  );
};

export default ChatHistory;
