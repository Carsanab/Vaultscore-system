const express = require('express');
const router = express.Router();
const torneoController = require('../controllers/torneoController');
const { verifyToken, verifyRole } = require('../middleware/auth');

// Público - ver torneos
router.get('/', torneoController.getTorneos);

// Solo admin - crear, actualizar, eliminar
router.post('/', verifyToken, verifyRole(['admin']), torneoController.createTorneo);
router.put('/:id', verifyToken, verifyRole(['admin']), torneoController.updateTorneo);
router.delete('/:id', verifyToken, verifyRole(['admin']), torneoController.deleteTorneo);

module.exports = router;