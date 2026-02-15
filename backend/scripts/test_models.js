const { VertexAI } = require('@google-cloud/vertexai');
require('dotenv').config();

const project = process.env.GOOGLE_CLOUD_PROJECT || 'lumes-fadef';
const location = process.env.GOOGLE_CLOUD_LOCATION || 'us-central1';

const modelsToTest = [
    'gemini-3-flash-preview',
    'gemini-3-pro-preview',
    'gemini-2.5-flash',
    'gemini-2.5-pro',
    'gemini-2.0-flash',
    'gemini-1.5-flash-001',
    'gemini-1.5-pro-001',
    'gemini-1.0-pro'
];

async function run() {
    console.log(`\n🔍 Checking Model Availability for Project: ${project} in ${location}`);
    console.log("----------------------------------------------------------------");

    const vertexAI = new VertexAI({ project, location });
    let anySuccess = false;

    for (const modelName of modelsToTest) {
        try {
            process.stdout.write(`Testing: ${modelName.padEnd(25)} `);
            const model = vertexAI.getGenerativeModel({ model: modelName });

            // Simple generation request
            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: 'Hello' }] }]
            });
            const response = result.response; // Wait for response

            console.log(`✅ AVAILABLE`);
            anySuccess = true;
        } catch (error) {
            let status = 'UNKNOWN';
            if (error.message.includes('NOT_FOUND')) status = 'NOT_FOUND';
            if (error.message.includes('PERMISSION_DENIED')) status = 'PERMISSION_DENIED';
            if (error.message.includes('404')) status = '404 (Not Found)';
            if (error.message.includes('403')) status = '403 (Forbidden)';

            console.log(`❌ ${status}`);
            // console.log(`   Error: ${error.message.substring(0, 100)}...`);
        }
    }
    console.log("----------------------------------------------------------------");

    if (!anySuccess) {
        console.log("\n⚠️  ALL MODELS FAILED.");
        console.log("Possibilities:");
        console.log("1. 'Vertex AI API' is not enabled in Cloud Console.");
        console.log("2. The region 'us-central1' is incorrect for this project.");
        console.log("3. Service Account permissions (Vertex AI User) not yet propagated.");
    } else {
        console.log("\n🚀 At least one model is working!");
    }
}

run();
