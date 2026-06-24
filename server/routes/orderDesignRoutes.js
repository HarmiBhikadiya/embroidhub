const express = require('express');
const router = express.Router();
const orderDesignController = require('../controllers/orderDesignController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/order/:orderId', orderDesignController.getByOrderId);
router.post('/', orderDesignController.create);
router.put('/:id', orderDesignController.update);
router.delete('/:id', orderDesignController.delete);

module.exports = router;
