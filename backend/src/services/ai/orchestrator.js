const { VertexAI, HarmCategory, HarmBlockThreshold } = require('@google-cloud/vertexai');
const toolRegistry = require('./toolRegistry');

const project = process.env.GOOGLE_CLOUD_PROJECT || 'aegis-platform';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

const vertexAI = new VertexAI({ project, location });
const model = 'gemini-2.5-flash';

const generativeModel = vertexAI.getGenerativeModel({
    model: model,
    safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
    ],
    generationConfig: { maxOutputTokens: 2048 },
});

/**
 * Get the system prompt for a specific role
 */
const getSystemPrompt = (role, context) => {
    const base = `You are AEGIS AI Copilot, a multi-agent, role-aware institutional intelligence system.
Current User Role: ${role.toUpperCase()}
Context: ${JSON.stringify(context)}

Your goal is to assist the user by providing structured information, executing permitted tools, and suggesting proactive steps. 
NEVER bypass RBAC. If a user asks for something outside their role (${role}), politely decline.
Use the provided tools to fetch or modify data.
Always provide professional, concise, and helpful responses in Markdown.`;

    const roleSpecific = {
        student: "Focus on academic resources, grievance reporting, and career opportunities. Help them improve resumes and draft cover letters.",
        faculty: "Focus on managing resources, posting opportunities, and reviewing applicant clusters.",
        authority: "Focus on grievance resolution, pattern detection, and priority management.",
        admin: "Focus on system-wide analytics, user metrics, and platform health."
    };

    return `${base}\n${roleSpecific[role] || ""}`;
};

/**
 * Get available tools for a role
 */
const getToolsForRole = (role) => {
    const roleTools = {
        student: ['create_grievance', 'fetch_attendance_summary', 'apply_to_opportunity'],
        faculty: ['create_opportunity', 'rank_applicants'],
        authority: ['update_grievance_priority', 'summarize_grievances'],
        admin: ['export_analytics', 'summarize_grievances']
    };

    const allowedToolNames = roleTools[role] || [];
    const functionDeclarations = [];

    for (const name of allowedToolNames) {
        if (toolRegistry[name]) {
            functionDeclarations.push({
                name: name,
                description: toolRegistry[name].description || "Tool description unavailable",
                parameters: toolRegistry[name].parameters || {}
            });
        }
    }

    if (functionDeclarations.length > 0) {
        return [{ functionDeclarations: functionDeclarations }];
    } else {
        return [];
    }
};

/**
 * Handle AI Request
 */
const chat = async (userId, role, message, chatHistory = [], context = {}) => {
    try {
        const tools = getToolsForRole(role);
        const systemInstruction = getSystemPrompt(role, context);

        const chatSession = generativeModel.startChat({
            history: chatHistory,
            tools: tools,
            systemInstruction: systemInstruction,
        });

        const result = await chatSession.sendMessage(message);
        const response = result.response;
        const candidate = response.candidates[0];
        const parts = candidate.content.parts;

        let finalResponse = "";
        let toolCalls = [];

        for (const part of parts) {
            if (part.text) {
                finalResponse += part.text;
            }
            if (part.functionCall) {
                const { name, args } = part.functionCall;
                console.log(`[AI] Agent requested tool: ${name} with args:`, args);

                // Execute Tool
                if (toolRegistry[name]) {
                    try {
                        const toolResult = await toolRegistry[name].execute(userId, args);
                        toolCalls.push({ name, args, result: toolResult });

                        // Send tool results back to model for final answer
                        const toolResponseResult = await chatSession.sendMessage([{
                            functionResponse: {
                                name: name,
                                response: { content: toolResult }
                            }
                        }]);

                        finalResponse = toolResponseResult.response.candidates[0].content.parts.map(p => p.text || "").join("");
                    } catch (toolError) {
                        console.error(`[AI] Tool execution error (${name}):`, toolError);
                        finalResponse = "I encountered an error while processing your request via the platform services.";
                    }
                }
            }
        }

        return {
            content: finalResponse,
            toolCalls: toolCalls
        };

    } catch (error) {
        console.error("[AI Orchestrator Error]:", error);
        throw error;
    }
};

module.exports = {
    chat
};
