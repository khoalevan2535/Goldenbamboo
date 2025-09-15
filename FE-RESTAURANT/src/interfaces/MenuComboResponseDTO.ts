import { MenuItemStatus } from "./enums/MenuItemStatus";

export interface MenuComboResponseDTO {
  id: string;
  comboId: string;
  comboName: string;
  price?: number;
  sellingPrice?: number;
  status?: MenuItemStatus;
  imageUrl?: string; // Thay đổi từ image sang imageUrl để nhất quán với backend
  description?: string;
  comboDishes?: Array<{
    dishId: string;
    dishName: string;
    quantity: number;
    price?: number;
  }>;
}