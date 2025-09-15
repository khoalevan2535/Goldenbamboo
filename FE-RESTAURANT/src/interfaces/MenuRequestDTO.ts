import { type MenuDishRequestDTO } from './MenuDishRequestDTO';
import { type MenuComboRequestDTO } from './MenuComboRequestDTO';

export interface MenuRequestDTO {
  name: string;
  description?: string;
  dishes: MenuDishRequestDTO[];
  combos: MenuComboRequestDTO[];
  branchAssignment?: {
    branchId: number;
    isDefault: boolean;
  };
}