export interface MenuDishResponseDTO {
  id: string;
  dishId: string;
  dishName: string;
  categoryId?: number;
  categoryName?: string;
  price?: number;
  sellingPrice?: number;
  status?: 'APPROVED' | 'PENDING' | 'REJECTED';
  operationalStatus?: 'ACTIVE' | 'INACTIVE';
  imageUrl?: string; // Thay đổi từ image sang imageUrl để nhất quán với backend
}