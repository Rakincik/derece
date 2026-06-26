import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dereceuzem_default_secret_key_change_me';

/**
 * Generates a salted PBKDF2 hash for a password
 * @param {string} password 
 * @returns {{salt: string, hash: string}}
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return { salt, hash };
}

/**
 * Verifies a password against a salt and hash
 * @param {string} password 
 * @param {string} salt 
 * @param {string} originalHash 
 * @returns {boolean}
 */
export function verifyPassword(password, salt, originalHash) {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

/**
 * Generates a JWT token for a user payload (valid for 7 days)
 * @param {object} payload 
 * @returns {string}
 */
export function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

/**
 * Verifies a JWT token
 * @param {string} token 
 * @returns {object|null}
 */
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
