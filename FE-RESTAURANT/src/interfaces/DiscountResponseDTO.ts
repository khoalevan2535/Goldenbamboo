import { type DiscountStatus } from './enums/DiscountStatus';
import { type DiscountType } from './enums/DiscountType';

export interface DiscountResponseDTO {
  id: number;
  name: string;
  type: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  status: DiscountStatus;
  branchNames: string[];
  branchIds?: number[];
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
} 