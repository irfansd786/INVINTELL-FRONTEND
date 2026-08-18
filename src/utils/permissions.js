/**
 * INVINTELL Role-Based Access Control (RBAC) & Granular Permissions
 * Roles: OWNER, STAFF
 * NOTE: VIEWER role is strictly omitted per specification.
 */

export const ROLES = {
  OWNER: 'OWNER',
  STAFF: 'STAFF'
};

export const ROLE_LABELS = {
  [ROLES.OWNER]: 'Owner / System Administrator',
  [ROLES.STAFF]: 'Staff Operations Member'
};

// All available granular permissions in system
export const ALL_PERMISSIONS = [
  { key: 'overview.view', label: 'View Overview / Command Center', category: 'Command' },
  { key: 'inventory.view', label: 'View Inventory & Products', category: 'Inventory' },
  { key: 'inventory.edit', label: 'Edit Inventory & Products', category: 'Inventory' },
  { key: 'orders.view', label: 'View Orders', category: 'Orders' },
  { key: 'orders.edit', label: 'Manage & Fulfill Orders', category: 'Orders' },
  { key: 'allocation.view', label: 'View Stock Allocations', category: 'Fulfillment' },
  { key: 'allocation.edit', label: 'Perform Allocations', category: 'Fulfillment' },
  { key: 'picking.view', label: 'View Picking Queue', category: 'Fulfillment' },
  { key: 'picking.edit', label: 'Execute Picking Tasks', category: 'Fulfillment' },
  { key: 'packing.view', label: 'View Packing Queue', category: 'Fulfillment' },
  { key: 'packing.edit', label: 'Execute Packing Tasks', category: 'Fulfillment' },
  { key: 'dispatch.view', label: 'View Dispatch Queue', category: 'Fulfillment' },
  { key: 'dispatch.edit', label: 'Execute Dispatch Actions', category: 'Fulfillment' },
  { key: 'exceptions.view', label: 'View Exceptions & Issues', category: 'Operations' },
  { key: 'exceptions.edit', label: 'Report & Resolve Exceptions', category: 'Operations' },
  { key: 'reports.view', label: 'View Reports & Intelligence', category: 'Intelligence' },
  { key: 'finance.view', label: 'View Finance & Revenue', category: 'Intelligence' },
  { key: 'forecasts.view', label: 'View Demand Forecasts', category: 'Intelligence' },
  { key: 'warehouses.view', label: 'View Warehouses', category: 'Network' },
  { key: 'warehouses.edit', label: 'Edit Warehouses', category: 'Network' },
  { key: 'suppliers.view', label: 'View Suppliers', category: 'Network' },
  { key: 'suppliers.edit', label: 'Edit Suppliers', category: 'Network' },
  { key: 'transfers.view', label: 'View Transfers', category: 'Network' },
  { key: 'transfers.edit', label: 'Create & Process Transfers', category: 'Network' }
];

// Route path to permission requirement mapping
export const PATH_PERMISSIONS = {
  '/dashboard': 'overview.view',
  '/today': 'overview.view',
  '/future': 'forecasts.view',
  '/risks': 'inventory.view',
  '/finance': 'finance.view',
  '/report': 'reports.view',
  '/orders': 'orders.view',
  '/inventory': 'inventory.view',
  '/allocation': 'allocation.view',
  '/picking': 'picking.view',
  '/packing': 'packing.view',
  '/dispatch': 'dispatch.view',
  '/exceptions': 'exceptions.view',
  '/analytics': 'reports.view',
  '/actions': 'inventory.edit',
  '/scenarios': 'forecasts.view',
  '/warehouses': 'warehouses.view',
  '/transfers': 'transfers.view',
  '/products': 'inventory.view',
  '/suppliers': 'suppliers.view',
  '/alerts': 'exceptions.view',
  '/activity': 'overview.view',
  '/settings': 'overview.view',
  '/staff': 'staff.manage' // OWNER only
};

/**
 * Check if a user (or profile) has a specific operational permission
 */
export function hasPermission(userProfile, permission) {
  if (!userProfile) return false;
  if (userProfile.role === ROLES.OWNER) return true;
  
  const userPermissions = Array.isArray(userProfile.permissions) ? userProfile.permissions : [];
  if (userPermissions.includes('*')) return true;
  return userPermissions.includes(permission);
}

/**
 * Check if a user profile can access a specific route path
 */
export function isRouteAllowedForProfile(userProfile, path) {
  if (!userProfile) return false;
  if (userProfile.role === ROLES.OWNER) return true;

  if (path === '/staff') return false; // Staff management is strictly OWNER only

  const requiredPerm = PATH_PERMISSIONS[path];
  if (!requiredPerm) return true; // Default fallback for unmapped routes

  return hasPermission(userProfile, requiredPerm);
}
