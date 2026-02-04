import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { login } from '../../services/auth';
import './index.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    // 表单验证
    if (!email.trim()) {
      Taro.showToast({
        title: '请输入邮箱',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    if (!password.trim()) {
      Taro.showToast({
        title: '请输入密码',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    // 简单的邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Taro.showToast({
        title: '邮箱格式不正确',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    try {
      setLoading(true);
      const res = await login({
        username: email,
        password: password
      });

      if (res.success) {
        Taro.showToast({
          title: '登录成功',
          icon: 'success',
          duration: 1500
        });

        // 延迟返回上一页
        setTimeout(() => {
          Taro.navigateBack();
        }, 1500);
      }
    } catch (error) {
      console.error('登录失败:', error);
      Taro.showToast({
        title: error.message || '登录失败，请重试',
        icon: 'none',
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = () => {
    Taro.navigateTo({
      url: '/pages/register/index'
    });
  };

  return (
    <View className='login-container'>
      <View className='login-header'>
        <Text className='login-title'>易宿酒店</Text>
        <Text className='login-subtitle'>欢迎回来</Text>
      </View>

      <View className='login-form'>
        <View className='form-item'>
          <Text className='form-label'>邮箱</Text>
          <Input
            className='form-input'
            type='text'
            placeholder='请输入邮箱'
            placeholderClass='input-placeholder'
            value={email}
            onInput={(e) => setEmail(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>密码</Text>
          <Input
            className='form-input'
            type='password'
            placeholder='请输入密码'
            placeholderClass='input-placeholder'
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
          />
        </View>

        <View className='form-tips'>
          <Text className='tips-text'>测试账号: user@trip.com / password123</Text>
        </View>

        <Button
          className='login-btn'
          loading={loading}
          disabled={loading}
          onClick={handleLogin}
        >
          {loading ? '登录中...' : '登录'}
        </Button>

        <View className='register-link-wrapper'>
          <Text className='register-text'>还没有账号？</Text>
          <Text className='register-link' onClick={handleRegister}>
            立即注册
          </Text>
        </View>
      </View>
    </View>
  );
}

export default Login;
