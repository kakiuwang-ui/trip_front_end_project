/**
 * HTTP 请求封装
 * 基于 Taro.request 实现，参考 Next.js 项目的 app/lib/request.ts
 */
import Taro from '@tarojs/taro';

// API 基础地址
const BASE_URL = 'http://localhost:3000/api';

// 开发环境标识
const isDevelopment = true;

/**
 * 统一请求方法
 * @param {string} url - 请求路径（相对路径）
 * @param {object} options - 请求配置
 * @param {string} options.method - 请求方法 GET/POST/PUT/DELETE
 * @param {object} options.data - 请求数据
 * @param {object} options.header - 请求头
 * @returns {Promise} 返回 Promise 对象
 */
function request(url, options = {}) {
  // 1. 从本地存储获取 token
  const token = Taro.getStorageSync('token');

  // 2. 设置请求头
  const header = {
    'Content-Type': 'application/json',
    ...options.header,
  };

  // 如果有 token，添加到请求头
  if (token) {
    header.Authorization = `Bearer ${token}`;
  }

  // 3. 打印请求信息（开发环境）
  if (isDevelopment) {
    console.log('📡 API Request:', {
      url: BASE_URL + url,
      method: options.method || 'GET',
      data: options.data,
    });
  }

  // 4. 发起请求
  return Taro.request({
    url: BASE_URL + url,
    method: options.method || 'GET',
    data: options.data,
    header,
    timeout: 10000,
  })
    .then((res) => {
      // 5. 响应处理
      if (isDevelopment) {
        console.log('✅ API Response:', res.data);
      }

      // 成功响应
      if (res.statusCode === 200) {
        return res.data;
      }

      // 401 未授权 - 清除 token 并跳转登录
      if (res.statusCode === 401) {
        console.warn('🔒 未授权，跳转登录页');
        Taro.removeStorageSync('token');
        Taro.removeStorageSync('user');

        // 跳转到登录页
        Taro.navigateTo({
          url: '/pages/login/index',
        });

        return Promise.reject(new Error('未授权，请先登录'));
      }

      // 其他错误状态码
      const errorMsg = res.data?.error || res.data?.message || '请求失败';
      Taro.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 2000,
      });

      return Promise.reject(new Error(errorMsg));
    })
    .catch((err) => {
      // 6. 错误处理
      console.error('❌ API Error:', err);

      // 网络错误
      if (err.errMsg && err.errMsg.includes('request:fail')) {
        Taro.showToast({
          title: '网络连接失败',
          icon: 'none',
          duration: 2000,
        });
        return Promise.reject(new Error('网络连接失败'));
      }

      // 超时错误
      if (err.errMsg && err.errMsg.includes('timeout')) {
        Taro.showToast({
          title: '请求超时',
          icon: 'none',
          duration: 2000,
        });
        return Promise.reject(new Error('请求超时'));
      }

      // 其他错误
      return Promise.reject(err);
    });
}

/**
 * GET 请求
 * @param {string} url - 请求路径
 * @param {object} params - 查询参数
 * @param {object} config - 其他配置
 */
export const get = (url, params = {}, config = {}) => {
  // 将 params 转换为查询字符串
  const queryParams = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');

  const fullUrl = queryParams ? `${url}?${queryParams}` : url;

  return request(fullUrl, {
    method: 'GET',
    ...config,
  });
};

/**
 * POST 请求
 * @param {string} url - 请求路径
 * @param {object} data - 请求数据
 * @param {object} config - 其他配置
 */
export const post = (url, data = {}, config = {}) => {
  return request(url, {
    method: 'POST',
    data,
    ...config,
  });
};

/**
 * PUT 请求
 * @param {string} url - 请求路径
 * @param {object} data - 请求数据
 * @param {object} config - 其他配置
 */
export const put = (url, data = {}, config = {}) => {
  return request(url, {
    method: 'PUT',
    data,
    ...config,
  });
};

/**
 * DELETE 请求
 * @param {string} url - 请求路径
 * @param {object} config - 其他配置
 */
export const del = (url, config = {}) => {
  return request(url, {
    method: 'DELETE',
    ...config,
  });
};

export default request;
