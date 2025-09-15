// File: src/interfaces/AuthState.ts (hoặc file interface của bạn)

import type { LoginRequestDTO } from './LoginRequestDTO';

// Dùng để giải mã token
export interface JwtPayload {
  sub: string; // Subject (thường là username hoặc email)
  accountId: number;
  branchId: number | null;
  role: string;
  iat: number; // Issued at
  exp: number; // Expiration time
}

// Dùng cho state của AuthContext
export interface AuthState {
  loading: boolean;
  authLoaded: boolean;
  isAuthenticated: boolean;
  token: string | null;
  user: JwtPayload | null;
}

// Dùng cho giá trị mà Context cung cấp
export interface AuthContextType extends AuthState {
  login: (credentials: LoginRequestDTO) => Promise<void>;
  loginWithToken: (accessToken: string) => Promise<void>;
  loginWithTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  role: string;
}