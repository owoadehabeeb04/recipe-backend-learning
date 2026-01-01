"use client";

// import AriaInterface from "@/components/ariaComponents/ariaInterface";
// import ChatHistory from "@/components/ariaComponents/chatHistory";
import React, { useState } from "react";
import { useInView } from "react-intersection-observer";
import { Sparkles } from "lucide-react";
import dynamic from "next/dynamic";

const AriaInterface = dynamic(
  () => import("@/components/ariaComponents/ariaInterface"),
  { ssr: false }
);
const ChatHistory = dynamic(
  () => import("@/components/ariaComponents/chatHistory"),
  { ssr: false }
);
const Aria = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);

  const { ref: contentRef, inView: contentVisible } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  // Toggle sidebar visibility on mobile
  const toggleSidebar = () => setShowSidebar((prev) => !prev);

  return (
    <div className="flex overflow-y-auto h-screen">
      {/* Desktop sidebar - always fixed on desktop */}
      <div className="hidden w-[280px] sm:w-[300px] fixed overflow-y-auto inset-y-0 left-0 border-r border-border bg-card md:flex flex-col z-10">
        {/* Aria header for desktop sidebar */}
        <div className="px-3 py-3 sm:py-4 border-b border-border flex items-center">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center mr-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
          </div>
          <h1 className="text-lg sm:text-xl font-semibold text-foreground">
            Aria
          </h1>
        </div>

        {/* Chat history */}
        <div className="flex-1 overflow-hidden">
          <ChatHistory
            selectedChatId={selectedChat}
            onSelectChat={setSelectedChat}
          />
        </div>
      </div>

      {/* Mobile sidebar - conditionally visible */}
      {showSidebar && (
        <>
          {/* Mobile overlay */}
          <div
            className="md:hidden overflow-y-scroll fixed inset-0 bg-background/80 backdrop-blur-sm z-20 animate-fade-in"
            onClick={toggleSidebar}
          />

          {/* Mobile sidebar */}
          <div className="md:hidden fixed inset-y-0 left-0 w-[85%] max-w-[300px] z-30 border-r border-border bg-card flex flex-col shadow-xl">
            {/* Aria header for mobile sidebar */}
            <div className="px-3 py-3 sm:py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center mr-2">
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                </div>
                <h1 className="text-lg sm:text-xl font-semibold text-foreground">
                  Aria
                </h1>
              </div>

              <button
                type="button"
                onClick={toggleSidebar}
                className="p-1.5 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground cursor-pointer touch-manipulation"
                aria-label="Close sidebar"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="w-5 h-5 pointer-events-none"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Chat history */}
            <div className="flex-1 overflow-hidden">
              <ChatHistory
                selectedChatId={selectedChat}
                onSelectChat={setSelectedChat}
                isMobile={true}
                onCloseMobile={toggleSidebar}
              />
            </div>
          </div>
        </>
      )}

      {/* Main content area - shifted on desktop to make room for fixed sidebar */}
      <div className="flex-1 flex flex-col h-full overflow-hidden md:ml-[280px] lg:ml-[300px]">
        {/* Mobile header with menu button */}
        <div className="md:hidden flex items-center p-2 sm:p-4 border-b border-border bg-card z-10 relative">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer touch-manipulation"
            aria-label="Toggle sidebar"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 pointer-events-none"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              ></path>
            </svg>
          </button>

          <div className="ml-3 sm:ml-4 flex items-center">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center mr-2">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <h1 className="text-lg sm:text-xl font-semibold text-foreground">
              Aria
            </h1>
          </div>
        </div>

        {/* Chat interface */}
        <div
          ref={contentRef}
          className={`flex-1 overflow-hidden transition-opacity duration-500 ${
            contentVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          <AriaInterface
            setSelectedChatId={setSelectedChat}
            selectedChatId={selectedChat}
            // showGreeting={true}
          />
        </div>
      </div>
    </div>
  );
};

export default Aria;
