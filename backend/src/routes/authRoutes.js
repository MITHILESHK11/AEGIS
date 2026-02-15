const express = require('express');
const { registerUser, getUser, listAllUsers, removeUser } = require('../controllers/authController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/rbac');

const router = express.Router();

// Protected Routes
router.post('/register', verifyToken, registerUser);
router.get('/profile', verifyToken, getUser);

// Admin Routes
router.get('/admin/users', verifyToken, checkRole(['admin']), listAllUsers);
router.delete('/admin/users/:uid', verifyToken, checkRole(['admin']), removeUser);

module.exports = router;
