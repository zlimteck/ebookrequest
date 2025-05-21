import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationStatus, setVerificationStatus] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/api/users/verify-email/${token}`
        );

        if (response.data.success) {
          setVerificationStatus('success');
          toast.success('Votre adresse email a été vérifiée avec succès !');
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setVerificationStatus('error');
          toast.error(response.data.message || 'Une erreur est survenue lors de la vérification.');
        }
      } catch (error) {
        console.error('Erreur lors de la vérification:', error);
        setVerificationStatus('error');
        toast.error(error.response?.data?.message || 'Une erreur est survenue lors de la vérification.');
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyEmail();
    } else {
      setVerificationStatus('error');
      setIsVerifying(false);
    }
  }, [token, navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      {isVerifying ? (
        <div>
          <h2>Vérification de votre adresse email en cours...</h2>
          <p>Veuillez patienter pendant que nous vérifions votre adresse email.</p>
        </div>
      ) : verificationStatus === 'success' ? (
        <div>
          <h2>Email vérifié avec succès !</h2>
          <p>Vous allez être redirigé vers votre tableau de bord.</p>
        </div>
      ) : (
        <div>
          <h2>Erreur lors de la vérification</h2>
          <p>Le lien de vérification est invalide ou a expiré.</p>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retour au tableau de bord
          </button>
        </div>
      )}
    </div>
  );
};

export default VerifyEmail;