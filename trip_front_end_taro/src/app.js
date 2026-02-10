// src/app.js
import React, { useEffect } from 'react';
import Taro from '@tarojs/taro';
import { LanguageProvider } from './context/LanguageContext';
import './app.css';

// 自定义组件，用于处理语言相关的全局逻辑
const AppContent = ({ children }) => {
  const { lang } = require('./context/LanguageContext').useLanguage?.() || { lang: 'zh' };
  
  // 当语言变化时，更新TabBar文本
  useEffect(() => {
    updateTabBarText(lang);
  }, [lang]);
  
  return children;
};

// 更新TabBar文本的函数
const updateTabBarText = (lang) => {
  try {
    if (lang === 'zh') {
      // 中文TabBar
      Taro.setTabBarItem({
        index: 0,
        text: '首页'
      });
      Taro.setTabBarItem({
        index: 1,
        text: '搜索'
      });
      Taro.setTabBarItem({
        index: 2,
        text: '我的'
      });
    } else {
      // 英文TabBar
      Taro.setTabBarItem({
        index: 0,
        text: 'Home'
      });
      Taro.setTabBarItem({
        index: 1,
        text: 'Search'
      });
      Taro.setTabBarItem({
        index: 2,
        text: 'Mine'
      });
    }
  } catch (error) {
    console.log('更新TabBar失败，可能当前页面不是TabBar页面:', error);
  }
};

// 主App组件
function App(props) {
  // 在应用启动时初始化语言设置
  useEffect(() => {
    // 可以在这里做一些全局初始化操作
    console.log('App启动');
    
    // 尝试从缓存获取语言设置
    const lang = Taro.getStorageSync('language') || 'zh';
    
    // 延迟更新TabBar，确保页面已加载
    setTimeout(() => {
      updateTabBarText(lang);
    }, 500);
  }, []);

  return (
    <LanguageProvider>
      <AppContent>
        {props.children}
      </AppContent>
    </LanguageProvider>
  );
}

export default App;