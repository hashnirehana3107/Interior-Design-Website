const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Subscriber = require('../models/Subscriber');

// Configure NodeMailer transporter (Expects environment variables)
// Make sure EMAIL_USER and EMAIL_PASS are configured in the .env file
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use 'gmail' or adjust host/port for your provider
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// @route   POST /api/subscribers
// @desc    Subscribe to newsletter and send REAL welcome email (if env vars are set)
// @access  Public
router.post('/', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ message: 'Email address is required.' });
        }

        const existing = await Subscriber.findOne({ email: email.trim().toLowerCase() });
        if (existing) {
            return res.status(400).json({ message: 'This email is already subscribed!' });
        }

        const newSub = new Subscriber({
            email: email.trim().toLowerCase()
        });
        await newSub.save();

        const htmlEmailConfig = `
            <div style="font-family: 'Arial', sans-serif; max-width: 600px; margin: 0 auto; color: #333; line-height: 1.6;">
                <div style="text-align: center; padding: 30px; background-color: #0f172a;">
                    <h1 style="color: #c48b59; margin: 0;">GOOD INTERIOR</h1>
                    <p style="color: #cbd5e1; font-size: 14px; letter-spacing: 2px;">DESIGN STUDIO</p>
                </div>
                <div style="padding: 40px 30px; background-color: #ffffff; border: 1px solid #eaeaea;">
                    <h2 style="color: #1e293b; margin-top: 0;">Welcome to our Design Community! 🎉</h2>
                    <p>Hi there,</p>
                    <p>Thank you for subscribing to the Good Interior Design Studio newsletter. We are thrilled to have you here.</p>
                    <p>Get ready to explore the latest interior design trends, exclusive tips, and inspiration tailored just for you. We regularly share content that will help you transform your spaces.</p>
                    <div style="text-align: center; margin: 35px 0;">
                        <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}" style="background-color: #c48b59; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 4px; font-weight: bold; font-size: 15px;">EXPLORE OUR WORK</a>
                    </div>
                    <p>If you have a project in mind, don't hesitate to reach out for a consultation.</p>
                    <p>Stay inspired,<br/><strong>The Good Interior Team</strong></p>
                </div>
                <div style="text-align: center; padding: 20px; font-size: 12px; color: #94a3b8; background-color: #f8fafc;">
                    &copy; 2025 Good Interior Design Studio. All rights reserved.<br/>
                    123 Design Street, Colombo 05, Sri Lanka
                </div>
            </div>
        `;

        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            try {
                await transporter.sendMail({
                    from: `"Good Interior Design" <${process.env.EMAIL_USER}>`,
                    to: newSub.email,
                    subject: 'Welcome to Good Interior Design Studio!',
                    html: htmlEmailConfig,
                });
                console.log(`✅ Welcome Email successfully sent to ${newSub.email}`);
            } catch (mailErr) {
                console.error(`⚠️ Subscriber saved, but failed to send email to ${newSub.email}:`, mailErr.message);
                // We still return 201 since they are subscribed successfully
            }
        } else {
            console.log(`\n========================================`);
            console.log(`📧 SIMULATED EMAIL SENT (Because EMAIL_USER / EMAIL_PASS are missing in .env)`);
            console.log(`To: ${newSub.email}`);
            console.log(`Subject: Welcome to Good Interior Design Studio!`);
            console.log(`========================================\n`);
        }

        res.status(201).json({ message: 'Successfully subscribed!', subscriber: newSub });
    } catch (err) {
        console.error('Subscriber Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   GET /api/subscribers
// @desc    Get all subscribers
// @access  Admin
router.get('/', async (req, res) => {
    try {
        const subs = await Subscriber.find().sort({ subscribedAt: -1 });
        res.status(200).json(subs);
    } catch (err) {
        console.error('Get Subscribers Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @route   DELETE /api/subscribers/:id
// @desc    Delete a subscriber
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        const sub = await Subscriber.findByIdAndDelete(req.params.id);
        if (!sub) return res.status(404).json({ message: 'Subscriber not found' });
        res.json({ message: 'Subscriber removed' });
    } catch (err) {
        console.error('Delete Subscriber Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
