import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  HiOutlineHome, HiOutlineUsers, HiOutlineClipboardList,
  HiOutlineColorSwatch, HiOutlineCog, HiOutlineCube,
  HiOutlineCreditCard, HiOutlineDocumentText, HiOutlineCash,
  HiOutlineTruck, HiOutlineDatabase, HiOutlineLogout,
  HiOutlineMenu, HiOutlineX, HiOutlineMoon, HiOutlineSun,
  HiOutlineUserGroup, HiOutlineChartBar
} from 'react-icons/hi';

const navItems = [
  { path: '/', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/customers', label: 'Customers', icon: HiOutlineUsers },
  { path: '/orders', label: 'Orders', icon: HiOutlineClipboardList },
  { path: '/designs', label: 'Designs', icon: HiOutlineColorSwatch },
  { path: '/production', label: 'Production', icon: HiOutlineCog },
  { path: '/employees', label: 'Employees', icon: HiOutlineUserGroup, role: 'Admin' },
  { path: '/machines', label: 'Machines', icon: HiOutlineCube, role: 'Admin' },
  { path: '/payments', label: 'Payments', icon: HiOutlineCreditCard, role: 'Admin' },
  { path: '/invoices', label: 'Invoices', icon: HiOutlineDocumentText, role: 'Admin' },
  { path: '/inventory', label: 'Inventory', icon: HiOutlineTruck },
  { path: '/expenses', label: 'Expenses', icon: HiOutlineCash, role: 'Admin' },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();
  const { dark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredItems = navItems.filter(item =>
    !item.role || item.role === user?.role
  );

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
     ${isActive
      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
      : 'text-surface-400 hover:text-white hover:bg-white/5'}`;

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-white/10">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center p-0.5 bg-white/10 shrink-0">
          <img src="/logo.png" alt="EmbroidHub" className="w-full h-full object-contain drop-shadow-[0_0_8px_rgba(139,92,246,0.8)]" />
        </div>
        {!collapsed && (
          <div className="animate-fade-in truncate">
            <h1 className="text-white font-bold text-base tracking-wide leading-tight">EmbroidHub</h1>
          </div>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {filteredItems.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={linkClass}
            onClick={() => setMobileOpen(false)}
            title={collapsed ? item.label : ''}
          >
            <item.icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="animate-fade-in">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom section */}
      {/* toggle the dark mode  */}
      <div className="px-3 py-4 border-t border-white/10 space-y-2">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-surface-400 hover:text-white hover:bg-white/5 w-full transition-all"
        >
          {dark ? <HiOutlineSun className="w-5 h-5" /> : <HiOutlineMoon className="w-5 h-5" />}
          {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>


        {/* User info with roles */}
        {!collapsed && (
          <div className="flex items-center gap-3 px-4 py-2 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user?.username}</p>
              <p className="text-surface-500 text-xs">{user?.role}</p>
            </div>
          </div>
        )}


        {/* logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 w-full transition-all"
        >
          <HiOutlineLogout className="w-5 h-5" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-surface-800 text-white shadow-lg"
      >
        <HiOutlineMenu className="w-5 h-5" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/50" onClick={() => setMobileOpen(false)}>
          <div
            className="w-64 h-full gradient-sidebar animate-slide-in"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-surface-400 hover:text-white"
            >
              <HiOutlineX className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col gradient-sidebar transition-all duration-300 ${
          collapsed ? 'w-[72px]' : 'w-64'
        } shrink-0 h-screen sticky top-0`}
      >
        <SidebarContent />
        <button
          onClick={() => setCollapsed(prev => !prev)}
          className="absolute -right-3 top-8 w-6 h-6 rounded-full bg-surface-700 border border-surface-600 text-surface-400 hover:text-white flex items-center justify-center text-xs transition-all"
        >
          {collapsed ? '›' : '‹'}
        </button>
      </aside>
    </>
  );
}
