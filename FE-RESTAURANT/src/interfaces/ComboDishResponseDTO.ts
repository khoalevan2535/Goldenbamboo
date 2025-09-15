import { ItemAvailabilityStatus } from './enums/MenuItemStatus';

export interface ComboDishResponseDTO {
  id: number;
  comboId: number;
  comboName: string;
  dishId: number;
  dishName: string;
  quantity: number;
  basePrice: number;
  availabilityStatus: ItemAvailabilityStatus;
} 