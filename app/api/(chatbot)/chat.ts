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