import { start } from 'repl';
import { get, put, del, post } from '@/app/lib/request';
import type { Booking, BookingStatus, ApiResponse, BookingFormData } from '@/app/types';
import { getStoredUser } from './auth';

/**
 * 获取当前商户的所有酒店预订列表
 * (优化版：直接调用后端聚合接口)
 */
export const getMyBookings = async () => {
  const user = getStoredUser();
  if (!user) {
    throw new Error('用户未登录');
  }

  // 直接请求 /api/bookings?merchantId=xxx
  // 后端会根据 merchantId 返回该商户名下所有酒店的订单
  const response = await get<ApiResponse<any[]>>(`/bookings?merchantId=${user.id}`);
  
  if (!response.success || !response.data) {
      return [];
  }

  // 转换数据格式为前端 Booking 类型
  // Directly return the data structure that matches the interface, but ensure types are correct
  return response.data.map((booking: any) => ({
      ...booking,
      totalPrice: Number(booking.totalPrice), // Ensure number
      // Ensure nested objects are populated if needed, backend sends them
      // We don't need to flatten them if we update the UI to use nested properties
  })) as Booking[];
};

/**
 * 更新预订状态（商户操作）
 */
export const updateBookingStatus = async (id: number, status: BookingStatus) => {
  const response = await put<{ success: boolean; data: any }>(`/bookings/${id}`, { status });
  return response.data;
};

/**
 * 取消预订
 */
export const cancelBooking = async (id: number) => {
  const response = await put<{ success: boolean; message: string }>(`/bookings/${id}`, {
    status: 'cancelled'
  });
  return response;
};

/**
 * 创建预订
 */
export const createBooking = async (data: BookingFormData) => {
  const response = await post<ApiResponse<Booking>>('/bookings', data);
  return response.data;
};

/**
 * 删除预订
 */
export const deleteBooking = async (id: number) => {
  const response = await del<{ success: boolean; message: string }>(`/bookings/${id}`);
  return response;
};
