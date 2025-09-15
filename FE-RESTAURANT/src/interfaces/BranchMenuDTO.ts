// File: src/interfaces/BranchMenuDTO.ts

export interface BranchMenuRequestDTO {
  branchId: number;
  menuId: number;
  isDefault?: boolean;
}

export interface BranchMenuResponseDTO {
  id: number;
  branchId: number;
  branchName?: string;
  menuId: number;
  menuName?: string;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}


