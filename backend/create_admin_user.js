require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas...');

        const adminEmail = 'admin@goodinterior.com';
        const rawPassword = 'AdminPassword123!';

        let user = await User.findOne({ email: adminEmail });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(rawPassword, salt);

        if (user) {
            user.role = 'admin';
            user.password = hashedPassword;
            await user.save();
            console.log(`✅ [ADMIN UPDATED] Existing user ${user.email} promoted to ADMIN role!`);
        } else {
            user = new User({
                fullName: 'Good Interior Admin',
                email: adminEmail,
                phone: '+94 77 123 4567',
                country: 'Sri Lanka',
                password: hashedPassword,
                role: 'admin'
            });
            await user.save();
            console.log(`✅ [ADMIN CREATED] New Admin account created: ${adminEmail}`);
        }

        // Also promote all existing registered users to admin if needed so any logged in user can test easily
        const updatedUsersCount = await User.updateMany({}, { $set: { role: 'admin' } });
        console.log(`✅ Promoted all existing registered users (${updatedUsersCount.modifiedCount}) to Admin role!`);

        process.exit(0);
    } catch (err) {
        console.error('Error creating admin user:', err);
        process.exit(1);
    }
};

createAdmin();
