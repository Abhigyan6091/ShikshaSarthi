const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    user_role: { type: String, enum: ['Student', 'Teacher', 'SchoolAdmin', 'SuperAdmin'], required: true },
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expires_at: { type: Date, required: true },
    used: { type: Boolean, default: false },
    verification_attempts: { type: Number, default: 0 },
    created_at: { type: Date, default: Date.now }
});

// Index for automatic deletion after expiry + some buffer
otpSchema.index({ expires_at: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model('OTP', otpSchema);
