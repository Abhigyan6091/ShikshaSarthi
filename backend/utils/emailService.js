const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'poojaiitwork@gmail.com',
        pass: 'poojaiit@work123'
    }
});

const sendOTP = async (email, otp) => {
    const mailOptions = {
        from: '"Shiksha Sarthi" <poojaiitwork@gmail.com>',
        to: email,
        subject: 'Shiksha Sarthi Password Reset',
        text: `Your password reset code is:\n\n${otp}\n\nThis code is valid for 10 minutes.\n\nIf you did not request this reset, please ignore this email.`
    };

    try {
        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('Email send error:', error);
        return false;
    }
};

module.exports = { sendOTP };
