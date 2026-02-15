const express = require('express');
const { uploadResource, listResources, removeResource } = require('../controllers/academicController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/rbac');

const router = express.Router();

// Define Routes
router.post('/upload', verifyToken, checkRole(['faculty', 'admin']), uploadResource); // Only Faculty/Admin can upload
router.get('/list', verifyToken, listResources); // Students/Faculty/Admin/Authority can view
router.delete('/delete/:resourceId', verifyToken, checkRole(['faculty', 'admin']), removeResource); // Only Faculty/Admin can delete

module.exports = router;
