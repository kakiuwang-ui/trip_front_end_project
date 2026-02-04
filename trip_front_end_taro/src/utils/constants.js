/**
 * 常量定义
 * 统一管理项目中的常量配置
 */

// ==================== API 配置 ====================

/**
 * API 基础地址
 */
export const API_BASE_URL =
  process.env.TARO_APP_API_BASE_URL || 'http://localhost:3000/api';

// ==================== 城市列表 ====================

/**
 * 支持的城市列表
 * 实际项目中应该从后端 API 获取
 */
export const CITIES = [
  { id: 1, name: '上海', code: 'shanghai' },
  { id: 2, name: '北京', code: 'beijing' },
  { id: 3, name: '广州', code: 'guangzhou' },
  { id: 4, name: '深圳', code: 'shenzhen' },
  { id: 5, name: '杭州', code: 'hangzhou' },
  { id: 6, name: '成都', code: 'chengdu' },
  { id: 7, name: '南京', code: 'nanjing' },
  { id: 8, name: '西安', code: 'xian' },
];

// ==================== 酒店标签 ====================

/**
 * 快捷标签（首页使用）
 */
export const QUICK_TAGS = [
  '外滩',
  '近地铁',
  '免费停车',
  '含早餐',
  '亲子',
  '豪华',
  '商务',
  '浪漫',
];

/**
 * 酒店设施标签
 */
export const FACILITY_TAGS = {
  wifi: 'Wi-Fi',
  parking: '停车场',
  breakfast: '早餐',
  pool: '游泳池',
  gym: '健身房',
  spa: 'SPA',
  restaurant: '餐厅',
  bar: '酒吧',
  meeting: '会议室',
  pets: '可携带宠物',
};

// ==================== 星级定义 ====================

/**
 * 酒店星级列表
 */
export const STAR_RATINGS = [
  { value: 1, label: '一星级' },
  { value: 2, label: '二星级' },
  { value: 3, label: '三星级' },
  { value: 4, label: '四星级' },
  { value: 5, label: '五星级' },
];

// ==================== 价格范围 ====================

/**
 * 价格筛选范围
 */
export const PRICE_RANGES = [
  { min: 0, max: 200, label: '200元以下' },
  { min: 200, max: 500, label: '200-500元' },
  { min: 500, max: 1000, label: '500-1000元' },
  { min: 1000, max: 2000, label: '1000-2000元' },
  { min: 2000, max: null, label: '2000元以上' },
];

// ==================== 订单状态 ====================

/**
 * 预订状态映射
 */
export const BOOKING_STATUS = {
  pending: '待确认',
  confirmed: '已确认',
  checked_in: '已入住',
  checked_out: '已退房',
  cancelled: '已取消',
};

/**
 * 预订状态颜色
 */
export const BOOKING_STATUS_COLOR = {
  pending: '#faad14', // 橙色
  confirmed: '#52c41a', // 绿色
  checked_in: '#1890ff', // 蓝色
  checked_out: '#8c8c8c', // 灰色
  cancelled: '#ff4d4f', // 红色
};

// ==================== 排序方式 ====================

/**
 * 酒店列表排序方式
 */
export const SORT_OPTIONS = [
  { value: 'default', label: '默认排序' },
  { value: 'price_asc', label: '价格从低到高' },
  { value: 'price_desc', label: '价格从高到低' },
  { value: 'rating_desc', label: '评分从高到低' },
  { value: 'distance_asc', label: '距离从近到远' },
];

// ==================== 用户角色 ====================

/**
 * 用户角色
 */
export const USER_ROLES = {
  USER: 'USER',
  MERCHANT: 'MERCHANT',
  ADMIN: 'ADMIN',
};

/**
 * 用户角色名称
 */
export const USER_ROLE_NAMES = {
  USER: '普通用户',
  MERCHANT: '商户',
  ADMIN: '管理员',
};

// ==================== 房型类型 ====================

/**
 * 房型类型
 */
export const ROOM_TYPES = [
  { value: 'standard', label: '标准间' },
  { value: 'deluxe', label: '豪华间' },
  { value: 'suite', label: '套房' },
  { value: 'family', label: '家庭房' },
  { value: 'business', label: '商务房' },
];

// ==================== 床型 ====================

/**
 * 床型类型
 */
export const BED_TYPES = [
  { value: 'single', label: '单人床' },
  { value: 'double', label: '双人床' },
  { value: 'twin', label: '双床' },
  { value: 'king', label: '大床' },
  { value: 'queen', label: '超大床' },
];

// ==================== 支付方式 ====================

/**
 * 支付方式
 */
export const PAYMENT_METHODS = [
  { value: 'wechat', label: '微信支付', icon: '💚' },
  { value: 'alipay', label: '支付宝', icon: '💙' },
  { value: 'cash', label: '到店支付', icon: '💰' },
];

// ==================== 取消政策 ====================

/**
 * 取消政策类型
 */
export const CANCELLATION_POLICIES = {
  free: '免费取消',
  charge_partial: '部分收费',
  charge_full: '不可取消',
};

// ==================== 默认值 ====================

/**
 * 默认分页大小
 */
export const DEFAULT_PAGE_SIZE = 20;

/**
 * 默认搜索历史最大数量
 */
export const MAX_SEARCH_HISTORY = 10;

/**
 * 默认超时时间（毫秒）
 */
export const DEFAULT_TIMEOUT = 10000;

/**
 * Token 过期时间（小时）
 */
export const TOKEN_EXPIRE_HOURS = 24;

// ==================== 正则表达式 ====================

/**
 * 邮箱正则
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * 手机号正则（中国大陆）
 */
export const PHONE_REGEX = /^1[3-9]\d{9}$/;

/**
 * 密码正则（6-20位，至少包含字母和数字）
 */
export const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,20}$/;

// ==================== 错误消息 ====================

/**
 * 常见错误消息
 */
export const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  SERVER_ERROR: '服务器错误，请稍后重试',
  UNAUTHORIZED: '未登录或登录已过期，请重新登录',
  FORBIDDEN: '没有权限访问该资源',
  NOT_FOUND: '请求的资源不存在',
  VALIDATION_ERROR: '数据验证失败',
  UNKNOWN_ERROR: '未知错误，请联系客服',
};

// ==================== 成功消息 ====================

/**
 * 常见成功消息
 */
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: '登录成功',
  REGISTER_SUCCESS: '注册成功',
  LOGOUT_SUCCESS: '退出成功',
  BOOKING_SUCCESS: '预订成功',
  CANCEL_SUCCESS: '取消成功',
  UPDATE_SUCCESS: '更新成功',
  DELETE_SUCCESS: '删除成功',
};
