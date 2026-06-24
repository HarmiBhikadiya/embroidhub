const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', paymentController.getAll);
router.get('/order/:orderId', paymentController.getByOrderId);
router.post('/', paymentController.create);
router.delete('/:id', paymentController.delete);

module.exports = router;
