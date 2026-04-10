import crypto from 'crypto';

export const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export const generateSessionToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export const hashSessionToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
