const Invoice = require('../models/Invoice');
const PDFDocument = require('pdfkit');

const invoiceController = {
  // GET /api/invoices
  async getAll(req, res, next) {
    try {
      const { page, limit } = req.query;
      const result = await Invoice.getAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
      });
      res.json({ success: true, ...result });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/invoices/:id
  async getById(req, res, next) {
    try {
      const invoice = await Invoice.getById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
      }
      res.json({ success: true, data: invoice });
    } catch (err) {
      next(err);
    }
  },

  // POST /api/invoices
  async create(req, res, next) {
    try {
      const { OrderID, InvoiceDate, TaxAmount, Discount, NetTotal, Remarks } = req.body;
      if (!OrderID) {
        return res.status(400).json({ success: false, message: 'OrderID is required.' });
      }
      const invoice = await Invoice.create({
        OrderID,
        InvoiceDate: InvoiceDate || new Date(),
        TaxAmount: TaxAmount || 0,
        Discount: Discount || 0,
        NetTotal,
        Remarks,
        GeneratedBy: req.user.userId,
      });
      res.status(201).json({ success: true, message: 'Invoice generated successfully', data: invoice });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/invoices/:id/pdf
  async exportPDF(req, res, next) {
    try {
      const invoice = await Invoice.getById(req.params.id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
      }

      const doc = new PDFDocument({ margin: 50 });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=invoice_${invoice.invoiceid}.pdf`);
      doc.pipe(res);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('INVOICE', { align: 'center' });
      doc.moveDown(0.5);
      doc.fontSize(10).font('Helvetica').text('Embroidery Management System', { align: 'center' });
      doc.moveDown(1);

      // Invoice Info
      doc.fontSize(11).font('Helvetica-Bold');
      doc.text(`Invoice #: INV-${String(invoice.invoiceid).padStart(5, '0')}`, 50);
      doc.text(`Date: ${new Date(invoice.invoicedate).toLocaleDateString('en-IN')}`, 50);
      doc.moveDown(0.5);

      // Customer Info
      doc.text('Bill To:', 50);
      doc.font('Helvetica');
      doc.text(`${invoice.customername || 'N/A'}`);
      if (invoice.customerphone) doc.text(`Phone: ${invoice.customerphone}`);
      if (invoice.customeremail) doc.text(`Email: ${invoice.customeremail}`);
      if (invoice.customeraddress) doc.text(`Address: ${invoice.customeraddress}`);
      if (invoice.gstnumber) doc.text(`GST: ${invoice.gstnumber}`);
      doc.moveDown(1);

      // Order Info
      doc.font('Helvetica-Bold').text(`Order #: ${invoice.orderid}`);
      doc.font('Helvetica').text(`Order Date: ${new Date(invoice.orderdate).toLocaleDateString('en-IN')}`);
      doc.moveDown(1);

      // Table Header
      const tableTop = doc.y;
      doc.font('Helvetica-Bold').fontSize(10);
      doc.text('Design', 50, tableTop, { width: 150 });
      doc.text('Qty', 200, tableTop, { width: 60, align: 'center' });
      doc.text('Rate', 260, tableTop, { width: 80, align: 'right' });
      doc.text('SubTotal', 340, tableTop, { width: 100, align: 'right' });
      doc.moveDown(0.5);

      // Line
      doc.moveTo(50, doc.y).lineTo(450, doc.y).stroke();
      doc.moveDown(0.3);

      // Table Rows
      doc.font('Helvetica').fontSize(10);
      if (invoice.designs && invoice.designs.length > 0) {
        invoice.designs.forEach((item) => {
          const y = doc.y;
          doc.text(item.designname, 50, y, { width: 150 });
          doc.text(String(item.quantity), 200, y, { width: 60, align: 'center' });
          doc.text(`₹${parseFloat(item.priceperunit).toFixed(2)}`, 260, y, { width: 80, align: 'right' });
          doc.text(`₹${parseFloat(item.subtotal).toFixed(2)}`, 340, y, { width: 100, align: 'right' });
          doc.moveDown(0.5);
        });
      }

      // Line
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(450, doc.y).stroke();
      doc.moveDown(0.5);

      // Totals
      const totalsX = 300;
      doc.font('Helvetica');
      doc.text(`Subtotal:`, totalsX, doc.y, { width: 80 });
      doc.text(`₹${parseFloat(invoice.ordertotal || 0).toFixed(2)}`, 380, doc.y - 12, { width: 80, align: 'right' });

      doc.text(`Tax:`, totalsX, doc.y, { width: 80 });
      doc.text(`₹${parseFloat(invoice.taxamount || 0).toFixed(2)}`, 380, doc.y - 12, { width: 80, align: 'right' });

      doc.text(`Discount:`, totalsX, doc.y, { width: 80 });
      doc.text(`-₹${parseFloat(invoice.discount || 0).toFixed(2)}`, 380, doc.y - 12, { width: 80, align: 'right' });

      doc.moveDown(0.3);
      doc.moveTo(300, doc.y).lineTo(450, doc.y).stroke();
      doc.moveDown(0.3);

      doc.font('Helvetica-Bold').fontSize(12);
      doc.text(`Net Total:`, totalsX, doc.y, { width: 80 });
      doc.text(`₹${parseFloat(invoice.nettotal || 0).toFixed(2)}`, 380, doc.y - 14, { width: 80, align: 'right' });

      // Remarks
      if (invoice.remarks) {
        doc.moveDown(2);
        doc.font('Helvetica').fontSize(10);
        doc.text(`Remarks: ${invoice.remarks}`, 50);
      }

      // Footer
      doc.moveDown(3);
      doc.font('Helvetica').fontSize(9).fillColor('#666');
      doc.text('Generated by Embroidery Management System', 50, doc.y, { align: 'center' });

      doc.end();
    } catch (err) {
      next(err);
    }
  },

  // DELETE /api/invoices/:id
  async delete(req, res, next) {
    try {
      const invoice = await Invoice.delete(req.params.id);
      if (!invoice) {
        return res.status(404).json({ success: false, message: 'Invoice not found.' });
      }
      res.json({ success: true, message: 'Invoice deleted', data: invoice });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = invoiceController;
