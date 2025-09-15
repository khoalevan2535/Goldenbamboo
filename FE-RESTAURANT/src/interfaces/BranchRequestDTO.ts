import { type BranchStatus } from './enums/BranchStatus';

export interface BranchRequestDTO {
  name: string;
  address: string;
  phone: string;
  description: string;
  createdBy: string;
  status: BranchStatus;
} 