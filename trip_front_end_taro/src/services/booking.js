/**
 * 预订服务
 * 处理酒店预订相关的 API 请求
 */
import { get, post, put, del } from './request';

/**
 * 创建预订
 * @param {object} data - 预订数据
 * @param {number} data.hotelId - 酒店 ID
 * @param {number} data.roomTypeId - 房型 ID
 * @param {string} data.checkInDate - 入住日期 YYYY-MM-DD
 * @param {string} data.checkOutDate - 离店日期 YYYY-MM-DD
 * @param {number} data.guestCount - 入住人数
 * @param {number} data.totalPrice - 总价
 * @param {string} data.specialRequests - 特殊要求
 * @returns {Promise} 返回预订结果
 */
export const createBooking = async (data) => {
  try {
    const res = await post('/bookings', {
      hotelId: data.hotelId,
      roomTypeId: data.roomTypeId,
      checkInDate: data.checkInDate,
      checkOutDate: data.checkOutDate,
      guestCount: data.guestCount || 1,
      totalPrice: data.totalPrice,
      guestInfo: {
        specialRequests: data.specialRequests || '',
      },
    });

    console.log('✅ 创建预订成功:', res);

    return res;
  } catch (error) {
    console.error('❌ 创建预订失败:', error);
    throw error;
  }
};

/**
 * 获取我的预订列表
 * @param {object} params - 查询参数
 * @param {string} params.status - 订单状态筛选
 * @returns {Promise} 返回预订列表
 */
export const getMyBookings = async (params = {}) => {
  try {
    const res = await get('/bookings', params);

    console.log('✅ 获取预订列表成功:', res);

    return res;
  } catch (error) {
    console.error('❌ 获取预订列表失败:', error);
    throw error;
  }
};

/**
 * 获取预订详情
 * @param {number} id - 预订 ID
 * @returns {Promise} 返回预订详情
 */
export const getBookingById = async (id) => {
  try {
    const res = await get(`/bookings/${id}`);

    console.log('✅ 获取预订详情成功:', res);

    return res;
  } catch (error) {
    console.error('❌ 获取预订详情失败:', error);
    throw error;
  }
};

/**
 * 更新预订状态
 * @param {number} id - 预订 ID
 * @param {string} status - 新状态
 * @returns {Promise} 返回更新结果
 */
export const updateBookingStatus = async (id, status) => {
  try {
    const res = await put(`/bookings/${id}`, { status });

    console.log('✅ 更新预订状态成功:', res);

    return res;
  } catch (error) {
    console.error('❌ 更新预订状态失败:', error);
    throw error;
  }
};

/**
 * 取消预订
 * @param {number} id - 预订 ID
 * @returns {Promise} 返回取消结果
 */
export const cancelBooking = async (id) => {
  try {
    const res = await put(`/bookings/${id}`, {
      status: 'cancelled',
    });

    console.log('✅ 取消预订成功:', res);

    return res;
  } catch (error) {
    console.error('❌ 取消预订失败:', error);
    throw error;
  }
};

/**
 * 删除预订
 * @param {number} id - 预订 ID
 * @returns {Promise} 返回删除结果
 */
export const deleteBooking = async (id) => {
  try {
    const res = await del(`/bookings/${id}`);

    console.log('✅ 删除预订成功:', res);

    return res;
  } catch (error) {
    console.error('❌ 删除预订失败:', error);
    throw error;
  }
};

export default {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking,
  deleteBooking,
};
