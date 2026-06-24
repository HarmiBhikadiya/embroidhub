import { useState, useEffect } from 'react';
import api from '../api/axios';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch } from 'react-icons/hi';

const emptyForm = { DesignName: '', Description: '', FilePath: '', StitchCount: '', ThreadColors: '', DesignRate: '' };

export default function Designs() {
  const [designs, setDesigns] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/designs?page=${page}&limit=10&search=${search}`);
      setDesigns(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch {
      toast.error('Failed to load designs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [page, search]);

  //add designs
  const openCreate = () => { setForm(emptyForm); setEditing(null); setModalOpen(true); };
  
  //while cliking on the edit
  const openEdit = (d) => {
    setForm({
      DesignName: d.designname,
      Description: d.description || '',
      FilePath: d.filepath || '',
      StitchCount: d.stitchcount || '',
      ThreadColors: d.threadcolors || '',
      DesignRate: d.designrate || ''
    });
    setEditing(d.designid);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/designs/${editing}`, form);
        toast.success('Design updated');
      } else {
        await api.post('/designs', form);
        toast.success('Design created');
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error saving design');
    }
  };


  //delete button
  const handleDelete = async (id) => {
    if (!confirm('Delete this design?')) return;
    try {
      await api.delete(`/designs/${id}`);
      toast.success('Design deleted');
      fetchData();
    } catch {
      toast.error('Failed to delete design');
    }
  };

  return (
    <div className="space-y-6 pt-8 lg:pt-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Designs</h1>
          <p className="text-surface-500 text-sm mt-1">Manage embroidery designs array</p>
        </div>
        <button onClick={openCreate} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-white font-medium text-sm shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all hover:scale-[1.02]">
          <HiOutlinePlus className="w-5 h-5" /> Add Design
        </button>
      </div>

      <div className="relative max-w-md">
        <HiOutlineSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
        <input
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          placeholder="Search designs..."
          className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white placeholder-surface-400 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
        />
      </div>

      {/* Cards View */}
      {loading ? (
        <div className="text-center py-12 text-surface-400">Loading...</div>
      ) : designs.length === 0 ? (
        <div className="text-center py-12 text-surface-400">No designs found</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {designs.map(d => (
            <div key={d.designid} className="bg-white dark:bg-surface-800 rounded-2xl p-5 shadow-sm border border-surface-200 dark:border-surface-700 hover:shadow-md transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  {d.designname?.charAt(0)}
                </div>
                <div className="flex gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(d)} className="p-1.5 rounded-lg text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all">
                    <HiOutlinePencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(d.designid)} className="p-1.5 rounded-lg text-surface-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all">
                    <HiOutlineTrash className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <h3 className="text-surface-900 dark:text-white font-semibold text-lg">{d.designname}</h3>
              <p className="text-surface-500 text-sm mt-1 line-clamp-2 h-10">{d.description || 'No description provided.'}</p>
              
              <div className="mt-4 pt-4 border-t border-surface-100 dark:border-surface-700 grid grid-cols-2 gap-y-3 gap-x-2 text-sm">
                <div>
                  <span className="text-surface-400 block text-xs mb-0.5">Stitches</span> 
                  <span className="text-surface-700 dark:text-surface-300 font-medium">{d.stitchcount?.toLocaleString() || '—'}</span>
                </div>
                <div>
                  <span className="text-surface-400 block text-xs mb-0.5">Rate</span> 
                  <span className="text-emerald-600 dark:text-emerald-400 font-semibold">₹{parseFloat(d.designrate || 0).toFixed(2)}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-surface-400 block text-xs mb-0.5">Colors</span> 
                  <span className="text-surface-700 dark:text-surface-300 truncate block text-sm">{d.threadcolors || '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />

      {/* Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Design' : 'Add Design'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Design Name *</label>
            <input type="text" value={form.DesignName} onChange={e => setForm({ ...form, DesignName: e.target.value })} required className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description</label>
            <textarea value={form.Description} onChange={e => setForm({ ...form, Description: e.target.value })} rows={2} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">File Path</label>
            <input type="text" value={form.FilePath} onChange={e => setForm({ ...form, FilePath: e.target.value })} placeholder="/designs/file.dst" className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Stitch Count</label>
              <input type="number" value={form.StitchCount} onChange={e => setForm({ ...form, StitchCount: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Rate (₹)</label>
              <input type="number" step="0.01" value={form.DesignRate} onChange={e => setForm({ ...form, DesignRate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Thread Colors</label>
            <input type="text" value={form.ThreadColors} onChange={e => setForm({ ...form, ThreadColors: e.target.value })} placeholder="Red,Green,Gold" className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 text-surface-600 dark:text-surface-300 text-sm font-medium hover:bg-surface-50 dark:hover:bg-surface-700 transition-all">Cancel</button>
            <button type="submit" className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium shadow-lg shadow-primary-600/20 hover:shadow-primary-600/40 transition-all">{editing ? 'Update' : 'Create'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
