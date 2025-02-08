// index.tsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';  // Assurez-vous d'importer BrowserRouter ici
import './styles/index.css';
import HomePage from './pages/HomePage';  // L'import de HomePage doit être correct

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
    <Router>
      <HomePage />  {/* Assurez-vous que HomePage est bien rendu sous le Router */}
    </Router>
  </React.StrictMode>
);
