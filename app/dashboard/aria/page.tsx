'use client'

import AriaInterface from '@/components/ariaComponents/ariaInterface';
import ChatHistory from '@/components/ariaComponents/chatHistory';
import PageHeader from '@/components/ariaComponents/pageHeader';
import React, { useState } from 'react'


const Aria = () => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  return (
    <div className="container p-4 mx-auto">
      <PageHeader 
        title="Aria - Your AI Chef Assistant" 
        description="Ask cooking questions, get recipe ideas, or get help with meal planning" 
        icon="sparkles"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mt-6">
        {/* Chat history sidebar */}
        <div className="md:col-span-2">
          <ChatHistory 
            selectedChatId={selectedChat}
            onSelectChat={setSelectedChat}
          />
        </div>
        
        {/* Main chat interface */}
        <div className="md:col-span-4">
          <AriaInterface setSelectedChatId={setSelectedChat} selectedChatId={selectedChat} />
        </div>
      </div>
    </div>
  )
}

export default Aria