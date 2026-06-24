import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { HiOutlineClipboardList, HiOutlineCurrencyRupee, HiOutlineClock, HiOutlineUsers, HiOutlineUserGroup } from 'react-icons/hi';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

//revenue vs expense graph
ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'Admin';
  const [stats, setStats] = useState(null);
  const [monthlyExp, setMonthlyExp] = useState([]);
  const [monthlyRev, setMonthlyRev] = useState([]);
  const [topDesigns, setTopDesigns] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());

  //bar data 
  //runs when page loads or year changes
  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get('/dashboard/stats'),
      api.get(`/dashboard/monthly-expenses?year=${year}`),
      api.get(`/dashboard/monthly-revenue?year=${year}`),
      api.get('/dashboard/top-designs?limit=5'),
      api.get('/dashboard/order-status'),
    ]).then(([s, me, mr, td, os]) => {
      setStats(s.data.data);
      setMonthlyExp(me.data.data);
      setMonthlyRev(mr.data.data);
      setTopDesigns(td.data.data);
      setOrderStatus(os.data.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, [year]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" /></div>;

  const barData = {
    labels: monthNames,
    datasets: [
      { label: 'Revenue', data: monthlyRev.map(m => m.total), backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 6 },
      { label: 'Expenses', data: monthlyExp.map(m => m.total), backgroundColor: 'rgba(239,68,68,0.5)', borderRadius: 6 },
    ],
  };
  const barOpts = { responsive: true, plugins: { legend: { position: 'top' } }, scales: { y: { beginAtZero: true, ticks: { callback: v => '₹' + v.toLocaleString() } } } };




  //show the piechart data 
  const statusColors = { Pending: '#f59e0b', 'In Progress': '#3b82f6', Completed: '#10b981', Delivered: '#8b5cf6' };
  const doughnutData = {
    labels: orderStatus.map(o => o.status),
    datasets: [{ data: orderStatus.map(o => parseInt(o.count)), backgroundColor: orderStatus.map(o => statusColors[o.status] || '#94a3b8'), borderWidth: 0 }],
  };

  return (
    <div className="space-y-6 lg:space-y-8 pt-8 lg:pt-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary-600 to-accent-600 p-6 rounded-2xl shadow-lg shadow-primary-600/20 text-white mb-2">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 p-2 rounded-xl backdrop-blur-sm shrink-0 drop-shadow-md border border-white/30 hidden sm:block">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight drop-shadow-sm mb-1 text-white">EmbroidHub</h1>
            <p className="text-primary-100 text-sm font-medium opacity-90">Enterprise Management Dashboard</p>
          </div>
        </div>
        <div className="text-left md:text-right">
          <p className="text-primary-100 text-sm mb-1 opacity-90">Welcome back,</p>
          <p className="font-bold text-lg">{user?.username} <span className="bg-white/20 text-xs px-2 py-1 rounded-md ml-2 backdrop-blur-sm border border-white/20 shadow-sm">{user?.role}</span></p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard title="Total Orders" value={stats?.totalOrders || 0} icon={HiOutlineClipboardList} color="blue" />
        {isAdmin && <StatCard title="Total Revenue" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon={HiOutlineCurrencyRupee} color="green" />}
        <StatCard title="Pending Orders" value={stats?.pendingOrders || 0} icon={HiOutlineClock} color="orange" />
        <StatCard title="Customers" value={stats?.totalCustomers || 0} icon={HiOutlineUsers} color="purple" />
        <StatCard title="Employees" value={stats?.totalEmployees || 0} icon={HiOutlineUserGroup} color="cyan" />
      </div>

      {/* Charts Row */}
      <div className={`grid grid-cols-1 ${isAdmin ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-6`}>
        {/* Bar Chart */}
        {isAdmin && (
          <div className="lg:col-span-2 bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-white">Revenue vs Expenses</h3>
              <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} className="px-3 py-1.5 rounded-lg border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 cursor-pointer">
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
            <Bar data={barData} options={barOpts} />
          </div>
        )}
        {/* Doughnut */}
        <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-700 mx-auto w-full lg:max-w-md">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Order Status</h3>
          <Doughnut data={doughnutData} options={{ cutout: '65%', plugins: { legend: { position: 'bottom' } } }} />
        </div>
      </div>

      {/* Top Designs */}
      <div className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-700">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">Top Selling Designs</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-surface-200 dark:border-surface-700">
              <th className="text-left py-3 px-4 text-surface-500 font-medium">#</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Design</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Rate</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Qty Sold</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Revenue</th>
              <th className="text-left py-3 px-4 text-surface-500 font-medium">Orders</th>
            </tr></thead>
            <tbody>
              {topDesigns.map((d, i) => (
                <tr key={d.designid} className="border-b border-surface-100 dark:border-surface-700/50 hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors">
                  <td className="py-3 px-4 text-surface-900 dark:text-white font-semibold">{i + 1}</td>
                  <td className="py-3 px-4 text-surface-900 dark:text-white font-medium">{d.designname}</td>
                  <td className="py-3 px-4 text-surface-600 dark:text-surface-300">₹{parseFloat(d.designrate).toFixed(2)}</td>
                  <td className="py-3 px-4"><span className="px-2.5 py-1 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 text-xs font-medium">{d.total_quantity}</span></td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">₹{parseFloat(d.total_revenue).toLocaleString()}</td>
                  <td className="py-3 px-4 text-surface-600 dark:text-surface-300">{d.order_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
