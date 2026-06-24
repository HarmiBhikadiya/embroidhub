const express = require('express');
const router = express.Router();
const machineController = require('../controllers/machineController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/', machineController.getAll);
router.get('/:id', machineController.getById);
router.post('/', roleCheck('Admin'), machineController.create);
router.put('/:id', roleCheck('Admin'), machineController.update);
router.delete('/:id', roleCheck('Admin'), machineController.delete);

module.exports = router;
