import axios from 'axios';
const API_URL = process.env.API_URL || 'http://localhost:3001'
async function testRegistration() {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test123'
    });
    console.log('Registration response:', response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Registration failed:', error.response?.data);
    }
  }
}

testRegistration();