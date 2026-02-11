import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { getBookingById, cancelBooking } from '../../services/booking';
import { formatDate, formatPrice } from '../../utils/format';
import { DEFAULT_HOTEL_IMAGE } from '../../config/images';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../utils/useTheme'
import './index.css';
import AiChatWidget from '../../components/AiChatWidget';

function OrderDetail() {
  const { cssVars } = useTheme()
  const router = useRouter();
  const orderId = router.params.id;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrderDetail();
    }
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      const res = await getBookingById(orderId);

      if (res.success && res.data) {
        const rawData = res.data;

        // 处理图片
        let hotelImage = DEFAULT_HOTEL_IMAGE;
        if (rawData.hotel?.images) {
          try {
            const images = typeof rawData.hotel.images === 'string'
              ? JSON.parse(rawData.hotel.images)
              : rawData.hotel.images;
            if (Array.isArray(images) && images.length > 0) {
              hotelImage = images[0];
            }
          } catch (e) {
            console.error('解析图片失败:', e);
          }
        }

        const orderData = {
          id: rawData.id,
          orderNo: `ORD${String(rawData.id).padStart(8, '0')}`,
          hotelName: rawData.hotel?.nameZh || rawData.hotel?.name || '未知酒店',
          hotelAddress: rawData.hotel?.address || '地址未知',
          hotelImage: hotelImage,
          roomType: rawData.roomType?.name || '未知房型',
          checkInDate: formatDate(rawData.checkInDate, 'YYYY-MM-DD'),
          checkOutDate: formatDate(rawData.checkOutDate, 'YYYY-MM-DD'),
          guestCount: rawData.guestCount || 1,
          guestName: rawData.guestName || '-',
          guestPhone: rawData.guestPhone || '-',
          specialRequests: rawData.specialRequests || '无',
          totalPrice: formatPrice(rawData.totalPrice || 0),
          status: rawData.status || 'pending',
          statusText: getStatusText(rawData.status),
          statusColor: getStatusColor(rawData.status),
          createdAt: formatDate(rawData.createdAt, 'YYYY-MM-DD HH:mm:ss'),
          arrivalTime: rawData.arrivalTime || '14:00-18:00'
        };

        setOrder(orderData);
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
      Taro.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': '待确认',
      'confirmed': '已确认',
      'cancelled': '已取消',
      'completed': '已完成'
    };
    return statusMap[status] || status;
  };

  const getStatusColor = (status) => {
    const colorMap = {
      'pending': '#ff9800',
      'confirmed': '#4caf50',
      'cancelled': '#999',
      'completed': '#2196f3'
    };
    return colorMap[status] || '#999';
  };

  const getNightCount = () => {
    if (!order) return 0;
    const checkIn = new Date(order.checkInDate);
    const checkOut = new Date(order.checkOutDate);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleCancelOrder = () => {
    Taro.showModal({
      title: '取消订单',
      content: `确定要取消【${order.hotelName}】的订单吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await cancelBooking(orderId);

            if (result.success) {
              Taro.showToast({
                title: '取消成功',
                icon: 'success'
              });
              // 重新加载订单详情
              loadOrderDetail();
            }
          } catch (error) {
            console.error('取消订单失败:', error);
            Taro.showToast({
              title: '取消失败，请重试',
              icon: 'none'
            });
          }
        }
      }
    });
  };

  const handleContactHotel = () => {
    Taro.makePhoneCall({
      phoneNumber: '400-123-4567'
    });
  };

  const handleNavigateToHotel = () => {
    if (order && order.hotelAddress) {
      Taro.showToast({
        title: `地址: ${order.hotelAddress}`,
        icon: 'none',
        duration: 3000
      });
    }
  };

  if (loading) {
    return (
      <View className='order-detail-container' style={cssVars}>
        <LoadingSpinner text='加载订单详情...' fullScreen />
      </View>
    );
  }

  if (!order) {
    return (
      <View className='order-detail-container' style={cssVars}>
        <View className='error-container'>
          <Text className='error-text'>订单不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className='order-detail-container' style={cssVars}>
      {/* 订单状态卡片 */}
      <View className='status-card'>
        <View className='status-icon-wrapper'>
          <Text className='status-icon'>{order.status === 'confirmed' ? '✓' : order.status === 'cancelled' ? '✕' : '⏱'}</Text>
        </View>
        <Text className='status-text' style={{ color: order.statusColor }}>{order.statusText}</Text>
        <Text className='order-no'>订单号: {order.orderNo}</Text>
      </View>

      {/* 酒店信息卡片 */}
      <View className='hotel-card'>
        <View className='hotel-header'>
          <Text className='section-title'>酒店信息</Text>
        </View>
        <View className='hotel-content'>
          <Image className='hotel-image' src={order.hotelImage} mode='aspectFill' />
          <View className='hotel-info'>
            <Text className='hotel-name'>{order.hotelName}</Text>
            <Text className='hotel-address'>{order.hotelAddress}</Text>
          </View>
        </View>
        <View className='hotel-actions'>
          <View className='action-btn' onClick={handleContactHotel}>
            <Text className='action-icon'>📞</Text>
            <Text className='action-text'>联系酒店</Text>
          </View>
          <View className='action-btn' onClick={handleNavigateToHotel}>
            <Text className='action-icon'>📍</Text>
            <Text className='action-text'>查看位置</Text>
          </View>
        </View>
      </View>

      {/* 入住信息卡片 */}
      <View className='info-card'>
        <Text className='section-title'>入住信息</Text>
        <View className='info-row'>
          <Text className='info-label'>房型</Text>
          <Text className='info-value'>{order.roomType}</Text>
        </View>
        <View className='info-row'>
          <Text className='info-label'>入住日期</Text>
          <Text className='info-value'>{order.checkInDate}</Text>
        </View>
        <View className='info-row'>
          <Text className='info-label'>离店日期</Text>
          <Text className='info-value'>{order.checkOutDate}</Text>
        </View>
        <View className='info-row'>
          <Text className='info-label'>入住天数</Text>
          <Text className='info-value'>{getNightCount()}晚</Text>
        </View>
        <View className='info-row'>
          <Text className='info-label'>入住人数</Text>
          <Text className='info-value'>{order.guestCount}人</Text>
        </View>
        <View className='info-row'>
          <Text className='info-label'>预计到店</Text>
          <Text className='info-value'>{order.arrivalTime}</Text>
        </View>
      </View>

      {/* 入住人信息卡片 */}
      <View className='info-card'>
        <Text className='section-title'>入住人信息</Text>
        <View className='info-row'>
          <Text className='info-label'>姓名</Text>
          <Text className='info-value'>{order.guestName}</Text>
        </View>
        <View className='info-row'>
          <Text className='info-label'>手机号</Text>
          <Text className='info-value'>{order.guestPhone}</Text>
        </View>
        <View className='info-row'>
          <Text className='info-label'>特殊需求</Text>
          <Text className='info-value'>{order.specialRequests}</Text>
        </View>
      </View>

      {/* 费用信息卡片 */}
      <View className='info-card'>
        <Text className='section-title'>费用信息</Text>
        <View className='info-row'>
          <Text className='info-label'>房费</Text>
          <Text className='info-value'>{order.totalPrice}</Text>
        </View>
        <View className='price-total-row'>
          <Text className='total-label'>订单总额</Text>
          <View className='total-price'>
            <Text className='price-symbol'>¥</Text>
            <Text className='price-amount'>{order.totalPrice.replace('¥', '')}</Text>
          </View>
        </View>
      </View>

      {/* 订单时间 */}
      <View className='time-info'>
        <Text className='time-text'>下单时间: {order.createdAt}</Text>
      </View>

      {/* 底部操作栏 */}
      {order.status === 'pending' && (
        <View className='footer-actions'>
          <Button className='footer-btn cancel-btn' onClick={handleCancelOrder}>
            取消订单
          </Button>
          <Button className='footer-btn contact-btn' onClick={handleContactHotel}>
            联系客服
          </Button>
        </View>
      )}

      {order.status === 'confirmed' && (
        <View className='footer-actions'>
          <Button className='footer-btn contact-btn' onClick={handleContactHotel}>
            联系酒店
          </Button>
        </View>
      )}
      <AiChatWidget />
    </View>
  );
}

export default OrderDetail;
