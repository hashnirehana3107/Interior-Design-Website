require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const setStrictRoles = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB Atlas...');

        // Set ALL users to 'user' role first
        await User.updateMany({}, { $set: { role: 'user' } });

        // Set ONLY admin@goodinterior.com to 'admin' role
        const adminUser = await User.findOneAndUpdate(
            { email: 'admin@goodinterior.com' },
            { $set: { role: 'admin' } },
            { new: true }
        );

        console.log(`✅ Set all normal users to role: 'user'`);
        if (adminUser) {
            console.log(`🔒 Dedicated Admin set: ${adminUser.email} (role: '${adminUser.role}')`);
        }

        process.exit(0);
    } catch (err) {
        console.error('Error setting strict roles:', err);
        process.exit(1);
    }
};

setStrictRoles();
