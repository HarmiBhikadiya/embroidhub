const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);

router.get('/stats', dashboardController.getStats);
router.get('/monthly-expenses', dashboardController.getMonthlyExpenses);
router.get('/monthly-revenue', dashboardController.getMonthlyRevenue);
router.get('/top-designs', dashboardController.getTopDesigns);
router.get('/order-status', dashboardController.getOrderStatusBreakdown);

module.exports = router;
