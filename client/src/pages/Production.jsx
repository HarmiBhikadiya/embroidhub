import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

export default function Production() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [orders, setOrders] = useState([]);
  const [machines, setMachines] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({ OrderID:'', MachineID:'', EmployeeID:'', StartDate:'', EndDate:'', QuantityProduced:'', Remarks:'' });
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/production?page=${page}&limit=10&status=${statusFilter}`);
      setItems(res.data.data); setTotalPages(res.data.totalPages);
    } catch { toast.error('Failed to load'); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [page, statusFilter]);
  useEffect(() => {
    Promise.all([api.get('/orders?limit=100'), api.get('/machines?limit=100'), api.get('/employees?limit=100')])
      .then(([o,m,e]) => { setOrders(o.data.data); setMachines(m.data.data); setEmployees(e.data.data); }).catch(()=>{});
  }, []);

  const openCreate = () => { setForm({ OrderID:'', MachineID:'', EmployeeID:'', StartDate:'', EndDate:'', QuantityProduced:'', Remarks:'' }); setEditing(null); setModalOpen(true); };
  const openEdit = (p) => {
    setForm({ OrderID:p.orderid||'', MachineID:p.machineid||'', EmployeeID:p.employeeid||'', StartDate:p.startdate?p.startdate.slice(0,16):'', EndDate:p.enddate?p.enddate.slice(0,16):'', QuantityProduced:p.quantityproduced||'', Remarks:p.remarks||'' });
    setEditing(p.productionid); setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/production/${editing}`, form); toast.success('Updated'); }
      else { await api.post('/production', form); toast.success('Created'); }
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete?')) return;
    try { await api.delete(`/production/${id}`); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); }
  };

  const inp = "w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">Production</h1><p className="text-surface-500 text-sm mt-1">Track production jobs</p></div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all hover:scale-[1.02]"><HiOutlinePlus className="w-5 h-5" /> New Job</button>
      </div>
      <div className="flex gap-3">
        <select value={statusFilter} onChange={e=>{setStatusFilter(e.target.value);setPage(1);}} className="px-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500">
          <option value="">All</option><option value="ongoing">Ongoing</option><option value="completed">Completed</option>
        </select>
      </div>
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm">
          <thead><tr className="bg-surface-50 dark:bg-surface-900/50">
            <th className="text-left py-3.5 px-4 text-surface-500 font-medium">ID</th>
            <th className="text-left py-3.5 px-4 text-surface-500 font-medium">Order</th>
            <th className="text-left py-3.5 px-4 text-surface-500 font-medium">Machine</th>
            <th className="text-left py-3.5 px-4 text-surface-500 font-medium hidden md:table-cell">Employee</th>
            <th className="text-left py-3.5 px-4 text-surface-500 font-medium hidden lg:table-cell">Qty</th>
            <th className="text-left py-3.5 px-4 text-surface-500 font-medium">Status</th>
            <th className="text-right py-3.5 px-4 text-surface-500 font-medium">Actions</th>
          </tr></thead>
          <tbody>{loading?<tr><td colSpan={7} className="text-center py-12 text-surface-400">Loading...</td></tr>:items.length===0?<tr><td colSpan={7} className="text-center py-12 text-surface-400">No records</td></tr>:items.map(p=>(
            <tr key={p.productionid} className="border-t border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700/20 transition-colors">
              <td className="py-3 px-4 text-surface-500">#{p.productionid}</td>
              <td className="py-3 px-4 text-surface-900 dark:text-white font-medium">Order #{p.orderid} <span className="text-xs text-surface-400">({p.customername||''})</span></td>
              <td className="py-3 px-4 text-surface-600 dark:text-surface-300">{p.machinename||'—'}</td>
              <td className="py-3 px-4 text-surface-600 dark:text-surface-300 hidden md:table-cell">{p.employeename||'—'}</td>
              <td className="py-3 px-4 text-surface-600 dark:text-surface-300 hidden lg:table-cell">{p.quantityproduced||0}</td>
              <td className="py-3 px-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${p.enddate?'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400':'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}`}>{p.enddate?'Completed':'Ongoing'}</span></td>
              <td className="py-3 px-4"><div className="flex items-center justify-end gap-1">
                <button onClick={()=>openEdit(p)} className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"><HiOutlinePencil className="w-4 h-4"/></button>
                <button onClick={()=>handleDelete(p.productionid)} className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><HiOutlineTrash className="w-4 h-4"/></button>
              </div></td>
            </tr>))}</tbody>
        </table></div>
        <div className="px-4 pb-2"><Pagination page={page} totalPages={totalPages} onPageChange={setPage}/></div>
      </div>
      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editing?'Edit Production':'New Production Job'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Order *</label><select value={form.OrderID} onChange={e=>setForm({...form,OrderID:e.target.value})} required className={inp}><option value="">Select</option>{orders.map(o=><option key={o.orderid} value={o.orderid}>#{o.orderid} - {o.customername}</option>)}</select></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Machine</label><select value={form.MachineID} onChange={e=>setForm({...form,MachineID:e.target.value})} className={inp}><option value="">Select</option>{machines.map(m=><option key={m.machineid} value={m.machineid}>{m.machinename}</option>)}</select></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Employee</label><select value={form.EmployeeID} onChange={e=>setForm({...form,EmployeeID:e.target.value})} className={inp}><option value="">Select</option>{employees.map(e2=><option key={e2.employeeid} value={e2.employeeid}>{e2.name}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Start</label><input type="datetime-local" value={form.StartDate} onChange={e=>setForm({...form,StartDate:e.target.value})} className={inp}/></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">End</label><input type="datetime-local" value={form.EndDate} onChange={e=>setForm({...form,EndDate:e.target.value})} className={inp}/></div>
          </div>
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Qty Produced</label><input type="number" value={form.QuantityProduced} onChange={e=>setForm({...form,QuantityProduced:e.target.value})} className={inp}/></div>
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Remarks</label><textarea value={form.Remarks} onChange={e=>setForm({...form,Remarks:e.target.value})} rows={2} className={inp}/></div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 text-sm font-medium">Cancel</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-600/20">{editing?'Update':'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
