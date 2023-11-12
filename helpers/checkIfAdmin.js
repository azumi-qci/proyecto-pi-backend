const config = require('../config.json');

const checkIfAdmin = (req, res, next) => {
  const { type } = req.user;

  if (type !== config.ADMIN_LEVEL) {
    return res.status(401).json({
      error: true,
      message: 'The user does not have the required priviligies',
    });
  }

  next();
};

module.exports = checkIfAdmin;
