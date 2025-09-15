export interface BranchMenuDishRequestDTO {
  branchId: number;
  menuId: number;
  dishId: number;
  price: number;
  isActive: boolean;
}

export interface BranchMenuDishResponseDTO {
  id: number;
  branchId: number;
  branchName: string;
  menuId: number;
  menuName: string;
  dishId: number;
  dishName: string;
  price: number;
  isActive: boolean;
}

