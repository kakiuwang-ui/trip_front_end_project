/**
 * 格式化工具函数
 * 提供日期、价格、数字等格式化方法
 */
import dayjs from 'dayjs';

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @param {string} format - 格式化模板，默认 'YYYY-MM-DD'
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  if (!date) return '';
  return dayjs(date).format(format);
};

/**
 * 格式化日期为中文
 * @param {string|Date} date - 日期
 * @returns {string} 如 "2月3日"
 */
export const formatDateCN = (date) => {
  if (!date) return '';
  return dayjs(date).format('M月D日');
};

/**
 * 格式化日期时间
 * @param {string|Date} datetime - 日期时间
 * @returns {string} 如 "2025-02-03 14:30"
 */
export const formatDateTime = (datetime) => {
  if (!datetime) return '';
  return dayjs(datetime).format('YYYY-MM-DD HH:mm');
};

/**
 * 计算两个日期之间的天数
 * @param {string|Date} startDate - 开始日期
 * @param {string|Date} endDate - 结束日期
 * @returns {number} 天数
 */
export const calculateDays = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  return dayjs(endDate).diff(dayjs(startDate), 'day');
};

/**
 * 计算晚数（酒店入住晚数）
 * @param {string|Date} checkIn - 入住日期
 * @param {string|Date} checkOut - 离店日期
 * @returns {number} 晚数
 */
export const calculateNights = (checkIn, checkOut) => {
  return calculateDays(checkIn, checkOut);
};

/**
 * 格式化价格
 * @param {number|string} price - 价格
 * @param {boolean} showSymbol - 是否显示货币符号，默认 true
 * @returns {string} 格式化后的价格，如 "¥899"
 */
export const formatPrice = (price, showSymbol = true) => {
  if (price === undefined || price === null) return '-';

  const numPrice = Number(price);
  if (isNaN(numPrice)) return '-';

  const formatted = numPrice.toFixed(0);
  return showSymbol ? `¥${formatted}` : formatted;
};

/**
 * 格式化价格范围
 * @param {number} minPrice - 最低价
 * @param {number} maxPrice - 最高价
 * @returns {string} 如 "¥200-¥500"
 */
export const formatPriceRange = (minPrice, maxPrice) => {
  if (!minPrice && !maxPrice) return '-';
  if (!maxPrice || minPrice === maxPrice) return formatPrice(minPrice);
  return `${formatPrice(minPrice)}-${formatPrice(maxPrice)}`;
};

/**
 * 格式化星级为星星符号
 * @param {number} rating - 星级数字 (1-5)
 * @returns {string} 星星符号，如 "⭐⭐⭐⭐⭐"
 */
export const formatStars = (rating) => {
  if (!rating || rating < 1) return '';
  const stars = Math.min(Math.max(Math.floor(rating), 1), 5);
  return '⭐'.repeat(stars);
};

/**
 * 格式化评分
 * @param {number} score - 评分 (0-5)
 * @param {number} decimals - 小数位数，默认 1
 * @returns {string} 如 "4.8"
 */
export const formatScore = (score, decimals = 1) => {
  if (score === undefined || score === null) return '-';
  return Number(score).toFixed(decimals);
};

/**
 * 格式化数量（大数简写）
 * @param {number} num - 数量
 * @returns {string} 如 "1.2万"、"1000"
 */
export const formatCount = (num) => {
  if (!num || num < 0) return '0';

  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }

  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k';
  }

  return num.toString();
};

/**
 * 格式化手机号（中间隐藏）
 * @param {string} phone - 手机号
 * @returns {string} 如 "138****8888"
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const phoneStr = phone.toString();
  if (phoneStr.length !== 11) return phone;
  return phoneStr.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
};

/**
 * 格式化相对时间
 * @param {string|Date} time - 时间
 * @returns {string} 如 "刚刚"、"5分钟前"、"2小时前"
 */
export const formatRelativeTime = (time) => {
  if (!time) return '';

  const now = dayjs();
  const target = dayjs(time);
  const diffMinutes = now.diff(target, 'minute');
  const diffHours = now.diff(target, 'hour');
  const diffDays = now.diff(target, 'day');

  if (diffMinutes < 1) return '刚刚';
  if (diffMinutes < 60) return `${diffMinutes}分钟前`;
  if (diffHours < 24) return `${diffHours}小时前`;
  if (diffDays < 7) return `${diffDays}天前`;

  return formatDate(time);
};

/**
 * 截断文本
 * @param {string} text - 文本
 * @param {number} maxLength - 最大长度
 * @param {string} ellipsis - 省略符号，默认 '...'
 * @returns {string} 截断后的文本
 */
export const truncateText = (text, maxLength, ellipsis = '...') => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + ellipsis;
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @returns {string} 如 "1.5 MB"
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
};

/**
 * 判断是否是今天
 * @param {string|Date} date - 日期
 * @returns {boolean}
 */
export const isToday = (date) => {
  return dayjs(date).isSame(dayjs(), 'day');
};

/**
 * 判断是否是明天
 * @param {string|Date} date - 日期
 * @returns {boolean}
 */
export const isTomorrow = (date) => {
  return dayjs(date).isSame(dayjs().add(1, 'day'), 'day');
};

/**
 * 获取星期几
 * @param {string|Date} date - 日期
 * @returns {string} 如 "周一"
 */
export const getWeekday = (date) => {
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weekdays[dayjs(date).day()];
};
