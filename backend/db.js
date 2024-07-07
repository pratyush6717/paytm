// db.js
const mongoose = require('mongoose');

// Connect to MongoDB
const dbURI = 'mongodb://0.0.0.0:27017/paytm'; // Replace 'your-database-name' with your actual database name
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));

// Define the User schema
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
    }
}, {
    timestamps: true,
});

// Define schema for Accounts
const accountSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the Users collection
    },
    balance: {
        type: Number,
        default: 0, // Default balance of 0 INR
        required: true,
    },
});

// Create models
const User = mongoose.model('User', userSchema);
const Account = mongoose.model('Account', accountSchema);

// Export models
module.exports = {
    User,
    Account,
};
