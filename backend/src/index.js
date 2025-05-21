import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bookRequestRoutes from './routes/bookRequest.js';
import authRoutes from './routes/auth.js';
import googleBooksRoutes from './routes/googleBooks.js';
import pushoverRoutes from './routes/pushover.js';
import notificationRoutes from './routes/notifications.js';
import userRoutes from './routes/user.js';
import adminUserRoutes from './routes/users.js';

// Chargement des variables d'environnement
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Configuration CORS dynamique basée sur les variables d'environnement
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      process.env.REACT_APP_API_URL,
    ].filter(Boolean);
    
    // Vérifier si l'origine est autorisée
    if (allowedOrigins.some(allowedOrigin => 
      origin === allowedOrigin || 
      origin.startsWith(allowedOrigin.replace(/^https?:\/\//, 'http://'))
    )) {
      callback(null, true);
    } else {
      console.warn('Tentative d\'accès non autorisée depuis l\'origine :', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/requests', bookRequestRoutes);
app.use('/api/books', googleBooksRoutes);
app.use('/api/pushover', pushoverRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin/users', adminUserRoutes);

// Route test
app.get('/', (req, res) => {
  res.send('Backend ebook en ligne.');
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  app.listen(PORT, () => {
    console.log(`Serveur backend lancé sur le port ${PORT}`);
  });
})
.catch((error) => console.error('Erreur de connexion MongoDB:', error));