const router = require('express').Router();

const io = require('../sockets');
const db = require('../database');

router.get('/get-doors', async (req, res) => {
  try {
    const query = await db.query('SELECT * FROM doors');

    return res.json({
      error: false,
      content: query,
    });
  } catch (error) {
    console.warn(error);

    return res
      .json({
        error: true,
        message: 'An error ocurred in server',
      })
      .status(500);
  }
});

module.exports = router;
