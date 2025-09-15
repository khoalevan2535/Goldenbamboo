import type { ComboDishResponseDTO } from "./ComboDishResponseDTO";
import { ItemAvailabilityStatus } from "./enums/MenuItemStatus";

export interface ComboResponseDTO {
  id: string;
  name: string;
  image: string;
  description: string;
  basePrice: number;
  availabilityStatus: ItemAvailabilityStatus;
  manualAvailabilityOverride: boolean;
  createdBy: number;
  createdAt: string;
  updatedAt: string;
  comboDishes: ComboDishResponseDTO[];
  inUse?: boolean;

  // Discount entity relationship
  discount?: {
    id: number;
    code: string;
    name: string;
    newPrice: number;
    startDate: string;
    endDate: string;
    status: string;
    description?: string;
  };
} 