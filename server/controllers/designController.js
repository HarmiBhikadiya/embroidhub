const Design = require('../models/Design');

const designController = {
  // GET /api/designs
  async getAll(req, res, next) {
    try {
      const { search, page, limit } = req.query;
      const result = await Design.getAll({
        search,
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/designs/:id
  async getById(req, res, next) {
    try {
      const design = await Design.getById(req.params.id);
      if (!design) {
        return res.status(404).json({ success: false, message: 'Design not found.' });
      }
      res.json({ success: true, data: design });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/designs
  async create(req, res, next) {
    try {
      const { DesignName, Description, FilePath, StitchCount, ThreadColors, DesignRate } = req.body;
      if (!DesignName) {
        return res.status(400).json({ success: false, message: 'DesignName is required.' });
      }
      const design = await Design.create({ DesignName, Description, FilePath, StitchCount, ThreadColors, DesignRate });
      res.status(201).json({ success: true, message: 'Design created successfully', data: design });
    } catch (err) {
      next(err);
    }
  },

  // PUT /api/designs/:id
  async update(req, res, next) {
    try {
      const { DesignName, Description, FilePath, StitchCount, ThreadColors, DesignRate } = req.body;
      if (!DesignName) {
        return res.status(400).json({ success: false, message: 'DesignName is required.' });
      }
      const design = await Design.update(req.params.id, { DesignName, Description, FilePath, StitchCount, ThreadColors, DesignRate });
      if (!design) {
        return res.status(404).json({ success: false, message: 'Design not found.' });
      }
      res.json({ success: true, message: 'Design updated successfully', data: design });
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/designs/:id
  async delete(req, res, next) {
    try {
      const design = await Design.delete(req.params.id);
      if (!design) {
        return res.status(404).json({ success: false, message: 'Design not found.' });
      }
      res.json({ success: true, message: 'Design deleted successfully', data: design });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = designController;
