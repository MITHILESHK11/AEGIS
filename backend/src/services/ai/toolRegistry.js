const grievanceService = require('../grievanceService');
const opportunityService = require('../opportunityService');
const academicService = require('../academicService');

/**
 * Tool Registry for AEGIS AI Copilot
 * Defines structured tools for Google ADK Agents
 */
const toolRegistry = {
    // STUDENT TOOLS
    create_grievance: {
        description: "Create a new grievance entry for the current student.",
        parameters: {
            type: "object",
            properties: {
                category: { type: "string", description: "Category of grievance (e.g., Hostel, Academic, Infrastructure)" },
                priority: { type: "string", enum: ["Low", "Medium", "High"], description: "Priority level" },
                description: { type: "string", description: "Detailed description of the issue" },
                location: { type: "string", description: "Where the issue occurred" }
            },
            required: ["category", "priority", "description", "location"]
        },
        execute: async (userId, params) => {
            return await grievanceService.createGrievance(userId, params);
        }
    },

    fetch_attendance_summary: {
        description: "Fetch the student's attendance summary and percentages.",
        parameters: { type: "object", properties: {} },
        execute: async (userId) => {
            // Mocking or calling academicService if exists
            return {
                overall: "85%",
                shortfallIn: ["Advanced Math"],
                status: "Good"
            };
        }
    },

    apply_to_opportunity: {
        description: "Submit an application for mentored research or internship.",
        parameters: {
            type: "object",
            properties: {
                opportunityId: { type: "string", description: "ID of the opportunity" },
                coverLetter: { type: "string", description: "Personalized cover letter" },
                resumeUrl: { type: "string", description: "URL to the student's resume" }
            },
            required: ["opportunityId", "coverLetter"]
        },
        execute: async (userId, params) => {
            return await opportunityService.createApplication(userId, params.opportunityId, params);
        }
    },

    // FACULTY TOOLS
    create_opportunity: {
        description: "Post a new internship or research opportunity for students.",
        parameters: {
            type: "object",
            properties: {
                title: { type: "string" },
                description: { type: "string" },
                duration: { type: "string" },
                stipend: { type: "string" },
                applicationDeadline: { type: "string", description: "YYYY-MM-DD" },
                requiredSkills: { type: "array", items: { type: "string" } }
            },
            required: ["title", "description", "duration", "applicationDeadline"]
        },
        execute: async (userId, params) => {
            return await opportunityService.createOpportunity(userId, params);
        }
    },

    rank_applicants: {
        description: "Analyzes and ranks applicants for an opportunity based on skill matching.",
        parameters: {
            type: "object",
            properties: {
                opportunityId: { type: "string" }
            },
            required: ["opportunityId"]
        },
        execute: async (userId, params) => {
            // Logic to fetch applications and rank them
            const apps = await opportunityService.getApplications(userId);
            const filtered = apps.filter(a => a.opportunityId === params.opportunityId);
            return filtered.map(a => ({ ...a, score: Math.floor(Math.random() * 40) + 60 })); // Mock ranking
        }
    },

    // AUTHORITY TOOLS
    update_grievance_priority: {
        description: "Update the priority of an existing grievance.",
        parameters: {
            type: "object",
            properties: {
                grievanceId: { type: "string" },
                priority: { type: "string", enum: ["Low", "Medium", "High", "Critical"] }
            },
            required: ["grievanceId", "priority"]
        },
        execute: async (userId, params) => {
            return await grievanceService.updateGrievanceStatus(params.grievanceId, 'Review', `Priority updated to ${params.priority} by AI Copilot acting on behalf of authority.`, userId);
        }
    },

    summarize_grievances: {
        description: "Provides a summarized trend analysis of current grievances.",
        parameters: { type: "object", properties: {} },
        execute: async () => {
            return await grievanceService.getAnalyticsData();
        }
    },

    // ADMIN TOOLS
    export_analytics: {
        description: "Export full platform analytics and engagement metrics.",
        parameters: { type: "object", properties: {} },
        execute: async () => {
            const grievanceStats = await grievanceService.getAnalyticsData();
            // Add more stats here
            return {
                ...grievanceStats,
                timestamp: new Date().toISOString()
            };
        }
    }
};

module.exports = toolRegistry;
