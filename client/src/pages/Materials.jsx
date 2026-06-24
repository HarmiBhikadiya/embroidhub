import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';

export default function Materials() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [lowstock, setLowstock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [useModalOpen, setUseModalOpen] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({ MaterialName:'', QuantityAvailable:'', Unit:'', CostPerUnit:'', SupplierID:'' });
  const [editing, setEditing] = useState(null);
  const [useForm, setUseForm] = useState({ quantity: '' });

  const fetchData = async () => {
    setLoading(true);
    try { const r = await api.get(`/materials?page=${page}&limit=10&search=${search}&lowstock=${lowstock}`); setItems(r.data.data); setTotalPages(r.data.totalPages); }
    catch { toast.error('Failed to load materials'); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [page, search, lowstock]);
  useEffect(() => { api.get('/suppliers?limit=100').then(r => setSuppliers(r.data.data)).catch(() => {}); }, []);

  const openCreate = () => { setForm({ MaterialName:'', QuantityAvailable:'', Unit:'', CostPerUnit:'', SupplierID:'' }); setEditing(null); setModalOpen(true); };
  const openEdit = (m) => { setForm({ MaterialName:m.materialname, QuantityAvailable:m.quantityavailable||'', Unit:m.unit||'', CostPerUnit:m.costperunit||'', SupplierID:m.supplierid||'' }); setEditing(m.materialid); setModalOpen(true); };
  const openUse = (m) => { setEditing(m.materialid); setUseForm({ quantity: '' }); setUseModalOpen(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try { if (editing) { await api.put(`/materials/${editing}`, form); toast.success('Updated'); } else { await api.post('/materials', form); toast.success('Created'); } setModalOpen(false); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };
  const handleUseSubmit = async (e) => {
    e.preventDefault();
    try { await api.post(`/materials/${editing}/use`, useForm); toast.success('Stock deducted'); setUseModalOpen(false); fetchData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Error updating stock'); }
  };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; try { await api.delete(`/materials/${id}`); toast.success('Deleted'); fetchData(); } catch { toast.error('Failed'); } };

  const inp = "w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">Inventory</h1><p className="text-surface-500 text-sm mt-1">Manage materials and raw materials stock</p></div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all hover:scale-[1.02]"><HiOutlinePlus className="w-5 h-5"/> Add Material</button>
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
         <div className="relative flex-1 max-w-md"><HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" /><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Search materials..." className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"/></div>
         <label className="flex items-center gap-2 text-surface-700 dark:text-surface-300 font-medium">
             <input type="checkbox" checked={lowstock} onChange={e=> {setLowstock(e.target.checked); setPage(1);}} className="w-4 h-4 text-primary-600 rounded bg-surface-100 border-surface-300 focus:ring-primary-500 dark:bg-surface-700 dark:border-surface-600"/>
             Show Low Stock Only
         </label>
      </div>
      <div className="bg-white dark:bg-surface-800 rounded-2xl shadow-sm border border-surface-200 dark:border-surface-700 overflow-hidden">
        <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="bg-surface-50 dark:bg-surface-900/50">
          <th className="text-left py-3.5 px-4 text-surface-500 font-medium">Name</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Stock Available</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium">Unit</th><th className="text-left py-3.5 px-4 text-surface-500 font-medium hidden md:table-cell">Supplier</th><th className="text-right py-3.5 px-4 text-surface-500 font-medium">Actions</th>
        </tr></thead><tbody>{loading?<tr><td colSpan={5} className="text-center py-12 text-surface-400">Loading...</td></tr>:items.map(m=>(
          <tr key={m.materialid} className="border-t border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700/20 transition-colors">
            <td className="py-3 px-4 text-surface-900 dark:text-white font-medium">{m.materialname}</td>
            <td className="py-3 px-4"><span className={`font-semibold ${parseFloat(m.quantityavailable) < 100 ? 'text-red-500' : 'text-emerald-500'}`}>{parseFloat(m.quantityavailable).toLocaleString()}</span></td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300">{m.unit||'—'}</td>
            <td className="py-3 px-4 text-surface-600 dark:text-surface-300 hidden md:table-cell">{m.suppliername||'—'}</td>
            <td className="py-3 px-4"><div className="flex items-center justify-end gap-2">
                <button onClick={()=>openUse(m)} className="px-3 py-1 bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400 rounded-lg text-xs font-medium hover:bg-primary-200 dark:hover:bg-primary-900/50">Use Stock</button>
                <div className="flex gap-1 border-l border-surface-200 dark:border-surface-700 pl-2">
                   <button onClick={()=>openEdit(m)} className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"><HiOutlinePencil className="w-4 h-4"/></button><button onClick={()=>handleDelete(m.materialid)} className="p-1.5 rounded-lg text-surface-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"><HiOutlineTrash className="w-4 h-4"/></button>
                </div>
            </div></td>
          </tr>))}</tbody></table></div>
        <div className="px-4 pb-2"><Pagination page={page} totalPages={totalPages} onPageChange={setPage}/></div>
      </div>
      <Modal isOpen={modalOpen} onClose={()=>setModalOpen(false)} title={editing?'Edit Material':'Add Material'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Name *</label><input type="text" value={form.MaterialName} onChange={e=>setForm({...form,MaterialName:e.target.value})} required className={inp}/></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Qty Available *</label><input type="number" step="0.01" value={form.QuantityAvailable} onChange={e=>setForm({...form,QuantityAvailable:e.target.value})} required className={inp}/></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Unit (e.g. meters)</label><input type="text" value={form.Unit} onChange={e=>setForm({...form,Unit:e.target.value})} className={inp}/></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Cost Per Unit</label><input type="number" step="0.01" value={form.CostPerUnit} onChange={e=>setForm({...form,CostPerUnit:e.target.value})} className={inp}/></div>
            <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Supplier</label><select value={form.SupplierID} onChange={e=>setForm({...form,SupplierID:e.target.value})} className={inp}><option value="">Select Supplier</option>{suppliers.map(s=><option key={s.supplierid} value={s.supplierid}>{s.name}</option>)}</select></div>
          </div>
          <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 text-sm font-medium">Cancel</button><button type="submit" className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-600/20">{editing?'Update':'Create'}</button></div>
        </form>
      </Modal>
      <Modal isOpen={useModalOpen} onClose={()=>setUseModalOpen(false)} title="Use Material Stock">
          <form onSubmit={handleUseSubmit} className="space-y-4">
             <div><label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Quantity to deduct *</label><input type="number" step="0.01" value={useForm.quantity} onChange={e=>setUseForm({quantity:e.target.value})} required className={inp}/></div>
             <div className="flex justify-end gap-3 pt-2"><button type="button" onClick={()=>setUseModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 text-sm font-medium">Cancel</button><button type="submit" className="px-6 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium">Deduct Stock</button></div>
          </form>
      </Modal>
    </div>
  );
}
