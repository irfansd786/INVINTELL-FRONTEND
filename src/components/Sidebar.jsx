import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Box, 
  Menu,
  LayoutDashboard, 
  Calendar, 
  TrendingUp, 
  AlertTriangle, 
  FileText, 
  ShoppingBag, 
  Layers, 
  Navigation, 
  PackageCheck, 
  Truck, 
  ShieldAlert, 
  Building2, 
  Activity, 
  Users, 
  UserCheck,
  Settings,
  DollarSign
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

export default function Sidebar() {
  const store = useStore();
  const { sidebarOpen, toggleSidebar, closeSidebar } = store;
  const { role, canAccessPath } = useAuth();

  const openExceptionsCount = store?.exceptions?.filter(e => e.status === 'OPEN').length || 0;
  const unallocatedOrdersCount = store?.orders?.filter(o => o.status === 'PENDING').length || 0;

  const rawCommandItems = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Today', path: '/today', icon: Calendar },
    { label: 'Future', path: '/future', icon: TrendingUp },
    { label: 'Risks', path: '/risks', icon: AlertTriangle },
    { label: 'Finance', path: '/finance', icon: DollarSign, badge: 'NEW' },
    { label: 'Report', path: '/report', icon: FileText }
  ];

  const rawOperationsItems = [
    { label: 'Orders', path: '/orders', icon: ShoppingBag, badge: unallocatedOrdersCount > 0 ? unallocatedOrdersCount : null },
    { label: 'Inventory', path: '/inventory', icon: Box },
    { label: 'Allocation', path: '/allocation', icon: Layers },
    { label: 'Picking', path: '/picking', icon: Navigation },
    { label: 'Packing', path: '/packing', icon: PackageCheck },
    { label: 'Dispatch', path: '/dispatch', icon: Truck },
    { label: 'Exceptions', path: '/exceptions', icon: ShieldAlert, isRed: openExceptionsCount > 0, badge: openExceptionsCount > 0 ? openExceptionsCount : null }
  ];

  const rawManagementItems = [
    { label: 'Warehouses', path: '/warehouses', icon: Building2 },
    { label: 'Analytics', path: '/analytics', icon: Activity },
    { label: 'Products', path: '/products', icon: Box },
    { label: 'Suppliers', path: '/suppliers', icon: Users }
  ];

  const activeRole = role || 'OWNER';
  const rawSystemItems = [
    // STAFF MENU IS STRICTLY VISIBLE ONLY TO OWNER ROLE
    ...(activeRole === 'OWNER' ? [{ label: 'Staff', path: '/staff', icon: UserCheck, badge: 'OWNER' }] : []),
    { label: 'Settings', path: '/settings', icon: Settings }
  ];

  const commandItems = rawCommandItems.filter(item => canAccessPath(item.path));
  const operationsItems = rawOperationsItems.filter(item => canAccessPath(item.path));
  const managementItems = rawManagementItems.filter(item => canAccessPath(item.path));
  const systemItems = rawSystemItems.filter(item => canAccessPath(item.path));

  return (
    <>
      {/* Backdrop overlay for mobile */}
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={closeSidebar}></div>
      )}

      <aside className={`app-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-left">
            <button 
              className="sidebar-menu-btn"
              onClick={toggleSidebar}
              title="Close navigation menu"
              aria-label="Toggle navigation menu"
            >
              <Menu size={18} />
            </button>
            <div className="sidebar-brand-icon">
              <Box size={20} strokeWidth={2.5} />
            </div>
            <div className="sidebar-brand-text">
              <span className="brand-name">INVINTELL</span>
              <span className="brand-sub">SMART WAREHOUSE PLATFORM</span>
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          {/* COMMAND GROUP */}
          <div className="sidebar-nav-group">
            <span className="nav-group-heading">COMMAND</span>
            {commandItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-badge sb-badge-green">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* OPERATIONS GROUP */}
          <div className="sidebar-nav-group">
            <span className="nav-group-heading">OPERATIONS</span>
            {operationsItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${item.isRed ? 'link-red' : ''}`}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span className={`sidebar-badge ${item.isRed ? 'sb-badge-red' : 'sb-badge-green'}`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* MANAGEMENT GROUP */}
          <div className="sidebar-nav-group">
            <span className="nav-group-heading">MANAGEMENT</span>
            {managementItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {item.badge && (
                    <span className="sidebar-badge sb-badge-green">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>

          {/* SYSTEM GROUP */}
          <div className="sidebar-nav-group">
            <span className="nav-group-heading">SYSTEM</span>
            {systemItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink 
                  key={item.path} 
                  to={item.path} 
                  className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
}
