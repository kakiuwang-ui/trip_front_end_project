import React from 'react';
import { View, Text } from '@tarojs/components';
import './index.css';

/**
 * 加载动画组件
 * @param {string} text - 加载提示文本
 * @param {boolean} fullScreen - 是否全屏显示
 */
function LoadingSpinner({ text = '加载中...', fullScreen = false }) {
  return (
    <View className={`loading-container ${fullScreen ? 'fullscreen' : ''}`}>
      <View className='loading-spinner'>
        <View className='spinner-dot'></View>
        <View className='spinner-dot'></View>
        <View className='spinner-dot'></View>
      </View>
      {text && <Text className='loading-text'>{text}</Text>}
    </View>
  );
}

export default LoadingSpinner;
