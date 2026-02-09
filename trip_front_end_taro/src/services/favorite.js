/**
 * 收藏服务
 * 处理酒店收藏相关的 API 请求
 */
import { get, post, del } from './request';

/**
 * 添加收藏
 * @param {number} hotelId - 酒店 ID
 * @param {number} folderId - 收藏夹 ID（可选）
 * @returns {Promise} 返回收藏结果
 */
export const addFavorite = async (hotelId, folderId = null) => {
  try {
    const res = await post('/favorites', { hotelId, folderId });
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

/**
 * 获取收藏夹列表
 * @returns {Promise} 返回收藏夹列表
 */
export const getFavoriteFolders = async () => {
  try {
    const res = await get('/favorite-folders');
    console.log('✅ 获取收藏夹列表成功:', res);
    return res;
  } catch (error) {
    console.error('❌ 获取收藏夹列表失败:', error);
    throw error;
  }
};

/**
 * 创建收藏夹
 * @param {string} name - 收藏夹名称
 * @param {string} description - 描述（可选）
 * @returns {Promise} 返回创建结果
 */
export const createFavoriteFolder = async (name, description = '') => {
  try {
    const res = await post('/favorite-folders', { name, description });
    console.log('✅ 创建收藏夹成功:', res);
    return res;
  } catch (error) {
    console.error('❌ 创建收藏夹失败:', error);
    throw error;
  }
};

/**
 * 删除收藏夹
 * @param {number} folderId - 收藏夹 ID
 * @returns {Promise} 返回删除结果
 */
export const deleteFavoriteFolder = async (folderId) => {
  try {
    const res = await del(`/favorite-folders/${folderId}`);
    console.log('✅ 删除收藏夹成功:', res);
    return res;
  } catch (error) {
    console.error('❌ 删除收藏夹失败:', error);
    throw error;
  }
};

/**
 * 批量删除收藏
 * @param {Array<number>} hotelIds - 酒店 ID 数组
 * @returns {Promise} 返回删除结果
 */
export const batchRemoveFavorites = async (hotelIds) => {
  try {
    const res = await post('/favorites/batch-delete', { hotelIds });
    console.log('✅ 批量删除收藏成功:', res);
    return res;
  } catch (error) {
    console.error('❌ 批量删除收藏失败:', error);
    throw error;
  }
};

/**
 * 移动收藏到指定文件夹
 * @param {Array<number>} hotelIds - 酒店 ID 数组
 * @param {number} folderId - 目标收藏夹 ID
 * @returns {Promise} 返回移动结果
 */
export const moveFavoritesToFolder = async (hotelIds, folderId) => {
  try {
    const res = await post('/favorites/move', { hotelIds, folderId });
    console.log('✅ 移动收藏成功:', res);
    return res;
  } catch (error) {
    console.error('❌ 移动收藏失败:', error);
    throw error;
  }
};

export default {
  addFavorite,
  removeFavorite,
  getMyFavorites,
  checkFavorite,
  getFavoriteFolders,
  createFavoriteFolder,
  deleteFavoriteFolder,
  batchRemoveFavorites,
  moveFavoritesToFolder
};
