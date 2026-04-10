import User from '../models/User.js';
import { hashSessionToken } from '../services/sessionService.js';

/**
 * Authentication middleware
 * Verifies opaque session tokens and attaches user info to request
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const tokenHash = hashSessionToken(token);
    let user = await User.findOne({
      sessionTokenHash: tokenHash,
      sessionExpiresAt: { $gt: new Date() }
    }).select('-password -sessionTokenHash');

    // Backward-compatible fallback for users who still have a legacy plain token stored.
    if (!user) {
      user = await User.findOne({ token }).select('-password -sessionTokenHash');
    }
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid token or inactive user' });
    }

    if (user.sessionExpiresAt && user.sessionExpiresAt <= new Date()) {
      user.clearSession();
      await user.save();
      return res.status(401).json({ message: 'Session expired. Please log in again.' });
    }

    // Attach user info to request
    req.user = {
      userId: user._id,
      email: user.email,
      role: user.role,
      collegeId: user.collegeId
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to ensure user can only access their own college's data
 * Enforces strict multi-tenant isolation
 */
export const enforceCollegeAccess = (req, res, next) => {
  if (!req.user || !req.user.collegeId) {
    return res.status(403).json({ message: 'Access denied: College information missing' });
  }

  // If collegeId is provided in params/body/query, verify it matches user's college
  const requestedCollegeId = req.params.collegeId || req.body.collegeId || req.query.collegeId;
  
  if (requestedCollegeId && requestedCollegeId.toString() !== req.user.collegeId.toString()) {
    return res.status(403).json({ 
      message: 'Access denied: Cannot access other college data',
      requested: requestedCollegeId,
      userCollege: req.user.collegeId
    });
  }

  // Automatically attach collegeId filter to request for all queries
  // Controllers should use req.user.collegeId or req.collegeId for filtering
  req.collegeId = req.user.collegeId;
  
  // Override any attempt to set collegeId in body/params to user's college
  if (req.body.collegeId) {
    req.body.collegeId = req.user.collegeId;
  }
  if (req.params.collegeId) {
    req.params.collegeId = req.user.collegeId;
  }
  
  next();
};
