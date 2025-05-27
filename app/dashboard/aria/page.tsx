'use client'

import AriaInterface from '@/components/ariaComponents/ariaInterface';
import ChatHistory from '@/components/ariaComponents/chatHistory';
import PageHeader from '@/components/ariaComponents/pageHeader';
import React, { useState, useEffect } from 'react'
import { useInView } from 'react-intersection-observer';

const Aria = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  
  // Use ref with 0 threshold to detect when any part of the component is visible
  const { ref: pageRef, inView: pageIsVisible } = useInView({
    threshold: 0,
    triggerOnce: false
  });

  // Toggle sidebar visibility on mobile
  const toggleSidebar = () => setShowSidebar(prev => !prev);

  return (
    <div 
      ref={pageRef} 
      className="container p-3 sm:p-4 mx-auto relative min-h-[calc(100vh-70px)]"
    >
      <PageHeader 
        title="Aria - Your AI Chef Assistant" 
        description="Ask cooking questions, get recipe ideas, or get help with meal planning" 
        icon="sparkles"
      />
      
      {/* Mobile history toggle button */}
      <div className={`md:hidden fixed bottom-6 left-6 z-30 fade-in ${pageIsVisible ? 'visible' : ''}`}>
        <button 
          onClick={toggleSidebar}
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-3 rounded-full shadow-lg"
          aria-label="Toggle chat history"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24" 
            strokeWidth={1.5} 
            stroke="currentColor" 
            className="w-6 h-6"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm-.375 5.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
          </svg>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4 md:gap-6 mt-4 md:mt-6 relative">
        {/* Mobile overlay */}
        {showSidebar && (
          <div 
            className="fixed inset-0 bg-black z-20 md:hidden overlay-transition"
            onClick={toggleSidebar}
          />
        )}
      
        {/* Chat history sidebar - for mobile with CSS transitions */}
        <div 
          className={`fixed left-0 top-0 bottom-0 w-[80%] max-w-sm z-30 md:hidden 
                    bg-gray-800/90 backdrop-blur-sm shadow-xl border-r border-white/5 
                    sidebar-transition ${showSidebar ? 'sidebar-visible' : 'sidebar-hidden'}`}
        >
          <div className="p-4 h-full overflow-y-auto">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
              Chat History
              <button 
                onClick={toggleSidebar} 
                className="p-1.5 rounded-full hover:bg-gray-700/50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </h2>
            <ChatHistory 
              selectedChatId={selectedChat}
              onSelectChat={(chatId) => {
                setSelectedChat(chatId);
                setShowSidebar(false);
              }}
            />
          </div>
        </div>
        
        {/* Chat history sidebar - for desktop */}
        <div className={`hidden md:block md:col-span-2 fade-in ${pageIsVisible ? 'visible' : ''}`}>
          <ChatHistory 
            selectedChatId={selectedChat}
            onSelectChat={setSelectedChat}
          />
        </div>
        
        {/* Main chat interface */}
        <div className={`md:col-span-4 fade-in-up ${pageIsVisible ? 'visible' : ''}`}>
          <AriaInterface setSelectedChatId={setSelectedChat} selectedChatId={selectedChat} />
        </div>
      </div>
    </div>
  );
};

export default Aria;