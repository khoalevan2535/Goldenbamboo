import { type ComboItemDTO } from './ComboItemDTO';

export interface ComboCreationRequestDTO {
  name: string;
  description: string;
  price: number;
  dishes: ComboItemDTO[];
} 