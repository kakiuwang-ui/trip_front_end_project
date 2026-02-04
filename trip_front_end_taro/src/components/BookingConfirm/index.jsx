import React, { useState } from 'react';
import { View, Text, Input, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.css';

/**
 * 预订确认组件
 * @param {boolean} visible - 是否显示
 * @param {object} hotel - 酒店信息
 * @param {object} room - 房型信息
 * @param {string} checkIn - 入住日期
 * @param {string} checkOut - 离店日期
 * @param {number} nights - 住宿晚数
 * @param {number} totalPrice - 总价
 * @param {function} onClose - 关闭回调
 * @param {function} onConfirm - 确认回调
 */
function BookingConfirm({
  visible,
  hotel,
  room,
  checkIn,
  checkOut,
  nights,
  totalPrice,
  onClose,
  onConfirm
}) {
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestCount, setGuestCount] = useState(1);
  const [specialRequests, setSpecialRequests] = useState('');
  const [arrivalTime, setArrivalTime] = useState('14:00-18:00');

  if (!visible) return null;

  // 验证手机号
  const validatePhone = (phone) => {
    return /^1[3-9]\d{9}$/.test(phone);
  };

  // 确认预订
  const handleConfirm = () => {
    // 验证必填项
    if (!guestName.trim()) {
      Taro.showToast({
        title: '请填写入住人姓名',
        icon: 'none'
      });
      return;
    }

    if (!guestPhone.trim()) {
      Taro.showToast({
        title: '请填写联系电话',
        icon: 'none'
      });
      return;
    }

    if (!validatePhone(guestPhone)) {
      Taro.showToast({
        title: '请填写正确的手机号码',
        icon: 'none'
      });
      return;
    }

    // 返回预订数据
    onConfirm({
      guestName,
      guestPhone,
      guestCount,
      specialRequests,
      arrivalTime
    });
  };

  return (
    <View className='booking-confirm-mask' onClick={onClose}>
      <View className='booking-confirm-content' onClick={(e) => e.stopPropagation()}>
        {/* 标题栏 */}
        <View className='confirm-header'>
          <Text className='confirm-title'>确认预订</Text>
          <Text className='confirm-close' onClick={onClose}>×</Text>
        </View>

        {/* 酒店信息 */}
        <View className='confirm-section'>
          <Text className='section-title'>酒店信息</Text>
          <View className='hotel-summary'>
            <Text className='hotel-name'>{hotel?.name}</Text>
            <Text className='room-name'>{room?.name}</Text>
          </View>
        </View>

        {/* 入住信息 */}
        <View className='confirm-section'>
          <Text className='section-title'>入住信息</Text>
          <View className='date-summary'>
            <View className='date-item'>
              <Text className='date-label'>入住</Text>
              <Text className='date-value'>{checkIn}</Text>
            </View>
            <Text className='date-nights'>{nights}晚</Text>
            <View className='date-item'>
              <Text className='date-label'>离店</Text>
              <Text className='date-value'>{checkOut}</Text>
            </View>
          </View>
        </View>

        {/* 入住人信息 */}
        <View className='confirm-section'>
          <Text className='section-title'>入住人信息</Text>
          <View className='form-item'>
            <Text className='form-label'>姓名 *</Text>
            <Input
              className='form-input'
              placeholder='请输入入住人姓名'
              value={guestName}
              onInput={(e) => setGuestName(e.detail.value)}
            />
          </View>
          <View className='form-item'>
            <Text className='form-label'>手机号 *</Text>
            <Input
              className='form-input'
              type='number'
              placeholder='请输入手机号'
              maxlength={11}
              value={guestPhone}
              onInput={(e) => setGuestPhone(e.detail.value)}
            />
          </View>
          <View className='form-item'>
            <Text className='form-label'>入住人数</Text>
            <View className='guest-count-selector'>
              <Text
                className='count-btn'
                onClick={() => setGuestCount(Math.max(1, guestCount - 1))}
              >
                -
              </Text>
              <Text className='count-value'>{guestCount}</Text>
              <Text
                className='count-btn'
                onClick={() => setGuestCount(Math.min(4, guestCount + 1))}
              >
                +
              </Text>
            </View>
          </View>
        </View>

        {/* 预计到店时间 */}
        <View className='confirm-section'>
          <Text className='section-title'>预计到店时间</Text>
          <View className='time-options'>
            {['14:00-18:00', '18:00-22:00', '22:00后'].map((time) => (
              <Text
                key={time}
                className={`time-option ${arrivalTime === time ? 'active' : ''}`}
                onClick={() => setArrivalTime(time)}
              >
                {time}
              </Text>
            ))}
          </View>
        </View>

        {/* 特殊需求 */}
        <View className='confirm-section'>
          <Text className='section-title'>特殊需求（选填）</Text>
          <Input
            className='form-textarea'
            placeholder='如需高楼层、安静房间等，请在此备注'
            value={specialRequests}
            onInput={(e) => setSpecialRequests(e.detail.value)}
            maxlength={200}
          />
          <Text className='input-hint'>{specialRequests.length}/200</Text>
        </View>

        {/* 价格明细 */}
        <View className='confirm-section'>
          <Text className='section-title'>价格明细</Text>
          <View className='price-detail'>
            <View className='price-row'>
              <Text className='price-label'>房费 × {nights}晚</Text>
              <Text className='price-value'>¥{room?.price * nights}</Text>
            </View>
            <View className='price-row total'>
              <Text className='price-label'>总计</Text>
              <View className='total-price'>
                <Text className='price-symbol'>¥</Text>
                <Text className='price-amount'>{totalPrice}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 底部按钮 */}
        <View className='confirm-footer'>
          <Button className='footer-btn cancel' onClick={onClose}>
            取消
          </Button>
          <Button className='footer-btn confirm' onClick={handleConfirm}>
            确认预订
          </Button>
        </View>
      </View>
    </View>
  );
}

export default BookingConfirm;
