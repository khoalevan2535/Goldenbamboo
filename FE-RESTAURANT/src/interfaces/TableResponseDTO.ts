import { type TableStatus } from './enums/TableStatus';

export interface TableResponseDTO {
  id: number;
  name: string;
  status: TableStatus;
  branchId: number;
  branchName: string;
  operationalStatus?: 'ACTIVE' | 'INACTIVE';
  description: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  seats: number;
  area: string;
} 