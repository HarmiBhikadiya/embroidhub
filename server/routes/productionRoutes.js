const express = require('express');
const router = express.Router();
const productionController = require('../controllers/productionController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', productionController.getAll);
router.get('/:id', productionController.getById);
router.post('/', productionController.create);
router.put('/:id', productionController.update);
router.delete('/:id', productionController.delete);

module.exports = router;
