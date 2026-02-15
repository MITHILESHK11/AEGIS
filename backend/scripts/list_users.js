const { admin } = require('../src/config/firebase');

const listAllUsers = async (nextPageToken) => {
    try {
        const listUsersResult = await admin.auth().listUsers(10, nextPageToken);
        if (listUsersResult.users.length === 0) {
            console.log('No users found.');
            return;
        }
        listUsersResult.users.forEach((userRecord) => {
            console.log('User:', userRecord.toJSON());
        });
        if (listUsersResult.pageToken) {
            listAllUsers(listUsersResult.pageToken);
        }
    } catch (error) {
        console.log('Error listing users:', error);
    }
};

// Start listing users from the beginning, 10 at a time.
listAllUsers();
