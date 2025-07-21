import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api/breakout';

// Create a reusable axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const breakoutService = {
  // Create a new breakout room
  async createBreakoutRoom(mainRoomName, breakoutRoomName, participants = []) {
    try {
      const response = await apiClient.post('/create', {
        mainRoomName,
        breakoutRoomName,
        participants
      });
      return response.data;
    } catch (error) {
      console.error('Create Breakout Room Error:', error);
      throw new Error(error.response?.data?.error || 'Failed to create breakout room');
    }
  },

  // Get all breakout rooms for a main room
  async getBreakoutRooms(mainRoomName) {
    try {
      const response = await apiClient.get(`/${mainRoomName}`);
      return response.data;
    } catch (error) {
      console.error('Get Breakout Rooms Error:', error);
      throw new Error(error.response?.data?.error || 'Failed to get breakout rooms');
    }
  },

  // Join a breakout room
  async joinBreakoutRoom(mainRoomName, breakoutRoomName, userName) {
    try {
      const response = await apiClient.post('/join', {
        mainRoomName,
        breakoutRoomName,
        userName
      });
      return response.data.token;
    } catch (error) {
      console.error('Join Breakout Room Error:', error);
      throw new Error(error.response?.data?.error || 'Failed to join breakout room');
    }
  },

  // Leave a breakout room
  async leaveBreakoutRoom(mainRoomName, breakoutRoomName, userName) {
    try {
      const response = await apiClient.post('/leave', {
        mainRoomName,
        breakoutRoomName,
        userName
      });
      return response.data;
    } catch (error) {
      console.error('Leave Breakout Room Error:', error);
      throw new Error(error.response?.data?.error || 'Failed to leave breakout room');
    }
  },

  // Delete a breakout room
  async deleteBreakoutRoom(mainRoomName, breakoutRoomName) {
    try {
      const response = await apiClient.delete(`/${mainRoomName}/${breakoutRoomName}`);
      return response.data;
    } catch (error) {
      console.error('Delete Breakout Room Error:', error);
      throw new Error(error.response?.data?.error || 'Failed to delete breakout room');
    }
  }
}; 