/**
 * 认证服务
 * 处理用户登录、注册、退出等认证相关操作
 */
import { post } from './request';
import { storage } from '../utils/storage';
import Taro from '@tarojs/taro';

/**
 * 用户登录
 * @param {object} data - 登录数据
 * @param {string} data.username - 用户名（邮箱）
 * @param {string} data.password - 密码
 * @returns {Promise} 返回登录结果
 */
export const login = async (data) => {
  try {
    const res = await post('/auth/login', {
      email: data.username || data.email, // 前端用 username，后端用 email
      password: data.password,
    });

    // 登录成功，保存 token 和用户信息
    if (res.success && res.accessToken) {
      storage.setToken(res.accessToken);

      if (res.user) {
        storage.setUser(res.user);
      }

      console.log('✅ 登录成功:', res.user);

      return res;
    }

    throw new Error(res.error || '登录失败');
  } catch (error) {
    console.error('❌ 登录失败:', error);
    throw error;
  }
};

/**
 * 用户注册
 * @param {object} data - 注册数据
 * @param {string} data.name - 姓名
 * @param {string} data.email - 邮箱
 * @param {string} data.password - 密码
 * @param {string} data.phone - 手机号（可选）
 * @returns {Promise} 返回注册结果
 */
export const register = async (data) => {
  try {
    const res = await post('/auth/register', {
      name: data.name,
      email: data.email,
      password: data.password,
      phone: data.phone || undefined,
      role: 'user', // 用户端固定为普通用户角色
    });

    console.log('✅ 注册成功');

    return res;
  } catch (error) {
    console.error('❌ 注册失败:', error);
    throw error;
  }
};

/**
 * 用户退出登录
 * @returns {Promise}
 */
export const logout = async () => {
  try {
    // 清除本地认证信息
    storage.clearAuth();

    console.log('✅ 退出成功');

    // 可选：显示提示
    Taro.showToast({
      title: '已退出登录',
      icon: 'success',
      duration: 1500,
    });

    return Promise.resolve();
  } catch (error) {
    console.error('❌ 退出失败:', error);
    throw error;
  }
};

/**
 * 获取当前用户信息
 * @returns {object|null} 用户信息或 null
 */
export const getCurrentUser = () => {
  return storage.getUser();
};

/**
 * 检查是否已登录
 * @returns {boolean} 是否已登录
 */
export const isLoggedIn = () => {
  return storage.isAuthenticated();
};

/**
 * 刷新 Token
 * @param {string} refreshToken - Refresh Token
 * @returns {Promise} 返回新的 Token
 */
export const refreshToken = async (refreshToken) => {
  try {
    const res = await post('/auth/refresh', {
      refreshToken,
    });

    if (res.success && res.accessToken) {
      storage.setToken(res.accessToken);
      console.log('✅ Token 刷新成功');
      return res;
    }

    throw new Error('Token 刷新失败');
  } catch (error) {
    console.error('❌ Token 刷新失败:', error);
    // Token 刷新失败，清除认证信息
    storage.clearAuth();
    throw error;
  }
};

/**
 * 保存认证信息
 * @param {string} token - Access Token
 * @param {object} user - 用户信息
 */
export const saveAuth = (token, user) => {
  if (token) {
    storage.setToken(token);
  }

  if (user) {
    storage.setUser(user);
  }
};

/**
 * 检查登录状态，未登录则跳转登录页
 * @param {boolean} showToast - 是否显示提示
 * @returns {boolean} 是否已登录
 */
export const checkLogin = (showToast = true) => {
  const isAuth = isLoggedIn();

  if (!isAuth) {
    if (showToast) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1500,
      });
    }

    setTimeout(() => {
      Taro.navigateTo({
        url: '/pages/login/index',
      });
    }, 1500);

    return false;
  }

  return true;
};

export default {
  login,
  register,
  logout,
  getCurrentUser,
  isLoggedIn,
  refreshToken,
  saveAuth,
  checkLogin,
};
