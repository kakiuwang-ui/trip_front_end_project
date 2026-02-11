/**
 * 主题管理工具
 * 支持：跟随系统 / 手动亮色 / 手动深色
 * 对齐 YouTube --yt-spec-* 方案：CSS 变量集中管理，切换时通过 style 注入根节点
 */
import Taro from '@tarojs/taro';
import { storage } from './storage';

export const THEME = {
  SYSTEM: 'system',
  LIGHT: 'light',
  DARK: 'dark',
};

const THEME_KEY = 'app_theme';

/**
 * CSS 变量 Token 映射（单一数据源）
 * 命名规范：--color-[功能]-[层级]，语义化，不含颜色词
 */
const TOKENS = {
  light: {
    '--color-primary': '#1677ff',
    '--color-header-bg': '#1677ff',
    '--color-bg-base': '#ffffff',
    '--color-bg-secondary': '#f8f9fa',
    '--color-bg-tertiary': '#f0f2f5',
    '--color-card-bg': '#ffffff',
    '--color-text-primary': '#1a1a1a',
    '--color-text-secondary': '#666666',
    '--color-text-tertiary': '#999999',
    '--color-text-disabled': '#cccccc',
    '--color-border-base': '#e5e7eb',
    '--color-border-light': '#f0f2f5',
    '--color-border-dark': '#d1d5db',
    '--shadow-sm': '0 2rpx 8rpx rgba(0,0,0,0.04)',
    '--shadow-md': '0 4rpx 16rpx rgba(0,0,0,0.08)',
    '--shadow-lg': '0 8rpx 24rpx rgba(0,0,0,0.12)',
  },
  dark: {
    '--color-primary': '#4a90e2',
    '--color-header-bg': '#1a2332',
    '--color-bg-base': '#1a1a1a',
    '--color-bg-secondary': '#242424',
    '--color-bg-tertiary': '#2a2a2a',
    '--color-card-bg': '#242424',
    '--color-text-primary': '#e0e0e0',
    '--color-text-secondary': '#a0a0a0',
    '--color-text-tertiary': '#666666',
    '--color-text-disabled': '#444444',
    '--color-border-base': '#333333',
    '--color-border-light': '#2a2a2a',
    '--color-border-dark': '#444444',
    '--shadow-sm': '0 2rpx 8rpx rgba(0,0,0,0.3)',
    '--shadow-md': '0 4rpx 16rpx rgba(0,0,0,0.4)',
    '--shadow-lg': '0 8rpx 24rpx rgba(0,0,0,0.5)',
  },
};

export function getSavedTheme() {
  return storage.get(THEME_KEY, THEME.SYSTEM);
}

export function saveTheme(theme) {
  storage.set(THEME_KEY, theme);
}

export function getSystemIsDark() {
  try {
    return Taro.getSystemInfoSync().theme === 'dark';
  } catch {
    return false;
  }
}

/**
 * 根据用户偏好和系统主题，解析出实际应使用的主题
 * @returns {'light'|'dark'}
 */
export function resolveTheme() {
  const saved = getSavedTheme();
  if (saved === THEME.LIGHT) return 'light';
  if (saved === THEME.DARK) return 'dark';
  return getSystemIsDark() ? 'dark' : 'light';
}

/**
 * 生成 CSS 变量字符串，绑定到页面根 View 的 style 属性
 * 等同于 YouTube 在 <html> 节点上注入 --yt-spec-* 变量
 * @param {'light'|'dark'} resolvedTheme
 * @returns {string} 如 "--color-bg-base:#1a1a1a;--color-text-primary:#e0e0e0"
 */
export function getThemeCssVars(resolvedTheme) {
  const tokens = TOKENS[resolvedTheme] || TOKENS.light;
  return Object.entries(tokens)
    .map(([k, v]) => `${k}:${v}`)
    .join(';');
}

/**
 * 应用原生 UI 主题（NavigationBar + TabBar）
 * 必须在每个页面 useDidShow 中调用，因为 setNavigationBarColor 是页面级 API
 * @param {'light'|'dark'} resolvedTheme
 */
export function applyNativeTheme(resolvedTheme) {
  const isDark = resolvedTheme === 'dark';

  Taro.setNavigationBarColor({
    frontColor: '#ffffff',
    backgroundColor: isDark ? '#0d1117' : '#1677ff',
    animation: { duration: 200, timingFunc: 'linear' },
  });

  try {
    Taro.setTabBarStyle({
      color: isDark ? '#888888' : '#999999',
      selectedColor: isDark ? '#4a90e2' : '#1677ff',
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderStyle: isDark ? 'white' : 'black',
    });
  } catch {
    // 部分平台/页面不支持 setTabBarStyle，静默忽略
  }
}
