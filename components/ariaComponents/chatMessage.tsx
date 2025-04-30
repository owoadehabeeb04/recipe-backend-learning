import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ChefHat, Copy, ThumbsUp, ThumbsDown, Check } from "lucide-react";
import { format } from "date-fns";
import ReactMarkdown from "react-markdown";

interface MessageProps {
  id: string;
  role: "user" | "assistant";
  message: string;
  timestamp: Date;
  isNew?: boolean;
}

interface ChatMessageProps {
  message: MessageProps;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAssistant = message.role === "assistant";
  const [copied, setCopied] = useState(false);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const fullMessageRef = useRef(message.message);
  
  // Debug info
  console.log(`Message ${message.id.substring(0,5)}... - isNew: ${message.isNew}, isAssistant: ${isAssistant}`);

  // Initialize state when the message changes
  useEffect(() => {
    console.log(`Setting up message ${message.id.substring(0,5)}...`);
    fullMessageRef.current = message.message;

    // Default to treating messages as new if isNew is undefined (for backward compatibility)
    const shouldAnimate = (message.isNew !== false) && isAssistant;
    
    if (shouldAnimate) {
      console.log(`Starting typing animation for message ${message.id.substring(0,5)}...`);
      setDisplayText(""); 
      setTypingComplete(false);
      setIsTyping(true);
    } else {
      console.log(`Showing full message immediately for ${message.id.substring(0,5)}...`);
      setDisplayText(message.message);
      setTypingComplete(true);
      setIsTyping(false);
    }
  }, [message.id, message.message, message.isNew, isAssistant]);

  // Typing effect
  useEffect(() => {
    if (!isAssistant || typingComplete || !isTyping) return;
    
    console.log(`Typing effect running for message ${message.id.substring(0,5)}...`);
    
    let i = 0;
    const fullText = fullMessageRef.current;
    const speed = 25; // Increased speed for better visibility
    let timeout: NodeJS.Timeout;

    // Skip animation for very short messages
    if (fullText.length < 20) {
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
        console.log(`Typing complete for message ${message.id.substring(0,5)}...`);
        setTypingComplete(true);
        setIsTyping(false);
      }
    };

    // Start typing after a short delay
    timeout = setTimeout(() => {
      console.log(`Starting actual typing for message ${message.id.substring(0,5)}...`);
      type();
    }, 300);

    return () => {
      clearTimeout(timeout);
    };
  }, [isAssistant, typingComplete, isTyping, message.id]);

  const preprocessMarkdown = (content: string) => {
    // Replace triple newlines with horizontal rules for better section separation
    let processed = content.replace(/\n\s*\n\s*\n/g, "\n\n---\n\n");

    // Replace <br> tags with actual line breaks
    processed = processed.replace(/<br>/gi, "\n");

    // Ensure bullet points have proper spacing
    processed = processed.replace(/\n\*/g, "\n\n*");

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
    console.log(`Skipping typing for message ${message.id.substring(0,5)}...`);
    setDisplayText(fullMessageRef.current);
    setTypingComplete(true);
    setIsTyping(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
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
          {isAssistant ? (
            <div className="prose text-[0.8rem] prose-invert prose-sm max-w-none relative">
              <ReactMarkdown
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
                  br: ({ node, ...props }) => <br className="mb-2" {...props} />
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
            <p className="text-white text-[0.8rem]">{message.message}</p>
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
    </motion.div>
  );
};

export default ChatMessage;
