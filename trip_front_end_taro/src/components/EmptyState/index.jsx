import React from 'react';
import { View, Text, Button } from '@tarojs/components';
import './index.css';

/**
 * 空状态组件
 * @param {string} image - 图片表情
 * @param {string} title - 标题
 * @param {string} description - 描述
 * @param {string} buttonText - 按钮文本
 * @param {function} onButtonClick - 按钮点击回调
 */
function EmptyState({
  image = '🏨',
  title = '暂无数据',
  description = '',
  buttonText = '',
  onButtonClick
}) {
  return (
    <View className='empty-state-container'>
      <Text className='empty-state-image'>{image}</Text>
      <Text className='empty-state-title'>{title}</Text>
      {description && <Text className='empty-state-description'>{description}</Text>}
      {buttonText && (
        <Button className='empty-state-button' onClick={onButtonClick}>
          {buttonText}
        </Button>
      )}
    </View>
  );
}

export default EmptyState;
