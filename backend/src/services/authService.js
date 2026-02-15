const { admin, db } = require('../config/firebase');

const createUserProfile = async (uid, email, role, additionalData) => {
    const userRef = db.collection('users').doc(uid);
    const snapshot = await userRef.get();

    if (!snapshot.exists) {
        // Basic user data
        const userData = {
            email,
            role,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            ...additionalData
        };

        // Save to Firestore
        await userRef.set(userData);

        // Set custom claim for role-based access control (RBAC) securely
        await admin.auth().setCustomUserClaims(uid, { role });

        return userData;
    }
    return snapshot.data();
};

const getUserProfile = async (uid) => {
    const userRef = db.collection('users').doc(uid);
    const doc = await userRef.get();
    if (!doc.exists) {
        throw new Error('User profile not found');
    }
    return doc.data();
};

const getAllUsers = async () => {
    try {
        const usersSnapshot = await db.collection('users').get();
        const users = [];
        usersSnapshot.forEach(doc => {
            users.push({ id: doc.id, ...doc.data() });
        });

        // In-memory sort
        users.sort((a, b) => {
            const tA = a.createdAt ? (a.createdAt._seconds || 0) : 0;
            const tB = b.createdAt ? (b.createdAt._seconds || 0) : 0;
            return tB - tA;
        });

        return users;
    } catch (error) {
        throw new Error('Error fetching users: ' + error.message);
    }
};

const deleteUser = async (uid) => {
    try {
        // Delete from Auth
        await admin.auth().deleteUser(uid);
        // Delete from Firestore
        await db.collection('users').doc(uid).delete();
        return { message: 'User deleted successfully' };
    } catch (error) {
        throw new Error('Error deleting user: ' + error.message);
    }
};

module.exports = { createUserProfile, getUserProfile, getAllUsers, deleteUser };
