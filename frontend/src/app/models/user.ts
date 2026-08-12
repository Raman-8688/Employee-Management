export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  roles?: string[];
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token?: string;
  accessToken?: string;
  tokenType?: string;
  expiresIn?: number;
  user?: User;
  userInfo?: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
