const mongoose = require('mongoose');
const axios = require('axios');
const cron = require('node-cron');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://db:27017/app';
const HUB_URL = process.env.HUB_URL || 'http://100.111.94.52:8080';

async function syncData() {
    console.log(`[${new Date().toISOString()}] Starting hourly sync...`);

    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(MONGO_URI);
        }

        // 1. PUSH: Upload unsynced student reports
        const StudentReport = mongoose.model('StudentReport', new mongoose.Schema({}, { strict: false, collection: 'studentreports' }));
        const unsyncedReports = await StudentReport.find({ synced: false });

        if (unsyncedReports.length > 0) {
            console.log(`Found ${unsyncedReports.length} unsynced reports. Uploading...`);
            await axios.post(`${HUB_URL}/api/sync/upload-reports`, { reports: unsyncedReports });

            // Mark as synced
            const reportIds = unsyncedReports.map(r => r._id);
            await StudentReport.updateMany({ _id: { $in: reportIds } }, { $set: { synced: true } });
            console.log(`Successfully synced ${unsyncedReports.length} reports.`);
        } else {
            console.log('No new reports to sync.');
        }

        // 2. PULL: Download new quiz questions
        console.log('Checking for new questions from College Hub...');
        const response = await axios.get(`${HUB_URL}/api/sync/get-new-questions`);
        const newQuestions = response.data.questions;

        if (newQuestions && newQuestions.length > 0) {
            const Question = mongoose.model('Question', new mongoose.Schema({}, { strict: false, collection: 'questions' }));

            for (const q of newQuestions) {
                // Upsert based on question content or ID
                await Question.updateOne(
                    { question: q.question, subject: q.subject, topic: q.topic },
                    { $set: { ...q, synced: true } },
                    { upsert: true }
                );
            }
            console.log(`Downloaded and updated ${newQuestions.length} new questions.`);
        } else {
            console.log('No new questions available.');
        }

    } catch (error) {
        console.error('Error during sync:', error.message);
    }
}

// Run every hour
cron.schedule('0 * * * *', () => {
    syncData();
});

// Run once on startup
syncData();
