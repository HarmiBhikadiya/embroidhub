const Customer = require('../models/Customer');

const customerController = {
  // GET /api/customers
  async getAll(req, res, next) {
    try {
      const { search, page, limit } = req.query;
      const result = await Customer.getAll({
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/customers/:id
  async getById(req, res, next) {
    try {
      const customer = await Customer.getById(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }
      res.json({ success: true, data: customer });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/customers
  async create(req, res, next) {
    try {
      const { Name, Phone, Email, Address, GSTNumber } = req.body;
      if (!Name) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
      }
      const customer = await Customer.create({ Name, Phone, Email, Address, GSTNumber });
      res.status(201).json({ success: true, message: 'Customer created successfully', data: customer });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/customers/:id
  async update(req, res, next) {
    try {
      const { Name, Phone, Email, Address, GSTNumber } = req.body;
      if (!Name) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
      }
      const customer = await Customer.update(req.params.id, { Name, Phone, Email, Address, GSTNumber });
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }
      res.json({ success: true, message: 'Customer updated successfully', data: customer });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/customers/:id
  async delete(req, res, next) {
    try {
      const customer = await Customer.delete(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }
      res.json({ success: true, message: 'Customer deleted successfully', data: customer });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/customers/:id/orders
  async getOrderHistory(req, res, next) {
    try {
      const customer = await Customer.getById(req.params.id);
      if (!customer) {
        return res.status(404).json({ success: false, message: 'Customer not found.' });
      }
      const orders = await Customer.getOrderHistory(req.params.id);
      res.json({ success: true, data: { customer, orders } });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = customerController;
