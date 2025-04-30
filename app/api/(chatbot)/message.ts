import axios from "axios";


const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const saveMessageFeedback = async (token: string| null | undefined, messageChatId: string)=> {
    try{
        const response = await axios.post(`/${API_URL}/chatbot/messages/${messageChatId}/feedback`, {
            headers: {
                Authorization: `Bearer ${token}`
            }   
    })
return response.data;
    } catch(erroor){
         console.error(erroor)
    }
}