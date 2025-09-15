export interface BranchMenuComboRequestDTO {
  branchId: number;
  menuId: number;
  comboId: number;
  price: number;
  isActive: boolean;
}

export interface BranchMenuComboResponseDTO {
  id: number;
  branchId: number;
  branchName: string;
  menuId: number;
  menuName: string;
  comboId: number;
  comboName: string;
  price: number;
  isActive: boolean;
}

