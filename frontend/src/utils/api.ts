import axios from "axios";

// Define common server URL that can be used by both API and socket connections
export const SERVER_URL =
  (import.meta.env.VITE_BACKEND_URL as string) ?? "http://localhost:5000";

// Define response types for API calls
interface AuthResponse {
  token: string;
  user: {
    username: string;
    lastLogin: string;
  };
}

interface UserProfileResponse {
  user: {
    username: string;
    lastLogin: string;
  };
}

interface LeaderboardEntry {
  username: string;
  score: number;
  gameType: string;
}

// Create an axios instance with default config
const API = axios.create({
  baseURL: `${SERVER_URL}/api`,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token to requests
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => {
    return Promise.reject(
      error instanceof Error ? error : new Error(String(error))
    );
  }
);

// Auth-related API calls
export const AuthAPI = {
  login: (username: string, password: string, rememberMe = false) =>
    API.post<AuthResponse>("/auth/login", {
      username,
      password,
      rememberMe,
    }),

  register: (username: string, password: string) =>
    API.post<AuthResponse>("/auth/register", { username, password }),

  logout: () => localStorage.removeItem("authToken"),

  getProfile: () => API.get<UserProfileResponse>("/auth/verify"),

  changePassword: (username: string, password: string, newPassword: string) =>
    API.post<{ success: boolean; message: string }>("/auth/change-password", {
      username,
      password,
      newPassword,
    }),
};

export const LeaderboardAPI = {
  getLeaderboard: () => API.get<LeaderboardEntry[]>("/leaderboard"),
  saveGameStats: (gameName: string, won: boolean, score: number) =>
    API.post("/leaderboard/save-stats", { gameName, won, score }),
};

// Export the base API for other direct usages
export default API;
