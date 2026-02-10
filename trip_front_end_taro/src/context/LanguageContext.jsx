// src/context/LanguageContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import Taro from '@tarojs/taro';
import translations from '../utils/i18n';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState('zh');

  // 初始化语言
  useEffect(() => {
    const currentLang = Taro.getStorageSync('language') || 'zh';
    setLang(currentLang);
  }, []);

  // 切换语言
  const switchLanguage = (targetLang) => {
    if (targetLang && (targetLang === 'zh' || targetLang === 'en')) {
      setLang(targetLang);
      Taro.setStorageSync('language', targetLang);
    }
  };

  // 切换中英文
  const toggleLanguage = () => {
    const newLang = lang === 'zh' ? 'en' : 'zh';
    switchLanguage(newLang);
  };

  // 翻译函数 - 支持参数替换
  const t = useCallback((key, params = {}) => {
    let text = translations[lang] && translations[lang][key] ? translations[lang][key] : key;
    
    // 替换参数
    Object.keys(params).forEach(paramKey => {
      const regex = new RegExp(`{${paramKey}}`, 'g');
      text = text.replace(regex, params[paramKey]);
    });
    
    return text;
  }, [lang]);

  // 获取当前语言显示名称
  const getCurrentLanguageName = () => {
    return lang === 'zh' ? '中文' : 'English';
  };

  return (
    <LanguageContext.Provider value={{ 
      lang, 
      switchLanguage, 
      toggleLanguage,
      t,
      getCurrentLanguageName
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);