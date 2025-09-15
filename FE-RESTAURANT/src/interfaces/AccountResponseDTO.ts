import { AccountStatus } from './enums/AccountStatus';

export interface AccountResponseDTO {
  id: number; // Sửa lại thành number để khớp với backend
  username: string;
  name: string;
  email?: string; // Thêm email
  phone: string;
  status: AccountStatus;
  createAt: string; // Sử dụng string cho LocalDateTime
  
  // Thông tin khóa tài khoản
  failedAttempts?: number;
  lockTime?: string;
  lastFailedAttempt?: string;
  
  branchId?: number; // Sửa lại thành number và optional
  branchName?: string; // Optional
  roles: string[]; // Sửa lại thành array để khớp với backend Set<String>
  avatarUrl?: string; // Thêm avatarUrl
} 