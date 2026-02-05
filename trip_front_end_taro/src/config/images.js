/**
 * 图片资源配置
 * 统一管理应用中使用的图片URL
 */

// API服务器地址（根据环境切换）
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://your-domain.com'  // 生产环境使用HTTPS
  : 'http://localhost:3000';    // 开发环境

// 默认酒店图片
export const DEFAULT_HOTEL_IMAGE = `${API_BASE}/uploads/1770189062477-9-2026-02-03185959.png`;

// Banner轮播图
export const BANNER_IMAGES = [
  `${API_BASE}/uploads/1770189062477-9-2026-02-03185959.png`,
  `${API_BASE}/uploads/1770189498058-967-2026-02-03185959.png`,
  `${API_BASE}/uploads/1770189524279-198-2026-01-12155024.png`
];

// 获取图片URL（如果已经是完整URL则直接返回，否则拼接）
export const getImageUrl = (imagePath) => {
  if (!imagePath) return DEFAULT_HOTEL_IMAGE;
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  return `${API_BASE}${imagePath}`;
};

export default {
  DEFAULT_HOTEL_IMAGE,
  BANNER_IMAGES,
  getImageUrl
};
