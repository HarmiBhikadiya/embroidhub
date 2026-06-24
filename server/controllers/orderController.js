const Orders = require('../models/Orders');

const orderController = {
  // GET /api/orders
  async getAll(req, res, next) {
    try {
      const { status, customerid, search, page, limit } = req.query;
      const result = await Orders.getAll({
        status,
        customerid,
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/orders/:id
  async getById(req, res, next) {
    try {
      const order = await Orders.getById(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      res.json({ success: true, data: order });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/orders
  async create(req, res, next) {
    try {
      const { CustomerID, OrderDate, DueDate, TotalAmount, Status, PaymentStatus } = req.body;
      if (!CustomerID || !OrderDate) {
        return res.status(400).json({ success: false, message: 'CustomerID and OrderDate are required.' });
      }
      const order = await Orders.create({ CustomerID, OrderDate, DueDate, TotalAmount, Status, PaymentStatus });
      res.status(201).json({ success: true, message: 'Order created successfully', data: order });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/orders/:id
  async update(req, res, next) {
    try {
      const { CustomerID, OrderDate, DueDate, TotalAmount, Status, PaymentStatus } = req.body;
      const order = await Orders.update(req.params.id, { CustomerID, OrderDate, DueDate, TotalAmount, Status, PaymentStatus });
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      res.json({ success: true, message: 'Order updated successfully', data: order });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/orders/:id/status
  async updateStatus(req, res, next) {
    try {
      const { status } = req.body;
      const validStatuses = ['Pending', 'In Progress', 'Completed', 'Delivered'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ success: false, message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      }
      const order = await Orders.updateStatus(req.params.id, status);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      res.json({ success: true, message: 'Order status updated', data: order });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/orders/:id
  async delete(req, res, next) {
    try {
      const order = await Orders.delete(req.params.id);
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found.' });
      }
      res.json({ success: true, message: 'Order deleted successfully', data: order });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = orderController;
