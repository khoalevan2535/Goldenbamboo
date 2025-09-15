export const TableStatus = {
  AVAILABLE: 'AVAILABLE',
  OCCUPIED: 'OCCUPIED',
  RESERVED: 'RESERVED',
  UNAVAILABLE: 'UNAVAILABLE',
} as const;

export type TableStatus = typeof TableStatus[keyof typeof TableStatus]; 