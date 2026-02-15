const aiOrchestrator = require('../services/ai/orchestrator');
const { db } = require('../config/firebase');

const handleChat = async (req, res) => {
    try {
        const { message, history, context } = req.body;
        const { uid, role } = req.user;

        if (!message) {
            return res.status(400).json({ error: 'Message is required' });
        }

        console.log(`[AI] Chat request from ${uid} (Role: ${role})`);

        const response = await aiOrchestrator.chat(uid, role, message, history, context);

        // Log interaction to Firestore for audit & memory
        try {
            await db.collection('ai_interactions').add({
                userId: uid,
                role: role,
                userMessage: message,
                aiResponse: response.content,
                toolCalls: response.toolCalls || [],
                timestamp: new Date().toISOString(),
                context: context || {}
            });
        } catch (logError) {
            console.error('[AI] Interaction logging failed:', logError);
        }

        res.json(response);
    } catch (error) {
        console.error('AI Controller Error:', error);
        res.status(500).json({ error: 'Failed to process AI request: ' + error.message });
    }
};

module.exports = {
    handleChat
};
