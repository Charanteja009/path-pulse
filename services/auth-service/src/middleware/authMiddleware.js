const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // 1. Get token from header (Format: "Bearer <token>")
        const token = req.headers.authorization.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ message: 'No token, authorization denied' });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Add user ID to the request so other routes can use it
        req.user = decoded;
        next(); // Move to the next function
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};