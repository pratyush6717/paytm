// backend/routes/account.js
const express = require('express');
const router = express.Router();
const { Account } = require('../db'); // Import the Account model
const authMiddleware = require('../middleware');

router.get('/balance', authMiddleware, async (req, res) => {
    try {
        // Assume userId is available from authentication middleware (req.userId)
        const userId = req.userId;
        console.log("user id",req.userId);
        // Find the account for the current user
        const account = await Account.findOne({ userId });

        if (!account) {
            return res.status(404).json({ message: 'Account not found' });
        }

        // Respond with the user's balance
        res.status(200).json({ balance: account.balance });
    } catch (error) {
        console.error('Error fetching balance:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Endpoint to transfer money to another account
router.post('/transfer', authMiddleware ,async (req, res) => {
    try {
        const { to, amount } = req.body;
        const userId = req.userId; // Assume userId is available from authentication middleware

        // Validate amount
        if (amount <= 0) {
            return res.status(400).json({ message: 'Invalid amount' });
        }

        // Find sender's account
        const senderAccount = await Account.findOne({ userId });
        if (!senderAccount) {
            return res.status(404).json({ message: 'Sender account not found' });
        }

        // Check if sender has sufficient balance
        if (senderAccount.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // Find receiver's account
        const receiverAccount = await Account.findOne({ userId: to });
        if (!receiverAccount) {
            return res.status(400).json({ message: 'Invalid receiver account' });
        }

        // Perform the transfer
        senderAccount.balance -= amount;
        receiverAccount.balance += amount;

        // Save updated balances to database
        await senderAccount.save();
        await receiverAccount.save();

        // Respond with success message
        res.status(200).json({ message: 'Transfer successful' });
    } catch (error) {
        console.error('Error transferring money:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});


module.exports = router;
