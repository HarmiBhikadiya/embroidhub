import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlineArchive, HiOutlineTrash, HiOutlineDownload } from 'react-icons/hi';

export default function Invoices() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ OrderID: '', InvoiceDate: '', TaxAmount: '', Discount: '', NetTotal: '', Remarks: '' });

  const fetchData = async () => {
    setLoading(true);
    try { const r = await api.get(`/invoices?page=${page}&limit=10`); setItems(r.data.data); setTotalPages(r.data.totalPages); }
    catch { toast.error('Failed to load invoices'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page]);
  useEffect(() => { api.get('/orders?limit=100').then(r => setOrders(r.data.data)).catch(() => {}); }, []);

  const openCreate = () => { setForm({ OrderID: '', InvoiceDate: new Date().toISOString().split('T')[0], TaxAmount: '', Discount: '', NetTotal: '', Remarks: '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/invoices', form);
      toast.success('Invoice generated successfully');
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error generating invoice'); }
  };
  const handleDelete = async (id) => { if (!confirm('Delete this invoice?')) return; try { await api.delete(`/invoices/${id}`); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed to delete'); } };
  
  const handleDownloadPDF = async (id) => {
      try {
          const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement('a');
          link.href = url;
          link.setAttribute('download', `invoice_${id}.pdf`);
          document.body.appendChild(link);
          link.click();
          link.parentNode.removeChild(link);
      } catch (err) {
          toast.error("Failed to download PDF");
      }
  };

  const inp = "w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Invoices</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all hover:scale-[1.02]"><HiOutlinePlus className="w-5 h-5"/> Generate Invoice</button>
      </div>
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-surface-50 dark:bg-surface-900/50">
          <th className="text-left py-3.5 px-4 text-surface-500 font-medium">Invoice #</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Order #</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Customer</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Date</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Net Total</th><th className="text-right py-3.5 px-4 text-surface-500 font-medium">Actions</th>
        </tr></thead><tbody>{loading?<tr><td colSpan={6} className="text-center py-12 text-surface-400">Loading...</td></tr>:items.map(i=>(
          <tr key={i.invoiceid} className="border-t border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700/20 transition-colors">
             <td className="py-3 px-4 font-semibold text-primary-600 dark:text-primary-400">INV-{String(i.invoiceid).padStart(5, '0')}</td>
            <td className="py-3 px-4 text-surface-900 dark:text-white">Order #{i.orderid}</td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300">{i.customername}</td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300">{new Date(i.invoicedate).toLocaleDateString()}</td>
            <td className="py-3 px-4 font-medium text-surface-900 dark:text-white">₹{parseFloat(i.nettotal).toLocaleString()}</td>
            <td className="py-3 px-4"><div className="flex items-center justify-end gap-1"><button onClick={()=>handleDownloadPDF(i.invoiceid)} className="p-2 w-full text-left rounded-lg text-primary-500 font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all flex items-center gap-1.5" title="Download PDF"><HiOutlineDownload className="w-5 h-5"/> PDF</button><button onClick={()=>handleDelete(i.invoiceid)} className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><HiOutlineTrash className="w-4 h-4"/></button></div></td>
          </tr>))}</tbody></table></div>
        <div className="px-4 pb-2"><Pagination page={page} totalPages={totalPages} onPageChange={setPage}/></div>
      </div>
      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title="Generate Invoice">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Order *</label><select value={form.OrderID} onChange={e=>setForm({...form,OrderID:e.target.value})} required className={inp}><option value="">Select Order</option>{orders.map(o=><option key={o.orderid} value={o.orderid}>#{o.orderid} - {o.customername} (Total: ₹{parseFloat(o.totalamount).toLocaleString()})</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Date *</label><input type="date" value={form.InvoiceDate} onChange={e=>setForm({...form,InvoiceDate:e.target.value})} required className={inp}/></div>
             <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Tax Amount (₹)</label><input type="number" step="0.01" value={form.TaxAmount} onChange={e=>setForm({...form,TaxAmount:e.target.value})} className={inp}/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Discount (₹)</label><input type="number" step="0.01" value={form.Discount} onChange={e=>setForm({...form,Discount:e.target.value})} className={inp}/></div>
             <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Net Total (₹) *</label><input type="number" step="0.01" value={form.NetTotal} onChange={e=>setForm({...form,NetTotal:e.target.value})} required className={inp}/></div>
          </div>
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Remarks</label><textarea value={form.Remarks} onChange={e=>setForm({...form,Remarks:e.target.value})} rows={2} className={inp}/></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 text-sm font-medium">Cancel</button><button type="submit" className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-600/20">Generate</button></div>
        </form>
      </Modal>
    </div>
  );
}
