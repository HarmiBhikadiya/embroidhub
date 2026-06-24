import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';

export default function Suppliers() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ Name:'', ContactNumber:'', Email:'', Address:'' });
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try { const r = await api.get(`/suppliers?page=${page}&limit=10&search=${search}`); setItems(r.data.data); setTotalPages(r.data.totalPages); }
    catch { toast.error('Failed to load suppliers'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page, search]);

  const openCreate = () => { setForm({ Name:'', ContactNumber:'', Email:'', Address:'' }); setEditing(null); setModalOpen(true); };
  const openEdit = (s) => { setForm({ Name:s.name, ContactNumber:s.contactnumber||'', Email:s.email||'', Address:s.address||'' }); setEditing(s.supplierid); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (editing) { await api.put(`/suppliers/${editing}`, form); toast.success('Updated'); } else { await api.post('/suppliers', form); toast.success('Created'); } setModalOpen(false); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/suppliers/${id}`); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); } };

  const inp = "w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Suppliers</h1>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all hover:scale-[1.02]"><HiOutlinePlus className="w-5 h-5"/> Add Supplier</button>
      </div>
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-surface-50 dark:bg-surface-900/50">
          <th className="text-left py-3.5 px-4 text-surface-500 font-medium">ID</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Name</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Contact</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium hidden md:table-cell">Email</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium hidden lg:table-cell">Address</th><th className="text-right py-3.5 px-4 text-surface-500 font-medium">Actions</th>
        </tr></thead><tbody>{loading?<tr><td colSpan={6} className="text-center py-12 text-surface-400">Loading...</td></tr>:items.map(s=>(
          <tr key={s.supplierid} className="border-t border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700/20 transition-colors">
            <td className="py-3 px-4 text-surface-500">#{s.supplierid}</td>
            <td className="py-3 px-4 text-surface-900 dark:text-white font-medium">{s.name}</td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300">{s.contactnumber||'—'}</td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300 hidden md:table-cell">{s.email||'—'}</td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300 line-clamp-1 hidden lg:table-cell">{s.address||'—'}</td>
            <td className="py-3 px-4"><div className="flex items-center justify-end gap-1"><button onClick={()=>openEdit(s)} className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"><HiOutlinePencil className="w-4 h-4"/></button><button onClick={()=>handleDelete(s.supplierid)} className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><HiOutlineTrash className="w-4 h-4"/></button></div></td>
          </tr>))}</tbody></table></div>
        <div className="px-4 pb-2"><Pagination page={page} totalPages={totalPages} onPageChange={setPage}/></div>
      </div>
      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editing?'Edit Supplier':'Add Supplier'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Supplier Name *</label><input type="text" value={form.Name} onChange={e=>setForm({...form,Name:e.target.value})} required className={inp}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Contact</label><input type="text" value={form.ContactNumber} onChange={e=>setForm({...form,ContactNumber:e.target.value})} className={inp}/></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Email</label><input type="email" value={form.Email} onChange={e=>setForm({...form,Email:e.target.value})} className={inp}/></div>
          </div>
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Address</label><textarea value={form.Address} onChange={e=>setForm({...form,Address:e.target.value})} rows={2} className={inp}/></div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 text-sm font-medium">Cancel</button><button type="submit" className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-600/20">{editing?'Update':'Create'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
