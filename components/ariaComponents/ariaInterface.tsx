import React, { useState, useRef, useEffect } from "react";
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
import {
  sendVoiceMessageStream,
  speechService
} from "@/service/voiceController";
import toast from "react-hot-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Message {
  id: string;
  role: "user" | "assistant";
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
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  console.log({ messages });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load messages when chat ID changes
  useEffect(() => {
    const loadMessages = async () => {
      if (!selectedChatId || selectedChatId === "new" || !token) {
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
          console.log("RESULT ENTERING MESSAGES", result);
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
          throw new Error("Failed to load messages");
        }
      } catch (err) {
        console.error("Error loading messages:", err);
        setError("Failed to load messages. Please try again.");
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
      setError("You must be logged in to create a new chat");
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
        throw new Error("Failed to create new chat");
      }
    } catch (err) {
      console.error("Error creating chat:", err);
      setError("Failed to create a new chat. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const [transcript, setTranscript] = useState("");
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);

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

  // Handle voice recording toggle
  // const toggleRecording = () => {
  //   if (isLoading || isProcessingVoice) return;

  //   if (isRecording) {
  //     const finalTranscript = speechService.stopRecording();
  //     if (finalTranscript.trim()) {
  //       setInput(finalTranscript);
  //       // Optional: auto-send after recording
  //       // handleVoiceSubmit(finalTranscript);
  //     }
  //   } else {
  //     // Clear previous transcript before starting new recording
  //     speechService.clearTranscript();
  //     setTranscript('');
  //     const started = speechService.startRecording();
  //     if (!started) {
  //       toast.error('Could not start recording. Please check microphone permissions.');
  //     }
  //   }
  // };
  // Handle voice message submission
  // Handle voice submission
  const handleVoiceSubmit = async (voiceText: string) => {
    if (!voiceText.trim() || !token || isProcessingVoice) return;

    // If no chat selected, create one
    if (!selectedChatId || selectedChatId === "new") {
      try {
        setIsProcessingVoice(true);
        const result: any = await createChat(token);

        if (result.success && result.data) {
          setSelectedChatId(result.data._id);
          await processVoiceMessage(result.data._id, voiceText);
        } else {
          throw new Error("Failed to create new chat");
        }
      } catch (err) {
        console.error("Error creating chat for voice message:", err);
        setError("Failed to process voice message");
        setIsProcessingVoice(false);
      }
    } else {
      await processVoiceMessage(selectedChatId, voiceText);
    }
  };

  // Process voice message with existing chat
  // Process voice message with streaming
  const processVoiceMessage = async (chatId: string, voiceText: string) => {
    if (!token) return;

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      message: voiceText,
      timestamp: new Date(),
      isNew: true
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsProcessingVoice(true);
    setError(null);

    // Create a reference to store accumulated text outside React state
    // to avoid closure issues
    const accumulatedText = { current: "" };

    try {
      // Generate a temporary ID for the streaming message
      const tempAssistantId = `temp-${Date.now()}`;

      // Add an initial assistant message that will be updated as chunks arrive
      setMessages((prev) => [
        ...prev,
        {
          id: tempAssistantId,
          role: "assistant",
          message: "",
          timestamp: new Date(),
          isNew: true
        }
      ]);

      setIsStreaming(true);

      // Stream the response
      await sendVoiceMessageStream(
        token,
        chatId,
        voiceText,
        // Handle each chunk
        (chunk: string) => {
          // Update the accumulated text
          accumulatedText.current += chunk;

          // Update the message with the current total text
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempAssistantId
                ? { ...msg, message: accumulatedText.current }
                : msg
            )
          );
        },
        // Handle completion
        (finalMessage: any) => {
          // Replace the temporary message with the final one from the server
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === tempAssistantId
                ? {
                    id: finalMessage._id,
                    role: "assistant",
                    message: finalMessage.content,
                    timestamp: new Date(finalMessage.createdAt),
                    isNew: false
                  }
                : msg
            )
          );

          // Update chat info if available
          if (finalMessage.chatInfo) {
            setChatInfo(finalMessage.chatInfo);
          }
        }
      );
    } catch (err) {
      console.error("Error processing voice message:", err);
      setError("Failed to process voice message. Please try again.");

      // Remove the optimistically added messages on error
      setMessages((prev) =>
        prev.filter(
          (msg) => msg.id !== userMessage.id && !msg.id.startsWith("temp-")
        )
      );
    } finally {
      setIsProcessingVoice(false);
      setIsStreaming(false);
      // Clear transcript after processing
      speechService.clearTranscript();
      setTranscript("");
    }
  };

  // Handle message submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Stop any active recording first
    if (isRecording) {
      const finalTranscript = speechService.stopRecording();
      if (finalTranscript.trim()) {
        setInput(finalTranscript);
      }
    }

    // Regular message processing continues...
    if (!input.trim() || isLoading || isProcessingVoice) return;

    if (!token) {
      setError("You must be logged in to send messages");
      return;
    }

    // If no chat is selected or it's 'new', create a new chat first
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

  // Helper function to send message to a specific chat
  const sendMessageToChat = async (chatId: string, message: string) => {
    if (!token) return;

    // Add user message to UI immediately for better UX
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      message: message,
      timestamp: new Date(),
      isNew: true // Mark as new
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      // Send message to API
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
          const formattedAssistantMessage: Message = {
            id: assistantMessage._id,
            role: "assistant",
            message: assistantMessage.content,
            timestamp: new Date(assistantMessage.createdAt),
            isNew: true // Mark as new
          };

          setMessages((prev) => [...prev, formattedAssistantMessage]);
        }
      } else {
        throw new Error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
      setError("Failed to send message. Please try again.");

      // Remove the optimistically added user message on error
      setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id));
    } finally {
      setIsLoading(false);
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
      // Clear previous transcript before starting new recording
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
      }
    }
  };
  const useSuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  // Updated empty state for mobile
  if (!selectedChatId) {
    return (
      <div className="h-[70vh] bg-black/40 backdrop-blur-sm border border-purple-900/30 rounded-xl p-3 sm:p-6 flex flex-col items-center justify-center text-center max-h-[calc(100vh-140px)] overflow-hidden">
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
    <div className="h-[70vh] bg-black/40 backdrop-blur-sm border border-purple-900/30 rounded-xl flex flex-col max-h-[calc(100vh-140px)] overflow-hidden">
      {/* Error notification - improved for small screens */}
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

      {/* Chat messages - improved padding for mobile */}
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
            <div>
              {messages.map((message) => (
                <ChatMessage key={message.id} message={message} />
              ))}
            </div>

            {isLoading && (
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

      {/* Suggestion chips - improved scrolling on mobile */}
      {messages.length === 0 && !isLoading && (
        <div className="px-2 sm:px-4 py-2 sm:py-3 border-t border-purple-800/30 flex overflow-x-auto no-scrollbar pb-1 -mx-0.5">
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
      {/* Input area - mobile optimized */}
      <div className="p-2 sm:p-4 border-t border-purple-800/30">
        {/* Chat usage indicator - responsive layout */}
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

            {/* Progress bar */}
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

        {/* Form with improved mobile layout */}
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <div className="flex-1 bg-purple-900/20 border border-purple-700/30 hover:border-purple-600/50 focus-within:border-purple-500/50 transition-colors duration-200 rounded-lg flex items-center overflow-hidden">
            <input
              type="text"
              value={isRecording ? transcript || "Listening..." : input}
              onChange={(e) => !isRecording && setInput(e.target.value)}
              placeholder={
                isRecording ? "Listening..." : "Ask Aria about cooking..."
              }
              className="flex-1 bg-transparent px-2 sm:px-3 py-2.5 sm:py-3 text-sm sm:text-base text-white placeholder:text-purple-400/70 focus:outline-none min-w-0"
              disabled={isLoading || isProcessingVoice || isRecording}
            />

            <div className="flex shrink-0">
              {input && !isRecording && (
                <button
                  type="button"
                  onClick={() => setInput("")}
                  className="p-1.5 sm:p-2 text-purple-400 hover:text-white active:text-pink-400 transition-colors"
                  disabled={isLoading || isProcessingVoice}
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-1.5 sm:p-2 ${
                  isRecording
                    ? "text-pink-500 bg-pink-500/20 rounded-full"
                    : "text-purple-400 hover:text-white active:bg-purple-800/30"
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
                className="p-1.5 sm:p-2 text-purple-400 hover:text-white active:bg-purple-800/30 transition-colors"
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
            className={`p-2.5 sm:p-3 rounded-lg shadow-lg ${
              isLoading || isProcessingVoice || (!input.trim() && !isRecording)
                ? "bg-purple-900/50 text-purple-300 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 active:from-purple-800 active:to-pink-800 transform active:scale-95 transition-all"
            }`}
            disabled={
              isLoading || isProcessingVoice || (!input.trim() && !isRecording)
            }
          >
            {isLoading || isProcessingVoice ? (
              <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
            ) : (
              <SendHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            )}
          </button>
        </form>
        {isStreaming && (
          <div className="absolute bottom-20 right-4 z-10 bg-purple-600/90 text-white px-3 py-1.5 rounded-full flex items-center">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            Receiving response...
          </div>
        )}
      </div>
    </div>
  );
};

export default AriaInterface;
