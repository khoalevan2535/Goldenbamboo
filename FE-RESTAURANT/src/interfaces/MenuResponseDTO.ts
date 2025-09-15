import { type MenuComboResponseDTO } from './MenuComboResponseDTO';
import { type MenuDishResponseDTO } from './MenuDishResponseDTO';

export interface MenuResponseDTO {
  id: number;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  dishes: MenuDishResponseDTO[];
  combos: MenuComboResponseDTO[];
  createdBy?: string;
  inUse?: boolean;
  assignedBranchesCount?: number;
}