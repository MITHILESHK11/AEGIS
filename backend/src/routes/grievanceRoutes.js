
const express = require('express');
const { submitGrievance, listGrievances, updateStatus, getStats } = require('../controllers/grievanceController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/rbac');

const router = express.Router();

router.post('/submit', verifyToken, checkRole(['student']), submitGrievance);
router.get('/list', verifyToken, listGrievances); // Filtered by Role inside controller
router.put('/:grievanceId/status', verifyToken, checkRole(['authority']), updateStatus);
router.get('/stats', verifyToken, checkRole(['authority', 'admin']), getStats); // Only Authority/Admin

module.exports = router;
