const User = require('../models/User');

const authenticateAdmin = async (req, res, next) => {
    try {
        // For now, we'll use a simple approach where we check the user's email
        // In a production app, you'd use JWT tokens or sessions
        // Check for email in both body (POST) and query params (GET)
        const email = req.body.email || req.query.email;
        
        console.log('Auth middleware - Request body:', req.body);
        console.log('Auth middleware - Request query:', req.query);
        console.log('Auth middleware - Email found:', email);
        
        if (!email) {
            console.log('Auth middleware - No email provided');
            return res.status(401).json({ message: 'Email required for admin access' });
        }

        const user = await User.findOne({ email });
        console.log('Auth middleware - User found:', user ? { id: user._id, email: user.email, role: user.role } : 'No user found');
        
        if (!user || user.role !== 'admin') {
            console.log('Auth middleware - Access denied');
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        req.user = user;
        console.log('Auth middleware - Access granted');
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({ message: 'Server error during authentication' });
    }
};

module.exports = { authenticateAdmin };
