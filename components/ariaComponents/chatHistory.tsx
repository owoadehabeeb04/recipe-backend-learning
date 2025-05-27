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
  ChevronRight
} from "lucide-react";
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from "date-fns";
import { createChat, getChats, searchChats, deleteChat as deleteApiChat } from "@/app/api/(chatbot)/chat";
import { useAuthStore } from "@/app/store/authStore";

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
}

// Type for categorized chats
interface CategorizedChats {
  today: ApiChat[];
  yesterday: ApiChat[];
  thisWeek: ApiChat[];
  thisMonth: ApiChat[];
  lastMonth: ApiChat[];
  earlier: ApiChat[];
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ selectedChatId, onSelectChat }) => {
  const { token } = useAuthStore();
  const [chats, setChats] = useState<ApiChat[]>([]);
  const [categorizedChats, setCategorizedChats] = useState<CategorizedChats>({
    today: [],
    yesterday: [],
    thisWeek: [],
    thisMonth: [],
    lastMonth: [],
    earlier: []
  });

  // Track which categories are expanded
  const [expandedCategories, setExpandedCategories] = useState({
    today: true,
    yesterday: true,
    thisWeek: true,
    thisMonth: true,
    lastMonth: true,
    earlier: true
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Load chat history
  useEffect(() => {
    fetchChats();
  }, [token]);

  // Categorize chats whenever the chats array changes
  useEffect(() => {
    const categorize = (chats: ApiChat[]) => {
      const result: CategorizedChats = {
        today: [],
        yesterday: [],
        thisWeek: [],     // Will be "Previous 7 Days" in UI
        thisMonth: [],    // Will be "Previous 30 Days" in UI
        lastMonth: [],    // This won't be used anymore
        earlier: []
      };
  
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      
      const thirtyDaysAgo = new Date(now);
      thirtyDaysAgo.setDate(now.getDate() - 30);
  
      chats.forEach(chat => {
        const date = new Date(chat.updatedAt);
        
        if (isToday(date)) {
          result.today.push(chat);
        } else if (isYesterday(date)) {
          result.yesterday.push(chat);
        } else if (date >= sevenDaysAgo) {
          // Previous 7 days (excluding today and yesterday)
          result.thisWeek.push(chat);
        } else if (date >= thirtyDaysAgo) {
          // Previous 30 days (excluding the first 7 days)
          result.thisMonth.push(chat);
        } else {
          // Older than 30 days
          result.earlier.push(chat);
        }
      });
  
      setCategorizedChats(result);
    };
  
    categorize(chats);
  }, [chats]);
function isLastMonth(date: Date, now: Date): boolean {
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();
  
  // Get last month (handling January case where last month is December of previous year)
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
  
  return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
}
  const fetchChats = async () => {
    if (!token) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await getChats(token);

      if (response && response.success && response.data) {
        console.log(response, 'CHATS GOTTEN')
        const filteredChats = response.data.filter((chat: any) =>
          chat.lastMessage !== undefined &&
          chat.lastMessage !== null &&
          chat.lastMessage !== ""
        );

        setChats(filteredChats);
      } else {
        setError("Failed to load chats");
      }
    } catch (error) {
      console.error("Error fetching chats:", error);
      setError("Failed to load your conversations");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle search when searchTerm changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchTerm) {
        handleSearch();
      } else if (searchTerm === "") {
        // If search is cleared, fetch all chats
        fetchChats();
      }
    }, 500);  // 500ms delay for debounce

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleSearch = async () => {
    if (!token || searchTerm.trim() === "") return;

    try {
      setIsSearching(true);
      setError(null);

      const response = await searchChats(token, searchTerm);

      if (response && response.success && response.data) {
        // Combine chats from direct matches and message matches
        const directMatches = response.data.chats || [];

        // For message matches, we want to convert them to a similar format as chats
        const messageMatches = (response.data.messageMatches || []).map((match: any) => ({
          _id: match._id,
          title: match.chatTitle,
          lastMessage: match.matches[0]?.content || "",
          updatedAt: match.matches[0]?.createdAt || new Date().toISOString(),
          messageMatchCount: match.matchCount
        }));

        const allMatches = [...directMatches];
        messageMatches.forEach((match: { _id: any; }) => {
          if (!allMatches.some(chat => chat._id === match._id)) {
            allMatches.push(match);
          }
        });

        setChats(allMatches);
      } else {
        setError("Failed to search conversations");
      }
    } catch (error) {
      console.error("Error searching chats:", error);
      setError("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const deleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!token) return;

    try {
      setIsDeleting(chatId);

      const response = await deleteApiChat(token, chatId);

      if (response && response.success) {
        // Remove from local state
        setChats(chats.filter((chat) => chat._id !== chatId));

        // If this was the selected chat, select a new one
        if (selectedChatId === chatId) {
          onSelectChat("new");
        }
      } else {
        setError("Failed to delete conversation");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
      setError("Failed to delete conversation");
    } finally {
      setIsDeleting(null);
    }
  };

  const startNewChat = async () => {
    if (!token) return;

    try {
      setIsCreating(true);
      setError(null);

      const response = await createChat(token);

      if (response && response.success && response.data) {
        // Add the new chat to the list
        setChats(prevChats => [response.data, ...prevChats]);
        // Select the new chat
        onSelectChat(response.data._id);
      } else {
        setError("Failed to create new conversation");
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
      setError("Failed to create new conversation");
    } finally {
      setIsCreating(false);
    }
  };

  // Toggle category expansion
  const toggleCategory = (category: keyof CategorizedChats) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    // If today, show time
    if (isToday(date)) {
      return format(date, "h:mm a");
    }

    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return format(date, "MMM d");
    }

    // Otherwise show date with year
    return format(date, "MMM d, yyyy");
  };

  const renderCategorySection = (title: string, chats: ApiChat[], categoryKey: keyof CategorizedChats) => {
    if (chats.length === 0) return null;

    return (
      <div className="mb-2">
    <button
  onClick={() => toggleCategory(categoryKey)}
  className="w-full flex items-center text-xs text-purple-300 py-1.5 md:py-1 px-2 mb-1 hover:bg-purple-900/20 rounded-md min-h-[32px]"
>
  {expandedCategories[categoryKey] ? (
    <ChevronDown className="w-3.5 h-3.5 mr-1" />
  ) : (
    <ChevronRight className="w-3.5 h-3.5 mr-1" />
  )}
  <span className="font-medium">{title}</span>
  <span className="ml-auto bg-purple-900/40 px-2 py-0.5 rounded-full text-xs">
    {chats.length}
  </span>
</button>

        {expandedCategories[categoryKey] && (
          <div className="space-y-1">
            {chats.map((chat) => (
              <div
                key={chat._id}
                onClick={() => onSelectChat(chat._id)}
                className={`p-2.5 md:p-3 rounded-lg cursor-pointer ${
                  selectedChatId === chat._id
                    ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30"
                    : "hover:bg-purple-900/20 border border-transparent"
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-white text-sm truncate max-w-[65%] md:max-w-[70%]">
                    {chat.title}
                  </h3>
                  <div className="flex items-center">
                    <span className="text-xs text-purple-400 mr-2 hidden xs:inline">
                      {formatDate(chat.updatedAt)}
                    </span>
                    <button
                      onClick={(e) => deleteChat(chat._id, e)}
                      className={`p-1.5 md:p-1 ${
                        isDeleting === chat._id ? 'text-pink-500' : 'text-purple-400 hover:text-pink-400'
                      } rounded-full hover:bg-purple-800/30`}
                      disabled={isDeleting !== null}
                    >
                      {isDeleting === chat._id ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
                {/* Show date for mobile as a separate row */}
                <span className="text-xs text-purple-400 xs:hidden">
                  {formatDate(chat.updatedAt)}
                </span>
                <p className="text-xs text-purple-300 truncate mt-1">
                  {chat.lastMessage || "No messages yet"}
                </p>
                <div className="flex items-center mt-2">
                  <MessageSquare className="w-3 h-3 text-purple-400 mr-1" />
                  <span className="text-xs text-purple-400">
                    {chat.messageCount || 0} messages
                  </span>

                  {/* Show if this was a message match from search */}
                  {chat.messageMatchCount && chat.messageMatchCount > 0 && searchTerm && (
                    <span className="ml-2 bg-purple-700/40 text-purple-300 text-xs px-1.5 py-0.5 rounded-full">
                      {chat.messageMatchCount} matches
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-[70vh] md:h-[70vh] bg-black/40 backdrop-blur-sm border border-purple-900/30 rounded-xl flex flex-col max-h-[calc(100vh-140px)] overflow-hidden">
      {/* Header - slight padding adjustments for mobile */}
      <div className="p-3 md:p-4 border-b border-purple-800/30">
        <h2 className="font-medium text-white mb-2 md:mb-3">Recent Conversations</h2>

        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-purple-900/20 border border-purple-700/30 rounded-lg pl-8 pr-3 py-2 md:py-2 text-sm text-white focus:outline-none focus:border-purple-500/50"
            disabled={isLoading}
          />
          {isSearching && (
            <Loader2 className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-purple-400 animate-spin" />
          )}
        </div>

        {error && (
          <div className="mt-2 p-2 bg-red-900/20 text-red-300 text-xs rounded-lg flex items-center">
            <AlertCircle className="w-3 h-3 mr-1 flex-shrink-0" />
            {error}
          </div>
        )}
      </div>

      <div className="px-3 md:px-4 pt-3 pb-1">
        <button
          onClick={startNewChat}
          disabled={isCreating}
          className="w-full px-3 py-2.5 md:py-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 text-white rounded-lg border border-purple-600/30 flex items-center justify-center text-sm transition-colors disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              New Conversation
            </>
          )}
        </button>
      </div>

      {/* Chat list - optimized scrolling for mobile */}
      <div className="flex-1 overflow-y-auto p-1.5 md:p-2 overscroll-contain">
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="p-3 rounded-lg border border-purple-800/30 animate-pulse"
              >
                <div className="h-4 bg-purple-800/40 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-purple-800/30 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        ) : searchTerm ? (
          // When searching, show flat list
          <div className="space-y-1">
            {chats.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <MessageSquare className="w-8 h-8 text-purple-500/50 mb-2" />
                <p className="text-sm text-purple-300">
                  No conversations match your search
                </p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => onSelectChat(chat._id)}
                  className={`p-2.5 md:p-3 rounded-lg cursor-pointer ${
                    selectedChatId === chat._id
                      ? "bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30"
                      : "hover:bg-purple-900/20 border border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium text-white text-sm truncate max-w-[65%] md:max-w-[70%]">
                      {chat.title}
                    </h3>
                    <div className="flex items-center">
                      <span className="text-xs text-purple-400 mr-2 hidden xs:inline">
                        {formatDate(chat.updatedAt)}
                      </span>
                      <button
                        onClick={(e) => deleteChat(chat._id, e)}
                        className={`p-1.5 md:p-1 ${
                          isDeleting === chat._id ? 'text-pink-500' : 'text-purple-400 hover:text-pink-400'
                        } rounded-full hover:bg-purple-800/30`}
                        disabled={isDeleting !== null}
                      >
                        {isDeleting === chat._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                  {/* Show date for mobile as a separate row */}
                  <span className="text-xs text-purple-400 xs:hidden">
                    {formatDate(chat.updatedAt)}
                  </span>
                  <p className="text-xs text-purple-300 truncate mt-1">
                    {chat.lastMessage || "No messages yet"}
                  </p>
                  <div className="flex items-center mt-2">
                    <MessageSquare className="w-3 h-3 text-purple-400 mr-1" />
                    <span className="text-xs text-purple-400">
                      {chat.messageCount || 0} messages
                    </span>

                    {chat.messageMatchCount && chat.messageMatchCount > 0 && searchTerm && (
                      <span className="ml-2 bg-purple-700/40 text-purple-300 text-xs px-1.5 py-0.5 rounded-full">
                        {chat.messageMatchCount} matches
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <>
            {renderCategorySection("Today", categorizedChats.today, "today")}
            {renderCategorySection("Yesterday", categorizedChats.yesterday, "yesterday")}
            {renderCategorySection("Previous 7 Days", categorizedChats.thisWeek, "thisWeek")}
            {renderCategorySection("Previous 30 Days", categorizedChats.thisMonth, "thisMonth")}
            {renderCategorySection("Earlier", categorizedChats.earlier, "earlier")}
            {chats.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <MessageSquare className="w-8 h-8 text-purple-500/50 mb-2" />
                <p className="text-sm text-purple-300">
                  No conversations yet
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;
