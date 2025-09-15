export interface ClientMenuItemDTO {
  id: number;
  type: 'food' | 'combo';
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  categoryId?: number;
  categoryName?: string;
  branchId: number;
  branchName: string;
  available: boolean;
  status: string;
  popularity?: number;
  createdAt: string;
}







