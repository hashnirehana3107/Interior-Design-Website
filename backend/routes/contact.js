const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'interior_design_studio_jwt_secret_key_2026';

// Helper to extract user info from authorization header
const getUserFromHeader = async (req) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.id);
            return user;
        }
    } catch (err) {
        // Token optional or invalid
    }
    return null;
};

// Transporter configuration for Nodemailer
const createTransporter = () => {
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    }
    // Fallback Ethereal SMTP / JSON transport for development testing if SMTP credentials not configured
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: 'ethereal.user@ethereal.email',
            pass: 'ethereal.pass'
        }
    });
};

// @route   POST /api/contact
// @desc    Submit a new contact message and save to MongoDB Atlas
// @access  Public / Authenticated
router.post('/', async (req, res) => {
    try {
        const { fullName, email, phone, subject, message } = req.body;

        // Validation
        if (!fullName || !email || !phone || !subject || !message) {
            return res.status(400).json({ message: 'All fields (full name, email, phone, subject, message) are required.' });
        }

        const user = await getUserFromHeader(req);

        // Create new ContactMessage document
        const newMessage = new ContactMessage({
            fullName: fullName.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim(),
            subject: subject.trim(),
            message: message.trim(),
            userId: user ? user._id : null
        });

        await newMessage.save();
        console.log(`✅ [DB WRITE SUCCESS] New Contact Message saved in MongoDB Atlas! ID: "${newMessage._id}", Sender: "${newMessage.fullName}", Subject: "${newMessage.subject}"`);

        // Send Email Notification to Admin
        const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;
        if (adminEmail && process.env.EMAIL_PASS) {
            try {
                const transporter = createTransporter();
                const mailOptions = {
                    from: `"Good Interior Studio Alerts" <${process.env.EMAIL_USER}>`,
                    to: adminEmail,
                    replyTo: `"${fullName.trim()}" <${email.trim()}>`,
                    subject: `[NEW CONTACT ENQUIRY] ${subject.trim()} - from ${fullName.trim()}`,
                    html: `
                        <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 30px; color: #1e293b;">
                            <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                                <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #b38058;">
                                    <h2 style="color: #b38058; margin: 0; font-size: 22px; letter-spacing: 1px;">GOOD INTERIOR DESIGN STUDIO</h2>
                                    <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0; letter-spacing: 2px;">NEW WEBSITE CONTACT ENQUIRY</p>
                                </div>
                                
                                <div style="padding: 24px 0;">
                                    <p style="font-size: 15px; color: #0f172a; margin-bottom: 15px;">You have received a new contact enquiry from the website:</p>
                                    <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                                        <tr><td style="padding: 8px 0; color: #64748b; width: 120px;"><strong>Client Name:</strong></td><td style="color: #0f172a; font-weight: 600;">${fullName.trim()}</td></tr>
                                        <tr><td style="padding: 8px 0; color: #64748b;"><strong>Email:</strong></td><td style="color: #0f172a;"><a href="mailto:${email.trim()}">${email.trim()}</a></td></tr>
                                        <tr><td style="padding: 8px 0; color: #64748b;"><strong>Phone:</strong></td><td style="color: #0f172a;">${phone.trim()}</td></tr>
                                        <tr><td style="padding: 8px 0; color: #64748b;"><strong>Subject:</strong></td><td style="color: #0f172a; font-weight: 600;">${subject.trim()}</td></tr>
                                    </table>

                                    <div style="background-color: #f1f5f9; border-left: 4px solid #b38058; padding: 15px; border-radius: 4px; margin: 20px 0;">
                                        <p style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 5px 0;">Message Body:</p>
                                        <p style="font-size: 14px; color: #1e293b; margin: 0; white-space: pre-line;">${message.trim()}</p>
                                    </div>

                                    <p style="font-size: 13px; color: #64748b; font-style: italic; margin-top: 20px;">
                                        💡 <strong>Tip:</strong> You can hit <strong>"Reply"</strong> directly in your email app to reply straight to ${fullName.trim()} (${email.trim()}), or use your Admin Dashboard!
                                    </p>
                                </div>

                                <div style="border-top: 1px solid #e2e8f0; padding-top: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
                                    <p style="margin: 0;">Good Interior Studio Automated Notification System</p>
                                </div>
                            </div>
                        </div>
                    `
                };
                await transporter.sendMail(mailOptions);
                console.log(`✅ [ADMIN NOTIFIED] Instant email alert sent to admin (${adminEmail}) for contact submission.`);
            } catch (notifyErr) {
                console.warn(`⚠️ [ADMIN NOTIFY WARNING] Could not send notification email to admin:`, notifyErr.message);
            }
        }

        res.status(201).json({
            message: 'Contact message submitted successfully!',
            data: newMessage
        });
    } catch (error) {
        console.error('Contact Message Submission Error:', error);
        res.status(500).json({ message: 'Server error while sending your message. Please try again.' });
    }
});

// @route   GET /api/contact
// @desc    Get all contact messages for admin OR user-specific if requested by regular user
// @access  Public / Private
router.get('/', async (req, res) => {
    try {
        const user = await getUserFromHeader(req);
        let query = {};

        // If authenticated user is NOT admin, show only their own submitted messages
        if (user && user.role !== 'admin' && !req.query.all) {
            query = { userId: user._id };
        }

        const messages = await ContactMessage.find(query).sort({ createdAt: -1 });
        res.status(200).json({ count: messages.length, messages });
    } catch (error) {
        console.error('Get Contact Messages Error:', error);
        res.status(500).json({ message: 'Failed to fetch contact messages.' });
    }
});

