const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

const fs = require('fs');
const path = require('path');

if (admin.apps.length > 0) {
  console.log(`[FIREBASE] Admin already initialized with project: ${admin.app().options.projectId}`);
} else {
  const serviceAccountPath = process.env.FIREBASE_CREDENTIAL_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (serviceAccountPath) {
    try {
      const resolvedPath = path.resolve(process.cwd(), serviceAccountPath);
      const serviceAccount = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));

      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: serviceAccount.project_id
      });
      console.log(`[FIREBASE] Initialized with project ID: ${serviceAccount.project_id}`);
    } catch (error) {
      console.error('[FIREBASE] Error with service account:', error.message);
      admin.initializeApp();
    }
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.GOOGLE_CLOUD_PROJECT
    });
    console.log(`[FIREBASE] Initialized with ADC. Project: ${process.env.GOOGLE_CLOUD_PROJECT}`);
  }
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = { admin, db, auth };
