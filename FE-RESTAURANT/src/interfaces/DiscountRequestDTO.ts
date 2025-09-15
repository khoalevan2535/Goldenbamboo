import { type DiscountType } from './enums/DiscountType';

export interface DiscountRequestDTO {
  name: string;
  type: DiscountType;
  value: number;
  startDate: string;
  endDate: string;
  branchIds: number[];
  minOrderAmount?: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
} 