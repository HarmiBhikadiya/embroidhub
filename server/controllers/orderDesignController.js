const OrderDesign = require('../models/OrderDesign');
const Orders = require('../models/Orders');

const orderDesignController = {
  // GET /api/order-designs/order/:orderId
  async getByOrderId(req, res, next) {
    try {
      const designs = await OrderDesign.getByOrderId(req.params.orderId);
      res.json({ success: true, data: designs });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/order-designs
  async create(req, res, next) {
    try {
      const { OrderID, DesignID, Quantity, PricePerUnit } = req.body;
      if (!OrderID || !DesignID || !Quantity || !PricePerUnit) {
        return res.status(400).json({ success: false, message: 'OrderID, DesignID, Quantity, and PricePerUnit are required.' });
      }
      const orderDesign = await OrderDesign.create({ OrderID, DesignID, Quantity, PricePerUnit });
      // Recalculate order total
      await Orders.recalculateTotal(OrderID);
      res.status(201).json({ success: true, message: 'Design added to order', data: orderDesign });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/order-designs/:id
  async update(req, res, next) {
    try {
      const { Quantity, PricePerUnit } = req.body;
      if (!Quantity || !PricePerUnit) {
        return res.status(400).json({ success: false, message: 'Quantity and PricePerUnit are required.' });
      }
      const existing = await OrderDesign.getById(req.params.id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'OrderDesign not found.' });
      }
      const orderDesign = await OrderDesign.update(req.params.id, { Quantity, PricePerUnit });
      // Recalculate order total
      await Orders.recalculateTotal(existing.orderid);
      res.json({ success: true, message: 'OrderDesign updated', data: orderDesign });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/order-designs/:id
  async delete(req, res, next) {
    try {
      const { deleted, orderId } = await OrderDesign.delete(req.params.id);
      if (!deleted) {
        return res.status(404).json({ success: false, message: 'OrderDesign not found.' });
      }
      // Recalculate order total
      if (orderId) await Orders.recalculateTotal(orderId);
      res.json({ success: true, message: 'Design removed from order', data: deleted });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = orderDesignController;
