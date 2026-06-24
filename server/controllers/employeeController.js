const Employee = require('../models/Employee');

const employeeController = {
  async getAll(req, res, next) {
    try {
      const { search, page, limit } = req.query;
      const result = await Employee.getAll({
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
      const employee = await Employee.getById(req.params.id);
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found.' });
      }
      res.json({ success: true, data: employee });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { Name, ContactNumber, Role, Salary, JoinDate } = req.body;
      if (!Name) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
      }
      const employee = await Employee.create({ Name, ContactNumber, Role, Salary, JoinDate });
      res.status(201).json({ success: true, message: 'Employee created successfully', data: employee });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { Name, ContactNumber, Role, Salary, JoinDate } = req.body;
      if (!Name) {
        return res.status(400).json({ success: false, message: 'Name is required.' });
      }
      const employee = await Employee.update(req.params.id, { Name, ContactNumber, Role, Salary, JoinDate });
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found.' });
      }
      res.json({ success: true, message: 'Employee updated successfully', data: employee });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const employee = await Employee.delete(req.params.id);
      if (!employee) {
        return res.status(404).json({ success: false, message: 'Employee not found.' });
      }
      res.json({ success: true, message: 'Employee deleted successfully', data: employee });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = employeeController;
