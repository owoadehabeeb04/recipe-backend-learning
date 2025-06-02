import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  SendHorizontal,
  Mic,
  MicOff,
  Sparkles,
  Image,
  PlusCircle,
  Loader2,
  X,
  AlertCircle,
  MessageSquare,
  AlertTriangle
} from "lucide-react";
import axios from "axios";
import ChatMessage from "./chatMessage";
import SuggestionChip from "./suggestionChip";
import { useAuthStore } from "@/app/store/authStore";
import {
  createChat,
  getChatMessages,
  sendMessage
} from "@/app/api/(chatbot)/chat";
import { speechService } from "@/service/voiceController";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Message {
  id: string;
  role: "user" | "assistant";
  message: string;
  timestamp: Date;
  isNew?: boolean;
  fullMessage?: string;
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

const AriaInterface: React.FC<AriaInterfaceProps> = ({
  selectedChatId,
  setSelectedChatId
}) => {
  const { token } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const [suggestions] = useState([
    "What can I make with chicken and broccoli?",
    "Help me plan a Mediterranean dinner",
    "What's a quick pasta recipe?",
    "How do I cook rice perfectly?",
    "Suggest a dessert for date night"
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [transcript, setTranscript] = useState("");
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const testEnbdpoin = async () => {
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/chatbot/test-intent`,
        {
          text: {
            text: "show me my recipes."
          }
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token || ""}`
          }
        }
      );

      console.log(response);
    } catch (error) {
      console.error("Error in testEnbdpoin:", error);
      throw error;
    }
  };
  useEffect(() => {
    console.log("reach");
    testEnbdpoin();
  }, []);
  // Initialize speech service
  useEffect(() => {
    // Set up handlers for the speech service
    speechService.setOnTranscriptUpdate((text) => {
      setTranscript(text);
    });

    speechService.setOnRecordingStateChange((recording) => {
      setIsRecording(recording);
      if (!recording && transcript.trim()) {
        // When recording stops with content, show in input
        setInput(transcript);
      }
    });

    speechService.setOnError((errorMsg) => {
      toast.error(errorMsg);
      setIsRecording(false);
    });

    // Cleanup
    return () => {
      if (isRecording) {
        speechService.stopRecording();
      }
    };
  }, []);

  // Update effect to listen for transcript changes
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  // Load chat messages when selectedChatId changes
  useEffect(() => {
    if (selectedChatId && selectedChatId !== "new") {
      loadChatMessages(selectedChatId);
    } else {
      // Clear messages when no chat is selected or new chat is selected
      setMessages([]);
      setChatInfo(null);
    }
  }, [selectedChatId]);

  // Load chat messages function
  const loadChatMessages = async (chatId: string) => {
    if (!token) {
      setError("You must be logged in to view messages");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setMessages([]); // Clear messages while loading

      const result = await getChatMessages(token, chatId);

      // Important: Check for both result.success and result.data
      if (result.success && result.data) {
        console.log(result.data);
        const messages = result?.data || [];

        // Format messages for display
        const formattedMessages: Message[] = messages.map((msg: any) => ({
          id: msg._id,
          role: msg.role,
          message: msg.content,
          timestamp: new Date(msg.createdAt),
          isNew: false // Mark existing messages as not new, so they don't animate
        }));

        // Update messages and chat info
        setMessages(formattedMessages);

        if (result.data.chatInfo) {
          setChatInfo(result.data.chatInfo);
        }
      } else {
        throw new Error("Failed to load chat messages");
      }
    } catch (err) {
      console.error("Error loading chat messages:", err);
      setError("Failed to load chat messages. Please try again.");
    } finally {
      setIsLoading(false);
      // Scroll to bottom after messages are loaded and rendered
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const toggleRecording = () => {
    if (isLoading || isProcessingVoice) return;

    if (isRecording) {
      const finalTranscript = speechService.stopRecording();
      if (finalTranscript.trim()) {
        setInput(finalTranscript);
      }
    } else {
      speechService.clearTranscript();
      setTranscript("");

      try {
        const started = speechService.startRecording();
        if (!started) {
          toast.error(
            "Could not start recording. Please check microphone permissions."
          );
        }
      } catch (error) {
        console.error("Error starting recording:", error);
        toast.error("Error starting voice recording");
        setIsRecording(false);
      }
    }
  };

  const handleCreateNewChat = async () => {
    if (!token) {
      setError("You must be logged in to create a new chat");
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const result: any = await createChat(token);
      console.log({ result });
      if (result.success && result.data) {
        setSelectedChatId(result.data._id);
      } else {
        throw new Error("Failed to create new chat");
      }
    } catch (err) {
      console.error("Error creating chat:", err);
      setError("Failed to create a new chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceSubmit = async (voiceText: string) => {
    if (!voiceText.trim() || !token || isProcessingVoice) return;

    setIsProcessingVoice(true);

    try {
      if (!selectedChatId || selectedChatId === "new") {
        try {
          const result: any = await createChat(token);

          if (result.success && result.data) {
            setSelectedChatId(result.data._id);
            await sendMessageToChat(result.data._id, voiceText);
          } else {
            throw new Error("Failed to create new chat");
          }
        } catch (err) {
          console.error("Error creating chat for voice message:", err);
          setError("Failed to process voice message");
          throw err;
        }
      } else {
        await sendMessageToChat(selectedChatId, voiceText);
      }
    } catch (err) {
      console.error("Voice message processing failed:", err);
    } finally {
      setIsProcessingVoice(false);
      speechService.clearTranscript();
      setTranscript("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isRecording) {
      const finalTranscript = speechService.stopRecording();
      if (finalTranscript.trim()) {
        setInput(finalTranscript);
      }
    }

    if (!input.trim() || isLoading || isProcessingVoice) return;

    if (!token) {
      setError("You must be logged in to send messages");
      return;
    }

    if (!selectedChatId || selectedChatId === "new") {
      try {
        setIsLoading(true);
        setError(null);

        const result: any = await createChat(token);

        if (result.success && result.data) {
          setSelectedChatId(result.data._id);
          await sendMessageToChat(result.data._id, input);
        } else {
          throw new Error("Failed to create new chat");
        }
      } catch (err) {
        console.error("Error creating chat:", err);
        setError("Failed to create a new chat. Please try again.");
        setIsLoading(false);
      }
    } else {
      await sendMessageToChat(selectedChatId, input);
    }
  };

  const sendMessageToChat = async (chatId: string, message: string) => {
    if (!token) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      message: message,
      timestamp: new Date(),
      isNew: true
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    setIsLoading(true);
    setError(null);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));

      const result = await sendMessage(token, chatId, message);

      if (result.success && result.data) {
        const {
          userMessage: apiUserMsg,
          aiMessage: assistantMessage,
          chatInfo: updatedChatInfo
        } = result.data;

        if (updatedChatInfo) {
          setChatInfo(updatedChatInfo);
        }

        if (assistantMessage) {
          const messageId = assistantMessage._id;
          const content = assistantMessage.content;

          const formattedAssistantMessage: Message = {
            id: messageId,
            role: "assistant",
            message: content,
            timestamp: new Date(assistantMessage.createdAt),
            isNew: true // Mark as new so the ChatMessage component will animate it
          };

          setMessages((prev) => [...prev, formattedAssistantMessage]);
        }
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");

      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
      setIsThinking(false);

      // Scroll to bottom after message is added
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  const useSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!selectedChatId) {
    return (
      <div className=" h-[80vh] lg:max-w-3/4 mx-auto backdrop-blur-sm border-0 border-purple-900/30 rounded-xl p-3 sm:p-6 flex flex-col items-center justify-center text-center  overflow-hidden">
        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 flex items-center justify-center mb-3 sm:mb-4">
          <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <h3 className="text-lg sm:text-xl font-medium text-white mb-2">
          Welcome to Aria
        </h3>
        <p className="text-purple-300 text-sm sm:text-base max-w-md mb-4 sm:mb-6">
          Your AI chef assistant ready to help with recipes, cooking techniques,
          and meal planning.
        </p>
        <button
          onClick={handleCreateNewChat}
          className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-lg flex items-center"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
              Creating chat...
            </>
          ) : (
            <>
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
              Start a new conversation
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className=" h-[80vh] lg:max-w-3/4 mx-auto bg-b/40 backdrop-blur-sm border-0 border-purple-900/30 rounded-xl flex flex-col overflow-hidden">
      {error && (
        <div className="p-2 sm:p-3 m-2 sm:m-3 bg-red-900/20 border border-red-700/30 rounded-lg text-red-300 flex items-center">
          <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="text-xs sm:text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-white p-1.5"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 overscroll-contain">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-3 sm:px-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 flex items-center justify-center mb-3 sm:mb-4">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-white mb-2">
              Start a conversation with Aria
            </h3>
            <p className="text-purple-300 text-sm sm:text-base max-w-md mb-4 sm:mb-6">
              Ask about recipes, cooking techniques, or meal planning
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-6">
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>

            {isThinking && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 flex items-center justify-center mr-2">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="bg-purple-900/20 border border-purple-800/30 text-purple-100 py-2 px-4  text-[0.8rem] rounded-lg">
                  Aria is thinking...
                </div>
              </div>
            )}

            {isLoading && !isThinking && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600/80 to-pink-600/80 flex items-center justify-center mr-2">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {messages.length === 0 && !isLoading && (
        <div className="px-2  mt-auto sm:px-4 py-2 sm:py-3 border-t border-purple-800/30 flex overflow-x-auto no-scrollbar pb-1 -mx-0.5">
          {suggestions.map((suggestion, index) => (
            <SuggestionChip
              key={index}
              text={suggestion}
              onClick={() => useSuggestion(suggestion)}
            />
          ))}
        </div>
      )}
      {isRecording && (
        <div className="absolute top-4 right-4 z-10 bg-pink-600/90 text-white px-3 py-1.5 rounded-full flex items-center animate-pulse">
          <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
          Recording...
        </div>
      )}
      <div className="p-2 mt-auto sm:p-4 border-t border-purple-800/30">
        {selectedChatId && selectedChatId !== "new" && chatInfo && (
          <div className="mb-2 sm:mb-3">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between text-xs mb-1.5 space-y-1 xs:space-y-0">
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

            <div className="w-full h-1 bg-purple-900/30 rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  chatInfo.isApproachingLimit ? "bg-amber-500" : "bg-purple-600"
                }`}
                style={{
                  width: `${(chatInfo.messageCount / chatInfo.totalLimit) * 100}%`
                }}
              ></div>
            </div>
          </div>
        )}
        <form onSubmit={handleSubmit} className="flex space-x-2 items-center">
          <div className="flex-1 bg-purple-900/30 border-2 border-purple-600/40 hover:border-purple-500/50 focus-within:border-purple-400 shadow-[0_0_10px_rgba(147,51,234,0.2)] transition-all duration-200 rounded-xl flex items-center overflow-hidden">
            <input
              type="text"
              value={isRecording ? transcript || "Listening..." : input}
              onChange={(e) => !isRecording && setInput(e.target.value)}
              placeholder={
                isRecording ? "Listening..." : "Ask Aria about cooking..."
              }
              className="flex-1 bg-transparent px-4 py-3 text-base text-white placeholder:text-purple-300/80 focus:outline-none min-w-0"
              disabled={isLoading || isProcessingVoice || isRecording}
            />

            <div className="flex shrink-0 mr-1">
              {input && !isRecording && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  className="p-2 text-purple-300 hover:text-white active:text-pink-300 transition-colors"
                  disabled={isLoading || isProcessingVoice}
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              )}
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2 ${
                  isRecording
                    ? "text-pink-400 bg-pink-500/20 rounded-full"
                    : "text-purple-300 hover:text-white active:bg-purple-800/30"
                } transition-colors`}
                disabled={isLoading || isProcessingVoice}
              >
                {isRecording ? (
                  <MicOff className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
                ) : (
                  <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>

              <button
                type="button"
                className="p-2 text-purple-300 hover:text-white active:bg-purple-800/30 transition-colors"
                disabled={isLoading || isProcessingVoice || isRecording}
              >
                <Image className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>

          <button
            type="submit"
            onClick={(e) => {
              if (isRecording && transcript.trim()) {
                e.preventDefault();
                speechService.stopRecording();
                handleVoiceSubmit(transcript);
              }
            }}
            className={`p-3 rounded-xl shadow-lg ${
              isLoading || isProcessingVoice || (!input.trim() && !isRecording)
                ? "bg-purple-900/50 text-purple-300 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 transform active:scale-95 transition-all shadow-[0_0_15px_rgba(219,39,119,0.3)]"
            }`}
            disabled={
              isLoading || isProcessingVoice || (!input.trim() && !isRecording)
            }
          >
            {isLoading || isProcessingVoice ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <SendHorizontal className="w-5 h-5" />
            )}
          </button>
        </form>
        {isProcessingVoice && (
          <div className="fixed bottom-4 sm:bottom-20 right-4 z-30 bg-purple-600/90 text-white px-4 py-2 rounded-full flex items-center shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            Processing voice message...
          </div>
        )}
      </div>
      {/* <div className="h-20 sm:h-24"></div> */}
    </div>
  );
};

export default AriaInterface;
