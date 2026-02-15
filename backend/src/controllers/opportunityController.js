
const { createOpportunity, getOpportunities, createApplication, getApplications, getMyApplications, updateApplicationStatus } = require('../services/opportunityService');

const postOpportunity = async (req, res) => {
    try {
        const facultyId = req.user.uid;
        const opportunityData = req.body;

        const newOpp = await createOpportunity(facultyId, opportunityData);
        res.status(201).json(newOpp);
    } catch (error) {
        console.error('Error creating opportunity:', error.message);
        res.status(500).json({ error: 'Failed to create opportunity posting.' });
    }
};

const listOpportunities = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            facultyId: req.query.facultyId // If user wants to see specific faculty's posts
        };

        const opportunities = await getOpportunities(filters);
        res.status(200).json(opportunities);
    } catch (error) {
        console.error('Error fetching opportunities:', error.message);
        res.status(500).json({ error: 'Failed to fetch opportunities.' });
    }
};

const submitApplication = async (req, res) => {
    try {
        const { opportunityId } = req.params;
        const studentId = req.user.uid;
        const applicationData = req.body; // resumeUrl, coverLetter

        const newApp = await createApplication(studentId, opportunityId, applicationData);
        res.status(201).json(newApp);
    } catch (error) {
        console.error('Error applying:', error.message);
        res.status(500).json({ error: 'Failed to submit application.' });
    }
};

const listApplications = async (req, res) => {
    try {
        const facultyId = req.user.uid; // Assumes faculty is logged in
        const applications = await getApplications(facultyId);
        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching applications:', error.message);
        res.status(500).json({ error: 'Failed to fetch applications.' });
    }
};

const listStudentApplications = async (req, res) => {
    try {
        const studentId = req.user.uid;
        const applications = await getMyApplications(studentId);
        res.status(200).json(applications);
    } catch (error) {
        console.error('Error fetching student applications:', error.message);
        res.status(500).json({ error: 'Failed to fetch student applications.' });
    }
};

const reviewApplication = async (req, res) => {
    try {
        const { appId } = req.params;
        const { status } = req.body; // 'Shortlisted', 'Rejected', 'Accepted'

        if (!['Shortlisted', 'Rejected', 'Accepted', 'Submitted'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        await updateApplicationStatus(appId, status);
        res.status(200).json({ message: 'Application status updated.' });
    } catch (error) {
        console.error('Error reviewing application:', error.message);
        res.status(500).json({ error: 'Failed to update application status.' });
    }
};

module.exports = {
    postOpportunity,
    listOpportunities,
    submitApplication,
    listApplications,
    listStudentApplications,
    reviewApplication
};
