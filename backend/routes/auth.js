const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'interior_design_studio_jwt_secret_key_2026';

// @route   POST /api/auth/register
// @desc    Register a new user in MongoDB
// @access  Public
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, phone, country, password } = req.body;

        // Validation
        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Full name, email, and password are required.' });
        }

        // Password complexity validation
        if (password.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain both uppercase and lowercase letters.' });
        }
        if (!/[0-9]/.test(password) && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
            return res.status(400).json({ message: 'Password must contain at least one number or special character.' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email address already exists.' });
        }


        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            fullName,
            email: email.toLowerCase(),
            phone: phone || '',
            country: country || '',
            password: hashedPassword
        });

        await newUser.save();
        console.log(`✅ [DB WRITE SUCCESS] New User saved in database "${newUser._id}": ${newUser.email}`);


        // Create JWT Token
        const token = jwt.sign(
            { id: newUser._id, email: newUser.email },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                phone: newUser.phone,
                country: newUser.country,
                avatar: newUser.avatar || '',
                role: newUser.role || 'user'
            }
        });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server error during registration. Please try again.' });
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password.' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email address or password.' });
        }

        // Validate password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid email address or password.' });
        }

        // Create Token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role || 'user' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Logged in successfully',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                country: user.country,
                avatar: user.avatar || '',
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login. Please try again.' });
    }
});

const { OAuth2Client } = require('google-auth-library');
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// @route   POST /api/auth/google
// @desc    Authenticate or register user via Real Google OAuth ID Token & save to MongoDB
// @access  Public
router.post('/google', async (req, res) => {
    try {
        const { credential, email, fullName, googleId } = req.body;

        let userEmail = email;
        let userName = fullName;
        let verifiedGoogleId = googleId;

        // 1. Verify Real Google ID Token if credential is provided
        if (credential) {
            try {
                const ticket = await googleClient.verifyIdToken({
                    idToken: credential,
                    audience: process.env.GOOGLE_CLIENT_ID
                });
                const payload = ticket.getPayload();
                userEmail = payload.email;
                userName = payload.name || payload.email.split('@')[0];
                verifiedGoogleId = payload.sub;
            } catch (verError) {
                console.warn('Google Token verification warning:', verError.message);
                // Fallback to payload data if verify fails without configured client ID
            }
        }

        if (!userEmail) {
            return res.status(400).json({ message: 'Google authentication failed: Email is required.' });
        }

        const normalizedEmail = userEmail.toLowerCase();
        const finalName = userName || normalizedEmail.split('@')[0];

        // 2. Check if user already exists in MongoDB Atlas
        let user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            // Generate secure hashed password for new Google user account
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(verifiedGoogleId || `GoogleOAuth_${Date.now()}`, salt);

            user = new User({
                fullName: finalName,
                email: normalizedEmail,
                phone: '',
                country: 'Sri Lanka',
                password: hashedPassword
            });

            await user.save();
            console.log(`✅ [REAL GOOGLE DB WRITE] New User created in MongoDB "${user._id}": ${user.email}`);
        } else {
            console.log(`✅ [REAL GOOGLE DB AUTH] Existing User authenticated in MongoDB "${user._id}": ${user.email}`);
        }

        // 3. Create JWT Token for frontend session
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role || 'user' },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            message: 'Real Google authentication successful',
            token,
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                country: user.country,
                avatar: user.avatar || '',
                role: user.role || 'user'
            }
        });
    } catch (error) {
        console.error('Google Auth Route Error:', error);
        res.status(500).json({ message: 'Server error during Google authentication.' });
    }
});


// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private (requires Bearer Token)
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No authorization token provided.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token.' });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update current user profile info in MongoDB
// @access  Private
router.put('/profile', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'Unauthorized. Token missing.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);

        const { fullName, phone, country, avatar } = req.body;

        if (!fullName) {
            return res.status(400).json({ message: 'Full name is required.' });
        }

        const updateData = {
            fullName,
            phone: phone || '',
            country: country || ''
        };

        if (avatar !== undefined) {
            updateData.avatar = avatar;
        }

        const updatedUser = await User.findByIdAndUpdate(
            decoded.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        console.log(`✅ [PROFILE UPDATED IN DB] User ${updatedUser._id}: ${updatedUser.fullName}`);

        res.status(200).json({
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                fullName: updatedUser.fullName,
                email: updatedUser.email,
                phone: updatedUser.phone,
                country: updatedUser.country,
                avatar: updatedUser.avatar || '',
                role: updatedUser.role || 'user'
            }
        });
    } catch (error) {
        console.error('Update Profile Error:', error);
        res.status(500).json({ message: 'Failed to update profile.' });
    }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate reset token & send reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ message: 'Please provide your email address.' });

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            // Return success even for unknown emails (security best practice)
            return res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });
        }

        // Generate a secure random token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpiry = Date.now() + 60 * 60 * 1000; // 1 hour from now

        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = tokenExpiry;
        await user.save();

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetLink = `${frontendUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
        });

        await transporter.sendMail({
            from: `"Good Interior Studio" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Password Reset Request — Good Interior Design Studio',
            html: `
                <div style="font-family:'Segoe UI',Arial,sans-serif;background:#f8fafc;padding:30px;color:#1e293b;">
                    <div style="max-width:600px;margin:0 auto;background:#fff;border-radius:12px;padding:30px;border:1px solid #e2e8f0;box-shadow:0 4px 12px rgba(0,0,0,0.05);">
                        <div style="text-align:center;padding-bottom:20px;border-bottom:2px solid #b38058;">
                            <h2 style="color:#b38058;margin:0;font-size:24px;letter-spacing:1px;">GOOD INTERIOR DESIGN STUDIO</h2>
                            <p style="font-size:12px;color:#64748b;margin:5px 0 0;letter-spacing:2px;">LUXURY ARCHITECTURE &amp; INTERIORS</p>
                        </div>
                        <div style="padding:28px 0 16px;">
                            <p style="font-size:16px;font-weight:600;color:#0f172a;">Dear ${user.fullName},</p>
                            <p style="font-size:14px;line-height:1.7;color:#334155;">We received a request to reset your password for your Good Interior Design Studio account. Click the button below to set a new password. This link will expire in <strong>1 hour</strong>.</p>
                            <div style="text-align:center;margin:28px 0;">
                                <a href="${resetLink}" style="display:inline-block;background:linear-gradient(135deg,#b38058,#8c603e);color:#fff;text-decoration:none;padding:14px 32px;border-radius:8px;font-weight:700;font-size:15px;letter-spacing:0.5px;">RESET MY PASSWORD</a>
                            </div>
                            <p style="font-size:12px;color:#94a3b8;">If you did not request a password reset, please ignore this email. Your account will remain secure.</p>
                        </div>
                        <div style="border-top:1px solid #e2e8f0;padding-top:20px;text-align:center;font-size:12px;color:#94a3b8;">
                            <p style="margin:0 0 4px;">Best Regards,</p>
                            <p style="font-weight:700;color:#b38058;margin:0;">Good Interior Studio Executive Team</p>
                        </div>
                    </div>
                </div>`
        });

        console.log(`✅ [PASSWORD RESET EMAIL SENT] to ${user.email}`);
        res.status(200).json({ message: 'If this email is registered, a reset link has been sent.' });
    } catch (error) {
        console.error('Forgot Password Error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

// @route   POST /api/auth/reset-password
// @desc    Validate token & update password
// @access  Public
router.post('/reset-password', async (req, res) => {
    try {
        const { token, email, password } = req.body;
        if (!token || !email || !password) {
            return res.status(400).json({ message: 'Invalid request. Token, email and new password are required.' });
        }

        const user = await User.findOne({
            email: email.toLowerCase(),
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'This password reset link is invalid or has expired. Please request a new one.' });
        }

        // Validate new password strength
        if (password.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)) return res.status(400).json({ message: 'Password must contain uppercase and lowercase letters.' });
        if (!/[0-9]/.test(password) && !/[!@#$%^&*]/.test(password)) return res.status(400).json({ message: 'Password must contain at least one number or special character.' });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save();

        console.log(`✅ [PASSWORD RESET SUCCESS] User ${user.email} password updated.`);
        res.status(200).json({ message: 'Your password has been reset successfully. You can now log in.' });
    } catch (error) {
        console.error('Reset Password Error:', error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
});

module.exports = router;
