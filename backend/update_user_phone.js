require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect(process.env.MONGODB_URI).then(async () => {
    const res = await User.updateOne(
        { email: 'kiarafrdo@gmail.com' },
        { $set: { phone: '+94771234567' } }
    );
    console.log('MongoDB Update Result for Kiara Fernando:', res);
    mongoose.disconnect();
}).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
