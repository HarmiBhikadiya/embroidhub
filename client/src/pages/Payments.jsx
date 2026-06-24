import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

export default function Payments() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({ OrderID: '', PaymentDate: '', AmountPaid: '', PaymentMode: 'Bank', TransactionReference: '' });

  const fetchData = async () => {
    setLoading(true);
    try { const r = await api.get(`/payments?page=${page}&limit=10`); setItems(r.data.data); setTotalPages(r.data.totalPages); }
    catch { toast.error('Failed to load payments'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page]);
  useEffect(() => { api.get('/orders?limit=100').then(r => setOrders(r.data.data)).catch(() => {}); }, []);

  const openCreate = () => { setForm({ OrderID: '', PaymentDate: new Date().toISOString().split('T')[0], AmountPaid: '', PaymentMode: 'Bank', TransactionReference: '' }); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/payments', form);
      toast.success('Payment recorded successfully');
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error recording payment'); }
  };
  const handleDelete = async (id) => { if (!confirm('Delete this payment?')) return; try { await api.delete(`/payments/${id}`); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed to delete'); } };
  
  const inp = "w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Payments</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all hover:scale-[1.02]"><HiOutlinePlus className="w-5 h-5"/> Record Payment</button>
      </div>
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-surface-50 dark:bg-surface-900/50">
          <th className="text-left py-3.5 px-4 text-surface-500 font-medium">ID</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Order</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Customer</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Date</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Amount</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Mode</th><th className="text-right py-3.5 px-4 text-surface-500 font-medium">Actions</th>
        </tr></thead><tbody>{loading?<tr><td colSpan={7} className="text-center py-12 text-surface-400">Loading...</td></tr>:items.map(p=>(
          <tr key={p.paymentid} className="border-t border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700/20 transition-colors">
            <td className="py-3 px-4 text-surface-500">#{p.paymentid}</td>
            <td className="py-3 px-4 text-surface-900 dark:text-white font-medium">Order #{p.orderid}</td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300">{p.customername}</td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300">{new Date(p.paymentdate).toLocaleDateString()}</td>
            <td className="py-3 px-4 text-emerald-600 font-medium">₹{parseFloat(p.amountpaid).toLocaleString()}</td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300">{p.paymentmode}</td>
            <td className="py-3 px-4"><div className="flex items-center justify-end gap-1"><button onClick={()=>handleDelete(p.paymentid)} className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><HiOutlineTrash className="w-4 h-4"/></button></div></td>
          </tr>))}</tbody></table></div>
        <div className="px-4 pb-2"><Pagination page={page} totalPages={totalPages} onPageChange={setPage}/></div>
      </div>
      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title="Record Payment">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Order *</label><select value={form.OrderID} onChange={e=>setForm({...form,OrderID:e.target.value})} required className={inp}><option value="">Select Order</option>{orders.map(o=><option key={o.orderid} value={o.orderid}>#{o.orderid} - {o.customername} (Amount: ₹{parseFloat(o.totalamount).toLocaleString()})</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Date *</label><input type="date" value={form.PaymentDate} onChange={e=>setForm({...form,PaymentDate:e.target.value})} required className={inp}/></div>
             <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Amount (₹) *</label><input type="number" step="0.01" value={form.AmountPaid} onChange={e=>setForm({...form,AmountPaid:e.target.value})} required className={inp}/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Mode *</label><select value={form.PaymentMode} onChange={e=>setForm({...form,PaymentMode:e.target.value})} required className={inp}><option>Bank</option><option>UPI</option><option>Cash</option></select></div>
             <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Reference ID</label><input type="text" value={form.TransactionReference} onChange={e=>setForm({...form,TransactionReference:e.target.value})} placeholder="Txn Ref" className={inp}/></div>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 text-sm font-medium">Cancel</button><button type="submit" className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-600/20">Record</button></div>
        </form>
      </Modal>
    </div>
  );
}
