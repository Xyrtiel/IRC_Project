import axios from 'axios';

const API_URL = 'http://localhost:3000/auth';

const getToken = () => localStorage.getItem('token');

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Ajouter un interceptor pour inclure le token dans chaque requête HTTP
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      // S'assurer que headers existe avant d'y ajouter l'autorisation
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export interface RegisterUserData {
  pseudo: string;
  email: string;
  password: string;
}

export interface LoginUserData {
  email: string;
  password: string;
}

export const registerUser = async (userData: RegisterUserData) => {
  try {
    const response = await api.post('/register', userData);
    return response.data;
  } catch (error: any) {
    console.error('Error registering user:', error.response?.data || error.message);
    throw error;
  }
};

export const loginUser = async (userData: LoginUserData) => {
  try {
    const response = await api.post('/login', userData);
    // Effectuer une assertion de type sur response.data afin d'accéder à la propriété token
    const data = response.data as { token: string };
    // Sauvegarder le token dans le localStorage après la connexion réussie
    localStorage.setItem('token', data.token);
    return data;
  } catch (error: any) {
    console.error('Error logging in:', error.response?.data || error.message);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await api.get('/profile');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw error;
  }
};

export default api;
