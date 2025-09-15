import { type BranchStatus } from './enums/BranchStatus';
// Updated interface with isInUse field

export interface BranchResponseDTO {
  id: string;
  name: string;
  address: string;
  phone: string;
  description: string;
  status: BranchStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  isInUse?: boolean; // Chi nhánh có đang được sử dụng không
}