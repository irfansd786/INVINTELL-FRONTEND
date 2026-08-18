import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Building2, User, Menu, Sun, Moon, LogOut, ChevronDown, CheckCircle2 } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/permissions';
import NotificationDropdown from './NotificationDropdown';
import GlobalSearchModal from './GlobalSearchModal';
import './Navbar.css';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    selectedWarehouseFilter, 
    setSelectedWarehouseFilter, 
    sidebarOpen, 
    toggleSidebar,
    theme,
    toggleTheme
  } = useStore();

  const { currentUser, userProfile, signOut } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => getISTFormattedTime());

  const profileRef = useRef(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(getISTFormattedTime());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut listener for Global Search (Ctrl+K, Cmd+K, /)
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      } else if (e.key === '/' && document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
        e.preventDefault();
        setSearchOpen(true);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close profile dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function getISTFormattedTime() {
    const now = new Date();
    const options = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata'
    };
    return new Intl.DateTimeFormat('en-GB', options).format(now).toUpperCase();
  }

  const getPageTitle = (path) => {
    switch (path) {
      case '/': return 'OVERVIEW';
      case '/dashboard': return 'OVERVIEW';
      case '/today': return 'TODAY\'S ACTIVITY';
      case '/future': return 'FUTURE DEMAND';
      case '/risks': return 'RISK INTELLIGENCE';
      case '/report': return 'EXECUTIVE REPORT';
      case '/orders': return 'ORDERS FULFILLMENT';
      case '/inventory': return 'MASTER INVENTORY';
      case '/allocation': return 'INVENTORY ALLOCATION';
      case '/picking': return 'PICKING QUEUE';
      case '/packing': return 'PACKING QUEUE';
      case '/dispatch': return 'OUTBOUND DISPATCH';
      case '/exceptions': return 'OPERATIONAL EXCEPTIONS';
      case '/warehouses': return 'WAREHOUSE NETWORK';
      case '/analytics': return 'OPERATIONAL ANALYTICS';
      case '/products': return 'PRODUCT CATALOG';
      case '/suppliers': return 'SUPPLIER DIRECTORY';
      case '/actions': return 'MANAGEMENT ACTIONS';
      case '/transfers': return 'STOCK TRANSFERS';
      case '/alerts': return 'ALERTS CENTER';
      case '/scenarios': return 'SCENARIO SIMULATION';
      case '/activity': return 'AUDIT LEDGER';
      case '/settings': return 'PLATFORM SETTINGS';
      case '/staff': return 'STAFF MANAGEMENT';
      default: return 'INVINTELL PLATFORM';
    }
  };

  const handleWarehouseSelect = (val) => {
    setSelectedWarehouseFilter(val);
    if (val !== 'ALL' && location.pathname !== '/inventory') {
      navigate('/inventory');
    }
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    await signOut();
    navigate('/');
  };

  const userName = userProfile?.name || currentUser?.displayName || 'System Owner Admin';
  const userEmail = userProfile?.email || currentUser?.email || 'admin@invintell.io';
  const userRoleKey = userProfile?.role || 'OWNER';
  const userRoleLabel = ROLE_LABELS[userRoleKey] || userRoleKey;
  const userDept = userProfile?.department || 'Executive Command';
  const userWh = userProfile?.warehouseId || 'ALL WAREHOUSES';

  return (
    <>
      <header className="top-navbar">
        <div className="top-navbar-container">
          {/* Left Context Title with Menu Toggle */}
          <div className="nav-context-col">
            {!sidebarOpen && (
              <button 
                className="menu-toggle-btn"
                onClick={toggleSidebar}
                title="Open navigation menu"
                aria-label="Open navigation menu"
              >
                <Menu size={18} />
              </button>
            )}
            <span className="nav-breadcrumb">INVINTELL / {getPageTitle(location.pathname)}</span>
          </div>

          {/* Right Top Bar Controls */}
          <div className="top-nav-right">
            {/* Search Trigger */}
            <button 
              className="top-search-btn"
              onClick={() => setSearchOpen(true)}
              aria-label="Global search"
            >
              <span>Search inventory, orders, SKUs...</span>
              <kbd className="kbd-shortcut">/</kbd>
            </button>

            {/* Theme Toggle Button */}
            <button 
              className="theme-toggle-btn" 
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              aria-label="Toggle theme"
            >
              {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
            </button>

            {/* Warehouse Selector Dropdown - 3 Warehouses Only */}
            <div className="wh-select-wrapper">
              <Building2 size={14} className="wh-icon" aria-hidden="true" />
              <select 
                value={selectedWarehouseFilter}
                onChange={(e) => handleWarehouseSelect(e.target.value)}
                className="top-wh-select"
                aria-label="Filter inventory by warehouse"
              >
                <option value="ALL">ALL WAREHOUSES (3)</option>
                <option value="wh-chi-01">Warehouse A (Chicago)</option>
                <option value="wh-dal-02">Warehouse B (Dallas)</option>
                <option value="wh-la-03">Warehouse C (Los Angeles)</option>
              </select>
            </div>

            {/* Notifications Dropdown */}
            <NotificationDropdown />

            {/* Live Indicator */}
            <div className="top-status-pill" aria-label="System status live">
              <span className="pulse-dot" aria-hidden="true"></span>
              <span className="live-text">LIVE</span>
              <span className="live-time">{currentTime}</span>
            </div>

            {/* User Profile Pill & Dropdown */}
            <div className="user-profile-wrapper" ref={profileRef} style={{ position: 'relative' }}>
              <button 
                type="button"
                className="user-profile-pill"
                onClick={() => setProfileOpen(prev => !prev)}
                aria-expanded={profileOpen}
                aria-haspopup="true"
                aria-label="Toggle user profile menu"
                style={{ cursor: 'pointer', userSelect: 'none', background: 'none', border: 'none' }}
                title="View Profile Details"
              >
                <div className="user-avatar" aria-hidden="true">
                  <User size={14} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left', lineHeight: '1.2' }}>
                  <span className="user-name">{userName}</span>
                  <span style={{ fontSize: '0.65rem', color: '#10B981', fontWeight: 700 }}>{userRoleKey}</span>
                </div>
                <ChevronDown size={14} style={{ color: '#71717A', transition: 'transform 0.2s', transform: profileOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} aria-hidden="true" />
              </button>

              {/* Profile Dropdown Menu */}
              {profileOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  width: '280px',
                  backgroundColor: '#18181B',
                  border: '1px solid #27272A',
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.6)',
                  padding: '16px',
                  zIndex: 999,
                  textAlign: 'left'
                }}>
                  {/* User Profile Info Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #27272A' }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      color: '#000000',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem'
                    }}>
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ overflow: 'hidden' }}>
                      <div style={{ fontWeight: 800, color: '#FFFFFF', fontSize: '0.92rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {userName}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: '#A1A1AA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {userEmail}
                      </div>
                    </div>
                  </div>

                  {/* Profile Details List */}
                  <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px solid #27272A' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <span style={{ color: '#71717A', fontWeight: 600 }}>Assigned Role:</span>
                      <span style={{ color: '#34D399', fontWeight: 700 }}>{userRoleLabel}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <span style={{ color: '#71717A', fontWeight: 600 }}>Department:</span>
                      <span style={{ color: '#E4E4E7' }}>{userDept}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <span style={{ color: '#71717A', fontWeight: 600 }}>Warehouse:</span>
                      <span style={{ color: '#E4E4E7' }}>{userWh}</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem' }}>
                      <span style={{ color: '#71717A', fontWeight: 600 }}>Status:</span>
                      <span style={{ color: '#34D399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckCircle2 size={12} /> ACTIVE
                      </span>
                    </div>
                  </div>

                  {/* Return to Home Button */}
                  <button 
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      marginTop: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      color: '#E4E4E7',
                      border: '1px solid #27272A',
                      borderRadius: '6px',
                      padding: '10px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <LogOut size={16} /> Exit to Landing Page
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal 
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </>
  );
}
