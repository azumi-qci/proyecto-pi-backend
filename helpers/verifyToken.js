const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware that verifies the authentication token
 * @param {import('express').Request} req - Express request object
 * @param {import('express').Response} res - Express response object
 * @param {import('express').NextFunction} next - Express next function
 * @returns
 */
const verifyToken = (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(500).json({
      error: true,
      message: 'Authentication header required',
    });
  }

  const token = authorization.split(' ')[1];

  const data = jwt.verify(token, JWT_SECRET);

  req.user = data;

  next();
};

module.exports = verifyToken;
