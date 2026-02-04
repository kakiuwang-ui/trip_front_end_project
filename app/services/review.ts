import { get, put } from '@/app/lib/request';
import type { Hotel, ApiResponse } from '@/app/types';

/**
 * 获取待审核酒店列表（管理员）
 */
export const getPendingHotels = async () => {
    // The API response is { success: boolean, data: Hotel[] }
    // The get<T> function returns T directly in some implementations, or Promise<T>. 
    // Assuming get returns the parsed JSON body.
    const res = await get<ApiResponse<Hotel[]>>('/hotels?status=pending');
    return res.data || [];
};

/**
 * 更新酒店状态 (通用)
 */
export const updateHotelStatus = async (id: number, status: string, rejectionReason?: string) => {
    const res = await put<ApiResponse<Hotel>>(`/hotels/${id}`, { status, rejectionReason });
    return res.data;
}

/**
 * 审核酒店 - 通过
 */
export const approveHotel = (id: number) => {
  return updateHotelStatus(id, 'published');
};

/**
 * 审核酒店 - 拒绝
 */
export const rejectHotel = (id: number, reason: string) => {
  return updateHotelStatus(id, 'rejected', reason);
};

