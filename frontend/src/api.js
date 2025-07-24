import axios from "axios";

// Define a constant for the access token key to avoid magic strings
export const ACCESS_TOKEN = "access"; // This should match what you use in localStorage

// Create an Axios instance
const api = axios.create({
    // Use environment variable for the base URL, falling back to a default
    // For Vite, it's import.meta.env.VITE_API_URL
    // For Create-React-App, it would be process.env.REACT_APP_API_URL
    baseURL: import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api', // Default to your Django backend API base URL
});

// Add a request interceptor to include the JWT token in headers
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem(ACCESS_TOKEN); // Get the access token from local storage
        if (token) {
            // If a token exists, set the Authorization header
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config; // Return the modified config
    },
    (error) => {
        // Handle request errors
        return Promise.reject(error);
    }
);

export default api;
