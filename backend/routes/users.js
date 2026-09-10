const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// @route   GET /api/users
// @desc    Get all users (admin only)
// @access  Admin
router.get('/', async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.status(200).json({ users });
    } catch (err) {
        console.error('Get Users Error:', err);
        res.status(500).json({ message: 'Failed to fetch users.' });
    }
});

// @route   POST /api/users
// @desc    Create a new user (admin)
// @access  Admin
router.post('/', async (req, res) => {
    try {
        const { fullName, email, phone, country, password, role } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: 'Full name, email and password are required.' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ message: 'A user with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName,
            email: email.toLowerCase(),
            phone: phone || '',
            country: country || '',
            password: hashedPassword,
            role: role || 'user'
        });

        await newUser.save();
        const userObj = newUser.toObject();
        delete userObj.password;

        res.status(201).json({ message: 'User created successfully.', user: userObj });
    } catch (err) {
        console.error('Create User Error:', err);
        res.status(500).json({ message: 'Failed to create user.' });
    }
});

// @route   PUT /api/users/:id
// @desc    Update user details (admin)
// @access  Admin
router.put('/:id', async (req, res) => {
    try {
        const { fullName, email, phone, country, role, password } = req.body;

        const updateData = {};
        if (fullName) updateData.fullName = fullName;
        if (email) updateData.email = email.toLowerCase();
        if (phone !== undefined) updateData.phone = phone;
        if (country !== undefined) updateData.country = country;
        if (role) updateData.role = role;

        // If a new password is provided, hash it
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found.' });
        }

        res.status(200).json({ message: 'User updated successfully.', user: updatedUser });
    } catch (err) {
        console.error('Update User Error:', err);
        res.status(500).json({ message: 'Failed to update user.' });
    }
});

// @route   DELETE /api/users/:id
// @desc    Delete a user (admin)
// @access  Admin
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await User.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(200).json({ message: 'User deleted successfully.' });
    } catch (err) {
        console.error('Delete User Error:', err);
        res.status(500).json({ message: 'Failed to delete user.' });
    }
});

module.exports = router;
