import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineEye } from 'react-icons/hi';

const statusColors = { Pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', 'In Progress': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', Completed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', Delivered: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' };
const payColors = { Unpaid: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', Partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', Paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' };

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailModal, setDetailModal] = useState(false);
  const [detail, setDetail] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [form, setForm] = useState({ CustomerID: '', OrderDate: '', DueDate: '', Status: 'Pending' });
  const [editing, setEditing] = useState(null);

  const fetch = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/orders?page=${page}&limit=10&search=${search}&status=${statusFilter}`);
      setOrders(res.data.data); setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, [page, search, statusFilter]);
  useEffect(() => { api.get('/customers?limit=100').then(r => setCustomers(r.data.data)).catch(() => {}); }, []);

  const openCreate = () => { setForm({ CustomerID: '', OrderDate: new Date().toISOString().split('T')[0], DueDate: '', Status: 'Pending' }); setEditing(null); setModalOpen(true); };
  const openEdit = (o) => { setForm({ CustomerID: o.customerid, OrderDate: o.orderdate?.split('T')[0] || '', DueDate: o.duedate?.split('T')[0] || '', Status: o.status }); setEditing(o.orderid); setModalOpen(true); };

  const viewDetail = async (id) => {
    try { const res = await api.get(`/orders/${id}`); setDetail(res.data.data); setDetailModal(true); }
    catch { toast.error('Failed to load order'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/orders/${editing}`, form); toast.success('Order updated'); }
      else { await api.post('/orders', form); toast.success('Order created'); }
      setModalOpen(false); fetch();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const updateStatus = async (id, status) => {
    try { await api.put(`/orders/${id}/status`, { status }); toast.success('Status updated'); fetch(); }
    catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this order?')) return;
    try { await api.delete(`/orders/${id}`); toast.success('Order deleted'); fetch(); } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">Orders</h1><p className="text-surface-500 text-sm mt-1">Track and manage all orders</p></div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all hover:scale-[1.02]"><HiOutlinePlus className="w-5 h-5" /> New Order</button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search orders..." className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All Status</option>
          <option>Pending</option><option>In Progress</option><option>Completed</option><option>Delivered</option>
        </select>
      </div>

      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="bg-surface-50 dark:bg-surface-900/50">
              <th className="text-left py-3.5 px-4 text-surface-500 font-medium">Order</th>
              <th className="text-left py-3.5 px-4 text-surface-500 font-medium">Customer</th>
              <th className="text-left py-3.5 px-4 text-surface-500 font-medium hidden md:table-cell">Date</th>
              <th className="text-left py-3.5 px-4 text-surface-500 font-medium">Amount</th>
              <th className="text-left py-3.5 px-4 text-surface-500 font-medium">Status</th>
              <th className="text-left py-3.5 px-4 text-surface-500 font-medium hidden lg:table-cell">Payment</th>
              <th className="text-right py-3.5 px-4 text-surface-500 font-medium">Actions</th>
            </tr></thead>
            <tbody>
              {loading ? <tr><td colSpan={7} className="text-center py-12 text-surface-400">Loading...</td></tr>
              : orders.length === 0 ? <tr><td colSpan={7} className="text-center py-12 text-surface-400">No orders found</td></tr>
              : orders.map(o => (
                <tr key={o.orderid} className="border-t border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700/20 transition-colors">
                  <td className="py-3 px-4 text-surface-900 dark:text-white font-semibold">#{o.orderid}</td>
                  <td className="py-3 px-4 text-surface-700 dark:text-surface-300">{o.customername || '—'}</td>
                  <td className="py-3 px-4 text-surface-500 hidden md:table-cell">{o.orderdate?.split('T')[0]}</td>
                  <td className="py-3 px-4 text-surface-900 dark:text-white font-medium">₹{parseFloat(o.totalamount || 0).toLocaleString()}</td>
                  <td className="py-3 px-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[o.status] || ''}`}>{o.status}</span></td>
                  <td className="py-3 px-4 hidden lg:table-cell"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${payColors[o.paymentstatus] || ''}`}>{o.paymentstatus}</span></td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => viewDetail(o.orderid)} className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"><HiOutlineEye className="w-4 h-4" /></button>
                      <button onClick={() => openEdit(o)} className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"><HiOutlinePencil className="w-4 h-4" /></button>
                      <button onClick={() => handleDelete(o.orderid)} className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><HiOutlineTrash className="w-4 h-4" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-4 pb-2"><Pagination page={page} totalPages={totalPages} onPageChange={setPage} /></div>
      </div>

      {/* Create/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Order' : 'New Order'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Customer *</label>
            <select value={form.CustomerID} onChange={e => setForm({ ...form, CustomerID: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
              <option value="">Select Customer</option>
              {customers.map(c => <option key={c.customerid} value={c.customerid}>{c.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Order Date *</label><input type="date" value={form.OrderDate} onChange={e => setForm({ ...form, OrderDate: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Due Date</label><input type="date" value={form.DueDate} onChange={e => setForm({ ...form, DueDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500" /></div>
          </div>
          {editing && <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Status</label><select value={form.Status} onChange={e => setForm({ ...form, Status: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"><option>Pending</option><option>In Progress</option><option>Completed</option><option>Delivered</option></select></div>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-all">Cancel</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-600/20 transition-all">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={detailModal} onClose={() => setDetailModal(false)} title={`Order #${detail?.orderid}`} size="lg">
        {detail && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><span className="text-surface-500">Customer:</span> <span className="text-surface-900 dark:text-white font-medium ml-1">{detail.customername}</span></div>
              <div><span className="text-surface-500">Date:</span> <span className="text-surface-900 dark:text-white ml-1">{detail.orderdate?.split('T')[0]}</span></div>
              <div><span className="text-surface-500">Status:</span> <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[detail.status]}`}>{detail.status}</span></div>
              <div><span className="text-surface-500">Payment:</span> <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${payColors[detail.paymentstatus]}`}>{detail.paymentstatus}</span></div>
              <div><span className="text-surface-500">Total:</span> <span className="text-surface-900 dark:text-white font-bold ml-1">₹{parseFloat(detail.totalamount || 0).toLocaleString()}</span></div>
            </div>
            {detail.designs?.length > 0 && (
              <div><h4 className="font-semibold text-surface-900 dark:text-white mb-2">Designs</h4>
                <table className="w-full text-sm"><thead><tr className="border-b border-surface-200 dark:border-surface-700"><th className="text-left py-2 text-surface-500">Design</th><th className="text-left py-2 text-surface-500">Qty</th><th className="text-left py-2 text-surface-500">Rate</th><th className="text-right py-2 text-surface-500">SubTotal</th></tr></thead>
                  <tbody>{detail.designs.map((d, i) => <tr key={i} className="border-b border-surface-100 dark:border-surface-700/50"><td className="py-2 text-surface-900 dark:text-white">{d.designname}</td><td className="py-2 text-surface-600 dark:text-surface-300">{d.quantity}</td><td className="py-2 text-surface-600 dark:text-surface-300">₹{parseFloat(d.priceperunit).toFixed(2)}</td><td className="py-2 text-right font-medium text-surface-900 dark:text-white">₹{parseFloat(d.subtotal).toLocaleString()}</td></tr>)}</tbody></table>
              </div>
            )}
            {detail.payments?.length > 0 && (
              <div><h4 className="font-semibold text-surface-900 dark:text-white mb-2">Payments</h4>
                <table className="w-full text-sm"><thead><tr className="border-b border-surface-200 dark:border-surface-700"><th className="text-left py-2 text-surface-500">Date</th><th className="text-left py-2 text-surface-500">Mode</th><th className="text-right py-2 text-surface-500">Amount</th></tr></thead>
                  <tbody>{detail.payments.map((p, i) => <tr key={i} className="border-b border-surface-100 dark:border-surface-700/50"><td className="py-2 text-surface-600 dark:text-surface-300">{p.paymentdate?.split('T')[0]}</td><td className="py-2 text-surface-600 dark:text-surface-300">{p.paymentmode}</td><td className="py-2 text-right font-medium text-emerald-600">₹{parseFloat(p.amountpaid).toLocaleString()}</td></tr>)}</tbody></table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
