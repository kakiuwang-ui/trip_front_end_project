import React, { useState, useEffect } from 'react';
import { View, Text, Button } from '@tarojs/components';
import Taro, { useDidShow } from '@tarojs/taro';
import { logout } from '../../services/auth';
import { getMyFavorites } from '../../services/favorite';
import { getMyBookings } from '../../services/booking';
import { storage } from '../../utils/storage';
import { useTheme } from '../../utils/useTheme';
import { getSavedTheme, saveTheme, resolveTheme, applyNativeTheme, THEME } from '../../utils/theme';
import AiChatWidget from '../../components/AiChatWidget';
import './index.css';

function Mine() {
  const { cssVars, isDark } = useTheme();

  // 主题偏好状态
  const [themePreference, setThemePreference] = useState(getSavedTheme());

  // 选择主题
  const handleThemeSelect = (pref) => {
    setThemePreference(pref);
    saveTheme(pref);
    const resolved = resolveTheme();
    applyNativeTheme(resolved);
    Taro.eventCenter.trigger('themeChanged', resolved);
  };

  // 登录状态和用户信息
  const [isLogin, setIsLogin] = useState(false);
  const [user, setUser] = useState(null);

  // 统计数据
  const [favoriteCount, setFavoriteCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  // 检查登录状态（首次加载）
  useEffect(() => {
    checkAuth();
  }, []);

  // 监听页面显示（从登录页返回时刷新状态）
  useDidShow(() => {
    checkAuth();
    if (storage.isAuthenticated()) {
      loadUserStats();
    }
  });

  // 检查认证状态
  const checkAuth = () => {
    const loggedIn = storage.isAuthenticated();
    setIsLogin(loggedIn);

    if (loggedIn) {
      const userInfo = storage.getUser();
      setUser(userInfo);
    } else {
      setFavoriteCount(0);
      setOrderCount(0);
    }
  };

  // 加载用户统计数据
  const loadUserStats = async () => {
    try {
      const [favoritesRes, bookingsRes] = await Promise.all([
        getMyFavorites(),
        getMyBookings()
      ]);

      if (favoritesRes.success && favoritesRes.data) {
        setFavoriteCount(favoritesRes.data.length);
      }

      if (bookingsRes.success && bookingsRes.data) {
        setOrderCount(bookingsRes.data.length);
      }
    } catch (error) {
      console.error('❌ 加载用户统计数据失败:', error);
    }
  };

  // 处理登录按钮点击
  const handleLogin = () => {
    Taro.navigateTo({ url: '/pages/login/index' });
  };

  // 处理注册按钮点击
  const handleRegister = () => {
    Taro.navigateTo({ url: '/pages/register/index' });
  };

  // 处理我的收藏点击
  const handleMyFavorites = () => {
    if (!isLogin) {
      Taro.showToast({ title: '请先登录', icon: 'none' });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1500);
      return;
    }
    Taro.navigateTo({ url: '/pages/favoriteList/index' });
  };

  // 处理退出登录
  const handleLogout = () => {
    Taro.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          await logout();
          setIsLogin(false);
          setUser(null);
        }
      }
    });
  };

  // 跳转到订单列表
  const handleMyOrders = () => {
    if (!isLogin) {
      Taro.showToast({ title: '请先登录', icon: 'none', duration: 1500 });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1500);
      return;
    }

    Taro.navigateTo({ url: '/pages/orderList/index' });
  };

  return (
<View className='mine-container' style={cssVars}>
{/* 1.顶部用户信息区域 */}
<View className='user-header-box'>
<View className='avatar-placeholder-circle'></View>
<View className='user-text-info'>
<Text className='user-name-title'>{isLogin && user ? user.name : '未登录'}</Text>
<Text className='user-sub-status'>{isLogin ? '欢迎回来' : '点击下方按钮登录'}</Text>
</View>
</View>

{/* 2.横向导航菜单 (收藏、订单、积分、优惠券) */}
<View className='mine-nav-row'>
<View className='nav-menu-item' onClick={handleMyFavorites}>
<Text className='nav-val-num'>{favoriteCount}</Text>
<Text className='nav-label-text'>我的收藏</Text>
</View>
<View className='nav-menu-item' onClick={handleMyOrders}>
<Text className='nav-val-num'>{orderCount}</Text>
<Text className='nav-label-text'>我的订单</Text>
</View>
<View className='nav-menu-item'>
<Text className='nav-val-num'>0</Text>
<Text className='nav-label-text'>积分</Text>
</View>
<View className='nav-menu-item'>
<Text className='nav-val-num'>0</Text>
<Text className='nav-label-text'>优惠券</Text>
</View>
</View>

{/* 3.登录与注册按钮区域 / 退出登录按钮 */}
{!isLogin ? (
<View className='auth-action-group'>
<Button className='mine-btn-login' onClick={handleLogin}>
立即登录
</Button>
<Button className='mine-btn-register' onClick={handleRegister}>
注册账号
</Button>
</View>
) : (
<View className='auth-action-group'>
<Button className='mine-btn-logout' onClick={handleLogout}>
退出登录
</Button>
</View>
)}

{/* 4.底部常用功能列表 (补充一些酒店常用入口) */}
<View className='common-list-section'>
<View className='list-cell-row'>
<Text className='cell-left-text'>我的评价</Text>
<Text className='cell-arrow-right'>{'>'}</Text>
</View>
<View className='list-cell-row'>
<Text className='cell-left-text'>意见反馈</Text>
<Text className='cell-arrow-right'>{'>'}</Text>
</View>
<View className='list-cell-row'>
<Text className='cell-left-text'>关于系统</Text>
<Text className='cell-arrow-right'>{'>'}</Text>
</View>
<View className='list-cell-row no-border theme-picker-row'>
<Text className='cell-left-text'>显示模式</Text>
<View className='theme-seg-ctrl'>
  <View
    className={`theme-seg-item${themePreference === THEME.LIGHT ? ' theme-seg-active' : ''}`}
    onClick={() => handleThemeSelect(THEME.LIGHT)}
  >
    <Text className='theme-seg-icon'>☀️</Text>
    <Text className='theme-seg-label'>浅色</Text>
  </View>
  <View
    className={`theme-seg-item${themePreference === THEME.SYSTEM ? ' theme-seg-active' : ''}`}
    onClick={() => handleThemeSelect(THEME.SYSTEM)}
  >
    <Text className='theme-seg-icon'>🌐</Text>
    <Text className='theme-seg-label'>跟随</Text>
  </View>
  <View
    className={`theme-seg-item${themePreference === THEME.DARK ? ' theme-seg-active' : ''}`}
    onClick={() => handleThemeSelect(THEME.DARK)}
  >
    <Text className='theme-seg-icon'>🌙</Text>
    <Text className='theme-seg-label'>深色</Text>
  </View>
</View>
</View>
</View>

{/* AI 助手悬浮按钮 */}
<AiChatWidget />
</View>
  );
}

export default Mine; // 最底部补全：Taro/React必须默认导出组件才能识别