import { get, post, put, del } from '@/app/lib/request';
import type {
  Hotel,
  HotelFormData,
  HotelSearchParams,
  HotelListResponse,
  ApiResponse,
  RoomType,
  Location,
  Tag
} from '@/app/types';
import { getStoredUser } from './auth';

/**
 * 获取酒店列表（公开API）
 */
export const getHotels = (params?: HotelSearchParams) => {
  return get<HotelListResponse>('/hotels', { params });
};

/**
 * 根据ID获取酒店详情（公开API）
 */
export const getHotelById = (id: number) => {
  return get<ApiResponse<Hotel>>(`/hotels/${id}`);
};

/**
 * 获取我的酒店列表（商户）
 */
export const getMyHotels = () => {
  const user = getStoredUser();
  if (!user) {
    return Promise.reject(new Error('未登录'));
  }
  return get<ApiResponse<Hotel[]>>(`/hotels?merchantId=${user.id}`);
};

/**
 * 创建酒店（商户）
 */
export const createHotel = (data: HotelFormData) => {
  return post<ApiResponse<Hotel>>('/hotels', data);
};

/**
 * 更新酒店（商户）
 */
export const updateHotel = (id: number, data: Partial<HotelFormData>) => {
  return put<ApiResponse<Hotel>>(`/hotels/${id}`, data);
};

/**
 * 删除酒店（商户）
 */
export const deleteHotel = (id: number) => {
  return del<ApiResponse<void>>(`/hotels/${id}`);
};

/**
 * 上传图片
 */
export const uploadImage = (file: File) => {
  const formData = new FormData();
  formData.append('file', file);

  return post<{ url: string }>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

// --- Room Types ---

/**
 * 创建房型
 */
export const createRoomType = (hotelId: number, data: Partial<RoomType>) => {
  return post<ApiResponse<RoomType>>(`/hotels/${hotelId}/room-types`, data);
};

/**
 * 更新房型
 */
export const updateRoomType = (id: number, data: Partial<RoomType>) => {
  return put<ApiResponse<RoomType>>(`/room-types/${id}`, data);
};

/**
 * 删除房型
 */
export const deleteRoomType = (id: number) => {
  return del<ApiResponse<void>>(`/room-types/${id}`);
};

// --- Others ---

/**
 * 获取所有位置/城市
 */
export const getLocations = () => {
  return get<ApiResponse<Location[]>>('/locations');
};

/**
 * 获取所有标签
 */
export const getTags = () => {
    return get<ApiResponse<Tag[]>>('/tags');
};

