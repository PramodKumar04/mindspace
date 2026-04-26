import User from '../models/User.js';
import College from '../models/College.js';
import {
  SESSION_DURATION_MS,
  generateSessionToken,
  hashSessionToken
} from '../services/sessionService.js';

const createSession = async (user) => {
  const token = generateSessionToken();

  user.token = undefined;
  user.sessionTokenHash = hashSessionToken(token);
  user.sessionExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await user.save();

  return token;
};


const serializeUser = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  collegeId: user.collegeId?._id || user.collegeId,
  alias: user.alias,
  college: user.collegeId?._id ? user.collegeId : undefined,
  hasCompletedOnboarding: user.hasCompletedOnboarding
});

const getOrCreateDefaultCollege = async () => {
  let college = await College.findOne({ isActive: true }).sort({ createdAt: 1 });

  if (!college) {
    college = await College.create({
      name: 'Default College',
      code: 'DEFAULT',
      description: 'Default college for initial platform setup'
    });
  }

  return college;
};

/**
 * Register new user
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, collegeId, alias } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedName = name?.trim();
    const normalizedAlias = alias?.trim();

    // Validate required fields
    if (!normalizedName || !normalizedEmail || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    let college = null;
    if (collegeId) {
      college = await College.findById(collegeId);
    } else {
      college = await getOrCreateDefaultCollege();
    }

    if (!college || !college.isActive) {
      return res.status(400).json({ message: 'Unable to resolve an active college for this account' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Public registration only allows student/counselor accounts.
    let finalRole = role || 'student';
    if (!['student', 'counselor'].includes(finalRole)) {
      return res.status(400).json({ message: 'Invalid role. Must be student or counselor' });
    }

    // Create user with atomic operation
    const user = await User.create({
      name: normalizedName,
      email: normalizedEmail,
      password,
      role: finalRole,
      collegeId: college._id,
      alias: normalizedAlias || normalizedName.split(' ')[0] // Default alias to first name
    });

    const hydratedUser = await User.findById(user._id).populate('collegeId', 'name code');
    const token = await createSession(hydratedUser);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: serializeUser(hydratedUser)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email: normalizedEmail }).populate('collegeId', 'name code');
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = await createSession(user);

    res.json({
      message: 'Login successful',
      token,
      user: serializeUser(user)
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get current user profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password -token -sessionTokenHash')
      .populate('collegeId', 'name code');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);

    if (user) {
      user.clearSession();
      await user.save();
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    next(error);
  }
};
