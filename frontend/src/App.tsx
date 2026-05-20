import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './core/store/authContext';
import AppRoutes from './routes';
import './App.css';

function App() {
  useEffect(() => {
    // Cargar el tema preferido (por defecto modo oscuro 'dark' para estética premium)
    const savedTheme = localStorage.getItem('mi_boleta_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
