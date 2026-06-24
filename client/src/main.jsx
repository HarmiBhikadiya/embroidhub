import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import './index.css'

import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Orders from './pages/Orders'
import Designs from './pages/Designs'
import Production from './pages/Production'
import Employees from './pages/Employees'
import Machines from './pages/Machines'
import Payments from './pages/Payments'
import Suppliers from './pages/Suppliers'
import Materials from './pages/Materials'
import Invoices from './pages/Invoices'
import Expenses from './pages/Expenses'

const ProtectedRoute = ({ children, requireRole }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (requireRole && user.role !== requireRole && user.role !== 'Admin') return <Navigate to="/" replace />;
  return children;
};

// Handle initial navigation redirect if no token exists
const InitialRedirect = () => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to="/dashboard" replace />;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Toaster position="top-right" toastOptions={{
            style: {
              background: '#1e293b',
              color: '#fff',
              borderRadius: '12px',
            },
          }} />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="customers" element={<Customers />} />
              <Route path="orders" element={<Orders />} />
              <Route path="designs" element={<Designs />} />
              <Route path="production" element={<Production />} />
              <Route path="suppliers" element={<Suppliers />} />
              <Route path="inventory" element={<Materials />} />
              
              {/* Critical Information restricted to Admin */}
              <Route path="employees" element={<ProtectedRoute requireRole="Admin"><Employees /></ProtectedRoute>} />
              <Route path="machines" element={<ProtectedRoute requireRole="Admin"><Machines /></ProtectedRoute>} />
              <Route path="payments" element={<ProtectedRoute requireRole="Admin"><Payments /></ProtectedRoute>} />
              <Route path="invoices" element={<ProtectedRoute requireRole="Admin"><Invoices /></ProtectedRoute>} />
              <Route path="expenses" element={<ProtectedRoute requireRole="Admin"><Expenses /></ProtectedRoute>} />
              
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
