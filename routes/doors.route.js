const router = require('express').Router();

const db = require('../database');

const verifyToken = require('../helpers/verifyToken');

router.get('/', verifyToken, async (req, res) => {
  try {
    const query = await db.query('SELECT * FROM doors');

    return res.json({
      error: false,
      content: query,
    });
  } catch (error) {
    console.warn(error);

    return res.status(500).json({
      error: true,
      message: 'An error ocurred in server',
    });
  }
});

module.exports = router;
