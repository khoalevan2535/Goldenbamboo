export interface StaffRegistrationRequestDTO {
  username: string;
  password: string;
  name: string;
  phone: string;
  email?: string;
  roleName: string;
  branchId?: number;
} 