/**
 * 页面级主题 Hook
 * 返回 cssVars 字符串，绑定到页面根 View 的 style 属性
 * 子组件通过 var(--color-xxx) 自动继承，无需任何改动
 *
 * 使用方式：
 * const { cssVars, isDark } = useTheme();
 * <View className='page-container' style={cssVars}>...</View>
 */
import { useState, useEffect } from 'react';
import Taro, { useDidShow } from '@tarojs/taro';
import { resolveTheme, applyNativeTheme, getThemeCssVars } from './theme';

export function useTheme() {
  const [cssVars, setCssVars] = useState(() => getThemeCssVars(resolveTheme()));
  const [isDark, setIsDark] = useState(() => resolveTheme() === 'dark');

  // 每次页面显示时同步主题（处理从"我的"页面修改后返回的情况）
  useDidShow(() => {
    const resolved = resolveTheme();
    setCssVars(getThemeCssVars(resolved));
    setIsDark(resolved === 'dark');
    applyNativeTheme(resolved);
  });

  // 监听 app.js 广播的主题变化事件（系统主题变化 / 用户手动切换后广播）
  useEffect(() => {
    const handler = (resolved) => {
      setCssVars(getThemeCssVars(resolved));
      setIsDark(resolved === 'dark');
    };
    Taro.eventCenter.on('themeChanged', handler);
    return () => Taro.eventCenter.off('themeChanged', handler);
  }, []);

  return { cssVars, isDark };
}
