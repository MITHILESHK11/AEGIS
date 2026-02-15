const { db, admin } = require('../config/firebase');

const RESOURCES_COLLECTION = 'resources';
const COURSES_COLLECTION = 'courses';

// Create a new resource metadata (Faculty)
const createResource = async (facultyId, data) => {
    try {
        const resourceRef = db.collection(RESOURCES_COLLECTION).doc();
        const resourceId = resourceRef.id;

        const newResource = {
            resourceId,
            courseId: data.courseId,
            title: data.title,
            description: data.description,
            fileUrl: data.fileUrl,
            resourceType: data.resourceType, // notes, paper, slides
            uploadedBy: facultyId,
            tags: data.tags || [],
            downloadCount: 0,
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        };

        await resourceRef.set(newResource);
        return newResource;
    } catch (error) {
        throw new Error('Error creating resource: ' + error.message);
    }
};

// Get resources (Students/Faculty)
const getResources = async (filters = {}) => {
    try {
        let query = db.collection(RESOURCES_COLLECTION);

        if (filters.courseId) query = query.where('courseId', '==', filters.courseId);
        if (filters.resourceType) query = query.where('resourceType', '==', filters.resourceType);
        // Tag filtering usually requires Array contains
        if (filters.tag) query = query.where('tags', 'array-contains', filters.tag);

        const snapshot = await query.get();

        const resources = [];
        snapshot.forEach(doc => {
            const data = doc.data();
            if (!data.isDeleted) {
                resources.push(data);
            }
        });

        // In-memory sort
        resources.sort((a, b) => {
            const tA = a.createdAt ? (a.createdAt._seconds || 0) : 0;
            const tB = b.createdAt ? (b.createdAt._seconds || 0) : 0;
            return tB - tA;
        });

        return resources;
    } catch (error) {
        throw new Error('Error fetching resources: ' + error.message);
    }
};

const deleteResource = async (resourceId) => {
    try {
        const resourceRef = db.collection(RESOURCES_COLLECTION).doc(resourceId);
        await resourceRef.update({
            isDeleted: true,
            deletedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        return { message: 'Resource deleted successfully' };
    } catch (error) {
        throw new Error('Error deleting resource: ' + error.message);
    }
};

module.exports = {
    createResource,
    getResources,
    deleteResource
};
