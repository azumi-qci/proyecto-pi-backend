const router = require('express').Router();

const io = require('../sockets');
const db = require('../database');

const verifyToken = require('../helpers/verifyToken');
const checkIfAdmin = require('../helpers/checkIfAdmin');
const checkIfToday = require('../helpers/checkIfToday');

router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { show_all } = req.query;

  try {
    const query = await db.query(
      `SELECT id,
        name,
        car_brand,
        car_color,
        car_plate,
        access_daytime,
        id_door,
        visit_location
      FROM access WHERE id_door = ? ${
        !show_all ? 'AND DATE(access_daytime) = CURDATE()' : ''
      }
      ORDER BY access_daytime DESC`,
      [id]
    );

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

router.post('/:id', verifyToken, checkIfAdmin, async (req, res) => {
  const { id } = req.params;

  const {
    name,
    car_brand,
    car_color,
    car_plate,
    access_daytime,
    visit_location,
  } = req.body;

  if (
    !name ||
    !car_brand ||
    !car_color ||
    !car_plate ||
    !access_daytime ||
    !visit_location
  ) {
    return res.status(422).json({
      error: true,
      message: 'Some required fields are not present in body',
    });
  }

  try {
    const query = await db.query(
      'INSERT INTO access VALUES (null, ?, ?, ?, ?, ?, ?, ?) RETURNING id',
      [
        name,
        car_brand,
        car_color,
        car_plate,
        access_daytime,
        parseInt(id),
        visit_location,
      ]
    );

    // Check if the log is on the same day
    if (checkIfToday(access_daytime)) {
      io.to(`door-${id}`).emit('add-log', {
        id: query[0].id,
        name,
        car_brand,
        car_color,
        car_plate,
        access_daytime,
        id_door: id,
        visit_location,
      });
    }

    return res.json({
      error: false,
      message: 'The access log was added successfully',
    });
  } catch (error) {
    console.warn(error);

    return res.status(500).json({
      error: true,
      message: 'An error ocurred in server',
    });
  }
});

router.put('/:id', verifyToken, checkIfAdmin, async (req, res) => {
  const { id } = req.params;

  const {
    name,
    car_brand,
    car_color,
    car_plate,
    access_daytime,
    id_door,
    visit_location,
  } = req.body;

  if (
    !name ||
    !car_brand ||
    !car_color ||
    !car_plate ||
    !access_daytime ||
    !id_door ||
    !visit_location
  ) {
    return res.status(422).json({
      error: true,
      message: 'Some required fields are not present in body',
    });
  }

  try {
    const query = await db.query(
      `
      UPDATE access
      SET
        name = ?,
        car_brand = ?,
        car_color = ?,
        car_plate = ?,
        access_daytime = ?,
        id_door = ?,
        visit_location = ?
      WHERE id = ?
    `,
      [
        name,
        car_brand,
        car_color,
        car_plate,
        access_daytime,
        id_door,
        visit_location,
        id,
      ]
    );

    if (query.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'The access log was not found',
      });
    }

    io.to(`door-${id_door}`).emit('update-log', {
      id: parseInt(id),
      name,
      car_brand,
      car_color,
      car_plate,
      access_daytime,
      id_door,
      visit_location,
    });

    return res.json({
      error: false,
      message: 'The access log was updated successfully',
    });
  } catch (error) {
    console.warn(error);

    return res.status(500).json({
      error: true,
      message: 'An error ocurred in server',
    });
  }
});

router.delete('/:id', verifyToken, checkIfAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const query = await db.query(
      `
      DELETE FROM access
      WHERE id = ?
      RETURNING id_door
    `,
      [id]
    );

    if (!query[0]) {
      return res.status(404).json({
        error: true,
        message: 'The access log was not found',
      });
    }

    io.to(`door-${query[0].id_door}`).emit('delete-log', parseInt(id));

    return res.json({
      error: false,
      message: 'The access log was deleted successfully',
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
