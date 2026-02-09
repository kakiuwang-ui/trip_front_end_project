/**
 * 酒店服务
 * 处理酒店相关的 API 请求
 */
import { get } from './request';

/**
 * 获取酒店列表
 * @param {object} params - 查询参数
 * @param {number} params.locationId - 位置 ID
 * @param {string} params.tags - 标签列表（逗号分隔）
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.priceRange - 价格范围
 * @param {string} params.starRating - 星级
 * @param {number} params.page - 页码
 * @param {number} params.pageSize - 每页数量
 * @returns {Promise} 返回酒店列表
 */
export const getHotels = async (params = {}) => {
  try {
    const queryParams = {};

    if (params.locationId) {
      queryParams.locationId = params.locationId;
    }

    if (params.tags) {
      // 将标签数组转换为逗号分隔的字符串
      queryParams.tags = Array.isArray(params.tags) ? params.tags.join(',') : params.tags;
    }

    if (params.keyword) {
      queryParams.keyword = params.keyword;
    }

    if (params.priceRange) {
      queryParams.priceRange = params.priceRange;
    }

    if (params.starRating) {
      queryParams.starRating = params.starRating;
    }

    if (params.page) {
      queryParams.page = params.page;
    }

    if (params.pageSize) {
      queryParams.pageSize = params.pageSize;
    }

    const res = await get('/hotels', queryParams);

    console.log('✅ 获取酒店列表成功:', res);

    return res;
  } catch (error) {
    console.error('❌ 获取酒店列表失败:', error);
    throw error;
  }
};

/**
 * 获取酒店详情
 * @param {number} id - 酒店 ID
 * @returns {Promise} 返回酒店详情
 */
export const getHotelById = async (id) => {
  try {
    const res = await get(`/hotels/${id}`);

    console.log('✅ 获取酒店详情成功:', res);

    return res;
  } catch (error) {
    console.error('❌ 获取酒店详情失败:', error);
    throw error;
  }
};

/**
 * 获取酒店房型列表
 * @param {number} hotelId - 酒店 ID
 * @returns {Promise} 返回房型列表
 */
export const getHotelRoomTypes = async (hotelId) => {
  try {
    const res = await get(`/hotels/${hotelId}/room-types`);

    console.log('✅ 获取房型列表成功:', res);

    return res;
  } catch (error) {
    console.error('❌ 获取房型列表失败:', error);
    throw error;
  }
};

/**
 * 获取房型可用性（库存和价格）
 * @param {number} roomTypeId - 房型 ID
 * @param {string} startDate - 开始日期 YYYY-MM-DD
 * @param {string} endDate - 结束日期 YYYY-MM-DD
 * @returns {Promise} 返回房型可用性数据
 */
export const getRoomAvailability = async (roomTypeId, startDate, endDate) => {
  try {
    const res = await get(`/room-types/${roomTypeId}/availability`, {
      startDate,
      endDate,
    });

    console.log('✅ 获取房型可用性成功:', res);

    return res;
  } catch (error) {
    console.error('❌ 获取房型可用性失败:', error);
    throw error;
  }
};

/**
 * 搜索酒店（按关键词）
 * @param {string} keyword - 搜索关键词
 * @param {object} filters - 筛选条件
 * @returns {Promise} 返回搜索结果
 */
export const searchHotels = async (keyword, filters = {}) => {
  try {
    const params = {
      keyword,
      ...filters,
    };

    return await getHotels(params);
  } catch (error) {
    console.error('❌ 搜索酒店失败:', error);
    throw error;
  }
};

export default {
  getHotels,
  getHotelById,
  getHotelRoomTypes,
  getRoomAvailability,
  searchHotels,
};