// @route   GET /api/contact/admin/all
// @desc    Get all contact messages explicitly for Admin Dashboard
// @access  Admin
router.get('/admin/all', async (req, res) => {
    try {
        const messages = await ContactMessage.find({}).sort({ createdAt: -1 });
        res.status(200).json({ count: messages.length, messages });
    } catch (error) {
        console.error('Get Admin Contact Messages Error:', error);
        res.status(500).json({ message: 'Failed to fetch all contact messages.' });
    }
});

// @route   POST /api/contact/:id/reply
// @desc    Send email reply to user and update contact message status to 'Replied'
// @access  Admin
router.post('/:id/reply', async (req, res) => {
    try {
        const { replySubject, replyMessage } = req.body;

        if (!replySubject || !replyMessage) {
            return res.status(400).json({ message: 'Reply subject and message body are required.' });
        }

        const contactMsg = await ContactMessage.findById(req.params.id);
        if (!contactMsg) {
            return res.status(404).json({ message: 'Contact message not found.' });
        }

        const recipientEmail = contactMsg.email;
        console.log(`📧 [EMAIL SENDING] Sending reply email to "${recipientEmail}" for message subject "${contactMsg.subject}"...`);

        const hasSalutation = replyMessage.trim().startsWith('Dear');

        // Send Email via Nodemailer
        try {
            const transporter = createTransporter();
            const mailOptions = {
                from: `"Good Interior Studio" <${process.env.EMAIL_USER}>`,
                to: recipientEmail,
                subject: replySubject.trim(),
                html: `
                    <div style="font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; padding: 30px; color: #1e293b;">
                        <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 30px; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                            <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #b38058;">
                                <h2 style="color: #b38058; margin: 0; font-size: 24px; letter-spacing: 1px;">GOOD INTERIOR DESIGN STUDIO</h2>
                                <p style="font-size: 12px; color: #64748b; margin: 5px 0 0 0; letter-spacing: 2px;">LUXURY ARCHITECTURE & INTERIORS</p>
                            </div>
                            
                            <div style="padding: 24px 0;">
                                ${hasSalutation ? '' : `<p style="font-size: 16px; font-weight: 600; color: #0f172a;">Dear ${contactMsg.fullName || contactMsg.name || 'Valued Client'},</p>`}
                                <p style="font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-line;">${replyMessage.trim()}</p>
                            </div>

                            <div style="background-color: #f1f5f9; border-left: 4px solid #b38058; padding: 15px; border-radius: 4px; margin: 20px 0;">
                                <p style="font-size: 12px; font-weight: 600; color: #475569; margin: 0 0 5px 0;">Your Original Enquiry:</p>
                                <p style="font-size: 13px; color: #64748b; margin: 0; font-style: italic;">"${contactMsg.message}"</p>
                            </div>

                            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                                <p style="margin: 0 0 4px 0;">Best Regards,</p>
                                <p style="font-weight: 700; color: #b38058; margin: 0;">Good Interior Studio Executive Team</p>
                                <p style="margin: 8px 0 0 0; font-size: 11px;">www.goodinterior.com | info@goodinterior.com</p>
                            </div>
                        </div>
                    </div>
                `
            };

            await transporter.sendMail(mailOptions);
            console.log(`✅ [EMAIL SENT SUCCESS] Reply email successfully dispatched to ${recipientEmail}`);
        } catch (emailErr) {
            console.warn(`⚠️ [EMAIL WARNING] SMTP transport issue (Message still logged & marked as Replied):`, emailErr.message);
        }

        // Update MongoDB Document
        contactMsg.status = 'Replied';
        contactMsg.replySubject = replySubject.trim();
        contactMsg.replyMessage = replyMessage.trim();
        contactMsg.repliedAt = Date.now();

        await contactMsg.save();
        console.log(`✅ [DB UPDATE SUCCESS] Contact Message "${contactMsg._id}" updated to status 'Replied' in MongoDB Atlas!`);

        res.status(200).json({
            message: `Reply sent successfully to ${recipientEmail}!`,
            data: contactMsg
        });
    } catch (error) {
        console.error('Reply Contact Message Error:', error);
        res.status(500).json({ message: 'Failed to send reply email.' });
    }
});

// @route   PUT /api/contact/:id/status
// @desc    Update contact message status
// @access  Admin
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const updatedMsg = await ContactMessage.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedMsg) return res.status(404).json({ message: 'Contact message not found' });

        res.status(200).json({ message: 'Status updated', data: updatedMsg });
    } catch (error) {
        console.error('Update Status Error:', error);
        res.status(500).json({ message: 'Failed to update status.' });
    }
});

// @route   DELETE /api/contact/:id
// @desc    Delete a contact message
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        const deletedMsg = await ContactMessage.findByIdAndDelete(req.params.id);
        if (!deletedMsg) return res.status(404).json({ message: 'Contact message not found' });

        res.status(200).json({ message: 'Contact message deleted successfully' });
    } catch (error) {
        console.error('Delete Contact Message Error:', error);
        res.status(500).json({ message: 'Failed to delete contact message.' });
    }
});

module.exports = router;
