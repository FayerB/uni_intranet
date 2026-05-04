const jwt = require('jsonwebtoken');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be set and at least 32 characters long');
}

const generateToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  });

const verifyToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

module.exports = { generateToken, verifyToken };
