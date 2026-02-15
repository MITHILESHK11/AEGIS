# AEGIS+ Setup Guide

This guide details how to set up the AEGIS+ development environment locally.

## Prerequisite: Environment Setup

Ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Git**
- **Firebase CLI** (optional, for advanced usage): `npm install -g firebase-tools`

## 1. Firebase Configuration

AEGIS+ relies heavily on Firebase. You must set up a project before running the code.

1.  **Create a Firebase Project**: Go to [Firebase Console](https://console.firebase.google.com/) and create a new project.
2.  **Enable Authentication**:
    *   Go to **Build > Authentication**.
    *   Click **Get Started**.
    *   Enable **Email/Password** provider.
    *   (Optional) Enable **Google** provider if you plan to implement social login.
3.  **Create Firestore Database**:
    *   Go to **Build > Firestore Database**.
    *   Click **Create Database**.
    *   Start in **Test Mode** (allows read/write for 30 days) for development convenience.
    *   Choose a location (e.g., `nam5` for us-central).
4.  **Create Storage Bucket**:
    *   Go to **Build > Storage**.
    *   Click **Get Started**.
    *   Start in **Test Mode**.
5.  **Get Frontend Config**:
    *   Go to **Project Settings > General**.
    *   Scroll to "Your apps" and add a **Web App**.
    *   Copy the `firebaseConfig` object values (apiKey, authDomain, etc.).
6.  **Get Backend Service Account**:
    *   Go to **Project Settings > Service Accounts**.
    *   Click **Generate new private key**.
    *   Save the JSON file. **Rename it to `service-account-key.json`** and place it in the `backend/` directory.

## 2. Backend Setup (`/backend`)

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    *   Create a `.env` file in the `backend` root.
    *   Add the following variables:
        ```ini
        PORT=5000
        GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
        FIREBASE_DATABASE_URL=https://<YOUR_PROJECT_ID>.firebaseio.com
        ```
    *   *Note: `FIREBASE_DATABASE_URL` is needed if using Realtime Database, but for Firestore usually the credentials file is enough if using `firebase-admin`.*

4.  Start the Development Server:
    ```bash
    npm run dev
    ```
    *   You should see: `Server running on port 5000`.

## 3. Frontend Setup (`/frontend`)

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    *   Create a `.env.local` file in the `frontend` root.
    *   Add your Firebase config values (from Step 1.5):
        ```ini
        NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
        NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
        NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
        NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
        NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
        NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
        NEXT_PUBLIC_API_URL=http://localhost:5000/api
        ```

4.  Start the Development Server:
    ```bash
    npm run dev
    ```
    *   The app should be running at `http://localhost:3000`.

## 4. Verification

1.  Open `http://localhost:3000` in your browser.
2.  Navigate to the **Register** page.
3.  Create a new account with the "Student" role.
4.  If successful, you should be redirected to the Student Dashboard.
5.  Check your Firebase Console > Authentication users list to verify the new user exists.

## ⚠️ Troubleshooting

- **CORS Errors**: If you see connection refused or CORS errors in the browser console, ensure the `backend` server is running on port 5000 and the `NEXT_PUBLIC_API_URL` in frontend `.env.local` is correct.
- **"Admin privileges required"**: To test Admin features, you may need to manually update the user's role in Firestore.
    1. Go to Firestore Console > `users` collection.
    2. Find your user document.
    3. Update the `role` field to `admin` or `authority`.
    4. Refresh the page or re-login.
