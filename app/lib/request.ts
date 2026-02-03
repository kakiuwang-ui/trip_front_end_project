import axios, { AxiosError, AxiosRequestConfig } from 'axios';

// 创建 axios 实例
const request = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// 请求拦截器
request.interceptors.request.use(
  (config) => {
    // 从 localStorage 获取 token（客户端）
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError<any>) => {
    // 错误处理（移除 message 调用，错误在组件中处理）
    if (error.response) {
      const { status } = error.response;
      const url = error.config?.url;

      // 401 未授权，清除 token 并跳转到登录页
      // 注意：排除登录接口本身的 401 错误（即账号密码错误的情况），避免重复跳转
      if (status === 401 && typeof window !== 'undefined' && !url?.includes('/auth/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/auth/login';
      }
    }

    return Promise.reject(error);
  }
);

export default request;

// 导出类型化的请求方法
export const get = <T = any>(url: string, config?: AxiosRequestConfig) =>
  request.get<T, T>(url, config);

export const post = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  request.post<T, T>(url, data, config);

export const put = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  request.put<T, T>(url, data, config);

export const patch = <T = any>(url: string, data?: any, config?: AxiosRequestConfig) =>
  request.patch<T, T>(url, data, config);

export const del = <T = any>(url: string, config?: AxiosRequestConfig) =>
  request.delete<T, T>(url, config);
