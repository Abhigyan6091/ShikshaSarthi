const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { RateLimiterMemory } = require('rate-limiter-flexible');

const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const SchoolAdmin = require('../models/SchoolAdmin');
const SuperAdmin = require('../models/SuperAdmin');
const OTP = require('../models/OTP');
const AuditLog = require('../models/AuditLog');
const { sendOTP } = require('../utils/emailService');

// Rate limiters
const otpRequestLimiter = new RateLimiterMemory({
    points: 5,
    duration: 3600, // 1 hour
});

const otpVerifyLimiter = new RateLimiterMemory({
    points: 5,
    duration: 600, // 10 mins
});

// Helper to find user by email across all roles
async function findUserByEmail(email) {
    const roles = [
        { model: Student, role: 'Student' },
        { model: Teacher, role: 'Teacher' },
        { model: SchoolAdmin, role: 'SchoolAdmin' },
        { model: SuperAdmin, role: 'SuperAdmin' }
    ];

    for (const { model, role } of roles) {
        const user = await model.findOne({ email });
        if (user) return { user, role };
    }
    return null;
}

// Helper to find user by ID and role
async function findUserByIdAndRole(id, role) {
    const models = {
        'Student': Student,
        'Teacher': Teacher,
        'SchoolAdmin': SchoolAdmin,
        'SuperAdmin': SuperAdmin
    };
    return await models[role].findById(id);
}

// 1. Forgot Password - Request OTP
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    const ip = req.ip;

    try {
        // Generic response
        const genericResponse = { message: "If an account exists for this email, an OTP has been sent." };

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const userContext = await findUserByEmail(email);

        if (userContext) {
            const { user, role } = userContext;

            // Rate limit check
            try {
                await otpRequestLimiter.consume(user._id.toString());
            } catch (err) {
                return res.status(429).json({ error: "Too many OTP requests. Please try again later." });
            }

            // Generate 6-digit OTP
            const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
            const expiresAt = new Date(Date.now() + 10 * 60000); // 10 minutes

            // Invalidate previous OTPs
            await OTP.updateMany({ user_id: user._id, used: false }, { $set: { used: true } });

            // Store OTP
            const otpEntry = new OTP({
                user_id: user._id,
                user_role: role,
                email: email,
                otp: otpCode,
                expires_at: expiresAt
            });
            await otpEntry.save();

            // Send Email
            await sendOTP(email, otpCode);

            // Audit Log
            await AuditLog.create({
                user_id: user._id,
                user_role: role,
                action: 'OTP_REQUESTED',
                ip_address: ip
            });
        }

        res.status(200).json(genericResponse);
    } catch (err) {
        res.status(500).json({ error: "Server error: " + err.message });
    }
});

// 2. Verify OTP and Reset Password
router.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    const ip = req.ip;

    try {
        if (!email || !otp || !newPassword) {
            return res.status(400).json({ error: "Email, OTP and new password are required" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }

        const otpRecord = await OTP.findOne({ email, otp, used: false }).sort({ created_at: -1 });

        if (!otpRecord) {
            return res.status(401).json({ error: "Invalid or expired OTP" });
        }

        // Rate limit check for verification attempts
        try {
            await otpVerifyLimiter.consume(otpRecord._id.toString());
        } catch (err) {
            return res.status(429).json({ error: "Too many verification attempts for this OTP." });
        }

        // Check expiry
        if (new Date() > otpRecord.expires_at) {
            otpRecord.used = true;
            await otpRecord.save();
            return res.status(401).json({ error: "OTP has expired" });
        }

        // Find user
        const user = await findUserByIdAndRole(otpRecord.user_id, otpRecord.user_role);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Update password (bcrypt is handled by pre-save hooks in models)
        user.password = newPassword;
        user.must_change_password = false;
        await user.save();

        // Mark OTP as used
        otpRecord.used = true;
        await otpRecord.save();

        // Audit Log
        await AuditLog.create({
            user_id: user._id,
            user_role: otpRecord.user_role,
            action: 'PASSWORD_RESET_VIA_OTP',
            ip_address: ip
        });

        res.status(200).json({ message: "Password reset successful. Please login with your new password." });

    } catch (err) {
        res.status(500).json({ error: "Server error: " + err.message });
    }
});

