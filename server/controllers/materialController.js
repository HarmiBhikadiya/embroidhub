const Material = require('../models/Material');

const materialController = {
  async getAll(req, res, next) {
    try {
      const { search, lowstock, supplierid, page, limit } = req.query;
      const result = await Material.getAll({
        search,
        lowstock,
        supplierid,
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
      const material = await Material.getById(req.params.id);
      if (!material) {
        return res.status(404).json({ success: false, message: 'Material not found.' });
      }
      res.json({ success: true, data: material });
    } catch (err) {
      next(err);
    }
  },

  async create(req, res, next) {
    try {
      const { MaterialName, QuantityAvailable, Unit, CostPerUnit, SupplierID } = req.body;
      if (!MaterialName) {
        return res.status(400).json({ success: false, message: 'MaterialName is required.' });
      }
      const material = await Material.create({ MaterialName, QuantityAvailable, Unit, CostPerUnit, SupplierID });
      res.status(201).json({ success: true, message: 'Material created successfully', data: material });
    } catch (err) {
      next(err);
    }
  },

  async update(req, res, next) {
    try {
      const { MaterialName, QuantityAvailable, Unit, CostPerUnit, SupplierID } = req.body;
      const material = await Material.update(req.params.id, { MaterialName, QuantityAvailable, Unit, CostPerUnit, SupplierID });
      if (!material) {
        return res.status(404).json({ success: false, message: 'Material not found.' });
      }
      res.json({ success: true, message: 'Material updated successfully', data: material });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/materials/:id/use - Deduct stock
  async useStock(req, res, next) {
    try {
      const { quantity } = req.body;
      if (!quantity || quantity <= 0) {
        return res.status(400).json({ success: false, message: 'Valid quantity is required.' });
      }
      const material = await Material.updateStock(req.params.id, quantity);
      if (!material) {
        return res.status(400).json({ success: false, message: 'Insufficient stock or material not found.' });
      }
      res.json({ success: true, message: 'Stock updated successfully', data: material });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/materials/low-stock
  async getLowStock(req, res, next) {
    try {
      const threshold = parseInt(req.query.threshold) || 100;
      const materials = await Material.getLowStock(threshold);
      res.json({ success: true, data: materials, count: materials.length });
    } catch (err) {
      next(err);
    }
  },

  async delete(req, res, next) {
    try {
      const material = await Material.delete(req.params.id);
      if (!material) {
        return res.status(404).json({ success: false, message: 'Material not found.' });
      }
      res.json({ success: true, message: 'Material deleted successfully', data: material });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = materialController;
