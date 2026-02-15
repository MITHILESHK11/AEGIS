
const express = require('express');
const { postOpportunity, listOpportunities, submitApplication, listApplications, listStudentApplications, reviewApplication } = require('../controllers/opportunityController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/rbac');

const router = express.Router();

// Define Routes
router.post('/post', verifyToken, checkRole(['faculty', 'admin']), postOpportunity); // Only Faculty/Admin can post
router.get('/list', verifyToken, listOpportunities); // Viewable by all

// Student Routes
router.post('/:opportunityId/apply', verifyToken, checkRole(['student']), submitApplication); // Only Students can apply
router.get('/my-applications', verifyToken, checkRole(['student']), listStudentApplications); // Only Students

// Faculty Routes
router.get('/applications', verifyToken, checkRole(['faculty', 'admin']), listApplications); // Only Faculty/Admin can view applications
router.patch('/application/:appId', verifyToken, checkRole(['faculty', 'admin']), reviewApplication); // Faculty/Admin can shortlist/reject

module.exports = router;
