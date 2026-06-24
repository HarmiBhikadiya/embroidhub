const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', invoiceController.getAll);
router.get('/:id', invoiceController.getById);
router.get('/:id/pdf', invoiceController.exportPDF);
router.post('/', invoiceController.create);
router.delete('/:id', invoiceController.delete);

module.exports = router;
