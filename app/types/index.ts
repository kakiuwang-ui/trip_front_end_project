// 用户相关类型
export interface Role {
  id: number;
  name: string;
  description?: string;
}

export interface User {
  id: number;
  email: string;
  phone?: string;
  name?: string;
  roleId?: number;
  role?: Role;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name?: string;
  phone?: string;
  role: 'user' | 'merchant'; // API 期望字符串枚举
}

// 酒店相关类型
export type HotelStatus = 'pending' | 'published' | 'rejected' | 'offline';

export interface Location {
  id: number;
  name: string;
  description?: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface RoomType {
  id: number;
  hotelId?: number;
  name: string;
  description?: string;
  price: number;
  discount: number;
  amenities?: string[];
  images?: string[];
  stock: number;
  availability?: RoomAvailability[];
}

export interface RoomAvailability {
  id: number;
  roomTypeId: number;
  date: string;
  price?: number;
  quota?: number;
  booked: number;
  isClosed: boolean;
}

export interface Hotel {
  id: number;
  merchantId?: number;
  locationId?: number;
  nameZh: string;
  nameEn?: string;
  address: string;
  starRating?: number;
  description?: string;
  facilities?: string[];
  openingYear?: number;
  images?: string[];
  status: HotelStatus;
  rejectionReason?: string;
  createdAt?: string;
  updatedAt?: string;
  location?: Location;
  merchant?: User;
  roomTypes?: RoomType[];
  hotelTags?: { tag: Tag }[];
}

export interface HotelFormData {
  nameZh: string;
  nameEn?: string;
  address: string;
  locationId?: number;
  starRating?: number;
  description?: string;
  facilities?: string[];
  openingYear?: number;
  images?: string[];
  merchantId: number;
}

// 搜索和筛选相关类型
export interface HotelSearchParams {
  locationId?: number;
  status?: HotelStatus;
  tags?: string;
  keyword?: string;
  checkInDate?: string;
  checkOutDate?: string;
  page?: number;
  limit?: number;
}

export interface HotelListResponse {
  success: boolean;
  data: Hotel[];
  total?: number;
  page?: number;
  limit?: number;
}

// 预订相关类型
export type BookingStatus = 'pending' | 'completed' | 'cancelled';

export interface Booking {
  id: number;
  userId?: number;
  hotelId?: number;
  roomTypeId?: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  totalPrice: number;
  status: BookingStatus;
  guestInfo?: any;
  createdAt?: string;
  hotel?: Hotel;
  roomType?: RoomType;
  user?: User;
}

export interface BookingFormData {
  hotelId: number;
  roomTypeId: number;
  checkInDate: string;
  checkOutDate: string;
  guestCount: number;
  guestInfo?: any;
}

// 审核相关类型
export interface HotelAuditLog {
  id: number;
  hotelId: number;
  operatorId?: number;
  oldStatus?: string;
  newStatus: string;
  comment?: string;
  createdAt: string;
  operator?: User;
}

export interface ReviewActionData {
  status: 'published' | 'rejected';
  rejectionReason?: string;
}

// API 响应通用类型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 常量
export const STAR_RATINGS = [1, 2, 3, 4, 5] as const;

export const FACILITIES = [
  '免费WiFi',
  '停车场',
  '游泳池',
  '健身房',
  '餐厅',
  '会议室',
  '商务中心',
  '接送服务',
  '洗衣服务',
  '儿童乐园',
] as const;

export const PRICE_RANGES = [
  { label: '200元以下', min: 0, max: 200 },
  { label: '200-500元', min: 200, max: 500 },
  { label: '500-1000元', min: 500, max: 1000 },
  { label: '1000元以上', min: 1000, max: Infinity },
] as const;

// 快速标签 - 前端写死的，后端也有 Tag 表，这里保留作为常用推荐
export const QUICK_TAGS = [
  '亲子',
  '豪华',
  '商务',
  '度假',
  '经济型',
  '温泉',
] as const;
