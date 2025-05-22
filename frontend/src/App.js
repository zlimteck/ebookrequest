import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserForm from './pages/user/UserForm';
import AdminPage from './pages/admin/AdminPage';
import UserDashboard from './pages/user/UserDashboard';
import Login from './pages/auth/Login';
import VerifyEmail from './pages/auth/VerifyEmail';
import UserSettings from './components/UserSettings';
import styles from './styles/Navbar.module.css';
import { checkAuth, logout as authLogout } from './services/authService';
import useActivityTracker from './hooks/useActivityTracker';

document.body.style.margin = '0';
document.body.style.padding = '0';

function App() {
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth <= 1024;
  const [isLoading, setIsLoading] = useState(true);
  
  useActivityTracker();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Vérifier l'authentification au chargement
    const verifyAuth = async () => {
      try {
        const { isAuthenticated, user } = await checkAuth();
        if (isAuthenticated && user) {
          localStorage.setItem('role', user.role);
          localStorage.setItem('username', user.username);
          setIsAdmin(user.role === 'admin');
          
          // Rediriger vers la page appropriée si sur la page de login
          if (window.location.pathname === '/login') {
            navigate(user.role === 'admin' ? '/admin' : '/dashboard', { replace: true });
          }
        } else if (window.location.pathname !== '/login') {
          // Rediriger vers la page de login si non authentifié et pas déjà sur la page de login
          navigate('/login', { replace: true });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        if (window.location.pathname !== '/login') {
          navigate('/login', { replace: true });
        }
      } finally {
        setIsLoading(false);
      }
    };

    window.addEventListener('resize', handleResize);
    verifyAuth();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [navigate]);

  const handleLogout = () => {
    authLogout();
    setIsAdmin(false);
  };

  const location = useLocation();
  const isAuthPage = location.pathname === '/login';
  const isAdminPage = location.pathname.startsWith('/admin');
  const token = localStorage.getItem('token');

  if (!token && !isAuthPage) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (token && isAuthPage) {
    const role = localStorage.getItem('role');
    return <Navigate to={role === 'admin' ? '/admin' : '/dashboard'} replace />;
  }

  if (isLoading) {
    return <div className="loading">Chargement...</div>;
  }

  if (isAuthPage) {
    return (
      <div style={{ margin: 0, padding: 0, width: '100%', overflowX: 'hidden' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email/:token" element={<VerifyEmail />} />
        </Routes>
      </div>
    );
  }

  return (
    <div style={{ margin: 0, padding: 0, width: '100%', overflowX: 'hidden' }}>
      <nav className={styles.navbar}>
        <div className={styles.navContainer}>
          <div className={styles.navLinks}>
            <Link 
              to="/dashboard" 
              className={`${styles.navlink} ${location.pathname === '/dashboard' ? styles.active : ''}`}
              aria-current={location.pathname === '/dashboard' ? 'page' : undefined}
            >
              Mes demandes
            </Link>
            <Link 
              to="/" 
              className={`${styles.navlink} ${location.pathname === '/' ? styles.active : ''}`}
              aria-current={location.pathname === '/' ? 'page' : undefined}
            >
              Nouvelle demande
            </Link>
            <Link 
              to="/settings" 
              className={`${styles.navlink} ${location.pathname === '/settings' ? styles.active : ''}`}
              aria-current={location.pathname === '/settings' ? 'page' : undefined}
            >
              Paramètres
            </Link>
            {isAdmin && (
              <Link 
                to="/admin" 
                className={`${styles.navlink} ${location.pathname.startsWith('/admin') ? styles.active : ''}`}
                aria-current={location.pathname.startsWith('/admin') ? 'page' : undefined}
              >
                Administration
              </Link>
            )}
          </div>
          {!isAuthPage && !isTablet && (
            <div className={styles.desktopActions}>
              <span className={styles.userInfo}>
                Connecté en tant que {localStorage.getItem('username')}
              </span>
              <button onClick={handleLogout} className={styles.logoutBtn}>
                Déconnexion
              </button>
            </div>
          )}
        </div>
        {!isAuthPage && (isMobile || isTablet) && (
          <div className={styles.mobileNavActions}>
            <span className={styles.userInfo}>
              Connecté en tant que {localStorage.getItem('username')}
            </span>
            <button onClick={handleLogout} className={styles.logoutBtn}>
              Déconnexion
            </button>
          </div>
        )}
      </nav>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route 
          path="/admin" 
          element={
            isAdmin ? 
            <AdminPage /> : 
            <Navigate to="/login" state={{ from: '/admin' }} replace />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            token ? 
            <UserDashboard /> : 
            <Navigate to="/login" state={{ from: '/dashboard' }} replace />
          } 
        />
        <Route 
          path="/settings" 
          element={
            token ?
            <UserSettings /> :
            <Navigate to="/login" state={{ from: '/settings' }} replace />
          } 
        />
        <Route 
          path="/verify-email/:token?" 
          element={
            token ?
            <VerifyEmail /> :
            <Navigate to="/login" state={{ from: '/verify-email' }} replace />
          } 
        />
        <Route path="/" element={token ? <UserForm /> : <Navigate to="/login" replace />} />
        {/* Redirection pour les routes inconnues */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
}

export default App;