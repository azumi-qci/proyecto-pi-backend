const router = require('express').Router();
const jwt = require('jsonwebtoken');

const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.json({
      error: true,
      message: 'Must provide email and password',
    });
  }

  try {
    const query = await db.query(
      'SELECT id, email, type FROM users WHERE email = ? AND password = SHA2(?, 256)',
      [email, password]
    );

    if (!query.length) {
      return res.status(401).json({
        error: true,
        message: 'Wrong credentials',
      });
    }

    const token = jwt.sign(
      {
        id: query[0].id,
        email: query[0].email,
        type: query[0].type,
      },
      JWT_SECRET
    );

    return res.json({
      error: false,
      content: { ...query[0], token },
    });
  } catch {
    console.warn(error);

    return res.status(500).json({
      error: true,
      message: 'An error ocurred in server',
    });
  }
});

module.exports = router;
