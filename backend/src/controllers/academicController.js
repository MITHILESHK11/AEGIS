const { createResource, getResources, deleteResource } = require('../services/academicService');

const uploadResource = async (req, res) => {
    try {
        const facultyId = req.user.uid;
        const resourceData = req.body; // title, courseId, description, fileUrl, type, tags

        // Basic Validation
        if (!resourceData.title || !resourceData.fileUrl || !resourceData.courseId) {
            return res.status(400).json({ error: 'Title, Course ID, and File URL are required.' });
        }

        const newResource = await createResource(facultyId, resourceData);
        res.status(201).json(newResource);
    } catch (error) {
        console.error('Error uploading resource:', error.message);
        res.status(500).json({ error: 'Failed to upload resource metadata.' });
    }
};

const listResources = async (req, res) => {
    try {
        const filters = {
            courseId: req.query.courseId,
            resourceType: req.query.type,
            tag: req.query.tag
        };

        const resources = await getResources(filters);
        res.status(200).json(resources);
    } catch (error) {
        console.error('Error listing resources:', error.message);
        res.status(500).json({ error: 'Failed to fetch resources.' });
    }
};

const removeResource = async (req, res) => {
    try {
        const { resourceId } = req.params;
        await deleteResource(resourceId);
        res.status(200).json({ message: 'Resource deleted successfully' });
    } catch (error) {
        console.error('Error deleting resource:', error.message);
        res.status(500).json({ error: 'Failed to delete resource.' });
    }
};

module.exports = {
    uploadResource,
    listResources,
    removeResource
};
