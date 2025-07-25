const jwt = require('jsonwebtoken');
const JWT_SECRET = 'your_jwt_secret_here'; // Ensure this matches the one used in your login/signup logic

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authorization header missing or malformed' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token missing' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { userId: decoded.userId }; // Store userId for later use

    console.log("Authenticated user ID:", req.user.userId); // ← NOW it's safe to log
    next();
  } catch (error) {
    console.error('JWT verification error:', error.message);
    res.status(401).json({ message: 'Invalid token' });
  }
};
