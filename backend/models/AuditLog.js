const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    user_role: { type: String, enum: ['Student', 'Teacher', 'SchoolAdmin', 'SuperAdmin'], required: true },
    action: { type: String, required: true },
    ip_address: { type: String },
    timestamp: { type: Date, default: Date.now },
    details: { type: mongoose.Schema.Types.Mixed }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
