import { get, post } from '@/app/lib/request';
import type { Hotel, ReviewActionData, ApiResponse } from '@/app/types';

/**
 * 获取待审核酒店列表（管理员）
 */
export const getPendingHotels = () => {
  return get<ApiResponse<Hotel[]>>('/hotels?status=pending');
};

/**
 * 审核酒店 - 通过
 */
export const reviewHotel = (id: number, data: ReviewActionData) => {
  return post<ApiResponse>(`/hotels/${id}`, data);
};
