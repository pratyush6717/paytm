// backend/routes/user.js
const express = require('express');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./config');
const { User, Account } = require('../db'); // Import the User model
const { z } = require('zod');
const authMiddleware = require('../middleware');
const userRouter = express.Router();

// Zod schema for input validation
const userSchema = z.object({
    username: z.string().email(),
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    password: z.string().min(6),
});

// Define your user routes here
userRouter.post('/signup', async (req, res) => {
    try {
        // Validate the request body using Zod
        const validatedData = userSchema.parse(req.body);
        if (!validatedData) {
            return res.status(411).json({ message: 'Email already taken' });
        }
        // Check if the user already exists
        const existingUser = await User.findOne({ email: validatedData.username });
        if (existingUser) {
            return res.status(411).json({ message: 'Email already taken' });
        }

        // Create a new user
        const newUser = new User({
            firstName: validatedData.firstName,
            lastName: validatedData.lastName,
            email: validatedData.username,
            password: validatedData.password, // Note: Password should be hashed in a real application
        });

        // Save the user to the database
        await newUser.save();

        // Generate a random balance between 1 and 10000 (inclusive)
        const initialBalance = Math.floor(Math.random() * (10000 - 1 + 1)) + 1;

        // Create an account for the new user with the initial balance
        const newAccount = new Account({
            userId: newUser._id,
            balance: initialBalance,
        });

        // Save the new account to the database
        await newAccount.save();

        // Generate a JWT token
        const token = jwt.sign({ userId: newUser._id }, JWT_SECRET);

        res.status(200).json({
            message: 'User created successfully',
            token: token,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(411).json({ message: 'Incorrect inputs' });
        }
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


userRouter.post('/signin', async (req, res) => {
    const { username, password } = req.body;

    try {
        // Find the user by username (email)
        const user = await User.findOne({ email: username });
        // Check if user exists and if password matches (Note: Password should be hashed and compared in a real application)
        if (!user || user.password !== password) {
            return res.status(411).json({ message: 'Error while logging in' });
        }

        // Generate a JWT token
        const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            token: token,
        });
    } catch (error) {
        console.error('Signin error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

const updateSchema = z.object({
	password: z.string().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
})

userRouter.put('/update', authMiddleware, async (req, res) => {
    const userId = req.userId; // UserId is available from the request object due to authMiddleware
    const { password, firstName, lastName } = req.body;

    try {
        // Validate the request body using Zod
        const validatedData = updateSchema.parse(req.body);
        if (!validatedData) {
            return res.status(411).json({ message: 'Email already taken' });
        }
        // Check if password is provided and meets minimum length requirement
        if (password && password.length < 6) {
            return res.status(411).json({ message: 'Password is too small' });
        }

        // Update user information in the database
        const updatedUser = await User.findByIdAndUpdate(userId, {
            ...(password && { password }), // Update password if provided
            ...(firstName && { firstName }), // Update firstName if provided
            ...(lastName && { lastName }), // Update lastName if provided
        }, { new: true });

        if (!updatedUser) {
            return res.status(411).json({ message: 'Error while updating information' });
        }

        res.status(200).json({ message: 'Updated successfully' });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(411).json({ message: 'Error while updating information' });
        }
        console.error('Update error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

userRouter.get('/bulk', async (req, res) => {
    try {
        const filter = req.query.filter;

        // Query users based on filter (firstName or lastName)
        const users = await User.find({
            $or: [
                { firstName: { $regex: filter, $options: 'i' } }, // Case-insensitive match for firstName
                { lastName: { $regex: filter, $options: 'i' } }, // Case-insensitive match for lastName
            ]
        }, { firstName: 1, lastName: 1, _id: 1 });

        res.status(200).json({ users });
    } catch (error) {
        console.error('Fetch users error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = userRouter;
