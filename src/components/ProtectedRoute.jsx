import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ROLES, isRouteAllowedForProfile } from '../utils/permissions';

export default function ProtectedRoute({ children, allowedRoles, requiredPermission }) {
  const { userProfile, role, hasPermission } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Account Disabled Check
  if (userProfile?.status === 'INACTIVE') {
    return (
      <div style={{
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: '#18181B',
          border: '1px solid #EF4444',
          borderRadius: '8px',
          padding: '40px',
          maxWidth: '480px',
          textAlign: 'center'
        }}>
          <ShieldAlert size={48} color="#EF4444" style={{ marginBottom: '16px' }} />
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
            Account Deactivated
          </h2>
          <p style={{ color: '#A1A1AA', fontSize: '0.88rem', marginBottom: '24px' }}>
            Your staff account has been deactivated by the System Owner. Please contact your administrator to restore access.
          </p>
          <button 
            onClick={() => navigate('/dashboard')}
            style={{
              backgroundColor: '#27272A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Role & Permission Authorization Check (OWNER has universal access)
  const isOwner = (role || ROLES.OWNER) === ROLES.OWNER;
  let isAuthorized = true;

  if (!isOwner) {
    if (allowedRoles && allowedRoles.length > 0) {
      isAuthorized = allowedRoles.includes(role);
    }
    if (requiredPermission) {
      isAuthorized = hasPermission(requiredPermission);
    }
    if (userProfile) {
      isAuthorized = isAuthorized && isRouteAllowedForProfile(userProfile, location.pathname);
    }
  }

  // Unauthorized -> Render 403 Access Denied View
  if (!isAuthorized) {
    return (
      <div style={{
        minHeight: '75vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div style={{
          backgroundColor: '#18181B',
          border: '1px solid #27272A',
          borderRadius: '8px',
          padding: '40px',
          maxWidth: '520px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px auto'
          }}>
            <ShieldAlert size={28} color="#EF4444" />
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#EF4444', letterSpacing: '1px', textTransform: 'uppercase' }}>
            403 ACCESS DENIED
          </span>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#FFFFFF', marginTop: '6px', marginBottom: '12px' }}>
            Restricted Module
          </h2>
          <p style={{ color: '#A1A1AA', fontSize: '0.88rem', marginBottom: '24px', lineHeight: 1.5 }}>
            Your account does not have authorization to view this operational section. Please request permission from the System Owner.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <button 
              onClick={() => navigate('/dashboard')}
              style={{
                backgroundColor: '#10B981',
                color: '#000000',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ArrowLeft size={16} /> Return to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
