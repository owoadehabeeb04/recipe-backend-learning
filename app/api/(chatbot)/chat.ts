import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const createChat = async (token: string | null | undefined)=> {
    try{
        const response = await axios.post(`${API_URL}/chatbot/chats`, 
            { title: "New Culinary Conversation" },{
                headers: {
                    Authorization: `Bearer ${token}`
                }   
        })
return response.data;
    } catch(error){
        console.error(error)
    }

}


export const getChatMessages = async (token: string | null | undefined, chatId: string) => {
    try{

        const response = await axios.get(`${API_URL}/chatbot/chats/${chatId}/messages`, {
            headers: {
                Authorization: `Bearer ${token}`
            }   
    })
return response.data;
    } catch(error){
        console.error(error)
    }
}




export const sendMessage = async (token: string, chatId: string, message: string) => {
    try {
      const response = await axios.post(`${API_URL}/chatbot/chats/${chatId}/messages`, 
        { message },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }   
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };


  // Keep your original function for backwards compatibility but rename it
export const sendMessageNonStreaming = async (token: string, chatId: string, message: string) => {
  // Your existing implementation
};

// Add a new streaming version
export const sendMessageStream = async (
  token: string,
  chatId: string,
  message: string,
  onStart: (data: any) => void,
  onChunk: (chunk: string) => void,
  onComplete: (data: any) => void,
  onError: (error: string) => void
) => {
  try {
    const response = await fetch(`${API_URL}/chatbot/chats/${chatId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message })
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('Response body is null');

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      // Decode the received chunk
      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;
      
      // Process complete lines
      const lines = buffer.split('\n');
      buffer = lines.pop() || ''; // Keep incomplete line in buffer
      
      for (const line of lines) {
        if (!line.trim() || !line.startsWith('data: ')) continue;
        
        try {
          const jsonData = JSON.parse(line.substring(6));
          
          if (jsonData.type === 'start') {
            onStart(jsonData);
          } else if (jsonData.type === 'chunk' && jsonData.content) {
            onChunk(jsonData.content);
          } else if (jsonData.type === 'complete') {
            onComplete(jsonData);
          } else if (jsonData.type === 'error') {
            onError(jsonData.error || 'Unknown error');
          }
        } catch (e) {
          console.error('Error parsing SSE JSON:', e);
        }
      }
    }
    
    return true;
  } catch (error: any) {
    console.error('Error streaming message:', error);
    onError(error.message || 'Failed to send message');
    throw error;
  }
};





export const renameChat = async (token: string| null | undefined, chatId: string)=> {
    try{
        const response = await axios.put(`${API_URL}/chatbot/chats/${chatId}/rename`, {
            headers: {
                Authorization: `Bearer ${token}`
            }   
    })
return response.data;
    } catch(erroor){
         console.error(erroor)
    }
}


export const continueChat = async (token: string| null | undefined, originalChatId: string)=> {
    try{
        const response = await axios.delete(`${API_URL}/chatbot/chats/${originalChatId}/continue`, {
            headers: {
                Authorization: `Bearer ${token}`
            }   
    })
return response.data;
    } catch(erroor){
         console.error(erroor)
    }
}





export const getChats = async (token: string | null | undefined) => {
    try {
      const response = await axios.get(`${API_URL}/chatbot/chats`, {
        headers: {
          Authorization: `Bearer ${token}`
        }   
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching chats:", error);
      throw error;
    }
  };
  
  export const searchChats = async (token: string | null | undefined, query: string) => {
    try {
      const response = await axios.get(`${API_URL}/chatbot/search`, {
        params: { query },
        headers: {
          Authorization: `Bearer ${token}`
        }   
      });
      return response.data;
    } catch (error) {
      console.error("Error searching chats:", error);
      throw error;
    }
  };
  
  export const deleteChat = async (token: string | null | undefined, chatId: string) => {
    try {
      const response = await axios.delete(`${API_URL}/chatbot/chats/${chatId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Error deleting chat:", error);
      throw error;
    }
  };