import { post, get } from '@/app/lib/request';
import type {
  LoginData,
  RegisterData,
  AuthResponse,
  User,
  ApiResponse,
} from '@/app/types';

/**
 * 用户注册
 */
export const register = (data: RegisterData) => {
  return post<ApiResponse<User>>('/auth/register', data);
};

/**
 * 用户登录
 */
export const login = async (data: LoginData) => {
  // 后端期望接收 { email, password }，前端表单使用的是 username 字段。
  const payload = {
    email: (data as any).username ?? (data as any).email,
    password: data.password,
  };

  // 后端返回 { success, accessToken, refreshToken, user }，这里做兼容处理并返回统一结构
  const res = await post<any>('/auth/login', payload);

  console.log('登录响应:', res); // 调试日志
  console.log('用户角色:', res.user?.role); // 调试日志

  return {
    success: res.success ?? true,
    accessToken: res.accessToken || res.token,
    refreshToken: res.refreshToken,
    user: res.user,
  } as AuthResponse;
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = () => {
  return get<ApiResponse<User>>('/users/profile');
};

/**
 * 退出登录（客户端）
 */
export const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/auth/login';
  }
};

/**
 * 获取存储的用户信息
 */
export const getStoredUser = (): User | null => {
  if (typeof window === 'undefined') return null;

  const userStr = localStorage.getItem('user');
  if (!userStr) return null;

  try {
    return JSON.parse(userStr);
  } catch {
    return null;
  }
};

/**
 * 保存用户信息和 token
 */
export const saveAuth = (token: string, user: User) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

/**
 * 检查是否已登录
 */
export const isAuthenticated = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!localStorage.getItem('token');
};
