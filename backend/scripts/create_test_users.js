const { admin, db } = require('../src/config/firebase');

const createTestUser = async (email, password, role) => {
    try {
        let userRecord;
        try {
            userRecord = await admin.auth().getUserByEmail(email);
            console.log(`User ${email} already exists. Updating password...`);
            await admin.auth().updateUser(userRecord.uid, { password });
        } catch (error) {
            if (error.code === 'auth/user-not-found') {
                console.log(`Creating new user ${email}...`);
                userRecord = await admin.auth().createUser({
                    email,
                    password,
                    emailVerified: true
                });
            } else {
                throw error;
            }
        }

        // Set Custom Claims
        await admin.auth().setCustomUserClaims(userRecord.uid, { role });
        console.log(`Set role '${role}' for ${email}`);

        // Create Firestore Profile
        await db.collection('users').doc(userRecord.uid).set({
            email,
            role,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            displayName: role.charAt(0).toUpperCase() + role.slice(1) + ' User'
        }, { merge: true });
        console.log(`Updated Firestore profile for ${email}`);

    } catch (error) {
        console.error(`Error creating/updating ${email}:`, error);
    }
};

const main = async () => {
    await createTestUser('admin@aegis.edu', 'admin123', 'admin');
    await createTestUser('student@aegis.edu', 'student123', 'student');
    await createTestUser('faculty@aegis.edu', 'faculty123', 'faculty');
    await createTestUser('authority@aegis.edu', 'authority123', 'authority');
    console.log('All test users processed.');
    process.exit(0);
};

main();
