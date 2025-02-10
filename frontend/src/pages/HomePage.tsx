import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
// @ts-ignore
import catPicture from '../assets/images/cat-picture.jpg';
import { registerUser, loginUser } from '../api/api';

// L'API renvoie un objet avec la propriété "access_token"
interface LoginResponse {
  access_token: string;
}

// Fonction utilitaire pour décoder un JWT en utilisant atob
const decodeToken = (token: string): any => {
  try {
    // Vérification si le token est défini et non vide
    if (!token || token.split('.').length !== 3) {
      throw new Error("Token mal formé");
    }

    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch (error) {
    console.error("Erreur lors du décodage du token:", error);
    return null;
  }
};

const HomePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'connexion' | 'inscription'>('connexion');
  const [user, setUser] = useState({ pseudo: '', email: '', password: '' });
  const [message, setMessage] = useState<string>('');
  const navigate = useNavigate();

  // Gestion des changements dans les champs du formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await registerUser(user);
      setMessage('Inscription réussie ! ✅');
      console.log('Inscription réussie:', response);
      // Réinitialisation des champs après inscription
      setUser({ pseudo: '', email: '', password: '' });
      setActiveTab('connexion');
    } catch (error: any) {
      console.error('Erreur lors de l\'inscription:', error);
      setMessage(error?.response?.data?.message || "Erreur lors de l'inscription ❌");
    }
  };

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await loginUser({ email: user.email, password: user.password });
      console.log("Réponse de loginUser:", response);
      
      // Utilisation de la bonne structure de données (LoginResponse)
      const data = response as unknown as LoginResponse;
      
      // Vérifier si le access_token est bien dans la réponse
      if (!data.access_token) {
        throw new Error("Le access_token est manquant dans la réponse");
      }

      const token = data.access_token;
      localStorage.setItem('token', token);

      // Décoder le token
      const decoded = decodeToken(token);
      if (!decoded) {
        throw new Error("Le token ne peut pas être décodé.");
      }

      // Ici, on assume que le pseudo est présent dans le token décodé sous "pseudo" ou "nickname"
      localStorage.setItem('nickname', decoded.pseudo || decoded.nickname || 'Anonymous');
      localStorage.setItem('userId', decoded.userId || decoded.id || '');

      setMessage('Connexion réussie ! ✅');
      console.log('Utilisateur connecté:', decoded.pseudo || decoded.nickname);
      setUser({ pseudo: '', email: '', password: '' });
      navigate('/chat');
    } catch (error: any) {
      console.error('Erreur lors de la connexion:', error);
      setMessage(error?.response?.data?.message || "Erreur lors de la connexion ❌");
    }
  };

  return (
    <>
      <nav>
        <ul className="nav-links">
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/chat">Chat</Link>
          </li>
        </ul>
      </nav>
      <div className="image-container">
        <img className="cat-picture" src={catPicture} alt="cat" />
      </div>
      <div className="connexion-container">
        <div className="tab-container">
          <button
            className={`tab ${activeTab === 'connexion' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('connexion');
              setMessage('');
            }}
          >
            Connexion
          </button>
          <button
            className={`tab ${activeTab === 'inscription' ? 'active' : ''}`}
            onClick={() => {
              setActiveTab('inscription');
              setMessage('');
            }}
          >
            Inscription
          </button>
        </div>

        <form className="form" onSubmit={activeTab === 'connexion' ? handleLogin : handleRegister}>
          {activeTab === 'connexion' ? (
            <>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Entrez votre email"
                onChange={handleChange}
                value={user.email}
              />
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Entrez votre mot de passe"
                onChange={handleChange}
                value={user.password}
              />
              <button className="submit-button" type="submit">
                Se connecter
              </button>
            </>
          ) : (
            <>
              <label htmlFor="pseudo">Pseudo</label>
              <input
                type="text"
                id="pseudo"
                name="pseudo"
                placeholder="Entrez votre pseudo"
                onChange={handleChange}
                value={user.pseudo}
              />
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Entrez votre email"
                onChange={handleChange}
                value={user.email}
              />
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="Entrez votre mot de passe"
                onChange={handleChange}
                value={user.password}
              />
              <button className="submit-button" type="submit">
                S'inscrire
              </button>
            </>
          )}
        </form>
        {message && <p className="message">{message}</p>}
      </div>
    </>
  );
};

export default HomePage;
