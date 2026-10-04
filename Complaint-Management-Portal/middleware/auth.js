const jwt = require('jsonwebtoken');

/**
 * Extracts and verifies the JWT from the Authorization header.
 * On success attaches { id, role, name, email } to req.user
 */
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: 'No authentication token provided. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token. Please log in again.' });
  }
}

// Restricts access to authenticated regular users
function requireUser(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'user') {
      return res.status(403).json({ success: false, message: 'Access denied. User account required.' });
    }
    next();
  });
}

// Restricts access to authenticated admins
function requireAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied. Admin privileges required.' });
    }
    next();
  });
}

module.exports = { verifyToken, requireUser, requireAdmin };
