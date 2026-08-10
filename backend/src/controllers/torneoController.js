const pool = require('../config/database');

// Obtener todos los torneos
exports.getTorneos = async (req, res) => {
  try {
    // ✅ Cambiamos 'fecha' por 'creado_en' (columna por defecto de Supabase)
    const result = await pool.query('SELECT * FROM torneos ORDER BY creado_en DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener torneos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear un nuevo torneo
exports.createTorneo = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden crear torneos' });
    }

    // ✅ Eliminamos 'fecha' de la desestructación para evitar errores
    const { nombre, ubicacion } = req.body;

    if (!nombre) {
      return res.status(400).json({ error: 'El nombre es requerido' });
    }

    // ✅ Insertamos solo nombre y ubicacion
    const result = await pool.query(
      'INSERT INTO torneos (nombre, ubicacion) VALUES ($1, $2) RETURNING *',
      [nombre, ubicacion || null]
    );

    res.status(201).json({
      message: 'Torneo creado exitosamente',
      torneo: result.rows[0]
    });

  } catch (error) {
    console.error('Error al crear torneo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar un torneo
exports.updateTorneo = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden actualizar torneos' });
    }

    const { id } = req.params;
    // ✅ Eliminamos 'fecha' de la actualización
    const { nombre, ubicacion, estado } = req.body;

    const result = await pool.query(
      `UPDATE torneos 
       SET nombre = $1, ubicacion = $2, estado = $3 
       WHERE id = $4 RETURNING *`,
      [nombre, ubicacion, estado || 'activo', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Torneo no encontrado' });
    }

    res.json({
      message: 'Torneo actualizado exitosamente',
      torneo: result.rows[0]
    });

  } catch (error) {
    console.error('Error al actualizar torneo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar un torneo
exports.deleteTorneo = async (req, res) => {
  try {
    if (req.user.rol !== 'admin') {
      return res.status(403).json({ error: 'Solo administradores pueden eliminar torneos' });
    }

    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM torneos WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Torneo no encontrado' });
    }

    res.json({ message: 'Torneo eliminado exitosamente' });

  } catch (error) {
    console.error('Error al eliminar torneo:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};