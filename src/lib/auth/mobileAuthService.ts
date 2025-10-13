import API_CONFIG from './mobileApiConfig';
import { authLocal, authBus, StoredUser } from './authLocal';

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginRequest {
  emailOrPhone: string;
  password: string;
}

export interface OTPVerificationRequest {
  email: string;
  otp: string;
}

export interface ForgotPasswordRequest { email: string; }
export interface ResetPasswordRequest { email: string; otp: string; newPassword: string; confirmPassword: string; }

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: StoredUser;
  tokens?: { accessToken: string; refreshToken: string };
  errors?: any[];
}

async function request(endpoint: string, method: string = 'GET', body?: any, includeAuth = false, signal?: AbortSignal): Promise<any> {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const headers: Record<string, string> = { ...API_CONFIG.HEADERS };
  if (includeAuth) {
    const token = authLocal.getAccessToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, {
    method,
    headers,
    body: body && method !== 'GET' ? JSON.stringify(body) : undefined,
    signal,
  });
  let data: any;
  try { data = await res.json(); } catch { data = undefined; }
  if (!res.ok) {
    const msg = data?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

class MobileAuthService {
  async register(data: RegisterRequest): Promise<AuthResponse> {
    return await request('/auth/register', 'POST', data);
  }
  async login(data: LoginRequest): Promise<AuthResponse> {
    const resp = await request('/auth/login', 'POST', data);
    if (resp?.success && resp?.tokens) {
      await authLocal.setTokens(resp.tokens.accessToken, resp.tokens.refreshToken);
      if (resp.user) await authLocal.setUser(resp.user);
      authBus.emit('login', resp.user);
    }
    return resp;
  }
  async verifyOTP(data: OTPVerificationRequest): Promise<AuthResponse> {
    const resp = await request('/auth/verify-otp', 'POST', data);
    if (resp?.success && resp?.tokens) {
      await authLocal.setTokens(resp.tokens.accessToken, resp.tokens.refreshToken);
      if (resp.user) await authLocal.setUser(resp.user);
      authBus.emit('login', resp.user);
    }
    return resp;
  }
  async resendOTP(data: { email: string; type?: 'email_verification' | 'password_reset' }): Promise<AuthResponse> {
    return await request('/auth/resend-otp', 'POST', data);
  }
  async forgotPassword(data: ForgotPasswordRequest): Promise<AuthResponse> {
    return await request('/auth/forgot-password', 'POST', data);
  }
  async resetPassword(data: ResetPasswordRequest): Promise<AuthResponse> {
    return await request('/auth/reset-password', 'POST', data);
  }
  async getProfile(): Promise<AuthResponse> {
    return await request('/auth/profile', 'GET', undefined, true);
  }
  async logout(): Promise<AuthResponse> {
    const refreshToken = authLocal.getRefreshToken();
    const resp = await request('/auth/logout', 'POST', { refreshToken }, true);
    await authLocal.clear();
    return resp;
  }
  isAuthenticated(): boolean { return !!authLocal.getAccessToken(); }
}

const mobileAuthService = new MobileAuthService();
export default mobileAuthService;
