import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';

export default function Employees() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ Name:'', ContactNumber:'', Role:'', Salary:'', JoinDate:'' });
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try { const r = await api.get(`/employees?page=${page}&limit=10&search=${search}`); setItems(r.data.data); setTotalPages(r.data.totalPages); }
    catch { toast.error('Failed'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page, search]);

  const openCreate = () => { setForm({ Name:'', ContactNumber:'', Role:'', Salary:'', JoinDate:'' }); setEditing(null); setModalOpen(true); };
  const openEdit = (e) => { setForm({ Name:e.name, ContactNumber:e.contactnumber||'', Role:e.role||'', Salary:e.salary||'', JoinDate:e.joindate?e.joindate.split('T')[0]:'' }); setEditing(e.employeeid); setModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/employees/${editing}`, form); toast.success('Updated'); }
      else { await api.post('/employees', form); toast.success('Created'); }
      setModalOpen(false); fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/employees/${id}`); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); } };

  const inp = "w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">Employees</h1></div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all hover:scale-[1.02]"><HiOutlinePlus className="w-5 h-5" /> Add Employee</button>
      </div>
      <div className="relative max-w-md"><HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" /><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search..." className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/></div>
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">

        
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-surface-50 dark:bg-surface-900/50">
          <th className="text-left py-3.5 px-4 text-surface-500 font-medium">ID</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Name</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Contact</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium hidden md:table-cell">Role</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium hidden lg:table-cell">Salary</th><th className="text-right py-3.5 px-4 text-surface-500 font-medium">Actions</th>
        </tr></thead><tbody>{loading?<tr><td colSpan={6} className="text-center py-12 text-surface-400">Loading...</td></tr>:items.length===0?<tr><td colSpan={6} className="text-center py-12 text-surface-400">No employees</td></tr>:items.map(e=>(
          <tr key={e.employeeid} className="border-t border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700/20 transition-colors">
            <td className="py-3 px-4 text-surface-500">#{e.employeeid}</td>
            <td className="py-3 px-4 text-surface-900 dark:text-white font-medium">{e.name}</td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300">{e.contactnumber||'—'}</td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300 hidden md:table-cell"><span className="px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium">{e.role||'—'}</span></td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300 hidden lg:table-cell">₹{parseFloat(e.salary||0).toLocaleString()}</td>
            <td className="py-3 px-4"><div className="flex items-center justify-end gap-1"><button onClick={()=>openEdit(e)} className="p-2 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"><HiOutlinePencil className="w-4 h-4"/></button><button onClick={()=>handleDelete(e.employeeid)} className="p-2 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><HiOutlineTrash className="w-4 h-4"/></button></div></td>
          </tr>))}</tbody></table></div>


        <div className="px-4 pb-2"><Pagination page={page} totalPages={totalPages} onPageChange={setPage}/></div>
      </div>



      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editing?'Edit Employee':'Add Employee'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Name *</label><input type="text" value={form.Name} onChange={e=>setForm({...form,Name:e.target.value})} required className={inp}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Contact</label><input type="text" value={form.ContactNumber} onChange={e=>setForm({...form,ContactNumber:e.target.value})} className={inp}/></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Role</label><input type="text" value={form.Role} onChange={e=>setForm({...form,Role:e.target.value})} className={inp}/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Salary</label><input type="number" step="0.01" value={form.Salary} onChange={e=>setForm({...form,Salary:e.target.value})} className={inp}/></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Join Date</label><input type="date" value={form.JoinDate} onChange={e=>setForm({...form,JoinDate:e.target.value})} className={inp}/></div>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 text-sm font-medium">Cancel</button><button type="submit" className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-600/20">{editing?'Update':'Create'}</button></div>
        </form>
      </Modal>
    </div>
  );
}
