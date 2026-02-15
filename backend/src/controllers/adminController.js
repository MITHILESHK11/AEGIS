const { db } = require('../config/firebase');
const { getAnalyticsData } = require('../services/grievanceService');

const getAdminStats = async (req, res) => {
    try {
        // 1. Get User Counts
        const usersSnapshot = await db.collection('users').get();
        const users = {
            total: usersSnapshot.size,
            students: 0,
            faculty: 0,
            authority: 0,
            admin: 0
        };

        usersSnapshot.forEach(doc => {
            const role = doc.data().role || 'student';
            if (users.hasOwnProperty(`${role}s`)) {
                users[`${role}s`]++;
            } else if (users.hasOwnProperty(role)) {
                users[role]++;
            }
        });

        // 2. Get Grievance Stats
        const grievanceStats = await getAnalyticsData();

        // 3. Get Opportunity Stats
        const oppsSnapshot = await db.collection('opportunities').get();
        const appsSnapshot = await db.collection('applications').get();

        // 4. Get Resource Stats
        const resourcesSnapshot = await db.collection('resources').get();
        let totalDownloads = 0;
        resourcesSnapshot.forEach(doc => {
            totalDownloads += (doc.data().downloadCount || 0);
        });

        const stats = {
            users,
            grievances: {
                total: grievanceStats.total,
                pending: grievanceStats.pending,
                resolved: grievanceStats.resolved
            },
            opportunities: {
                total: oppsSnapshot.size,
                applications: appsSnapshot.size
            },
            resources: {
                total: resourcesSnapshot.size,
                downloads: totalDownloads
            },
            dailyActiveUsers: Math.floor(usersSnapshot.size * 0.4) // Mock DAU for dashboard
        };

        return res.status(200).json(stats);
    } catch (error) {
        console.error('Admin Stats Error:', error.message);
        return res.status(500).json({ error: 'Failed to fetch admin statistics' });
    }
};

module.exports = {
    getAdminStats
};