// 3. Admin Set Student Password (For SchoolAdmin or SuperAdmin)
router.post('/admin/reset-student-password', async (req, res) => {
    const { adminId, adminRole, studentId, newPassword } = req.body;
    const ip = req.ip;

    try {
        if (!['SchoolAdmin', 'SuperAdmin'].includes(adminRole)) {
            return res.status(403).json({ error: "Unauthorized access" });
        }

        const student = await Student.findOne({ studentId });
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        let finalPassword;
        if (newPassword) {
            if (newPassword.length < 4) {
                return res.status(400).json({ error: "Password must be at least 4 characters long" });
            }
            finalPassword = newPassword;
            student.must_change_password = false;
        } else {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            finalPassword = `SS2026@${randomNum}`;
            student.must_change_password = true;
        }

        student.password = finalPassword;
        student.markModified('password');
        await student.save();

        await AuditLog.create({
            user_id: student._id,
            user_role: 'Student',
            action: 'PASSWORD_SET_BY_ADMIN',
            ip_address: ip,
            details: { admin_id: adminId, admin_role: adminRole }
        });

        res.status(200).json({
            message: "Password set successfully.",
            tempPassword: finalPassword
        });

    } catch (err) {
        res.status(500).json({ error: "Server error: " + err.message });
    }
});

// 3a. Admin Set School Admin Password (SuperAdmin only)
router.post('/admin/reset-schooladmin-password', async (req, res) => {
    const { adminId, adminRole, username, newPassword } = req.body;
    const ip = req.ip;

    try {
        if (adminRole !== 'SuperAdmin') {
            return res.status(403).json({ error: "Only SuperAdmin can reset school admin passwords" });
        }

        const schoolAdmin = await SchoolAdmin.findOne({ username });
        if (!schoolAdmin) {
            return res.status(404).json({ error: "School admin not found" });
        }

        let finalPassword;
        if (newPassword) {
            if (newPassword.length < 4) {
                return res.status(400).json({ error: "Password must be at least 4 characters long" });
            }
            finalPassword = newPassword;
            schoolAdmin.must_change_password = false;
        } else {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            finalPassword = `SS2026@${randomNum}`;
            schoolAdmin.must_change_password = true;
        }

        schoolAdmin.password = finalPassword;
        schoolAdmin.markModified('password');
        await schoolAdmin.save();

        await AuditLog.create({
            user_id: schoolAdmin._id,
            user_role: 'SchoolAdmin',
            action: 'PASSWORD_SET_BY_ADMIN',
            ip_address: ip,
            details: { admin_id: adminId, admin_role: adminRole }
        });

        res.status(200).json({
            message: "Password set successfully.",
            tempPassword: finalPassword
        });

    } catch (err) {
        res.status(500).json({ error: "Server error: " + err.message });
    }
});

// 3b. Admin Set Teacher Password (SuperAdmin only)
router.post('/admin/reset-teacher-password', async (req, res) => {
    const { adminId, adminRole, teacherId, newPassword } = req.body;
    const ip = req.ip;

    try {
        if (adminRole !== 'SuperAdmin') {
            return res.status(403).json({ error: "Only SuperAdmin can reset teacher passwords" });
        }

        const teacher = await Teacher.findOne({ teacherId });
        if (!teacher) {
            return res.status(404).json({ error: "Teacher not found" });
        }

        let finalPassword;
        if (newPassword) {
            if (newPassword.length < 4) {
                return res.status(400).json({ error: "Password must be at least 4 characters long" });
            }
            finalPassword = newPassword;
            teacher.must_change_password = false;
        } else {
            const randomNum = Math.floor(1000 + Math.random() * 9000);
            finalPassword = `SS2026@${randomNum}`;
            teacher.must_change_password = true;
        }

        teacher.password = finalPassword;
        teacher.markModified('password');
        await teacher.save();

        await AuditLog.create({
            user_id: teacher._id,
            user_role: 'Teacher',
            action: 'PASSWORD_SET_BY_ADMIN',
            ip_address: ip,
            details: { admin_id: adminId, admin_role: adminRole }
        });

        res.status(200).json({
            message: "Password set successfully.",
            tempPassword: finalPassword
        });

    } catch (err) {
        res.status(500).json({ error: "Server error: " + err.message });
    }
});

// 4. Force Change Password (for logged in users)
// This endpoint expects a userId and role, ideally from a session/JWT
// For now we'll accept them in the body as requested by the frontend implementation
router.post('/change-password', async (req, res) => {
    const { userId, role, newPassword } = req.body;
    const ip = req.ip;

    try {
        if (!userId || !role || !newPassword) {
            return res.status(400).json({ error: "User ID, role and new password are required" });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: "Password must be at least 8 characters long" });
        }

        const user = await findUserByIdAndRole(userId, role);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.password = newPassword;
        user.must_change_password = false;
        await user.save();

        // Audit Log
        await AuditLog.create({
            user_id: user._id,
            user_role: role,
            action: 'PASSWORD_CHANGED_FORCE',
            ip_address: ip
        });

        res.status(200).json({ message: "Password updated successfully." });

    } catch (err) {
        res.status(500).json({ error: "Server error: " + err.message });
    }
});

module.exports = router;
