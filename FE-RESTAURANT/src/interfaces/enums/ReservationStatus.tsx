export const ReservationStatus = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELED: 'CANCELED',
  COMPLETED: 'COMPLETED',
} as const;

export type ReservationStatus = typeof ReservationStatus[keyof typeof ReservationStatus]; 