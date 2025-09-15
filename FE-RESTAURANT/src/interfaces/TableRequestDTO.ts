import { type TableStatus } from './enums/TableStatus';

export interface TableRequestDTO {
  name: string;
  status: TableStatus;
  branchId: number;
  description: string;
  createdBy: string;
  seats: number;
  area: string;
  tableType: string;
  notes?: string;
} 