const Supplier = require('../models/Supplier');

const supplierController = {
  async getAll(req, res, next) {
    try {
      const { search, page, limit } = req.query;
      const result = await Supplier.getAll({
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  async getById(req, res, next) {
    try {
      const supplier = await Supplier.getById(req.params.id);
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found.' });
      }
      res.json({ success: true, data: supplier });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { Name, ContactNumber, Email, Address } = req.body;
      if (!Name) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
      }
      const supplier = await Supplier.create({ Name, ContactNumber, Email, Address });
      res.status(201).json({ success: true, message: 'Supplier created successfully', data: supplier });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { Name, ContactNumber, Email, Address } = req.body;
      const supplier = await Supplier.update(req.params.id, { Name, ContactNumber, Email, Address });
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found.' });
      }
      res.json({ success: true, message: 'Supplier updated successfully', data: supplier });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const supplier = await Supplier.delete(req.params.id);
      if (!supplier) {
        return res.status(404).json({ success: false, message: 'Supplier not found.' });
      }
      res.json({ success: true, message: 'Supplier deleted successfully', data: supplier });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = supplierController;
