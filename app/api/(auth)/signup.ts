import axios from "axios"

interface signUpFormData {
username: string;
email: string;
password: string;
}
export const signUp = async (payload: signUpFormData)=> {
try{
const response = await axios.post(`http://localhost:3001/auth/register`, 
payload
)
return response
} catch(error){
    console.log(error)
}
}