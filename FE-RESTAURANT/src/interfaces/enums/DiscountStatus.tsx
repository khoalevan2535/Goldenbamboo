export const DiscountStatus = {
  ACTIVE: 'ACTIVE',
  SCHEDULED: 'SCHEDULED',
  EXPIRED: 'EXPIRED',
} as const;

export type DiscountStatus = typeof DiscountStatus[keyof typeof DiscountStatus]; 