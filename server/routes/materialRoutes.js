const express = require('express');
const router = express.Router();
const materialController = require('../controllers/materialController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/low-stock', materialController.getLowStock);
router.get('/', materialController.getAll);
router.get('/:id', materialController.getById);
router.post('/', materialController.create);
router.put('/:id', materialController.update);
router.post('/:id/use', materialController.useStock);
router.delete('/:id', materialController.delete);

module.exports = router;
