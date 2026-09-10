const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const Consultation = require('../models/Consultation');

const JWT_SECRET = process.env.JWT_SECRET || 'interior_design_studio_jwt_secret_key_2026';

// Helper to extract optional user ID from authorization header
const getUserIdFromHeader = (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            return decoded.id;
        }
    } catch (err) {
        // Token optional for public booking
    }
    return null;
};

// @route   POST /api/consultations
// @desc    Create a new interior design consultation request in MongoDB Atlas
// @access  Public / Authenticated
router.post('/', async (req, res) => {
    try {
        const { fullName, email, phone, service, budget, date, notes } = req.body;

        // Validation
        if (!fullName || !email || !phone) {
            return res.status(400).json({ message: 'Full name, email address, and phone number are required.' });
        }

        const userId = getUserIdFromHeader(req);

        // Create new consultation document
        const newConsultation = new Consultation({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            service: service || 'Residential Interior Design',
            budget: budget || '$10k - $25k',
            date: date || '',
            notes: notes ? notes.trim() : '',
            userId: userId || null
        });

        await newConsultation.save();
        console.log(`✅ [DB WRITE SUCCESS] New Consultation saved in MongoDB Atlas! ID: "${newConsultation._id}", Client: "${newConsultation.fullName}", Service: "${newConsultation.service}"`);

        res.status(201).json({
            message: 'Consultation request submitted successfully!',
            consultation: newConsultation
        });
    } catch (error) {
        console.error('Consultation Submission Error:', error);
        res.status(500).json({ message: 'Server error while processing your consultation request. Please try again.' });
    }
});

// @route   GET /api/consultations
// @desc    Get all consultation requests (or user specific if authenticated)
// @access  Public / Private
router.get('/', async (req, res) => {
    try {
        const userId = getUserIdFromHeader(req);
        let query = {};
        if (userId) {
            query = { userId };
        }
        const consultations = await Consultation.find(query).sort({ createdAt: -1 });
        res.status(200).json({ count: consultations.length, consultations });
    } catch (error) {
        console.error('Get Consultations Error:', error);
        res.status(500).json({ message: 'Failed to fetch consultations.' });
    }
});

// @route   PUT /api/consultations/:id/status
// @desc    Update consultation status
// @access  Admin
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const cons = await Consultation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!cons) return res.status(404).json({ message: 'Consultation not found' });
        res.json(cons);
    } catch (err) {
        console.error('Update Consultation Status Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   POST /api/consultations/:id/reply
// @desc    Send an email reply to a consultation and update status
// @access  Admin
router.post('/:id/reply', async (req, res) => {
    try {
        const { replySubject, replyMessage } = req.body;
        if (!replyMessage) return res.status(400).json({ message: 'Reply message is required' });

        const cons = await Consultation.findById(req.params.id);
        if (!cons) return res.status(404).json({ message: 'Consultation not found' });

        // Set up Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const subjectLine = replySubject ? replySubject.trim() : `Re: ${cons.service || cons.serviceType || 'Interior Design Consultation'} - Good Interior Studio`;

        const hasSalutation = replyMessage.trim().startsWith('Dear');

        const htmlEmailConfig = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 30px; color: #1e293b;">
                <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                    <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #b38058;">
                        <h2 style="color: #b38058; margin: 0; font-size: 24px; letter-spacing: 1px;">GOOD INTERIOR DESIGN STUDIO</h2>
                        <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0; letter-spacing: 2px;">LUXURY ARCHITECTURE & INTERIORS</p>
                    </div>
                    
                    <div style="padding: 24px 0;">
                        ${hasSalutation ? '' : `<p style="font-size: 16px; font-weight: 600; color: #0f172a;">Dear ${cons.fullName},</p>`}
                        <p style="font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-line;">${replyMessage.trim()}</p>
                    </div>

                    <div style="background-color: #f1f5f9; border-left: 4px solid #b38058; padding: 15px; border-radius: 4px; margin: 20px 0;">
                        <p style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 5px 0;">Your Submitted Consultation Details:</p>
                        <p style="font-size: 13px; color: #64748b; margin: 0; font-style: italic;">
                            <strong>Service:</strong> ${cons.service || cons.serviceType || 'Interior Design'}<br/>
                            ${cons.budget ? `<strong>Budget:</strong> ${cons.budget}<br/>` : ''}
                            ${cons.preferredDate || cons.date ? `<strong>Preferred Date:</strong> ${cons.preferredDate || cons.date}<br/>` : ''}
                            ${cons.notes ? `<strong>Notes:</strong> "${cons.notes}"` : ''}
                        </p>
                    </div>

                    <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                        <p style="margin: 0 0 4px 0;">Best Regards,</p>
                        <p style="font-weight: 700; color: #b38058; margin: 0;">Good Interior Studio Executive Team</p>
                    </div>
                </div>
            </div>
        `;

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                await transporter.sendMail({
                    from: `"Good Interior Studio" <${process.env.EMAIL_USER}>`,
                    to: cons.email,
                    subject: subjectLine,
                    html: htmlEmailConfig,
                });
                console.log(`[EMAIL SENT] Consultation reply dispatched to ${cons.email}`);
            } catch (mailErr) {
                console.warn(`[EMAIL WARNING] SMTP transport issue:`, mailErr.message);
            }
        } else {
            console.log(`\n========================================`);
            console.log(`SIMULATED EMAIL SENT (Because EMAIL_USER / EMAIL_PASS are missing)`);
            console.log(`To: ${cons.email} (${cons.fullName})`);
            console.log(`Message:\n${replyMessage}`);
            console.log(`========================================\n`);
        }

        cons.replyMessage = replyMessage;
        cons.repliedAt = new Date();
        cons.status = 'Contacted';

        await cons.save();
        res.json(cons);
    } catch (err) {
        console.error('Reply Consultation Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/consultations/:id
// @desc    Delete a consultation request
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        const cons = await Consultation.findByIdAndDelete(req.params.id);
        if (!cons) return res.status(404).json({ message: 'Consultation not found' });
        res.json({ message: 'Consultation removed' });
    } catch (err) {
        console.error('Delete Consultation Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
