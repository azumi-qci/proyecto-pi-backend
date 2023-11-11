const router = require('express').Router();

const io = require('../sockets');
const db = require('../database');

const verifyToken = require('../helpers/verifyToken');

const config = require('../config.json');

router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  try {
    const query = await db.query(
      `SELECT id,
        name,
        car_brand,
        car_color,
        car_plate,
        entrance_hour,
        DATE_FORMAT(entrance_day, '%d-%m-%Y') as entrance_day,
        id_door,
        visit_location,
        checked
      FROM access WHERE id_door = ? AND DATE(entrance_day) = curdate()`,
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

router.post('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { type } = req.user;

  if (type !== config.ADMIN_LEVEL) {
    return res.status(401).json({
      error: true,
      message: 'The user does not have the required priviligies',
    });
  }

  const {
    name,
    car_brand,
    car_color,
    car_plate,
    entrance_hour,
    entrance_day,
    visit_location,
  } = req.body;

  if (
    !name ||
    !car_brand ||
    !car_color ||
    !car_plate ||
    !entrance_hour ||
    !entrance_day ||
    !visit_location
  ) {
    return res.status(422).json({
      error: true,
      message: 'Some required fields are not present in body',
    });
  }

  try {
    const query = await db.query(
      'INSERT INTO access VALUES (null, ?, ?, ?, ?, ?, ?, ?, ?, 0) RETURNING id',
      [
        name,
        car_brand,
        car_color,
        car_plate,
        entrance_hour,
        entrance_day,
        id,
        visit_location,
      ]
    );

    io.to(`door-${id}`).emit('add-log', {
      id: query.id,
      name,
      car_brand,
      car_color,
      car_plate,
      entrance_hour,
      entrance_day,
      id_door: id,
      visit_location,
      checked: 0,
    });

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

router.put('/edit/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { type } = req.user;

  if (type !== config.ADMIN_LEVEL) {
    return res.status(401).json({
      error: true,
      message: 'The user does not have the required priviligies',
    });
  }

  const {
    name,
    car_brand,
    car_color,
    car_plate,
    entrance_hour,
    entrance_day,
    id_door,
    visit_location,
    checked,
  } = req.body;

  if (
    !name ||
    !car_brand ||
    !car_color ||
    !car_plate ||
    !entrance_hour ||
    !entrance_day ||
    !id_door ||
    !visit_location ||
    isNaN(checked)
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
        entrance_hour = ?,
        entrance_day = ?,
        id_door = ?,
        visit_location = ?,
        checked = ?
      WHERE id = ?
    `,
      [
        name,
        car_brand,
        car_color,
        car_plate,
        entrance_hour,
        entrance_day,
        id_door,
        visit_location,
        checked,
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
      entrance_hour,
      entrance_day,
      id_door,
      visit_location,
      checked,
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

router.put('/check/:id_door/:id', verifyToken, async (req, res) => {
  const { id, id_door } = req.params;

  try {
    const query = await db.query(
      'UPDATE access SET checked = 1 WHERE id = ? AND id_door = ?',
      [id, id_door]
    );

    if (query.affectedRows === 0) {
      return res.status(404).json({
        error: true,
        message: 'The access log was not found',
      });
    }

    io.to(`door-${id_door}`).emit('check-log', {
      id: parseInt(id),
    });

    return res.json({
      error: false,
      message: 'The access log was checked successfully',
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
