
const { createGrievance, getGrievances, updateGrievanceStatus, getAnalyticsData } = require('../services/grievanceService');

// Create a new grievance (Student)
const submitGrievance = async (req, res) => {
    try {
        const userId = req.user.uid;
        const grievanceData = req.body;

        const newGrievance = await createGrievance(userId, grievanceData);
        return res.status(201).json(newGrievance);
    } catch (error) {
        console.error('Error submitting grievance:', error.message);
        return res.status(500).json({ error: 'Failed to submit grievance' });
    }
};

// Get grievances (Student: own, Authority: assigned/all)
const listGrievances = async (req, res) => {
    try {
        const userId = req.user.uid;
        const role = req.user.role || 'student'; // Default to student

        const filters = {
            category: req.query.category,
            status: req.query.status,
            priority: req.query.priority
        };

        const grievances = await getGrievances(userId, role, filters);
        return res.status(200).json(grievances);
    } catch (error) {
        console.error('Error listing grievances:', error.message);
        return res.status(500).json({ error: 'Failed to fetch grievances' });
    }
};

// Update status (Authority)
const updateStatus = async (req, res) => {
    try {
        const { grievanceId } = req.params;
        const { status, remark } = req.body;
        const authorityId = req.user.uid;

        // Basic validation
        if (!status || !remark) {
            return res.status(400).json({ error: 'Status and Remark are required for updates.' });
        }

        const result = await updateGrievanceStatus(grievanceId, status, remark, authorityId);
        return res.status(200).json(result);
    } catch (error) {
        console.error('Error updating status:', error.message);
        return res.status(500).json({ error: 'Failed to update grievance status' });
    }
};

const getStats = async (req, res) => {
    try {
        const stats = await getAnalyticsData();
        return res.status(200).json(stats);
    } catch (error) {
        console.error('Error calculating analytics:', error.message);
        return res.status(500).json({ error: 'Failed to load analytics' });
    }
}

module.exports = {
    submitGrievance,
    listGrievances,
    updateStatus,
    getStats
};
