import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

export default function Machines() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ MachineName:'', Brand:'', Model:'', Status:'Active', Location:'' });
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try { const r = await api.get(`/machines?page=${page}&limit=10`); setItems(r.data.data); setTotalPages(r.data.totalPages); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page]);

  const openCreate = () => { setForm({ MachineName:'', Brand:'', Model:'', Status:'Active', Location:'' }); setEditing(null); setModalOpen(true); };
  const openEdit = (m) => { setForm({ MachineName:m.machinename||'', Brand:m.brand||'', Model:m.model||'', Status:m.status||'Active', Location:m.location||'' }); setEditing(m.machineid); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (editing) { await api.put(`/machines/${editing}`, form); toast.success('Updated'); } else { await api.post('/machines', form); toast.success('Created'); } setModalOpen(false); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/machines/${id}`); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); } };
  const sColors = { Active:'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', Maintenance:'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', Inactive:'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' };
  const inp = "w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Machines</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all hover:scale-[1.02]"><HiOutlinePlus className="w-5 h-5"/> Add Machine</button>
      </div>
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-surface-50 dark:bg-surface-900/50">
          <th className="text-left py-3.5 px-4 text-surface-500 font-medium">ID</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Name</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Brand</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium hidden md:table-cell">Model</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Status</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium hidden lg:table-cell">Location</th><th className="text-right py-3.5 px-4 text-surface-500 font-medium">Actions</th>
        </tr></thead><tbody>{loading?<tr><td colSpan={7} className="text-center py-12 text-surface-400">Loading...</td></tr>:items.map(m=>(
          <tr key={m.machineid} className="border-t border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700/20 transition-colors">
            <td className="py-3 px-4 text-surface-500">#{m.machineid}</td>
            <td className="py-3 px-4 text-surface-900 dark:text-white font-medium">{m.machinename}</td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300">{m.brand||'—'}</td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300 hidden md:table-cell">{m.model||'—'}</td>
            <td className="py-3 px-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sColors[m.status]||''}`}>{m.status}</span></td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300 hidden lg:table-cell">{m.location||'—'}</td>
            <td className="py-3 px-4"><div className="flex items-center justify-end gap-1"><button onClick={()=>openEdit(m)} className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"><HiOutlinePencil className="w-4 h-4"/></button><button onClick={()=>handleDelete(m.machineid)} className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><HiOutlineTrash className="w-4 h-4"/></button></div></td>
          </tr>))}</tbody></table></div>
        <div className="px-4 pb-2"><Pagination page={page} totalPages={totalPages} onPageChange={setPage}/></div>
      </div>
      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editing?'Edit Machine':'Add Machine'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Machine Name *</label><input type="text" value={form.MachineName} onChange={e=>setForm({...form,MachineName:e.target.value})} required className={inp}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Brand</label><input type="text" value={form.Brand} onChange={e=>setForm({...form,Brand:e.target.value})} className={inp}/></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Model</label><input type="text" value={form.Model} onChange={e=>setForm({...form,Model:e.target.value})} className={inp}/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Status</label><select value={form.Status} onChange={e=>setForm({...form,Status:e.target.value})} className={inp}><option>Active</option><option>Maintenance</option><option>Inactive</option></select></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Location</label><input type="text" value={form.Location} onChange={e=>setForm({...form,Location:e.target.value})} className={inp}/></div>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 text-sm font-medium">Cancel</button><button type="submit" className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-600/20">{editing?'Update':'Create'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
