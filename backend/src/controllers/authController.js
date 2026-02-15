const { createUserProfile, getUserProfile, getAllUsers, deleteUser } = require('../services/authService');

const registerUser = async (req, res) => {
    const { email, role, ...additionalData } = req.body;

    // Ensure the user is authenticated via Firebase (middleware populates req.user)
    const uid = req.user.uid;

    // Potential security check: ensure email matches token email
    if (req.user.email !== email) {
        return res.status(400).json({ error: 'Email mismatch between token and body' });
    }

    try {
        // By default, assign 'student' role if not specified.
        // For higher roles (faculty, authority, admin), this should be restricted
        // or handled via an Admin dashboard route, not self-registration.
        // Here we allow 'student' creation freely for valid emails.
        const assignedRole = role === 'admin' ? 'student' : (role || 'student'); // Prevent self-promoting to admin

        const userProfile = await createUserProfile(uid, email, assignedRole, additionalData);
        res.status(201).json(userProfile);
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).json({ error: 'Failed to create user profile' });
    }
};

const getUser = async (req, res) => {
    try {
        // req.user.uid comes from verifyToken middleware
        const userProfile = await getUserProfile(req.user.uid);
        if (!userProfile) {
            return res.status(404).json({ error: 'User profile not found' });
        }
        res.status(200).json(userProfile);
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

const listAllUsers = async (req, res) => {
    try {
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

const removeUser = async (req, res) => {
    try {
        const { uid } = req.params;
        await deleteUser(uid);
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

module.exports = { registerUser, getUser, listAllUsers, removeUser };
