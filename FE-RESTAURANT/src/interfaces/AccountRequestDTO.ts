import { AccountStatus } from './enums/AccountStatus';

export interface AccountRequestDTO {
  name: string;
  password: string;
  phone: string;
  status: AccountStatus;
  branchId: string; // Changed from number to string
  roleId: string;   // Changed from number to string
} 