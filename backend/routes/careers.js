const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const JobApplication = require('../models/JobApplication');

const JWT_SECRET = process.env.JWT_SECRET || 'interior_design_studio_jwt_secret_key_2026';
const EMAIL_USER = process.env.EMAIL_USER || 'unicstationary39a@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'afdhtikubzqyrlzs';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || EMAIL_USER;

const createTransporter = () => {
    return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS
        }
    });
};

// @route   POST /api/careers/apply
// @desc    Submit a job application
// @access  Public
router.post('/apply', async (req, res) => {
    try {
        const { fullName, email, phone, position, portfolioUrl, experience, message } = req.body;

        if (!fullName || !email || !phone || !position) {
            return res.status(400).json({ message: 'Full name, email, phone, and position are required.' });
        }

        const newApplication = new JobApplication({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            position: position.trim(),
            portfolioUrl: portfolioUrl ? portfolioUrl.trim() : '',
            experience: experience ? experience.trim() : '',
            message: message ? message.trim() : ''
        });

        await newApplication.save();
        console.log(`✅ [DB WRITE SUCCESS] New Job Application saved in MongoDB Atlas! ID: "${newApplication._id}", Candidate: "${newApplication.fullName}", Position: "${newApplication.position}"`);

        // Send Email Alert to Admin
        try {
            const transporter = createTransporter();
            const mailOptions = {
                from: `"Good Interior Studio Careers" <${EMAIL_USER}>`,
                to: ADMIN_EMAIL,
                replyTo: `"${fullName.trim()}" <${email.trim()}>`,
                subject: `[NEW JOB APPLICATION] ${position.trim()} - ${fullName.trim()}`,
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 30px; color: #1e293b;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #b38058;">
                                <h2 style="color: #b38058; margin: 0; font-size: 22px; letter-spacing: 1px;">GOOD INTERIOR DESIGN STUDIO</h2>
                                <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0; letter-spacing: 2px;">NEW CAREER JOB APPLICATION</p>
                            </div>
                            
                            <div style="padding: 24px 0;">
                                <p style="font-size: 15px; color: #0f172a; margin-bottom: 15px;">A new candidate has applied for a position on the Careers page:</p>
                                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                    <tr><td style="padding: 8px 0; color: #64748b; width: 140px;"><strong>Candidate Name:</strong></td><td style="color: #0f172a; font-weight: 600;">${fullName.trim()}</td></tr>
                                    <tr><td style="padding: 8px 0; color: #64748b;"><strong>Position Applied:</strong></td><td style="color: #b38058; font-weight: 700;">${position.trim()}</td></tr>
                                    <tr><td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td><td style="color: #0f172a;"><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
                                    <tr><td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td><td style="color: #0f172a;">${phone.trim()}</td></tr>
                                    ${experience ? `<tr><td style="padding: 8px 0; color: #64748b;"><strong>Experience:</strong></td><td style="color: #0f172a;">${experience.trim()}</td></tr>` : ''}
                                    ${portfolioUrl ? `<tr><td style="padding: 8px 0; color: #64748b;"><strong>Portfolio / CV Link:</strong></td><td style="color: #0f172a;"><a href="${portfolioUrl.trim()}" target="_blank">${portfolioUrl.trim()}</a></td></tr>` : ''}
                                </table>

                                ${message ? `
                                <div style="background-color: #f1f5f9; border-left: 4px solid #b38058; padding: 15px; border-radius: 4px; margin: 20px 0;">
                                    <p style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 5px 0;">Candidate Cover Note / Intro:</p>
                                    <p style="font-size: 14px; color: #1e293b; margin: 0; white-space: pre-line;">${message.trim()}</p>
                                </div>
                                ` : ''}

                                <p style="font-size: 13px; color: #64748b; font-style: italic; margin-top: 20px;">
                                    💡 <strong>Tip:</strong> You can hit <strong>"Reply"</strong> directly in your email app to email candidate ${fullName.trim()} (${email.trim()})!
                                </p>
                            </div>

                            <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
                                <p style="margin: 0;">Good Interior Studio Automated Recruitment System</p>
                            </div>
                        </div>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
            console.log(`✅ [ADMIN NOTIFIED] Instant email alert sent to admin (${ADMIN_EMAIL}) for job application.`);
        } catch (notifyErr) {
            console.warn(`⚠️ [ADMIN NOTIFY WARNING] Could not send notification email to admin:`, notifyErr.message);
        }

        res.status(201).json({
            message: 'Application submitted successfully! Our recruitment team will review your details and contact you soon.',
            application: newApplication
        });
    } catch (error) {
        console.error('Job Application Error:', error);
        res.status(500).json({ message: 'Server error while submitting application. Please try again.' });
    }
});

// @route   GET /api/careers/applications
// @desc    Get all job applications for admin
// @access  Admin
router.get('/applications', async (req, res) => {
    try {
        const applications = await JobApplication.find().sort({ createdAt: -1 });
        res.status(200).json({ count: applications.length, applications });
    } catch (error) {
        console.error('Get Job Applications Error:', error);
        res.status(500).json({ message: 'Failed to fetch job applications.' });
    }
});

module.exports = router;
