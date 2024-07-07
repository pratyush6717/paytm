// backend/middleware.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('./routes/config');

const authMiddleware = (req, res, next) => {
    // Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
        return res.status(403).json({ message: 'Unauthorized' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId; // Attach userId to request object
        next(); // Call next middleware
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(403).json({ message: 'Unauthorized' });
    }
};

module.exports = authMiddleware;
