import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosAdmin from '../../axiosAdmin';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styles from './UserDashboard.module.css';

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const UserDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const prevRequestsRef = useRef([]);
  const isFirstRender = useRef(true);
  const [seenNotifications, setSeenNotifications] = useState(new Set());

  // Récupère les demandes de l'utilisateur connecté
  const fetchRequests = async () => {
    try {
      setLoading(true);
      const response = await axiosAdmin.get(`/api/requests/my-requests?status=${filter === 'all' ? '' : filter}`);
      setRequests(response.data);
    } catch (error) {
      console.error('Erreur lors de la récupération des demandes:', error);
      toast.error('Erreur lors du chargement de vos demandes');
    } finally {
      setLoading(false);
    }
  };
  
  // Marquer une notification comme vue côté serveur
  const markNotificationAsSeen = async (requestId) => {
    try {
      await axiosAdmin.post(`/api/notifications/${requestId}/seen`, { type: 'completed' });
      setSeenNotifications(prev => {
        const updated = new Set(prev);
        updated.add(requestId);
        return updated;
      });
      return true;
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme vue:', error);
      return false;
    }
  };
  
  // Charger les notifications non vues au montage du composant
  useEffect(() => {
    const loadUnseenNotifications = async () => {
      try {
        const response = await axiosAdmin.get('/api/notifications/unseen');
        if (response.data.success && response.data.notifications) {
          const unseenIds = new Set(response.data.notifications.map(n => n._id));
          setSeenNotifications(prev => {
            const merged = new Set(prev);
            return merged;
          });
        }
      } catch (error) {
        console.error('Erreur lors du chargement des notifications non vues:', error);
      }
    };
    
    loadUnseenNotifications();
  }, []);
  
  const toastIdsRef = useRef(new Set());

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevRequestsRef.current = [...requests];
      return;
    }

    // Vérifier les nouvelles demandes terminées
    if (requests && requests.length > 0) {
      const currentRequestIds = new Set(requests.map(req => req._id));
      requests.forEach(request => {
        if (!request || !request._id) return;
        const prevRequest = prevRequestsRef.current.find(r => r && r._id === request._id);
        if (request.status === 'completed' && 
            request.downloadLink && 
            !toastIdsRef.current.has(request._id) &&
            !seenNotifications.has(request._id) &&
            (!request.notifications?.completed?.seen)) {// Ne pas afficher si déjà vue côté serveur
          console.log('Nouvelle demande terminée détectée!', request);
          toastIdsRef.current.add(request._id);
          const toastId = `completed-${request._id}`;
          (async () => {
            try {
              await markNotificationAsSeen(request._id);
              setSeenNotifications(prev => new Set([...prev, request._id]));
            } catch (error) {
              console.error('Erreur lors du marquage de la notification comme vue:', error);
            }
          })();
          toast.success(
            <div>
              <div>Votre demande est terminée !</div>
              <a 
                href={request.downloadLink} 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ color: '#fff', textDecoration: 'underline' }}
                onClick={(e) => e.stopPropagation()}
              >
                Télécharger le livre
              </a>
            </div>,
            {
              toastId: toastId,
              autoClose: 10000, // Fermer automatiquement après 10 secondes
              closeOnClick: true,
              closeButton: true
            }
          );
        }
      });
      
      // Nettoyer les IDs des demandes qui n'existent plus
      toastIdsRef.current.forEach(id => {
        if (!currentRequestIds.has(id)) {
          toastIdsRef.current.delete(id);
        }
      });
    }
    prevRequestsRef.current = JSON.parse(JSON.stringify(requests));
  }, [requests]);

  // Vérifier les mises à jour toutes les 30 secondes
  useEffect(() => {
    const intervalId = setInterval(fetchRequests, 30000);
    return () => clearInterval(intervalId);
  }, [filter]);

  useEffect(() => {
    fetchRequests();
  }, [filter]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Chargement de vos demandes...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboardContainer}>
      <h1>Mes demandes</h1>
      
      <div className={styles.filterButtons}>
        <button
          className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          Toutes
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'pending' ? styles.active : ''}`}
          onClick={() => setFilter('pending')}
        >
          En attente
        </button>
        <button
          className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
          onClick={() => setFilter('completed')}
        >
          Terminées
        </button>
      </div>

      {requests.length === 0 ? (
        <div className={styles.emptyState}>
          <p>Vous n'avez aucune demande {filter !== 'all' ? filter : ''}.</p>
        </div>
      ) : (
        requests.map((request) => (
          <div key={request._id} className={`${styles.requestCard} ${request.status === 'completed' ? styles.completed : ''}`}>
            {request.thumbnail && (
              <div className={styles.bookCover}>
                <img 
                  src={request.thumbnail} 
                  alt={`Couverture de ${request.title}`} 
                  className={styles.coverImage}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentNode.classList.add(styles.noCover);
                  }}
                />
              </div>
            )}
            <div className={styles.requestContent}>
              <div className={styles.requestHeader}>
                <h3 className={styles.requestTitle}>{request.title}</h3>
                <span className={`${styles.statusBadge} ${request.status === 'completed' ? styles.completedBadge : styles.pendingBadge}`}>
                  {request.status === 'completed' ? 'Terminé' : 'En attente'}
                </span>
              </div>
              <p className={styles.requestAuthor}>Par {request.author}</p>
              
              {request.pageCount > 0 && (
                <p className={styles.bookMeta}>
                  <span className={styles.metaItem}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                      <polyline points="14 2 14 8 20 8"></polyline>
                      <line x1="16" y1="13" x2="8" y2="13"></line>
                      <line x1="16" y1="17" x2="8" y2="17"></line>
                      <polyline points="10 9 9 9 8 9"></polyline>
                    </svg>
                    {request.pageCount} pages
                  </span>
                </p>
              )}
              
              {request.description && (
                <div className={styles.bookDescription}>
                  <p>{request.description.length > 150 ? `${request.description.substring(0, 150)}...` : request.description}</p>
                </div>
              )}
              
              <div className={styles.actionButtons}>
                {request.link && (
                  <a 
                    href={request.link} 
                    className={styles.secondaryButton}
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    Voir plus d'informations
                  </a>
                )}
                
                {request.status === 'completed' && request.downloadLink && (
                  <a 
                    href={request.downloadLink} 
                    className={styles.primaryButton}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => markNotificationAsSeen(request._id)}
                  >
                    Télécharger le livre
                  </a>
                )}
              </div>
              
              <div className={styles.requestFooter}>
                <span className={styles.requestDate}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  {new Date(request.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default UserDashboard;