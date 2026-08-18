import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

import { StoreProvider, useStore } from './context/StoreContext';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import { ROLES } from './utils/permissions';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Enterprise Landing Page
import LandingPage from './landing/LandingPage';

// Command Pages
import Overview from './pages/Overview';
import Today from './pages/Today';
import Future from './pages/Future';
import Risks from './pages/Risks';
import Report from './pages/Report';

// Operations Pages
import Warehouses from './pages/Warehouses';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';
import Allocation from './pages/Allocation';
import Picking from './pages/Picking';
import Packing from './pages/Packing';
import Dispatch from './pages/Dispatch';
import Exceptions from './pages/Exceptions';

// Intelligence & Network Pages
import Analytics from './pages/Analytics';
import ManagementActions from './pages/ManagementActions';
import Transfers from './pages/Transfers';
import AlertCenter from './pages/AlertCenter';
import ScenarioSimulation from './pages/ScenarioSimulation';
import Suppliers from './pages/Suppliers';
import ActivityLog from './pages/ActivityLog';
import Settings from './pages/Settings';
import Finance from './pages/Finance';
import Staff from './pages/Staff';

import './styles/global.css';

function DashboardRoutes() {
  const location = useLocation();

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Command Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
          <Route path="/today" element={<ProtectedRoute><Today /></ProtectedRoute>} />
          <Route path="/future" element={<ProtectedRoute><Future /></ProtectedRoute>} />
          <Route path="/risks" element={<ProtectedRoute><Risks /></ProtectedRoute>} />
          <Route path="/report" element={<ProtectedRoute><Report /></ProtectedRoute>} />

          {/* Operations Routes */}
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><Inventory /></ProtectedRoute>} />
          <Route path="/allocation" element={<ProtectedRoute><Allocation /></ProtectedRoute>} />
          <Route path="/picking" element={<ProtectedRoute><Picking /></ProtectedRoute>} />
          <Route path="/packing" element={<ProtectedRoute><Packing /></ProtectedRoute>} />
          <Route path="/dispatch" element={<ProtectedRoute><Dispatch /></ProtectedRoute>} />
          <Route path="/exceptions" element={<ProtectedRoute><Exceptions /></ProtectedRoute>} />

          {/* Intelligence Routes */}
          <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
          <Route path="/actions" element={<ProtectedRoute><ManagementActions /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/scenarios" element={<ProtectedRoute><ScenarioSimulation /></ProtectedRoute>} />

          {/* Network Routes */}
          <Route path="/warehouses" element={<ProtectedRoute><Warehouses /></ProtectedRoute>} />
          <Route path="/transfers" element={<ProtectedRoute><Transfers /></ProtectedRoute>} />
          <Route path="/products" element={<ProtectedRoute><Products /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><Suppliers /></ProtectedRoute>} />

          {/* Management Routes */}
          <Route path="/alerts" element={<ProtectedRoute><AlertCenter /></ProtectedRoute>} />
          <Route path="/activity" element={<ProtectedRoute><ActivityLog /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Staff Management (STRICTLY OWNER ONLY) */}
          <Route path="/staff" element={<ProtectedRoute allowedRoles={[ROLES.OWNER]}><Staff /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<ProtectedRoute><Overview /></ProtectedRoute>} />
        </Routes>
      </AnimatePresence>
    </ErrorBoundary>
  );
}

function MainAppShell() {
  const { sidebarOpen } = useStore();
  const location = useLocation();

  const isLandingRoute = location.pathname === '/' || location.pathname === '/landing';

  if (isLandingRoute) {
    return (
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/landing" element={<LandingPage />} />
      </Routes>
    );
  }

  return (
    <div className={`app-layout ${sidebarOpen ? 'sidebar-is-open' : 'sidebar-is-closed'}`}>
      {/* Sliding Dark Left Sidebar */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="main-wrapper">
        <Navbar />
        <main className="main-content">
          <DashboardRoutes />
        </main>
        <Footer />
      </div>
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <MainAppShell />
        </Router>
      </AuthProvider>
    </StoreProvider>
  );
}
