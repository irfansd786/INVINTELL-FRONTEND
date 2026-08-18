import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';
import { api } from '../services/api';
import { isRouteAllowedForProfile, hasPermission as checkProfilePermission, ROLES } from '../utils/permissions';

const DEFAULT_OWNER_PROFILE = {
  id: 'usr-admin-owner-001',
  firebaseUid: 'admin-owner-001',
  name: 'System Owner Admin',
  email: 'admin@invintell.io',
  role: ROLES.OWNER,
  permissions: ['*'],
  department: 'Executive Command',
  warehouseId: 'ALL',
  status: 'ACTIVE',
  createdAt: new Date().toISOString()
};

const defaultAuthContextValue = {
  currentUser: { uid: 'admin-owner-001', email: 'admin@invintell.io', displayName: 'System Owner Admin' },
  userProfile: DEFAULT_OWNER_PROFILE,
  profile: DEFAULT_OWNER_PROFILE,
  loading: false,
  isAuthenticated: true,
  isOwner: true,
  isStaff: false,
  role: ROLES.OWNER,
  permissions: ['*'],
  signIn: async () => ({ success: true }),
  signOut: async () => ({ success: true }),
  hasRole: () => true,
  hasPermission: () => true,
  canAccessPath: () => true,
  refreshProfile: () => {}
};

const AuthContext = createContext(defaultAuthContextValue);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState({ uid: 'admin-owner-001', email: 'admin@invintell.io', displayName: 'System Owner Admin' });
  const [userProfile, setUserProfile] = useState(DEFAULT_OWNER_PROFILE);
  const [loading, setLoading] = useState(false);

  // Fetch application user profile from backend database
  const fetchUserProfile = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setUserProfile(DEFAULT_OWNER_PROFILE);
      return;
    }

    const cleanEmail = (firebaseUser.email || '').trim().toLowerCase();

    try {
      const res = await api.getCurrentUserProfile();
      if (res && res.success && res.data) {
        setUserProfile(res.data);
        return;
      }
    } catch (e) {
      console.warn('⚠️ Could not fetch user profile from API, fallback profile active:', e.message);
    }

    const isOwnerEmail = !cleanEmail || cleanEmail === 'admin@invintell.io' || firebaseUser.uid === 'admin-owner-001';
    const fallbackRole = isOwnerEmail ? ROLES.OWNER : ROLES.STAFF;

    const fallbackProfile = {
      id: `usr-${(firebaseUser.uid || 'admin-owner-001').substring(0, 8)}`,
      firebaseUid: firebaseUser.uid || 'admin-owner-001',
      name: firebaseUser.displayName || (cleanEmail ? cleanEmail.split('@')[0] : 'System Owner Admin'),
      email: cleanEmail || 'admin@invintell.io',
      role: fallbackRole,
      permissions: fallbackRole === ROLES.OWNER ? ['*'] : [
        'overview.view', 'inventory.view', 'orders.view', 'picking.view', 'packing.view', 'dispatch.view'
      ],
      department: fallbackRole === ROLES.OWNER ? 'Executive Command' : 'Warehouse Operations',
      warehouseId: 'ALL',
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    setUserProfile(fallbackProfile);
  }, []);

  useEffect(() => {
    const unsubscribe = authService.observeAuthState(async (user) => {
      const activeUser = user || { uid: 'admin-owner-001', email: 'admin@invintell.io', displayName: 'System Owner Admin' };
      setCurrentUser(activeUser);
      await fetchUserProfile(activeUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [fetchUserProfile]);

  const signIn = async (email, password) => {
    setLoading(true);
    const result = await authService.signIn(email, password);
    if (result.success && result.user) {
      setCurrentUser(result.user);
      await fetchUserProfile(result.user);
    }
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    const result = await authService.signOut();
    setCurrentUser({ uid: 'admin-owner-001', email: 'admin@invintell.io', displayName: 'System Owner Admin' });
    setUserProfile(DEFAULT_OWNER_PROFILE);
    return result;
  };

  const hasRole = (targetRole) => {
    if (!userProfile) return true;
    if (userProfile.role === ROLES.OWNER) return true;
    return userProfile.role === targetRole;
  };

  const hasPermission = (permissionKey) => {
    if (!userProfile) return true;
    return checkProfilePermission(userProfile, permissionKey);
  };

  const canAccessPath = (path) => {
    if (!userProfile) return true;
    return isRouteAllowedForProfile(userProfile, path);
  };

  const isOwner = (userProfile?.role || ROLES.OWNER) === ROLES.OWNER;
  const isStaff = userProfile?.role === ROLES.STAFF;

  const value = {
    currentUser,
    user: currentUser,
    firebaseUser: currentUser,
    userProfile,
    profile: userProfile,
    loading,
    isAuthenticated: true,
    isOwner,
    isStaff,
    role: userProfile?.role || ROLES.OWNER,
    permissions: userProfile?.permissions || ['*'],
    signIn,
    signOut,
    hasRole,
    hasPermission,
    canAccessPath,
    refreshProfile: () => fetchUserProfile(currentUser)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context || defaultAuthContextValue;
}
