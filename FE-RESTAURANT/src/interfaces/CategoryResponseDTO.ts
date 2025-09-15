import { CategoryStatus } from './enums/CategoryStatus';

export interface CategoryResponseDTO {
  id: string;
  name: string;
  description: string;
  status: CategoryStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  inUse?: boolean;
} 