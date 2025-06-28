import React, { useState, useEffect, useRef } from "react";
 
import { ChefHat, Copy, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import axios from "axios";
import { useAuthStore } from "@/app/store/authStore";
import Image from "next/image";
// Update your Message interface to include imageUrls
interface Message {
  id: string;
  role: "user" | "assistant";
  message: string;
  timestamp: Date;
  isNew?: boolean;
  fullMessage?: string;
  images?: any;
  imageUrls?: string[]; // Add this field
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === "assistant";
  const [copied, setCopied] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const fullMessageRef = useRef(message.message);

  // // Debug info
  // console.log(
  //   `Message ${message.id.substring(0, 5)}... - isNew: ${message.isNew}, isAssistant: ${isAssistant}`
  // );

  // Initialize state when the message changes
  useEffect(() => {
    fullMessageRef.current = message.message;

    // Default to treating messages as new if isNew is undefined (for backward compatibility)
    const shouldAnimate = message.isNew !== false && isAssistant;

    if (shouldAnimate) {
      
      setDisplayText("");
      setTypingComplete(false);
      setIsTyping(true);
    } else {
    
      setDisplayText(message.message);
      setTypingComplete(true);
      setIsTyping(false);
    }
  }, [message.id, message.message, message.isNew, isAssistant]);

  // Typing effect
  useEffect(() => {
    if (!isAssistant || typingComplete || !isTyping) return;


    let i = 0;
    const fullText = fullMessageRef.current;
    const speed = 35; // Increased speed for better visibility
    let timeout: NodeJS.Timeout;

    // Only skip animation for complex tables or very short messages
    const hasComplexTable =
      fullText.split("\n").filter((line) => line.trim().startsWith("|"))
        .length > 3;

    if (fullText.length < 15 || hasComplexTable) {
      
      setDisplayText(fullText);
      setTypingComplete(true);
      setIsTyping(false);
      return;
    }

    const type = () => {
      if (i < fullText.length) {
        setDisplayText(fullText.substring(0, i + 1));
        i++;

        const nextChar = fullText.charAt(i - 1);
        let delay = speed;
        if (nextChar === "." || nextChar === "!" || nextChar === "?") {
          delay = speed * 8;
        } else if (nextChar === "," || nextChar === ";") {
          delay = speed * 5;
        }

        timeout = setTimeout(type, delay);
      } else {
        
        setTypingComplete(true);
        setIsTyping(false);
      }
    };

    // Start typing after a short delay
    timeout = setTimeout(() => {
     
      type();
    }, 100);

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isAssistant, typingComplete, isTyping, message.id]);

  const preprocessMarkdown = (content: string) => {
    if (!content) return "";

    // Replace triple newlines with horizontal rules for better section separation
    let processed = content.replace(/\n\s*\n\s*\n/g, "\n\n---\n\n");

    // Replace <br> tags with actual line breaks
    processed = processed.replace(/<br>/gi, "\n");

    // Ensure bullet points have proper spacing
    processed = processed.replace(/\n\*/g, "\n\n*");

    // Ensure proper table formatting - add a newline before tables if needed
    processed = processed.replace(/([^\n])\n(\|[^\n]+\|)/g, "$1\n\n$2");
    processed = processed.replace(/(\|[^\n]+\|)\n([^\n|])/g, "$1\n\n$2");

    return processed;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullMessageRef.current);
    setCopied(true);

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // Show full text immediately function (like a "Skip" button)
  const showFullText = () => {
    setDisplayText(fullMessageRef.current);
    setTypingComplete(true);
    setIsTyping(false);
  };
  return (
    <div
      //{ opacity: 0, y: 10 }}
      // opacity: 1, y: 0 }}
      // duration: 0.3 }}
      className={`flex ${isAssistant ? "flex-row" : "flex-row-reverse"} relative`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 ${isAssistant ? "mr-3" : "ml-3"}`}>
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isAssistant
              ? "bg-gradient-to-r from-purple-600 to-pink-600"
              : "bg-purple-800/40 border border-purple-700/30"
          }`}
        >
          {isAssistant ? (
            <ChefHat className="w-4 h-4 text-white" />
          ) : (
            <span className="text-xs font-medium text-white">You</span>
          )}
        </div>
      </div>

      {/* Message content */}
      <div className={`max-w-[80%] ${isAssistant ? "mr-auto" : "ml-auto"}`}>
        <div
          className={`rounded-t-xl ${
            isAssistant
              ? "bg-purple-900/30 border border-purple-700/30 rounded-br-xl rounded-bl-none"
              : "bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-bl-xl rounded-br-none"
          } px-4 py-3`}
        >
          {/* Render images if present */}
          {(message.images && message.images.length > 0) && (
            <div
              className={`grid gap-2 mb-3 ${
                message.images.length === 1
                  ? "grid-cols-1"
                  : message.images.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-3"
              }`}
            >
              {message.images.map((img: any, index: number) => {
                // Handle both string URLs and objects with a url property
                const imgUrl = typeof img === 'string' ? img : img?.url;
                return (
                  <div
                    key={index}
                    className={`rounded-lg overflow-hidden ${
                      message.images && message.images.length > 2
                        ? "max-h-24 md:max-h-32"
                        : "max-h-48 md:max-h-64"
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      width={64}
                      height={64}
                      alt={`Shared image ${index + 1}`}
                      className="w-full h-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                      onClick={() => window.open(imgUrl, "_blank")}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Content based on role */}
          {isAssistant ? (
            <div className="prose text-[0.8rem] prose-invert prose-sm max-w-none relative">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  p: ({ node, ...props }) => <p className="mb-4" {...props} />,
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-white font-medium text-base mt-6 mb-2"
                      {...props}
                    />
                  ),
                  h4: ({ node, ...props }) => (
                    <h4
                      className="text-white font-medium mt-4 mb-2"
                      {...props}
                    />
                  ),
                  hr: ({ node, ...props }) => (
                    <hr className="my-4 border-purple-700/30" {...props} />
                  ),
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-5 mb-4" {...props} />
                  ),
                  li: ({ node, ...props }) => (
                    <li className="mb-1" {...props} />
                  ),
                  br: ({ node, ...props }) => (
                    <br className="mb-2" {...props} />
                  ),
                  // Table components with improved styling
                  table: ({ node, ...props }) => (
                    <div className="overflow-x-auto mb-4 w-full">
                      <table
                        className="min-w-full border-collapse text-left text-[0.7rem]"
                        {...props}
                      />
                    </div>
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-purple-900/30" {...props} />
                  ),
                  tbody: ({ node, ...props }) => <tbody {...props} />,
                  tr: ({ node, children, ...props }) => {
                    // Get the index from the parent tbody's children array
                    const parentNode = node as any;
                    const index =
                      parentNode?.parent?.children?.indexOf(parentNode) ?? 0;
                    return (
                      <tr
                        className={index % 2 ? "bg-purple-900/10" : undefined}
                        {...props}
                      />
                    );
                  },
                  th: ({ node, ...props }) => (
                    <th
                      className="py-2 px-3 text-left font-medium text-purple-200 border-b border-purple-800/50"
                      {...props}
                    />
                  ),
                  td: ({ node, ...props }) => (
                    <td
                      className="py-1.5 px-2 border-b border-purple-800/20 align-top"
                      {...props}
                    />
                  ),
                  code: ({ node, ...props }) => (
                    <code
                      className="px-1 py-0.5 bg-black/30 rounded text-pink-300 font-mono text-[0.75rem]"
                      {...props}
                    />
                  ),
                  pre: ({ node, ...props }) => (
                    <pre
                      className="p-3 bg-black/30 rounded-md overflow-x-auto mb-4 font-mono text-[0.75rem]"
                      {...props}
                    />
                  ),
                  em: ({ node, ...props }) => (
                    <em className="text-purple-300" {...props} />
                  ),
                  strong: ({ node, ...props }) => (
                    <strong
                      className="text-purple-200 font-semibold"
                      {...props}
                    />
                  )
                }}
              >
                {preprocessMarkdown(displayText)}
              </ReactMarkdown>

              {isTyping && (
                <>
                  {/* Blinking cursor at the end */}
                  <span className="inline-block w-2 h-4 bg-purple-400 ml-1 animate-pulse"></span>

                  {/* Skip button */}
                  <div className="absolute bottom-0 right-0">
                    <button
                      onClick={showFullText}
                      className="text-xs text-purple-400 hover:text-white bg-purple-900/50 px-2 py-1 rounded"
                    >
                      Skip
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            // Only render text message if there is content (otherwise just show the images)
            message.message && <p className="text-white text-[0.8rem]">{message.message}</p>
          )}
        </div>

        {/* Timestamp and actions */}
        <div
          className={`flex items-center text-xs text-purple-400 mt-1 ${
            isAssistant ? "justify-start" : "justify-end"
          }`}
        >
          <span>{format(new Date(message.timestamp), "h:mm a")}</span>

          {isAssistant && typingComplete && (
            <div className="flex items-center ml-2">
              <button
                onClick={copyToClipboard}
                className={`p-1 transition-colors ${
                  copied ? "text-green-400" : "hover:text-white"
                }`}
                title="Copy to clipboard"
              >
                {copied ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
              <button
                className="p-1 hover:text-green-400 transition-colors"
                title="Helpful"
              >
                <ThumbsUp className="w-3 h-3" />
              </button>
              <button
                className="p-1 hover:text-red-400 transition-colors"
                title="Not helpful"
              >
                <ThumbsDown className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
