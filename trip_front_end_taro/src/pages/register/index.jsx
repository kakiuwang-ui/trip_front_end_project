import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { register } from '../../services/auth';
import './index.css';

function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // 表单验证
    if (!name.trim()) {
      Taro.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    if (!email.trim()) {
      Taro.showToast({
        title: '请输入邮箱',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Taro.showToast({
        title: '邮箱格式不正确',
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

    if (password.length < 6) {
      Taro.showToast({
        title: '密码长度不能少于6位',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    if (password !== confirmPassword) {
      Taro.showToast({
        title: '两次输入的密码不一致',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        name: name,
        email: email,
        password: password,
        role: 'CUSTOMER'
      });

      if (res.success) {
        Taro.showToast({
          title: '注册成功',
          icon: 'success',
          duration: 1500
        });

        // 延迟跳转到登录页
        setTimeout(() => {
          Taro.redirectTo({
            url: '/pages/login/index'
          });
        }, 1500);
      }
    } catch (error) {
      console.error('注册失败:', error);
      Taro.showToast({
        title: error.message || '注册失败，请重试',
        icon: 'none',
        duration: 2000
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    Taro.navigateBack();
  };

  return (
    <View className='register-container'>
      <View className='register-header'>
        <Text className='register-title'>易宿酒店</Text>
        <Text className='register-subtitle'>创建新账号</Text>
      </View>

      <View className='register-form'>
        <View className='form-item'>
          <Text className='form-label'>姓名</Text>
          <Input
            className='form-input'
            type='text'
            placeholder='请输入姓名'
            placeholderClass='input-placeholder'
            value={name}
            onInput={(e) => setName(e.detail.value)}
          />
        </View>

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
            placeholder='请输入密码（至少6位）'
            placeholderClass='input-placeholder'
            value={password}
            onInput={(e) => setPassword(e.detail.value)}
          />
        </View>

        <View className='form-item'>
          <Text className='form-label'>确认密码</Text>
          <Input
            className='form-input'
            type='password'
            placeholder='请再次输入密码'
            placeholderClass='input-placeholder'
            value={confirmPassword}
            onInput={(e) => setConfirmPassword(e.detail.value)}
          />
        </View>

        <Button
          className='register-btn'
          loading={loading}
          disabled={loading}
          onClick={handleRegister}
        >
          {loading ? '注册中...' : '注册'}
        </Button>

        <View className='login-link-wrapper'>
          <Text className='login-text'>已有账号？</Text>
          <Text className='login-link' onClick={handleBackToLogin}>
            立即登录
          </Text>
        </View>
      </View>
    </View>
  );
}

export default Register;
