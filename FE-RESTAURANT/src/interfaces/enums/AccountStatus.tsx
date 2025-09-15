export const AccountStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  LOCKED: 'LOCKED',
} as const;

export type AccountStatus = typeof AccountStatus[keyof typeof AccountStatus]; 