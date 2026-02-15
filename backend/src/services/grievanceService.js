const { db, admin } = require('../config/firebase');

const COLLECTION_NAME = 'grievances';

const createGrievance = async (userId, data) => {
    try {
        const grievanceRef = db.collection(COLLECTION_NAME).doc();
        const grievanceId = grievanceRef.id;

        const newGrievance = {
            grievanceId,
            studentId: userId,
            category: data.category,
            priority: data.priority,
            location: data.location,
            description: data.description,
            photoUrl: data.photoUrl || null,
            isAnonymous: data.isAnonymous || false,
            status: 'Submitted', // Initial status
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            timeline: [
                {
                    status: 'Submitted',
                    timestamp: new Date().toISOString(),
                    remark: 'Grievance submitted successfully.'
                }
            ]
        };

        await grievanceRef.set(newGrievance);
        return newGrievance;
    } catch (error) {
        throw new Error('Error creating grievance: ' + error.message);
    }
};

const getGrievances = async (userId, role, filters = {}) => {
    try {
        let query = db.collection(COLLECTION_NAME);

        // Role-based filtering
        if (role === 'student') {
            query = query.where('studentId', '==', userId);
        } else if (role === 'authority' || role === 'admin') {
            // Authority and Admin should see all grievances.
            // No filters applied here, meaning they get the full list subject to status/filtering below.
        }

        // Apply additional filters
        if (filters.category) query = query.where('category', '==', filters.category);
        if (filters.status) query = query.where('status', '==', filters.status);
        if (filters.priority) query = query.where('priority', '==', filters.priority);

        // query = query.orderBy('createdAt', 'desc'); 
        // NOTE: Sorting by 'createdAt' alongside 'where' filters requires a Composite Index in Firestore.
        // If getting "Precondition Failed" or "Index Required" errors, enable the index via the link in error logs.
        // For development simplicity without waiting for index build, we are temporarily fetching unsorted and sorting in memory if needed,
        // OR just removing the sort to prevent the crash.
        // For production: query.orderBy('createdAt', 'desc') AND create the index.

        const snapshot = await query.get();

        const grievances = [];
        snapshot.forEach(doc => {
            grievances.push(doc.data());
        });

        // In-memory sort (safe for small datasets typical in dev)
        grievances.sort((a, b) => {
            const tA = a.createdAt ? (a.createdAt._seconds || 0) : 0;
            const tB = b.createdAt ? (b.createdAt._seconds || 0) : 0;
            return tB - tA;
        });

        return grievances;
    } catch (error) {
        console.error("Grievance Fetch Error:", error);
        throw new Error('Error fetching grievances: ' + error.message);
    }
};

const updateGrievanceStatus = async (grievanceId, status, remark, authorityId) => {
    try {
        const grievanceRef = db.collection(COLLECTION_NAME).doc(grievanceId);
        const doc = await grievanceRef.get();

        if (!doc.exists) throw new Error('Grievance not found');

        const currentData = doc.data();

        const updateData = {
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            timeline: admin.firestore.FieldValue.arrayUnion({
                status,
                timestamp: new Date().toISOString(),
                remark,
                authorityId
            })
        };

        if (remark) {
            // Optionally add to valid remarks collection if needed, but timeline is sufficient for now
        }

        await grievanceRef.update(updateData);
        return { grievanceId, status, remark };
    } catch (error) {
        throw new Error('Error updating grievance: ' + error.message);
    }
};

const getAnalyticsData = async () => {
    try {
        const snapshot = await db.collection(COLLECTION_NAME).get();
        const stats = {
            total: 0,
            resolved: 0,
            pending: 0,
            inProgress: 0,
            highPriority: 0,
            byCategory: {}
        };

        snapshot.forEach(doc => {
            const data = doc.data();
            stats.total++;

            if (data.status === 'Resolved') stats.resolved++;
            else if (data.status === 'Review' || data.status === 'In Progress') stats.inProgress++;
            else stats.pending++;

            if (data.priority === 'High' || data.priority === 'Critical') stats.highPriority++;

            if (data.category) {
                stats.byCategory[data.category] = (stats.byCategory[data.category] || 0) + 1;
            }
        });

        return stats;
    } catch (error) {
        throw new Error('Error calculating analytics: ' + error.message);
    }
};

module.exports = {
    createGrievance,
    getGrievances,
    updateGrievanceStatus,
    getAnalyticsData
};
