import axios from 'axios';

const API_BASE_URL = 'http://192.168.127.177:3001/api';

// Create a reusable axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const livekitService = {
  async getToken(roomName, userName) {
    try {
      const response = await apiClient.post('/token', {
        roomName,
        userName
      });
      
      if (!response.data?.token) {
        throw new Error('Invalid token received from server');
      }
      
      // Optional: Verify token structure
      try {
        const payload = JSON.parse(atob(response.data.token.split('.')[1]));
        if (!payload.video?.roomJoin) {
          throw new Error('Token missing roomJoin permission');
        }
      } catch (e) {
        console.warn('Token decoding warning:', e);
      }
      
      return response.data.token;
    } catch (error) {
      console.error('LiveKit Service Error:', {
        config: error.config,
        response: error.response?.data,
        message: error.message
      });
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Failed to get token'
      );
    }
  }
};