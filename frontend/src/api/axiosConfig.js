// src/api/axiosConfig.js
import axios from 'axios';

// First, make sure you have axios installed: npm install axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1', // Your backend server's base URL
  withCredentials: true, // This is crucial for sending cookies with requests
});

export default api;