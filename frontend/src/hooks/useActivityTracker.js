import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { REACT_APP_API_URL } from '../config';
import axios from 'axios';

const useActivityTracker = () => {
  const { user } = useAuth();
  const FIVE_MINUTES = 5 * 60 * 1000;

  useEffect(() => {
    if (!user) return;

    // Fonction pour mettre à jour l'activité
    const updateActivity = async () => {
      try {
        await axios.post(`${REACT_APP_API_URL}/api/activity`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'activité:', error);
      }
    };

    updateActivity();

    const interval = setInterval(updateActivity, FIVE_MINUTES);
    return () => clearInterval(interval);
  }, [user]);

  return null;
};

export default useActivityTracker;