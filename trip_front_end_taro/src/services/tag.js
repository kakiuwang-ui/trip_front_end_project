/**
 * 标签服务
 * 处理酒店标签相关的 API 请求
 */
import { get } from './request';

/**
 * 获取所有标签列表
 * @returns {Promise} 返回标签列表
 */
export const getTags = async () => {
  try {
    const res = await get('/tags');

    console.log('✅ 获取标签列表成功:', res);

    return res;
  } catch (error) {
    console.error('❌ 获取标签列表失败:', error);
    throw error;
  }
};

/**
 * 获取标签详情
 * @param {number} id - 标签 ID
 * @returns {Promise} 返回标签详情
 */
export const getTagById = async (id) => {
  try {
    const res = await get(`/tags/${id}`);

    console.log('✅ 获取标签详情成功:', res);

    return res;
  } catch (error) {
    console.error('❌ 获取标签详情失败:', error);
    throw error;
  }
};

export default {
  getTags,
  getTagById,
};
