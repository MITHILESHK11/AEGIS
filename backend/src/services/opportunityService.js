const { db, admin } = require('../config/firebase');

const OPPORTUNITIES_COLLECTION = 'opportunities';
const APPLICATIONS_COLLECTION = 'applications';

const createOpportunity = async (facultyId, data) => {
    try {
        const oppRef = db.collection(OPPORTUNITIES_COLLECTION).doc();
        const opportunityId = oppRef.id;

        const newOpp = {
            opportunityId,
            facultyId,
            title: data.title,
            description: data.description,
            requiredSkills: data.requiredSkills || [],
            duration: data.duration,
            stipend: data.stipend || 'Unpaid',
            applicationDeadline: admin.firestore.Timestamp.fromDate(new Date(data.applicationDeadline)),
            status: 'Open',
            applicantCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await oppRef.set(newOpp);
        return newOpp;
    } catch (error) {
        throw new Error('Error creating opportunity: ' + error.message);
    }
};

const getOpportunities = async (filters = {}) => {
    try {
        let query = db.collection(OPPORTUNITIES_COLLECTION);

        if (filters.status) query = query.where('status', '==', filters.status);
        if (filters.facultyId) query = query.where('facultyId', '==', filters.facultyId);

        const snapshot = await query.get();

        const opportunities = [];
        snapshot.forEach(doc => {
            opportunities.push(doc.data());
        });

        // In-memory sort to avoid index requirements during dev
        opportunities.sort((a, b) => {
            const tA = a.createdAt ? (a.createdAt._seconds || 0) : 0;
            const tB = b.createdAt ? (b.createdAt._seconds || 0) : 0;
            return tB - tA;
        });

        return opportunities;
    } catch (error) {
        throw new Error('Error fetching opportunities: ' + error.message);
    }
};

const createApplication = async (userId, opportunityId, data) => {
    try {
        // Check if already applied
        const existingApp = await db.collection(APPLICATIONS_COLLECTION)
            .where('studentId', '==', userId)
            .where('opportunityId', '==', opportunityId)
            .get();

        if (!existingApp.empty) throw new Error('You have already applied to this opportunity.');

        const appRef = db.collection(APPLICATIONS_COLLECTION).doc();
        const applicationId = appRef.id;

        const newApp = {
            applicationId,
            opportunityId,
            studentId: userId,
            resumeUrl: data.resumeUrl,
            coverLetter: data.coverLetter,
            status: 'Submitted',
            appliedAt: admin.firestore.FieldValue.serverTimestamp()
        };

        const batch = db.batch();
        batch.set(appRef, newApp);

        // Increment applicant count
        const oppRef = db.collection(OPPORTUNITIES_COLLECTION).doc(opportunityId);
        batch.update(oppRef, { applicantCount: admin.firestore.FieldValue.increment(1) });

        await batch.commit();
        return newApp;
    } catch (error) {
        throw new Error('Error submitting application: ' + error.message);
    }
};

const getApplications = async (facultyId) => {
    try {
        // 1. Get opportunities posted by this faculty
        const oppSnapshot = await db.collection(OPPORTUNITIES_COLLECTION).where('facultyId', '==', facultyId).get();

        if (oppSnapshot.empty) return [];

        const oppIds = oppSnapshot.docs.map(doc => doc.id);
        const oppMap = {};
        oppSnapshot.docs.forEach(doc => { oppMap[doc.id] = doc.data().title });

        // 2. Get applications where opportunityId is in the list
        // Firestore 'in' query supports up to 10 items. If we have more, we might need multiple queries or just fetch all and filter.
        // For scalability, let's reverse: fetch all applications (or those for these opps if possible)
        // Since we don't have a direct 'facultyId' on application, constructing a query is tricky without denormalization.
        // BETTER APPROACH: Add 'facultyId' to application on creation? No, let's stick to existing schema.
        // For now, let's fetch applications for EACH opportunity ID (parallel).

        const applications = [];

        const promises = oppIds.map(async (oppId) => {
            const appSnap = await db.collection(APPLICATIONS_COLLECTION).where('opportunityId', '==', oppId).get();
            appSnap.forEach(doc => {
                const data = doc.data();
                applications.push({
                    ...data,
                    opportunityTitle: oppMap[oppId]
                });
            });
        });

        await Promise.all(promises);

        return applications;

    } catch (error) {
        throw new Error('Error fetching applications: ' + error.message);
    }
}

const getMyApplications = async (studentId) => {
    try {
        const appSnapshot = await db.collection(APPLICATIONS_COLLECTION).where('studentId', '==', studentId).get();
        const applications = [];

        // Fetch opportunity details for each application
        const promises = appSnapshot.docs.map(async (doc) => {
            const data = doc.data();
            const oppDoc = await db.collection(OPPORTUNITIES_COLLECTION).doc(data.opportunityId).get();
            applications.push({
                ...data,
                opportunityTitle: oppDoc.exists ? oppDoc.data().title : 'Unknown Opportunity',
                status: data.status || 'Submitted'
            });
        });

        await Promise.all(promises);

        // In-memory sort
        applications.sort((a, b) => {
            const tA = a.appliedAt ? (a.appliedAt._seconds || 0) : 0;
            const tB = b.appliedAt ? (b.appliedAt._seconds || 0) : 0;
            return tB - tA;
        });

        return applications;
    } catch (error) {
        throw new Error('Error fetching student applications: ' + error.message);
    }
}

const updateApplicationStatus = async (appId, status) => {
    try {
        const appRef = db.collection(APPLICATIONS_COLLECTION).doc(appId);
        await appRef.update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { message: 'Status updated successfully' };
    } catch (error) {
        throw new Error('Error updating application status: ' + error.message);
    }
};

module.exports = {
    createOpportunity,
    getOpportunities,
    createApplication,
    getApplications,
    getMyApplications,
    updateApplicationStatus
};
