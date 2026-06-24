const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { authenticate } = require('../middleware/auth');
const { roleCheck } = require('../middleware/roleCheck');

router.use(authenticate);

router.get('/', employeeController.getAll);
router.get('/:id', employeeController.getById);
router.post('/', roleCheck('Admin'), employeeController.create);
router.put('/:id', roleCheck('Admin'), employeeController.update);
router.delete('/:id', roleCheck('Admin'), employeeController.delete);

module.exports = router;
