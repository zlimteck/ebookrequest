import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../user/UserForm.module.css';
import { useNavigate } from 'react-router-dom';
import { checkAuth } from '../../services/authService';
const REACT_APP_API_URL = process.env.REACT_APP_API_URL;

function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const verifyAuth = async () => {
      const { isAuthenticated, user } = await checkAuth();
      if (isAuthenticated && user) {
        // Rediriger vers le tableau de bord approprié
        navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
      } else {
        setIsLoading(false);
      }
    };

    verifyAuth();
  }, [navigate]);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const res = await axios.post(`${REACT_APP_API_URL}/api/auth/login`, form);
      if (res.data.token) {
        localStorage.setItem('token', res.data.token);
        window.location.href = res.data.role === 'admin' ? '/admin' : '/dashboard';
      } else {
        throw new Error('Aucun token reçu du serveur');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setMessage(err.response?.data?.message || "Identifiants invalides ou erreur serveur.");
    }
  };

  return (
    <div className={`${styles.formContainer} ${styles.loginFormContainer}`}>
      <div className={styles.logoContainer}>
        <img 
          src="/img/logo.png" 
          alt="Logo" 
          className={styles.logo}
        />
      </div>
      <h2 className={styles.title}>Connexion</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        <input className={styles.input} name="username" placeholder="Nom d'utilisateur" value={form.username} onChange={handleChange} required />
        <input className={styles.input} name="password" type="password" placeholder="Mot de passe" value={form.password} onChange={handleChange} required />
        <button className={styles.button} type="submit">Se connecter</button>
      </form>
      {message && <div className={styles.message}>{message}</div>}
    </div>
  );
}

export default Login;