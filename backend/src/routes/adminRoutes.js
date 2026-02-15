const express = require('express');
const { getAdminStats } = require('../controllers/adminController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/rbac');

const router = express.Router();

router.get('/stats', verifyToken, checkRole(['admin']), getAdminStats);

module.exports = router;
