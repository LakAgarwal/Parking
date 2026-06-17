const jwt = require('jsonwebtoken');

const generateToken = (user) => {
    const secret = process.env.JWT_SECRET || 'default_secret'; // Fallback value for JWT_SECRET
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
        },
        secret,
        {
            expiresIn: '1h',
        }
    );
};

const validateToken = (token) => {
    const secret = process.env.JWT_SECRET || 'default_secret'; // Fallback value for JWT_SECRET
    try {
        const decoded = jwt.verify(token, secret);
        return { valid: true, decoded };
    } catch (error) {
        return { valid: false, error };
    }
};

module.exports = { generateToken, validateToken };
