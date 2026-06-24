const Machine = require('../models/Machine');

const machineController = {
  async getAll(req, res, next) {
    try {
      const { search, status, page, limit } = req.query;
      const result = await Machine.getAll({
        search,
        status,
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
      const machine = await Machine.getById(req.params.id);
      if (!machine) {
        return res.status(404).json({ success: false, message: 'Machine not found.' });
      }
      res.json({ success: true, data: machine });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { MachineName, Brand, Model, Status, Location } = req.body;
      if (!MachineName) {
        return res.status(400).json({ success: false, message: 'MachineName is required.' });
      }
      const machine = await Machine.create({ MachineName, Brand, Model, Status, Location });
      res.status(201).json({ success: true, message: 'Machine created successfully', data: machine });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { MachineName, Brand, Model, Status, Location } = req.body;
      const machine = await Machine.update(req.params.id, { MachineName, Brand, Model, Status, Location });
      if (!machine) {
        return res.status(404).json({ success: false, message: 'Machine not found.' });
      }
      res.json({ success: true, message: 'Machine updated successfully', data: machine });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const machine = await Machine.delete(req.params.id);
      if (!machine) {
        return res.status(404).json({ success: false, message: 'Machine not found.' });
      }
      res.json({ success: true, message: 'Machine deleted successfully', data: machine });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = machineController;
