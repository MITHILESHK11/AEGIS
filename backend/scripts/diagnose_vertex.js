const { VertexAI } = require('@google-cloud/vertexai');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function diagnose() {
    console.log("--- VERTEX AI DIAGNOSTICS ---");

    // 1. Check Configuration
    const project = process.env.GOOGLE_CLOUD_PROJECT || 'lumes-fadef';
    const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './service-account-key.json';

    console.log(`[Config] Project: ${project}`);
    console.log(`[Config] Location: ${location}`);
    console.log(`[Config] Credentials: ${credPath}`);

    // 2. Check Key File
    try {
        const keyFile = path.resolve(process.cwd(), credPath);
        if (!fs.existsSync(keyFile)) {
            console.error(`❌ Key file not found at: ${keyFile}`);
            // Try absolute path or proceed if using ADC
        } else {
            const keyData = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
            console.log(`[Key] Client Email: ${keyData.client_email}`);
            console.log(`[Key] Project ID in Key: ${keyData.project_id}`);

            if (keyData.project_id !== project) {
                console.warn(`⚠️ WARNING: Key file project_id (${keyData.project_id}) DOES NOT MATCH .env project (${project})`);
            } else {
                console.log(`[Key] Project ID matches .env.`);
            }
        }
    } catch (e) {
        console.error(`❌ Error reading key file: ${e.message}`);
    }

    // 3. Test API Connectivity
    console.log("\n[Test] Attempting generation with 'gemini-1.5-flash-001'...");
    try {
        const vertexAI = new VertexAI({ project, location });
        const model = vertexAI.getGenerativeModel({ model: 'gemini-1.5-flash-001' });
        const result = await model.generateContent('Hello');
        const response = await result.response;
        console.log("✅ SUCCESS! Vertex AI is working.");
    } catch (error) {
        console.error("❌ FAILED");
        // Log the full error structure to see details
        console.log(JSON.stringify(error, null, 2));

        if (error.message) console.error("Message:", error.message);
    }
    console.log("-----------------------------");
}

diagnose();
