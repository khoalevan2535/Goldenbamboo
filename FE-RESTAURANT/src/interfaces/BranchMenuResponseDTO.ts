export interface BranchMenuResponseDTO {
  id: number;
  branchId: number;
  branchName: string;
  menuId: number;
  menuName: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

