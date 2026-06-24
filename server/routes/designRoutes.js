const express = require('express');
const router = express.Router();
const designController = require('../controllers/designController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/', designController.getAll);
router.get('/:id', designController.getById);
router.post('/', designController.create);
router.put('/:id', designController.update);
router.delete('/:id', designController.delete);

module.exports = router;
