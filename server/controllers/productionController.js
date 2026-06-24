const Production = require('../models/Production');

const productionController = {
  async getAll(req, res, next) {
    try {
      const { status, page, limit } = req.query;
      const result = await Production.getAll({
        status, // 'ongoing' or 'completed'
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
      const production = await Production.getById(req.params.id);
      if (!production) {
        return res.status(404).json({ success: false, message: 'Production record not found.' });
      }
      res.json({ success: true, data: production });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { OrderID, MachineID, EmployeeID, StartDate, EndDate, QuantityProduced, Remarks } = req.body;
      if (!OrderID) {
        return res.status(400).json({ success: false, message: 'OrderID is required.' });
      }
      const production = await Production.create({
        OrderID, MachineID, EmployeeID, StartDate, EndDate, QuantityProduced, Remarks,
      });
      res.status(201).json({ success: true, message: 'Production record created', data: production });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { OrderID, MachineID, EmployeeID, StartDate, EndDate, QuantityProduced, Remarks } = req.body;
      const production = await Production.update(req.params.id, {
        OrderID, MachineID, EmployeeID, StartDate, EndDate, QuantityProduced, Remarks,
      });
      if (!production) {
        return res.status(404).json({ success: false, message: 'Production record not found.' });
      }
      res.json({ success: true, message: 'Production record updated', data: production });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const production = await Production.delete(req.params.id);
      if (!production) {
        return res.status(404).json({ success: false, message: 'Production record not found.' });
      }
      res.json({ success: true, message: 'Production record deleted', data: production });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = productionController;
