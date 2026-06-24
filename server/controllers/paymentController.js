const Payment = require('../models/Payment');
const Orders = require('../models/Orders');

const paymentController = {
  // GET /api/payments
  async getAll(req, res, next) {
    try {
      const { orderid, mode, page, limit } = req.query;
      const result = await Payment.getAll({
        orderid,
        mode,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/payments/order/:orderId
  async getByOrderId(req, res, next) {
    try {
      const payments = await Payment.getByOrderId(req.params.orderId);
      res.json({ success: true, data: payments });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/payments
  async create(req, res, next) {
    try {
      const { OrderID, PaymentDate, AmountPaid, PaymentMode, TransactionReference } = req.body;
      if (!OrderID || !AmountPaid || !PaymentMode) {
        return res.status(400).json({ success: false, message: 'OrderID, AmountPaid, and PaymentMode are required.' });
      }

      const validModes = ['UPI', 'Cash', 'Bank'];
      if (!validModes.includes(PaymentMode)) {
        return res.status(400).json({ success: false, message: `Invalid PaymentMode. Must be one of: ${validModes.join(', ')}` });
      }

      const payment = await Payment.create({
        OrderID, PaymentDate: PaymentDate || new Date(), AmountPaid, PaymentMode, TransactionReference,
      });

      // Auto-update order payment status
      await Orders.updatePaymentStatus(OrderID);

      res.status(201).json({ success: true, message: 'Payment recorded successfully', data: payment });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/payments/:id
  async delete(req, res, next) {
    try {
      const { deleted, orderId } = await Payment.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'Payment not found.' });
      }
      // Recalculate order payment status
      if (orderId) await Orders.updatePaymentStatus(orderId);
      res.json({ success: true, message: 'Payment deleted', data: deleted });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = paymentController;
