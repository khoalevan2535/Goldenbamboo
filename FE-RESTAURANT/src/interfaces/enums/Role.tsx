export const Role = {
  ADMIN: 'ROLE_ADMIN',
  MANAGER: 'ROLE_MANAGER',
  STAFF: 'ROLE_STAFF',
  USER: 'ROLE_USER',
} as const;

export type Role = typeof Role[keyof typeof Role];

export const RoleLabel = {
  [Role.ADMIN]: 'Admin',
  [Role.MANAGER]: 'Quản lý',
  [Role.STAFF]: 'Nhân viên',
  [Role.USER]: 'Người dùng',
} as const;
