import axios from 'axios';

// URL de base de ton API
const API_URL = 'http://localhost:3001'; // Assure-toi que ce port est correct

// Fonction pour récupérer le token d'authentification depuis le localStorage
const getToken = () => localStorage.getItem('token');

// Configuration de l'instance Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requêtes pour ajouter le token dans les en-têtes si disponible
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interface pour les données d'enregistrement de l'utilisateur
export interface RegisterUserData {
  pseudo: string;
  email: string;
  password: string;
}

// Interface pour les données de connexion de l'utilisateur
export interface LoginUserData {
  email: string;
  password: string;
}

// Fonction pour enregistrer un utilisateur
export const registerUser = async (userData: RegisterUserData) => {
  try {
    const response = await api.post('/auth/register', userData); // Vérifie que la route est correcte côté serveur
    return response.data;
  } catch (error: any) {
    console.error('Error registering user:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour connecter un utilisateur
export const loginUser = async (userData: LoginUserData) => {
  try {
    const response = await api.post('/auth/login', userData); // Vérifie que la route est correcte côté serveur
    const data = response.data as { token: string };
    localStorage.setItem('token', data.token);
    return data;
  } catch (error: any) {
    console.error('Error logging in:', error.response?.data || error.message);
    throw error;
  }
};

// Fonction pour récupérer le profil de l'utilisateur
export const getUserProfile = async () => {
  try {
    const response = await api.get('/auth/profile'); // Vérifie que la route est correcte côté serveur
    return response.data;
  } catch (error: any) {
    console.error('Error fetching user profile:', error.response?.data || error.message);
    throw error;
  }
};

// Export de l'instance axios pour un usage global
export default api;
