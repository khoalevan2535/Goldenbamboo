export interface DeliveryAddressRequestDTO {
  recipientName: string;
  phoneNumber: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  notes?: string;
  isDefault?: boolean;
  branchId: number;
}

export interface DeliveryAddressResponseDTO {
  id: number;
  recipientName: string;
  phoneNumber: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  notes?: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  accountId: number;
  branchId: number;
  branchName: string;
  fullAddress: string;
  shortAddress: string;
}

export interface GHTKAddressDTO {
  pick_name?: string;
  pick_address?: string;
  pick_province?: string;
  pick_district?: string;
  pick_ward?: string;
  pick_tel?: string;
  name?: string;
  address?: string;
  province?: string;
  district?: string;
  ward?: string;
  tel?: string;
  note?: string;
  value?: number;
  transport?: string;
  pick_option?: string;
  deliver_option?: string;
}

export interface GHTKOrderDTO {
  label_id?: string;
  partner_id?: string;
  status?: string;
  created?: string;
  message?: string;
}

export interface GHTKFeeDTO {
  name?: string;
  fee?: number;
  insurance_fee?: number;
  include_vat?: string;
  cost_id?: string;
  delivery_type?: string;
  a?: number;
  dt?: number;
  ship_fee_only?: number;
  promotion_key?: string;
}

export interface GHTKErrorDTO {
  code?: number;
  message?: string;
}

export interface GHTKResponseDTO {
  success?: boolean;
  message?: string;
  order?: GHTKOrderDTO;
  fee?: GHTKFeeDTO;
  data?: GHTKAddressDTO[];
  error?: GHTKErrorDTO;
}

export interface DeliveryAddressFormData {
  recipientName: string;
  phoneNumber: string;
  address: string;
  province: string;
  district: string;
  ward: string;
  notes: string;
  isDefault: boolean;
  branchId: number;
}

export interface ProvinceDTO {
  id: string;
  name: string;
}

export interface DistrictDTO {
  id: string;
  name: string;
  province_id: string;
}

export interface WardDTO {
  id: string;
  name: string;
  district_id: string;
}
