import type { ComboItemDTO } from './ComboItemDTO';

export interface ComboRequestDTO {
  name: string;
  description?: string;
  image?: File | string | null;
  basePrice: number;
  comboItems: ComboItemDTO[];
}
