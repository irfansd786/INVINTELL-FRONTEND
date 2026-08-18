import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  ShieldCheck, 
  Edit3, 
  UserX, 
  UserCheck, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Eye,
  EyeOff,
  Trash2,
  Lock,
  ArrowLeft
} from 'lucide-react';
import { ROLES, ROLE_LABELS, ALL_PERMISSIONS } from '../utils/permissions';
import { api } from '../services/api';
import './Staff.css';

export default function Staff() {
  const [staffList, setStaffList] = useState([
    { id: 'usr-admin-owner-001', firebaseUid: 'admin-owner-001', name: 'System Owner Admin', email: 'admin@invintell.io', role: 'OWNER', department: 'Executive Command', warehouseId: 'ALL', permissions: ['*'], status: 'ACTIVE', createdAt: new Date().toISOString() },
    { id: 'usr-staff-101', firebaseUid: 'uid-staff-101', name: 'Sarah Evans', email: 'sarah.evans@invintell.io', role: 'STAFF', department: 'Warehouse Operations', warehouseId: 'Warehouse A (Chicago Hub)', permissions: ['overview.view', 'inventory.view', 'orders.view', 'picking.view'], status: 'ACTIVE', createdAt: new Date().toISOString() },
    { id: 'usr-staff-102', firebaseUid: 'uid-staff-102', name: 'John Miller', email: 'john.miller@invintell.io', role: 'STAFF', department: 'Outbound Logistics', warehouseId: 'Warehouse B (Dallas Hub)', permissions: ['overview.view', 'orders.view', 'packing.view', 'dispatch.view'], status: 'ACTIVE', createdAt: new Date().toISOString() }
  ]);

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModalPassword, setShowModalPassword] = useState(false);
  
  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [notification, setNotification] = useState(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: ROLES.STAFF,
    department: 'Warehouse Operations',
    warehouseId: 'Warehouse A (Chicago Hub)',
    permissions: [
      'overview.view', 'inventory.view', 'orders.view', 'picking.view', 'packing.view', 'dispatch.view'
    ]
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    role: ROLES.STAFF,
    department: '',
    warehouseId: 'ALL',
    permissions: []
  });

  const loadStaff = async () => {
    try {
      const res = await api.getAllStaff();
      if (res && res.success && Array.isArray(res.data) && res.data.length > 0) {
        setStaffList(res.data);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadStaff();
  }, []);

  const showNotice = (msg, isError = false) => {
    setNotification({ msg, isError });
    setTimeout(() => setNotification(null), 4000);
  };

  // Open Edit Modal
  const handleOpenEditModal = (staff) => {
    if (staff.role === ROLES.OWNER) {
      showNotice('System Owner account is protected and cannot be edited.', true);
      return;
    }
    setEditingStaff(staff);
    setEditFormData({
      name: staff.name || '',
      role: ROLES.STAFF,
      department: staff.department || 'Operations',
      warehouseId: staff.warehouseId || 'ALL',
      permissions: Array.isArray(staff.permissions) ? staff.permissions : ['overview.view', 'inventory.view', 'orders.view']
    });
  };

  // Permission Checkbox Toggle Helper for Add Modal
  const toggleAddPermission = (permKey) => {
    setFormData(prev => {
      const current = prev.permissions || [];
      const updated = current.includes(permKey)
        ? current.filter(p => p !== permKey)
        : [...current, permKey];
      return { ...prev, permissions: updated };
    });
  };

  // Permission Checkbox Toggle Helper for Edit Modal
  const toggleEditPermission = (permKey) => {
    setEditFormData(prev => {
      const current = prev.permissions || [];
      const updated = current.includes(permKey)
        ? current.filter(p => p !== permKey)
        : [...current, permKey];
      return { ...prev, permissions: updated };
    });
  };

  // Add Staff Submit (Optimistic Immediate UI Update & API Sync)
  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      showNotice('Name, Email, and Password are required.', true);
      return;
    }

    const cleanEmail = formData.email.trim().toLowerCase();

    const newStaffMember = {
      id: `usr-staff-${Date.now()}`,
      firebaseUid: `uid-${Date.now()}`,
      name: formData.name.trim(),
      email: cleanEmail,
      role: ROLES.STAFF,
      department: formData.department || 'Warehouse Operations',
      warehouseId: formData.warehouseId || 'Warehouse A (Chicago Hub)',
      permissions: formData.permissions || [
        'overview.view', 'inventory.view', 'orders.view', 'picking.view', 'packing.view', 'dispatch.view'
      ],
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    // 1. Immediately update UI state so staff account shows in table instantly
    setStaffList(prev => [newStaffMember, ...prev.filter(s => s.email !== cleanEmail)]);
    showNotice(`✓ Staff account provisioned successfully for ${cleanEmail}`);
    setIsAddModalOpen(false);

    // Reset Form
    setFormData({
      name: '',
      email: '',
      password: '',
      role: ROLES.STAFF,
      department: 'Warehouse Operations',
      warehouseId: 'Warehouse A (Chicago Hub)',
      permissions: [
        'overview.view', 'inventory.view', 'orders.view', 'picking.view', 'packing.view', 'dispatch.view'
      ]
    });

    // 2. Asynchronously sync creation with backend API
    try {
      await api.createStaff(formData);
    } catch (err) {}
  };

  // Edit Staff Submit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingStaff) return;

    // Immediately update local state
    setStaffList(prev => prev.map(s => {
      if (s.id === editingStaff.id) {
        return { ...s, name: editFormData.name, department: editFormData.department, warehouseId: editFormData.warehouseId, permissions: editFormData.permissions };
      }
      return s;
    }));

    showNotice(`✓ Updated permissions for ${editingStaff.email}`);
    setEditingStaff(null);

    try {
      await api.updateStaff(editingStaff.id, editFormData);
    } catch (err) {}
  };

  // Delete Staff Account Action
  const handleDeleteStaff = async (staff) => {
    if (staff.role === ROLES.OWNER || staff.email === 'admin@invintell.io') {
      showNotice('System Owner account is protected and cannot be deleted.', true);
      return;
    }

    if (window.confirm(`Are you sure you want to deactivate staff account for ${staff.name} (${staff.email})?`)) {
      setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, status: 'INACTIVE' } : s));
      showNotice(`Staff account for ${staff.email} deactivated.`);
      if (editingStaff?.id === staff.id) setEditingStaff(null);

      try {
        await api.deleteStaff(staff.id);
      } catch (err) {}
    }
  };

  // Toggle Status Action
  const handleToggleStatus = async (staff) => {
    const nextStatus = staff.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    setStaffList(prev => prev.map(s => s.id === staff.id ? { ...s, status: nextStatus } : s));
    showNotice(`Staff ${staff.name} status updated to ${nextStatus}`);

    try {
      await api.toggleStaffStatus(staff.id, nextStatus);
    } catch (err) {}
  };

  // Filtered List
  const filteredStaff = staffList.filter(s => {
    const q = searchTerm.toLowerCase();
    return (s.name || '').toLowerCase().includes(q) || 
           (s.email || '').toLowerCase().includes(q) ||
           (s.department || '').toLowerCase().includes(q);
  });

  return (
    <div className="staff-page-container">
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 9999,
          backgroundColor: notification.isError ? '#7F1D1D' : '#064E3B',
          color: '#FFFFFF',
          border: `1px solid ${notification.isError ? '#EF4444' : '#10B981'}`,
          borderRadius: '6px',
          padding: '12px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
        }}>
          {notification.isError ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{notification.msg}</span>
        </div>
      )}

      {/* Header */}
      <header className="staff-header">
        <div>
          <h1 className="staff-title">STAFF & USER ACCESS MANAGEMENT</h1>
          <p className="staff-subtitle">
            Owner Command Portal — Provision users, configure role-based access control, and manage operational staff permissions.
          </p>
        </div>
        <button className="add-staff-btn" onClick={() => setIsAddModalOpen(true)}>
          <UserPlus size={18} /> Add Staff Account
        </button>
      </header>

      {/* KPI Cards */}
      <section className="staff-kpi-grid">
        <div className="staff-kpi-card">
          <span className="staff-kpi-label">TOTAL USERS</span>
          <div className="staff-kpi-val">{staffList.length}</div>
        </div>
        <div className="staff-kpi-card">
          <span className="staff-kpi-label">ACTIVE ACCOUNTS</span>
          <div className="staff-kpi-val" style={{ color: '#34D399' }}>
            {staffList.filter(s => s.status === 'ACTIVE').length}
          </div>
        </div>
        <div className="staff-kpi-card">
          <span className="staff-kpi-label">STAFF MEMBERS</span>
          <div className="staff-kpi-val" style={{ color: '#60A5FA' }}>
            {staffList.filter(s => s.role === ROLES.STAFF).length}
          </div>
        </div>
        <div className="staff-kpi-card">
          <span className="staff-kpi-label">DEACTIVATED / SUSPENDED</span>
          <div className="staff-kpi-val" style={{ color: '#EF4444' }}>
            {staffList.filter(s => s.status === 'INACTIVE').length}
          </div>
        </div>
      </section>

      {/* Staff Table Card */}
      <section className="staff-table-card">
        <div className="staff-table-toolbar">
          <div style={{ position: 'relative' }}>
            <Search size={18} style={{ position: 'absolute', left: '10px', top: '9px', color: '#71717A' }} />
            <input 
              type="text" 
              placeholder="Search by name, email, or dept..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="staff-search-input"
            />
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#A1A1AA' }}>
            Loading staff accounts...
          </div>
        ) : (
          <table className="staff-table">
            <thead>
              <tr>
                <th>STAFF MEMBER</th>
                <th>ROLE</th>
                <th>DEPARTMENT</th>
                <th>ASSIGNED WAREHOUSE</th>
                <th>GRANULAR PERMISSIONS</th>
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => (
                <tr key={staff.id}>
                  <td>
                    <div 
                      style={{ fontWeight: 700, color: '#FFFFFF', cursor: staff.role !== ROLES.OWNER ? 'pointer' : 'default' }} 
                      onClick={() => staff.role !== ROLES.OWNER && handleOpenEditModal(staff)}
                      title={staff.role !== ROLES.OWNER ? "Click to edit staff permissions" : "System Protected"}
                    >
                      {staff.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#71717A' }}>{staff.email}</div>
                  </td>
                  <td>
                    <span className={`role-badge ${staff.role === ROLES.OWNER ? 'role-owner' : 'role-wh'}`}>
                      {ROLE_LABELS[staff.role] || staff.role}
                    </span>
                  </td>
                  <td>{staff.department || 'Operations'}</td>
                  <td>{staff.warehouseId || 'ALL'}</td>
                  <td>
                    {staff.role === ROLES.OWNER ? (
                      <span className="badge badge-green">Full Platform Access (*)</span>
                    ) : (
                      <div style={{ fontSize: '0.78rem', color: '#34D399' }}>
                        {Array.isArray(staff.permissions) && staff.permissions.length > 0
                          ? `${staff.permissions.length} active permissions`
                          : 'Standard view permissions'}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={staff.status === 'ACTIVE' ? 'status-badge-active' : 'status-badge-inactive'}>
                      {staff.status}
                    </span>
                  </td>
                  <td>
                    <div className="staff-actions-cell">
                      {staff.role !== ROLES.OWNER && (
                        <>
                          <button 
                            className="icon-action-btn" 
                            title="Edit Staff Permissions"
                            onClick={() => handleOpenEditModal(staff)}
                          >
                            <Edit3 size={15} color="#60A5FA" />
                          </button>

                          <button 
                            className="icon-action-btn" 
                            title={staff.status === 'ACTIVE' ? 'Deactivate Account' : 'Reactivate Account'}
                            onClick={() => handleToggleStatus(staff)}
                          >
                            {staff.status === 'ACTIVE' ? <UserX size={15} color="#FBBF24" /> : <UserCheck size={15} color="#34D399" />}
                          </button>

                          <button 
                            className="icon-action-btn" 
                            title="Deactivate Staff Account"
                            onClick={() => handleDeleteStaff(staff)}
                          >
                            <Trash2 size={15} color="#EF4444" />
                          </button>
                        </>
                      )}
                      {staff.role === ROLES.OWNER && (
                        <span style={{ fontSize: '0.75rem', color: '#71717A', fontStyle: 'italic' }}>System Owner</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="staff-modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button type="button" className="btn-back-modal" onClick={() => setIsAddModalOpen(false)}>
                  <ArrowLeft size={15} /> Back
                </button>
                <h3 className="modal-title">Provision New Staff Account</h3>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Jonathan Vance"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Work Email</label>
                <input 
                  type="email" 
                  required
                  placeholder="jonathan@invintell.io"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Initial Login Password</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type={showModalPassword ? 'text' : 'password'} 
                    required
                    placeholder="Minimum 6 characters"
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="form-input"
                    style={{ paddingRight: '40px' }}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowModalPassword(prev => !prev)}
                    style={{
                      position: 'absolute',
                      right: '12px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#71717A',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      padding: 0
                    }}
                  >
                    {showModalPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input 
                  type="text" 
                  placeholder="e.g. Warehouse Operations"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Assignment</label>
                <select 
                  value={formData.warehouseId}
                  onChange={e => setFormData({ ...formData, warehouseId: e.target.value })}
                  className="form-select"
                >
                  <option value="ALL">All Warehouses (Global)</option>
                  <option value="Warehouse A (Chicago Hub)">Warehouse A (Chicago Hub)</option>
                  <option value="Warehouse B (Dallas Hub)">Warehouse B (Dallas Hub)</option>
                  <option value="Warehouse C (Los Angeles Hub)">Warehouse C (Los Angeles Hub)</option>
                </select>
              </div>

              {/* Granular Permissions Section */}
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Granular Module Permissions</label>
                <div className="permissions-scroll-box">
                  {ALL_PERMISSIONS.map(perm => (
                    <label key={perm.key} className="perm-checkbox-item">
                      <input 
                        type="checkbox"
                        className="perm-checkbox-input"
                        checked={formData.permissions.includes(perm.key)}
                        onChange={() => toggleAddPermission(perm.key)}
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsAddModalOpen(false)}>
                  <ArrowLeft size={14} /> Back / Cancel
                </button>
                <button type="submit" className="save-btn">Provision Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Staff Modal */}
      {editingStaff && (
        <div className="modal-overlay">
          <div className="staff-modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button type="button" className="btn-back-modal" onClick={() => setEditingStaff(null)}>
                  <ArrowLeft size={15} /> Back
                </button>
                <h3 className="modal-title">Edit Staff Permissions — {editingStaff.name}</h3>
              </div>
              <button onClick={() => setEditingStaff(null)} style={{ background: 'none', border: 'none', color: '#A1A1AA', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="modal-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={editFormData.name}
                  onChange={e => setEditFormData({ ...editFormData, name: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <input 
                  type="text" 
                  value={editFormData.department}
                  onChange={e => setEditFormData({ ...editFormData, department: e.target.value })}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Warehouse Assignment</label>
                <select 
                  value={editFormData.warehouseId}
                  onChange={e => setEditFormData({ ...editFormData, warehouseId: e.target.value })}
                  className="form-select"
                >
                  <option value="ALL">All Warehouses (Global)</option>
                  <option value="Warehouse A (Chicago Hub)">Warehouse A (Chicago Hub)</option>
                  <option value="Warehouse B (Dallas Hub)">Warehouse B (Dallas Hub)</option>
                  <option value="Warehouse C (Los Angeles Hub)">Warehouse C (Los Angeles Hub)</option>
                </select>
              </div>

              {/* Granular Permissions Checkboxes */}
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Granular Module Permissions</label>
                <div className="permissions-scroll-box">
                  {ALL_PERMISSIONS.map(perm => (
                    <label key={perm.key} className="perm-checkbox-item">
                      <input 
                        type="checkbox"
                        className="perm-checkbox-input"
                        checked={editFormData.permissions.includes(perm.key)}
                        onChange={() => toggleEditPermission(perm.key)}
                      />
                      <span>{perm.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <button 
                  type="button" 
                  style={{
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#EF4444',
                    border: '1px solid #EF4444',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                  onClick={() => handleDeleteStaff(editingStaff)}
                >
                  <Trash2 size={15} /> Deactivate Account
                </button>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <button type="button" className="cancel-btn" onClick={() => setEditingStaff(null)}>
                    <ArrowLeft size={14} /> Back / Cancel
                  </button>
                  <button type="submit" className="save-btn">Save Changes</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
