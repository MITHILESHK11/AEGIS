# AEGIS+ Deployment Guide

This guide covers deploying AEGIS+ to production using Google Cloud Platform.

## 🎯 Prerequisites

- Google Cloud Platform account with billing enabled
- Firebase project configured (see SETUP.md)
- Docker installed locally (for containerization)
- Google Cloud SDK installed: `gcloud` CLI

## 📦 Backend Deployment (Cloud Run)

### Step 1: Prepare Backend for Production

1. **Create Production Environment File**:
   Create `backend/.env.production`:
   ```ini
   PORT=8080
   NODE_ENV=production
   GOOGLE_APPLICATION_CREDENTIALS=/app/service-account-key.json
   ```

2. **Create Dockerfile**:
   Create `backend/Dockerfile`:
   ```dockerfile
   FROM node:18-alpine
   
   WORKDIR /app
   
   COPY package*.json ./
   RUN npm ci --only=production
   
   COPY . .
   COPY service-account-key.json /app/
   
   EXPOSE 8080
   
   CMD ["npm", "start"]
   ```

3. **Create .dockerignore**:
   ```
   node_modules
   .env
   .git
   .gitignore
   README.md
   ```

### Step 2: Build and Deploy to Cloud Run

1. **Authenticate with Google Cloud**:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

2. **Enable Required APIs**:
   ```bash
   gcloud services enable run.googleapis.com
   gcloud services enable containerregistry.googleapis.com
   ```

3. **Build Container Image**:
   ```bash
   cd backend
   gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/aegis-backend
   ```

4. **Deploy to Cloud Run**:
   ```bash
   gcloud run deploy aegis-backend \
     --image gcr.io/YOUR_PROJECT_ID/aegis-backend \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --memory 512Mi \
     --cpu 1
   ```

5. **Note the Service URL**: After deployment, you'll receive a URL like:
   `https://aegis-backend-xxxxx-uc.a.run.app`

## 🌐 Frontend Deployment (Vercel - Recommended)

### Option 1: Deploy to Vercel (Easiest)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Update Frontend Environment**:
   Create `frontend/.env.production`:
   ```ini
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_API_URL=https://aegis-backend-xxxxx-uc.a.run.app/api
   ```

3. **Deploy**:
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configure Environment Variables in Vercel Dashboard**:
   - Go to your project settings
   - Add all `NEXT_PUBLIC_*` variables

### Option 2: Deploy to Firebase Hosting

1. **Install Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Login and Initialize**:
   ```bash
   firebase login
   cd frontend
   firebase init hosting
   ```

3. **Build the Frontend**:
   ```bash
   npm run build
   ```

4. **Deploy**:
   ```bash
   firebase deploy --only hosting
   ```

## 🔒 Security Configuration

### 1. Firestore Security Rules

Update Firestore rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check authentication
    function isAuthenticated() {
      return request.auth != null;
    }
    
    // Helper function to check role
    function hasRole(role) {
      return isAuthenticated() && request.auth.token.role == role;
    }
    
    // Users collection
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isAuthenticated() && 
                     (request.auth.uid == userId || hasRole('admin'));
    }
    
    // Grievances collection
    match /grievances/{grievanceId} {
      allow create: if hasRole('student');
      allow read: if isAuthenticated();
      allow update: if hasRole('authority') || hasRole('admin');
      allow delete: if hasRole('admin');
    }
    
    // Resources collection
    match /resources/{resourceId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if hasRole('faculty') || hasRole('admin');
    }
    
    // Opportunities collection
    match /opportunities/{opportunityId} {
      allow read: if isAuthenticated();
      allow create, update, delete: if hasRole('faculty') || hasRole('admin');
    }
    
    // Applications collection
    match /applications/{applicationId} {
      allow create: if hasRole('student');
      allow read: if isAuthenticated();
      allow update: if hasRole('faculty') || hasRole('admin');
    }
  }
}
```

### 2. Storage Security Rules

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /grievances/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'student';
    }
    
    match /resources/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                     (request.auth.token.role == 'faculty' || 
                      request.auth.token.role == 'admin');
    }
    
    match /applications/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'student';
    }
  }
}
```

### 3. CORS Configuration

Ensure your Cloud Run backend allows requests from your frontend domain:

Update `backend/src/index.js`:
```javascript
const cors = require('cors');

const allowedOrigins = [
  'https://your-frontend-domain.vercel.app',
  'https://your-project.web.app',
  'http://localhost:3000' // For development
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

## 📊 Monitoring & Logging

### Cloud Run Monitoring

1. **View Logs**:
   ```bash
   gcloud run services logs read aegis-backend --region us-central1
   ```

2. **Monitor Metrics**: Visit Cloud Console > Cloud Run > aegis-backend > Metrics

### Firebase Analytics

Enable Firebase Analytics in your Firebase Console to track:
- User engagement
- Page views
- Feature usage

## 🔄 CI/CD Pipeline (GitHub Actions)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy AEGIS+

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Cloud SDK
        uses: google-github-actions/setup-gcloud@v1
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}
      
      - name: Build and Deploy to Cloud Run
        run: |
          cd backend
          gcloud builds submit --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/aegis-backend
          gcloud run deploy aegis-backend \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/aegis-backend \
            --platform managed \
            --region us-central1 \
            --allow-unauthenticated

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install Vercel CLI
        run: npm install -g vercel
      
      - name: Deploy to Vercel
        run: |
          cd frontend
          vercel --prod --token=${{ secrets.VERCEL_TOKEN }}
```

## ✅ Post-Deployment Checklist

- [ ] Backend API is accessible at Cloud Run URL
- [ ] Frontend is deployed and accessible
- [ ] Firebase Authentication is working
- [ ] Firestore security rules are applied
- [ ] Storage security rules are applied
- [ ] CORS is properly configured
- [ ] Environment variables are set correctly
- [ ] SSL/HTTPS is enabled (automatic with Cloud Run and Vercel)
- [ ] Monitoring and logging are active
- [ ] Test all user roles (Student, Faculty, Authority, Admin)
- [ ] Test critical workflows (grievance submission, resource upload, etc.)

## 🆘 Troubleshooting

**Issue**: Backend returns 403 errors
- **Solution**: Check Firestore security rules and ensure custom claims are set

**Issue**: CORS errors in browser
- **Solution**: Verify allowed origins in backend CORS configuration

**Issue**: Images not loading
- **Solution**: Check Storage security rules and bucket permissions

**Issue**: High latency
- **Solution**: Consider enabling Cloud CDN or deploying to multiple regions
