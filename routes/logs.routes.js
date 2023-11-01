const router = require('express').Router();

router.post('/', (req, res) => {
  const { name, hour, door } = req.body;

  if (!name || !hour || !door) {
  }
});

module.exports = router;
