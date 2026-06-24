const mongoose = require('mongoose');
const axios = require('axios');
const cron = require('node-cron');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://db:27017/app';
const HUB_URL = process.env.HUB_URL || 'http://100.111.94.52:6091';

// Group collections to pull
const COLLECTIONS_TO_PULL = ['students', 'teachers', 'schoolAdmins', 'superAdmins', 'schools', 'classes', 'quizzes', 'questions'];

// Helper to get or define model safely
function getModel(name, collection) {
    if (mongoose.models[name]) {
        return mongoose.models[name];
    }
    return mongoose.model(name, new mongoose.Schema({}, { strict: false, collection: collection }));
}

async function syncData() {
    console.log(`[${new Date().toISOString()}] Starting sync cycle...`);

    try {
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(MONGO_URI);
        }

        // 1. PUSH: Upload unsynced student reports
        const StudentReport = getModel('StudentReport', 'studentreports');
        const unsyncedReports = await StudentReport.find({ synced: false });

        if (unsyncedReports.length > 0) {
            console.log(`Found ${unsyncedReports.length} unsynced reports. Uploading...`);
            await axios.post(`${HUB_URL}/api/sync/upload-reports`, { reports: unsyncedReports });

            const reportIds = unsyncedReports.map(r => r._id);
            await StudentReport.updateMany({ _id: { $in: reportIds } }, { $set: { synced: true } });
            console.log(`Successfully synced ${unsyncedReports.length} reports.`);
        }

        // 2. PULL: Download latest data from Hub
        for (const colName of COLLECTIONS_TO_PULL) {
            try {
                console.log(`Pulling updates for: ${colName}...`);
                const response = await axios.get(`${HUB_URL}/api/sync/get-latest/${colName}`);
                const items = response.data.items;

                if (items && items.length > 0) {
                    const Model = getModel(colName, colName);
                    
                    let upsertCount = 0;
                    for (const item of items) {
                        // Use specific IDs for students/teachers, otherwise use _id
                        let filter = { _id: item._id };
                        if (colName === 'students' && item.studentId) filter = { studentId: item.studentId };
                        if (colName === 'teachers' && item.teacherId) filter = { teacherId: item.teacherId };
                        
                        await Model.updateOne(filter, { $set: { ...item, synced: true } }, { upsert: true });
                        upsertCount++;
                    }
                    console.log(`✅ Synced ${upsertCount} items for ${colName}`);
                }
            } catch (colError) {
                console.error(`❌ Failed to pull ${colName}:`, colError.message);
            }
        }

    } catch (error) {
        console.error('❌ Error during sync cycle:', error.message);
    }
}

// Run every hour
cron.schedule('0 * * * *', () => {
    syncData();
});

// Run once on startup
syncData();
