const admin = require('firebase-admin');
const dotenv = require('dotenv');

// We need to point to existing .env in the parent directory
dotenv.config({ path: '../.env' });

try {
    // If credential file path is provided in ENV
    const serviceAccount = require(process.env.FIREBASE_CREDENTIAL_PATH || '../service-account-key.json');
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
    console.log('Firebase initialized.');
} catch (error) {
    console.error('Error initializing Firebase:', error.message);
    process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

const setRole = async (email, role) => {
    try {
        const userRecord = await auth.getUserByEmail(email);
        const uid = userRecord.uid;

        // Set custom claim
        await auth.setCustomUserClaims(uid, { role });
        console.log(`Custom claim { role: '${role}' } set for user ${email}.`);

        // Update Firestore profile
        await db.collection('users').doc(uid).set({ role }, { merge: true });
        console.log(`Firestore profile updated for user ${email}.`);

        console.log('SUCCESS: Role updated. User must sign out and sign in again.');
    } catch (error) {
        console.error('Error setting role:', error.message);
    }
};

const args = process.argv.slice(2);
if (args.length !== 2) {
    console.log('Usage: node setRole.js <email> <role>');
    console.log('Roles: student, faculty, authority, admin');
    process.exit(1);
}

setRole(args[0], args[1]);
