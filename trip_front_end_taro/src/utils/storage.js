/**
 * 本地存储工具
 * 封装 Taro 的存储 API，提供统一的存储接口
 */
import Taro from '@tarojs/taro';

export const storage = {
  /**
   * 保存 Token
   * @param {string} token - JWT Token
   */
  setToken(token) {
    try {
      Taro.setStorageSync('token', token);
      console.log('✅ Token 已保存');
    } catch (error) {
      console.error('❌ Token 保存失败:', error);
    }
  },

  /**
   * 获取 Token
   * @returns {string|null} Token 或 null
   */
  getToken() {
    try {
      return Taro.getStorageSync('token') || null;
    } catch (error) {
      console.error('❌ Token 获取失败:', error);
      return null;
    }
  },

  /**
   * 保存用户信息
   * @param {object} user - 用户信息对象
   */
  setUser(user) {
    try {
      Taro.setStorageSync('user', JSON.stringify(user));
      console.log('✅ 用户信息已保存:', user);
    } catch (error) {
      console.error('❌ 用户信息保存失败:', error);
    }
  },

  /**
   * 获取用户信息
   * @returns {object|null} 用户信息对象或 null
   */
  getUser() {
    try {
      const userStr = Taro.getStorageSync('user');
      if (!userStr) return null;

      return JSON.parse(userStr);
    } catch (error) {
      console.error('❌ 用户信息获取失败:', error);
      return null;
    }
  },

  /**
   * 清除认证信息（Token 和用户信息）
   */
  clearAuth() {
    try {
      Taro.removeStorageSync('token');
      Taro.removeStorageSync('user');
      console.log('✅ 认证信息已清除');
    } catch (error) {
      console.error('❌ 认证信息清除失败:', error);
    }
  },

  /**
   * 检查是否已登录
   * @returns {boolean} 是否已登录
   */
  isAuthenticated() {
    const token = this.getToken();
    return !!token;
  },

  /**
   * 保存搜索历史
   * @param {string} keyword - 搜索关键词
   * @param {number} maxHistory - 最大历史记录数，默认 10
   */
  saveSearchHistory(keyword, maxHistory = 10) {
    try {
      if (!keyword || !keyword.trim()) return;

      const historyStr = Taro.getStorageSync('searchHistory') || '[]';
      let history = JSON.parse(historyStr);

      // 去重：如果已存在，先移除
      history = history.filter((item) => item !== keyword);

      // 添加到开头
      history.unshift(keyword);

      // 限制最大数量
      if (history.length > maxHistory) {
        history = history.slice(0, maxHistory);
      }

      Taro.setStorageSync('searchHistory', JSON.stringify(history));
    } catch (error) {
      console.error('❌ 搜索历史保存失败:', error);
    }
  },

  /**
   * 获取搜索历史
   * @returns {Array<string>} 搜索历史数组
   */
  getSearchHistory() {
    try {
      const historyStr = Taro.getStorageSync('searchHistory') || '[]';
      return JSON.parse(historyStr);
    } catch (error) {
      console.error('❌ 搜索历史获取失败:', error);
      return [];
    }
  },

  /**
   * 清除搜索历史
   */
  clearSearchHistory() {
    try {
      Taro.removeStorageSync('searchHistory');
      console.log('✅ 搜索历史已清除');
    } catch (error) {
      console.error('❌ 搜索历史清除失败:', error);
    }
  },

  /**
   * 通用存储方法
   * @param {string} key - 存储键
   * @param {any} value - 存储值（会自动序列化）
   */
  set(key, value) {
    try {
      const valueStr = typeof value === 'string' ? value : JSON.stringify(value);
      Taro.setStorageSync(key, valueStr);
    } catch (error) {
      console.error(`❌ 存储 ${key} 失败:`, error);
    }
  },

  /**
   * 通用获取方法
   * @param {string} key - 存储键
   * @param {any} defaultValue - 默认值
   * @returns {any} 存储的值或默认值
   */
  get(key, defaultValue = null) {
    try {
      const value = Taro.getStorageSync(key);
      if (!value) return defaultValue;

      // 尝试解析 JSON
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error(`❌ 获取 ${key} 失败:`, error);
      return defaultValue;
    }
  },

  /**
   * 删除指定键的存储
   * @param {string} key - 存储键
   */
  remove(key) {
    try {
      Taro.removeStorageSync(key);
    } catch (error) {
      console.error(`❌ 删除 ${key} 失败:`, error);
    }
  },

  /**
   * 清除所有存储
   */
  clearAll() {
    try {
      Taro.clearStorageSync();
      console.log('✅ 所有存储已清除');
    } catch (error) {
      console.error('❌ 清除存储失败:', error);
    }
  },
};

export default storage;
