# E-Book Request

![image](https://zupimages.net/up/25/20/wdmb.png)

Site web pour gérer les requêtes d'ebooks avec interface d'administration et API RESTful. Compatible PWA (Progressive Web App) pour une meilleure expérience utilisateur.

## 📚 Fonctionnalité

- Requête d'ebooks
- Interface d'administration
- Gestion des utilisateurs
- Gestion des requêtes
- Notification admin via Pushover
- Notification utilisateur via Email
- API RESTful
- Compatible PWA (Progressive Web App)


## 🔒 Sécurité

- Authentification par JWT
- Protection des routes administrateur
- Validation des entrées utilisateur
- Hachage des mots de passe avec bcrypt

## 📂 Structure du projet

```
ebookrequest/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── index.js
│   └── scripts/
└── frontend/
    ├── public/
    └── src/
        ├── components/
        ├── pages/
        └── App.js
```

## 📋 Prérequis

- Node.js (v14 ou supérieur)
- MongoDB (version 5.0 ou supérieure) ou MongoDB Atlas
- npm ou yarn

## 🚀 Installation

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/zlimteck/ebookrequest.git
   cd ebookrequest
   ```

2. **Installer les dépendances**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Configuration**
   Renommer le fichier `.env.example` en `.env` dans le dossier `backend/` et modifier les variables.
   
   Renommer le fichier `.env.example` en `.env` dans le dossier `frontend/` et modifier les variables.

4. **Créer un compte administrateur** (Au premier démarrage)
   ```bash
   cd backend
   npm run init-admin
   ```
   Suivez les instructions pour créer le premier compte administrateur.

## 🌐 Déploiement manuel (sans Docker)

### Prérequis
- Serveur avec Node.js et MongoDB
- Nom de domaine (optionnel mais recommandé)
- Certificat SSL (recommandé pour la production)

### Étapes
1. Modifier le fichier nginx.conf si vous le souhaité, pour servir les fichiers statiques du frontend

2. Construire l'application frontend :
   ```bash
   cd frontend
   npm run build
   ```

3. Configurer un gestionnaire de processus comme PM2 pour le backend :
   ```bash
   npm install -g pm2
   cd backend
   pm2 start src/index.js --name "ebook-backend"
   ```

## 🔧 Commandes utiles

- `npm start` - Démarrer le serveur en mode production
- `npm run dev` - Démarrer en mode développement avec rechargement automatique
- `npm run init-admin` - Créer un compte administrateur
- `npm test` - Lancer les tests (à configurer)

## 🐳 Déploiement avec Docker

### Prérequis
- Docker
- Docker Compose
- Un fichier `.env` correctement configuré dans les dossiers `backend/` et `frontend/`

### Étapes

1. Modifier le fichier nginx.conf si vous le souhaité, pour servir les fichiers statiques du frontend

2. Dans le docker-compose.yml, remplacer path/to/backend et path/to/frontend par le chemin de vos dossiers backend et frontend puis votre chemin de votre fichier .env et YOUR_API_URL par votre URL ou IP:PORT de l'API de votre backend puis executez docker-compose up -d

3. Exécuter le script initAdmin.js pour créer un compte administrateur :
   ```bash
   docker exec -it [NOM_OU_ID_DU_CONTENEUR] npm run init-admin
   ```