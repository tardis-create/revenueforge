// RBAC Types and Utilities for RevenueForge

export type UserRole = 'admin' | 'dealer' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ApiKey {
  id: string;
  name: string;
  key_hash: string;
  role: UserRole;
  is_active: boolean;
  expires_at: string | null;
  last_used_at: string | null;
  created_at: string;
}

// Role hierarchy for permission checking
const ROLE_HIERARCHY: Record<UserRole, number> = {
  viewer: 1,
  dealer: 2,
  admin: 3,
};

// Permission matrix for resources
export interface PermissionMatrix {
  [resource: string]: {
    [action: string]: UserRole[];
  };
}

// Default permissions for RevenueForge
export const DEFAULT_PERMISSIONS: PermissionMatrix = {
  products: {
    read: ['viewer', 'dealer', 'admin'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin'],
  },
  leads: {
    read: ['dealer', 'admin'],
    create: ['dealer', 'admin'],
    update: ['dealer', 'admin'],
    delete: ['admin'],
  },
  'rfq-submissions': {
    read: ['dealer', 'admin'],
    create: ['viewer', 'dealer', 'admin'], // Public can submit RFQs
    update: ['dealer', 'admin'],
    delete: ['admin'],
  },
  quotes: {
    read: ['dealer', 'admin'],
    create: ['dealer', 'admin'],
    update: ['admin'],
    delete: ['admin'],
  },
  users: {
    read: ['admin'],
    create: ['admin'],
    update: ['admin'],
    delete: ['admin'],
  },
  'audit-log': {
    read: ['admin'],
    export: ['admin'],
  },
};

/**
 * Check if a user has permission to perform an action on a resource
 */
export function hasPermission(
  userRole: UserRole,
  resource: string,
  action: string,
  permissions: PermissionMatrix = DEFAULT_PERMISSIONS
): boolean {
  const resourcePerms = permissions[resource];
  if (!resourcePerms) return false;

  const allowedRoles = resourcePerms[action];
  if (!allowedRoles) return false;

  const userRoleLevel = ROLE_HIERARCHY[userRole];
  const minRequiredRole = allowedRoles.reduce((min, role) => {
    const roleLevel = ROLE_HIERARCHY[role];
    return roleLevel < min ? roleLevel : min;
  }, ROLE_HIERARCHY.admin);

  return userRoleLevel >= minRequiredRole;
}

/**
 * Check if a role has higher or equal privileges than another
 */
export function hasHigherOrEqualRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
}

/**
 * Get all roles that are at or above a given role level
 */
export function getRolesAtOrAbove(minRole: UserRole): UserRole[] {
  const minLevel = ROLE_HIERARCHY[minRole];
  return (Object.keys(ROLE_HIERARCHY) as UserRole[]).filter(
    (role) => ROLE_HIERARCHY[role] >= minLevel
  );
}

/**
 * Validate user role string
 */
export function isValidRole(role: string): role is UserRole {
  return ['admin', 'dealer', 'viewer'].includes(role);
}
