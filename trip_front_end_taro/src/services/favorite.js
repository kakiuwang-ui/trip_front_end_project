/**
 * 收藏服务
 * 处理酒店收藏相关的 API 请求
 */
import { get, post, del } from './request';

/**
 * 添加收藏
 * @param {number} hotelId - 酒店 ID
 * @returns {Promise} 返回收藏结果
 */
export const addFavorite = async (hotelId) => {
  try {
    const res = await post('/favorites', { hotelId });
    console.log('✅ 添加收藏成功:', res);
    return res;
  } catch (error) {
    console.error('❌ 添加收藏失败:', error);
    throw error;
  }
};

/**
 * 取消收藏
 * @param {number} hotelId - 酒店 ID
 * @returns {Promise} 返回取消结果
 */
export const removeFavorite = async (hotelId) => {
  try {
    const res = await del(`/favorites/${hotelId}`);
    console.log('✅ 取消收藏成功:', res);
    return res;
  } catch (error) {
    console.error('❌ 取消收藏失败:', error);
    throw error;
  }
};

/**
 * 获取我的收藏列表
 * @returns {Promise} 返回收藏列表
 */
export const getMyFavorites = async () => {
  try {
    const res = await get('/favorites');
    console.log('✅ 获取收藏列表成功:', res);
    return res;
  } catch (error) {
    console.error('❌ 获取收藏列表失败:', error);
    throw error;
  }
};

/**
 * 检查酒店是否已收藏
 * @param {number} hotelId - 酒店 ID
 * @returns {Promise} 返回是否已收藏
 */
export const checkFavorite = async (hotelId) => {
  try {
    const res = await get(`/favorites/check/${hotelId}`);
    console.log('✅ 检查收藏状态成功:', res);
    return res;
  } catch (error) {
    console.error('❌ 检查收藏状态失败:', error);
    throw error;
  }
};

export default {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite
};
