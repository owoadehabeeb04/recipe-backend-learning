import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizontal, Mic, MicOff, Sparkles, Image, PlusCircle, Loader2, X, AlertCircle, MessageSquare, AlertTriangle } from 'lucide-react';
import axios from 'axios';
import ChatMessage from './chatMessage';
import SuggestionChip from './suggestionChip';
import { useAuthStore } from '@/app/store/authStore';
import { createChat, getChatMessages, sendMessage } from '@/app/api/(chatbot)/chat';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  message: string;
  timestamp: Date;
  isNew?: boolean; 
}

interface ChatInfo {
  messageCount: number;
  totalLimit: number;
  remainingPairs: number;
  isApproachingLimit: boolean;
}

interface AriaInterfaceProps {
  selectedChatId: string | null;
  setSelectedChatId: (chatId: string | null) => void;
}

const AriaInterface: React.FC<AriaInterfaceProps> = ({ selectedChatId, setSelectedChatId }) => {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [suggestions] = useState([
    'What can I make with chicken and broccoli?',
    'Help me plan a Mediterranean dinner',
    "What's a quick pasta recipe?",
    'How do I cook rice perfectly?',
    'Suggest a dessert for date night'
  ]);
  console.log({messages})
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load messages when chat ID changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChatId || selectedChatId === 'new' || !token) {
        // Clear messages for new chat
        setMessages([]);
        setChatInfo(null);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const result: any = await getChatMessages(token, selectedChatId);

        if (result.success && result.data) {
          console.log('RESULT ENTERING MESSAGES', result)
          const formattedMessages = result.data.map((msg: any) => ({
            id: msg._id,
            role: msg.role,
            message: msg.content,
            timestamp: new Date(msg.createdAt),
            isNew: false 
          }));

          setMessages(formattedMessages);

          // Set chat info if available
          if (result.data.chatInfo) {
            setChatInfo(result.data.chatInfo);
          }
        } else {
          throw new Error('Failed to load messages');
        }
      } catch (err) {
        console.error('Error loading messages:', err);
        setError('Failed to load messages. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    loadMessages();
  }, [selectedChatId, token]);

  useEffect(() => {
    console.log({ input });
  }, []);

  // Create a new chat
  const handleCreateNewChat = async () => {
    if (!token) {
      setError('You must be logged in to create a new chat');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result: any = await createChat(token);
      console.log({ result });
      if (result.success && result.data) {
        // Select the newly created chat
        setSelectedChatId(result.data._id);
      } else {
        throw new Error('Failed to create new chat');
      }
    } catch (err) {
      console.error('Error creating chat:', err);
      setError('Failed to create a new chat. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || isLoading) return;

    if (!token) {
      setError('You must be logged in to send messages');
      return;
    }

    // If no chat is selected or it's 'new', create a new chat first
    if (!selectedChatId || selectedChatId === 'new') {
      try {
        setIsLoading(true);
        setError(null);

        const result: any = await createChat(token);

        if (result.success && result.data) {
          setSelectedChatId(result.data._id);
          await sendMessageToChat(result.data._id, input);
        } else {
          throw new Error('Failed to create new chat');
        }
      } catch (err) {
        console.error('Error creating chat:', err);
        setError('Failed to create a new chat. Please try again.');
        setIsLoading(false);
      }
    } else {
      await sendMessageToChat(selectedChatId, input);
    }
  };

  // Helper function to send message to a specific chat
  const sendMessageToChat = async (chatId: string, message: string) => {
    if (!token) return;

    // Add user message to UI immediately for better UX
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      message: message,
      timestamp: new Date(),
      isNew: true // Mark as new
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      // Send message to API
      const result = await sendMessage(token, chatId, message);

      if (result.success && result.data) {
        const { userMessage: apiUserMsg, aiMessage: assistantMessage, chatInfo: updatedChatInfo } = result.data;

        if (updatedChatInfo) {
          setChatInfo(updatedChatInfo);
        }

        if (assistantMessage) {
          const formattedAssistantMessage: Message = {
            id: assistantMessage._id,
            role: 'assistant',
            message: assistantMessage.content,
            timestamp: new Date(assistantMessage.createdAt),
            isNew: true // Mark as new
          };

          setMessages((prev) => [...prev, formattedAssistantMessage]);
        }
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message. Please try again.');

      // Remove the optimistically added user message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Here you would implement actual voice recording logic
  };

  const useSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  // Empty state - no chat selected
  if (!selectedChatId) {
    return (
      <div className="h-[70vh] bg-black/40 backdrop-blur-sm border border-purple-900/30 rounded-xl p-6 flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 flex items-center justify-center mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-xl font-medium text-white mb-2">Welcome to Aria</h3>
        <p className="text-purple-300 max-w-md mb-6">
          Your AI chef assistant ready to help with recipes, cooking techniques, and meal planning.
        </p>
        <button
          onClick={handleCreateNewChat}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg flex items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating chat...
            </>
          ) : (
            <>
              <PlusCircle className="w-4 h-4 mr-2" />
              Start a new conversation
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="h-[70vh] bg-black/40 backdrop-blur-sm border border-purple-900/30 rounded-xl flex flex-col">
      {/* Error notification */}
      {error && (
        <div className="p-3 m-3 bg-red-900/20 border border-red-700/30 rounded-lg text-red-300 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-white"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-medium text-white mb-2">Start a conversation with Aria</h3>
            <p className="text-purple-300 max-w-md mb-6">
              Ask about recipes, cooking techniques, or meal planning
            </p>
          </div>
        ) : (
          <>
            <AnimatePresence>
              {messages.map((message, index) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </AnimatePresence>

            {isLoading && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 flex items-center justify-center mr-2">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: '0ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: '150ms' }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: '300ms' }}
                  ></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Suggestion chips */}
      {messages.length === 0 && !isLoading && (
        <div className="px-4 py-3 border-t border-purple-800/30 flex overflow-x-auto no-scrollbar">
          {suggestions.map((suggestion, index) => (
            <SuggestionChip key={index} text={suggestion}
                // eslint-disable-next-line react-hooks/rules-of-hooks
                 onClick={() => useSuggestion(suggestion)} />
          ))}
        </div>
      )}

      {/* Input area */}
      <div className="p-4 border-t border-purple-800/30">
        {/* Chat usage indicator */}
        {selectedChatId && selectedChatId !== 'new' && chatInfo && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400 mr-1.5" />
                <span className="text-purple-300">
                  {chatInfo.messageCount} / {chatInfo.totalLimit} messages
                </span>
              </div>
              
              <div>
                {chatInfo.isApproachingLimit ? (
                  <span className="text-amber-400 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    {chatInfo.remainingPairs} pairs remaining
                  </span>
                ) : (
                  <span className="text-purple-400">
                    {chatInfo.remainingPairs} pairs remaining
                  </span>
                )}
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="w-full h-1 bg-purple-900/30 rounded-full overflow-hidden">
              <div 
                className={`h-full ${
                  chatInfo.isApproachingLimit ? 'bg-amber-500' : 'bg-purple-600'
                }`}
                style={{ width: `${(chatInfo.messageCount / chatInfo.totalLimit) * 100}%` }}
              ></div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 bg-purple-900/20 border border-purple-700/30 rounded-lg flex items-center overflow-hidden">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Aria about cooking, recipes, meal planning..."
              className="flex-1 bg-transparent px-3 py-2.5 text-white focus:outline-none"
              disabled={isLoading}
            />
            {input && (
              <button
                type="button"
                onClick={() => setInput('')}
                className="p-2 text-purple-400 hover:text-white"
                disabled={isLoading}
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 ${isRecording ? 'text-pink-500' : 'text-purple-400 hover:text-white'}`}
              disabled={isLoading}
            >
              {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
            <button 
              type="button" 
              className="p-2 text-purple-400 hover:text-white" 
              disabled={isLoading}
            >
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image className="w-5 h-5"/>
            </button>
          </div>
          <button
            type="submit"
            className={`p-2.5 rounded-lg ${
              isLoading || !input
                ? 'bg-purple-900/50 text-purple-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
            }`}
            disabled={isLoading || !input}
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <SendHorizontal className="w-5 h-5" />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AriaInterface;