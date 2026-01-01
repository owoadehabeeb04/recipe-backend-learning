import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  SendHorizontal,
  Mic,
  MicOff,
  Sparkles,
  PlusCircle,
  Loader2,
  X,
  AlertCircle,
  MessageSquare,
  AlertTriangle,
  XCircle,
  Upload,
  ImageIcon
} from "lucide-react";
import Image from "next/image";
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
import { uploadToCloudinary } from "@/app/api/(recipe)/uploadImage";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface Message {
  id: string;
  role: "user" | "assistant";
  message: string;
  timestamp: Date;
  isNew?: boolean;
  fullMessage?: string;
  imageUrls?: any;
  images?: Array<{ url: string }>;
  hasImage?: boolean;
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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [isUploadingImages, setIsUploadingImages] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    const files = Array.from(e.target.files);
    setSelectedImages((prev) => [...prev, ...files]);

    // Generate preview URLs
    const newPreviewUrls = files.map((file) => URL.createObjectURL(file));
    setImagePreviewUrls((prev) => [...prev, ...newPreviewUrls]);

    // Clear the input so the same file can be selected again
    e.target.value = "";
  };

  // Remove selected image
  const removeSelectedImage = (index: number) => {
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(imagePreviewUrls[index]);

    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  // Submit handler with images
  const handleSubmitWithImages = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      (!input.trim() && selectedImages.length === 0) ||
      isLoading ||
      isProcessingVoice
    )
      return;

    // Create or select chat
    if (!selectedChatId || selectedChatId === "new") {
      try {
        setIsLoading(true);
        setError(null);

        const result: any = await createChat(token);

        if (result.success && result.data) {
          setSelectedChatId(result.data._id);
          await sendImageMessageToChat(result.data._id, input, selectedImages);
        } else {
          throw new Error("Failed to create new chat");
        }
      } catch (err) {
        console.error("Error creating chat:", err);
        setError("Failed to create a new chat. Please try again.");
        setIsLoading(false);
      }
    } else {
      await sendImageMessageToChat(selectedChatId, input, selectedImages);
    }
  };

  // Updated function for Cloudinary images
  const sendImageMessageToChat = async (
    chatId: string,
    message: string,
    images: File[]
  ) => {
    if (!token) return;

    const tempMessageId = Date.now().toString();

    // Create a temporary user message with local image previews
    const userMessage: Message = {
      id: tempMessageId,
      role: "user",
      message: message || "Shared image(s)",
      timestamp: new Date(),
      isNew: true,
      images: imagePreviewUrls.map((url) => ({ url })), // Create array of objects with url property
      hasImage: true
    };

    // Add message to state
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsThinking(true);
    setIsLoading(true);
    setIsUploadingImages(true);
    setError(null);

    try {
      // Upload all images to Cloudinary first
      const uploadPromises = images.map((image) => uploadToCloudinary(image));
      const cloudinaryUrls = await Promise.all(uploadPromises);

      // Structure the payload for the API
      const payload: any = {
        message:
          message ||
          (images.length === 1
            ? "Shared an image"
            : `Shared ${images.length} images`)
      };

      // Add the appropriate image data based on count
      if (images.length === 1) {
        payload.imageUrl = cloudinaryUrls[0];
      } else {
        payload.imageUrls = cloudinaryUrls; // Direct array of strings
      }

      // Make the API call
      const response = await axios.post(
        `${API_URL}/chatbot/chats/${chatId}/${images.length > 1 ? "images" : "image"}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          }
        }
      );

      // Critical change: Reload all messages from server instead of trying to update locally
      if (response.data.success) {
        const { userMessage: apiUserMsg, aiMessage: assistantMessage } =
          response.data.data;

        // Replace temporary message with actual message from API
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === tempMessageId
              ? {
                  id: apiUserMsg._id,
                  role: "user",
                  message: apiUserMsg.content,
                  timestamp: new Date(apiUserMsg.createdAt),
                  isNew: false,
                  images:
                    apiUserMsg.images || cloudinaryUrls.map((url) => ({ url })),
                  hasImage: true
                }
              : msg
          )
        );

        // Add the AI response
        if (assistantMessage) {
          const formattedAssistantMessage: Message = {
            id: assistantMessage._id,
            role: "assistant",
            message: assistantMessage.content,
            timestamp: new Date(assistantMessage.createdAt),
            isNew: true
          };

          setMessages((prev) => [...prev, formattedAssistantMessage]);
        }
      } else {
        throw new Error(response.data.message || "Failed to process images");
      }
    } catch (err: any) {
      console.error("Error sending image message:", err);

      let errorMessage = "Failed to send image(s). Please try again.";
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = `Error: ${err.message}`;
      }

      setError(errorMessage);
      toast.error(errorMessage);

      // Remove the temporary message
      setMessages((prev) => prev.filter((msg) => msg.id !== tempMessageId));
    } finally {
      setIsLoading(false);
      setIsThinking(false);
      setIsUploadingImages(false);
      // Clear selected images
      setSelectedImages([]);
      // Clear preview URLs and revoke object URLs
      imagePreviewUrls.forEach((url) => URL.revokeObjectURL(url));
      setImagePreviewUrls([]);

      // Scroll to bottom after message is added
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }
  };

  // Handle API response
  const handleImageResponse = (
    data: any,
    tempMessageId: string,
    cloudinaryUrls?: string[]
  ) => {
    if (data.success && data.data) {
      const { userMessage: apiUserMsg, aiMessage: assistantMessage } =
        data.data;

      // Make sure we have image URLs regardless of API response
      const imageUrls =
        cloudinaryUrls ||
        (apiUserMsg.images && apiUserMsg.images.length > 0
          ? apiUserMsg.images.map((img: any) => img.url)
          : []);

      // Replace temporary message with actual message from API
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempMessageId
            ? {
                id: apiUserMsg._id,
                role: "user",
                message: apiUserMsg.content,
                timestamp: new Date(apiUserMsg.createdAt),
                isNew: true,
                // Always include the image URLs we originally uploaded
                images: imageUrls.map((url: any) => ({ url })), // Create array of objects with url property

                hasImage: true
              }
            : msg
        )
      );

      if (assistantMessage) {
        const formattedAssistantMessage: Message = {
          id: assistantMessage._id,
          role: "assistant",
          message: assistantMessage.content,
          timestamp: new Date(assistantMessage.createdAt),
          isNew: true
        };

        setMessages((prev) => [...prev, formattedAssistantMessage]);
      }
    }
  };

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

        // If there are images selected, enable smooth transition to sending both together
        if (selectedImages.length > 0 && !isLoading && !isProcessingVoice) {
          // Just update input - let user manually send for better control
          setInput(transcript);
        }
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
        const messages = result?.data || [];

        // Format messages for display
        const formattedMessages: Message[] = messages.map((msg: any) => ({
          id: msg._id,
          role: msg.role,
          message: msg.content,
          timestamp: new Date(msg.createdAt),
          isNew: false,
          images: msg.images,
          hasImage: msg.hasImages
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
      isNew: true,
      images: imagePreviewUrls.map((url) => ({ url })), // Create array of objects with url property
      hasImage: true
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
    } catch (err: any) {
      console.error("Error sending message:", err);

      // Check if it's a rate limit error
      const isRateLimit =
        err?.response?.status === 429 ||
        err?.status === 429 ||
        err?.response?.data?.isRateLimit ||
        err?.response?.data?.message?.toLowerCase().includes("rate limit") ||
        err?.response?.data?.message
          ?.toLowerCase()
          .includes("too many requests") ||
        err?.message?.includes("429") ||
        err?.message?.toLowerCase().includes("rate limit");

      if (isRateLimit) {
        setError(
          "Rate limit exceeded. Please wait a few minutes before trying again. The API has usage limits to ensure fair access for all users."
        );
        toast.error(
          "Rate limit exceeded. Please wait a few minutes before trying again.",
          {
            duration: 8000
          }
        );
      } else {
        setError("Failed to send message. Please try again.");
      }

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

  const applySuggestion = (suggestion: string) => {
    setInput(suggestion);
  };

  if (!selectedChatId) {
    return (
      <div className="h-[80vh] lg:max-w-3/4 mx-auto backdrop-blur-sm border border-border rounded-xl p-3 sm:p-6 flex flex-col items-center justify-center text-center overflow-hidden bg-card">
        <h3 className="text-lg sm:text-xl font-medium text-foreground mb-2">
          Welcome to Aria
        </h3>
        <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-4 sm:mb-6">
          Your AI chef assistant ready to help with recipes, cooking techniques,
          and meal planning.
        </p>
        <button
          onClick={handleCreateNewChat}
          className="px-3 sm:px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg flex items-center transition-colors"
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
    <div className="h-[80vh] lg:max-w-3/4 mx-auto backdrop-blur-sm border border-border rounded-xl flex flex-col overflow-hidden bg-card">
      {error && (
        <div className="p-2 sm:p-3 m-2 sm:m-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive flex items-center">
          <AlertCircle className="w-4 h-4 mr-1.5 flex-shrink-0" />
          <span className="text-xs sm:text-sm">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-destructive hover:text-destructive/80 p-1.5 transition-colors"
            aria-label="Dismiss error"
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-3 sm:space-y-4 overscroll-contain">
        {messages.length === 0 && !isLoading ? (
          <div className="h-full flex flex-col items-center justify-center text-center px-3 sm:px-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary flex items-center justify-center mb-3 sm:mb-4">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-primary-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-medium text-foreground mb-2">
              Start a conversation with Aria
            </h3>
            <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-4 sm:mb-6">
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
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted border border-border text-foreground py-2 px-4 text-[0.8rem] rounded-lg">
                  Aria is thinking...
                </div>
              </div>
            )}

            {isLoading && !isThinking && (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-2">
                  <Sparkles className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="flex space-x-1">
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-primary rounded-full animate-bounce"
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
        <div className="px-2 mt-auto sm:px-4 py-2 sm:py-3 border-t border-border flex overflow-x-auto no-scrollbar pb-1 -mx-0.5">
          {suggestions.map((suggestion, index) => (
            <SuggestionChip
              key={index}
              text={suggestion}
              onClick={() => applySuggestion(suggestion)}
            />
          ))}
        </div>
      )}
      {isRecording && (
        <div className="absolute top-4 right-4 z-10 bg-primary text-primary-foreground px-3 py-1.5 rounded-full flex items-center animate-pulse shadow-lg">
          <span className="w-2 h-2 bg-primary-foreground rounded-full mr-2"></span>
          Recording...
        </div>
      )}
      <div className="p-2 mt-auto sm:p-4 border-t border-border">
        {selectedChatId && selectedChatId !== "new" && chatInfo && (
          <div className="mb-2 sm:mb-3">
            <div className="flex flex-col xs:flex-row xs:items-center xs:justify-between text-xs mb-1.5 space-y-1 xs:space-y-0">
              <div className="flex items-center">
                <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />
                <span className="text-muted-foreground">
                  {chatInfo.messageCount} / {chatInfo.totalLimit} messages
                </span>
              </div>

              <div>
                {chatInfo.isApproachingLimit ? (
                  <span className="text-amber-500 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                    {chatInfo.remainingPairs} pairs remaining
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    {chatInfo.remainingPairs} pairs remaining
                  </span>
                )}
              </div>
            </div>

            <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full ${
                  chatInfo.isApproachingLimit ? "bg-amber-500" : "bg-primary"
                }`}
                style={{
                  width: `${(chatInfo.messageCount / chatInfo.totalLimit) * 100}%`
                }}
              ></div>
            </div>
          </div>
        )}
        <form
          onSubmit={
            selectedImages.length > 0 ? handleSubmitWithImages : handleSubmit
          }
          className="flex flex-col space-y-2"
        >
          {/* Hidden file input for image selection */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            multiple
            className="hidden"
            disabled={isLoading || isProcessingVoice || isRecording}
          />

          {/* Selected images preview */}
          {selectedImages.length > 0 && (
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin scrollbar-thumb-primary scrollbar-track-muted">
              {imagePreviewUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden group border border-border"
                >
                  <Image
                    src={url}
                    width={64}
                    height={64}
                    alt={`Selected ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => removeSelectedImage(index)}
                      className="text-primary-foreground/90 hover:text-primary-foreground"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Textarea for message input */}
          <div className="relative bg-background border-2 border-border hover:border-primary/50 focus-within:border-primary shadow-sm transition-all duration-200 rounded-xl overflow-hidden">
            <textarea
              value={isRecording ? transcript || "Listening..." : input}
              onChange={(e) => !isRecording && setInput(e.target.value)}
              placeholder={
                isRecording
                  ? "Listening..."
                  : selectedImages.length > 0
                    ? "Add a comment about your image(s)..."
                    : "Ask Aria about cooking..."
              }
              rows={1}
              onInput={(e) => {
                // Auto-resize the textarea
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = `${Math.min(target.scrollHeight, 150)}px`; // Max height of 150px
              }}
              className="w-full bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted-foreground focus:outline-none resize-none min-h-[50px]"
              disabled={isLoading || isProcessingVoice || isRecording}
            />

            {/* Clear button positioned at top right */}
            {input && !isRecording && (
              <button
                type="button"
                onClick={() => setInput("")}
                className="absolute top-2 right-2 p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-muted"
                disabled={isLoading || isProcessingVoice}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Action buttons row below the textarea */}
          <div className="flex items-center justify-between">
            <div className="flex space-x-1">
              <button
                type="button"
                onClick={toggleRecording}
                className={`p-2 rounded-lg ${
                  isRecording
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                } transition-all`}
                disabled={isLoading || isProcessingVoice} // Removed: || selectedImages.length > 0
              >
                <div className="flex items-center">
                  {isRecording ? (
                    <>
                      <MicOff className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse mr-1.5" />
                      <span className="text-sm font-medium">Stop</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
                      <span className="text-sm font-medium">Voice</span>
                    </>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`p-2 rounded-lg ${
                  selectedImages.length > 0
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                } transition-all`}
                disabled={isLoading || isProcessingVoice || isRecording}
              >
                <div className="flex items-center">
                  <Upload className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
                  <span className="text-sm font-medium">
                    {selectedImages.length > 0
                      ? `${selectedImages.length} Image(s)`
                      : "Image"}
                  </span>
                </div>
              </button>
            </div>
            <button
              type="submit"
              onClick={(e) => {
                if (isRecording && transcript.trim()) {
                  e.preventDefault();
                  speechService.stopRecording();
                  if (selectedImages.length > 0) {
                    handleSubmitWithImages(e);
                  } else {
                    handleVoiceSubmit(transcript);
                  }
                }
              }}
              className={`px-4 py-2.5 rounded-xl shadow-lg ${
                isLoading ||
                isProcessingVoice ||
                (!input.trim() && selectedImages.length === 0 && !isRecording)
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 transform transition-all"
              }`}
              disabled={
                isLoading ||
                isProcessingVoice ||
                (!input.trim() && selectedImages.length === 0 && !isRecording)
              }
            >
              <div className="flex items-center">
                {isLoading || isProcessingVoice ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5 animate-spin" />
                    <span>
                      {isUploadingImages ? "Uploading..." : "Processing..."}
                    </span>
                  </>
                ) : isRecording && selectedImages.length > 0 ? (
                  <>
                    <MicOff className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
                    <span>Stop & Send</span>
                  </>
                ) : (
                  <>
                    <SendHorizontal className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" />
                    <span>Send</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </form>
        {isProcessingVoice && (
          <div className="fixed bottom-4 sm:bottom-20 right-4 z-30 bg-primary text-primary-foreground px-4 py-2 rounded-full flex items-center shadow-lg">
            <span className="w-2 h-2 bg-primary-foreground rounded-full mr-2 animate-pulse"></span>
            Processing voice message...
          </div>
        )}
      </div>
      {/* <div className="h-20 sm:h-24"></div> */}
    </div>
  );
};

export default AriaInterface;
