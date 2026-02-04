import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { getMyBookings, cancelBooking } from '../../services/booking';
import { formatDate, formatPrice } from '../../utils/format';
import { storage } from '../../utils/storage';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import './index.css';

function OrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // all, pending, confirmed, cancelled

  useEffect(() => {
    checkAuthAndLoadOrders();
  }, []);

  const checkAuthAndLoadOrders = async () => {
    // 检查登录状态
    if (!storage.isAuthenticated()) {
      Taro.showToast({
        title: '请先登录',
        icon: 'none',
        duration: 1500
      });
      setTimeout(() => {
        Taro.navigateTo({ url: '/pages/login/index' });
      }, 1500);
      return;
    }

    await loadOrders();
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await getMyBookings();

      if (res.success && res.data) {
        const transformedOrders = res.data.map(order => ({
          id: order.id,
          hotelName: order.hotel?.nameZh || order.hotel?.name || '未知酒店',
          hotelAddress: order.hotel?.address || '地址未知',
          checkInDate: formatDate(order.checkInDate, 'MM月DD日'),
          checkOutDate: formatDate(order.checkOutDate, 'MM月DD日'),
          roomType: order.roomType?.nameZh || order.roomType?.name || '未知房型',
          totalPrice: formatPrice(order.totalPrice || 0),
          status: order.status || 'pending',
          statusText: getStatusText(order.status),
          statusColor: getStatusColor(order.status),
          paymentMethod: '在线支付',
          guestCount: order.guestCount || 1,
          createdAt: formatDate(order.createdAt, 'YYYY-MM-DD HH:mm'),
        }));
        setOrders(transformedOrders);
      }
    } catch (error) {
      console.error('获取订单列表失败:', error);
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

  const handleCancelOrder = (orderId, hotelName) => {
    Taro.showModal({
      title: '取消订单',
      content: `确定要取消【${hotelName}】的订单吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await cancelBooking(orderId);

            if (result.success) {
              Taro.showToast({
                title: '取消成功',
                icon: 'success'
              });
              // 重新加载订单列表
              loadOrders();
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

  const handleOrderDetail = (orderId) => {
    Taro.showToast({
      title: '订单详情功能开发中',
      icon: 'none'
    });
  };

  // 下拉刷新
  usePullDownRefresh(async () => {
    await loadOrders();
    Taro.stopPullDownRefresh();
  });

  // 根据状态筛选订单
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    return order.status === activeTab;
  });

  return (
    <View className='order-list-container'>
      {/* 顶部标签栏 */}
      <View className='order-tabs'>
        <View
          className={`tab-item ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <Text className='tab-text'>全部</Text>
        </View>
        <View
          className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Text className='tab-text'>待确认</Text>
        </View>
        <View
          className={`tab-item ${activeTab === 'confirmed' ? 'active' : ''}`}
          onClick={() => setActiveTab('confirmed')}
        >
          <Text className='tab-text'>已确认</Text>
        </View>
        <View
          className={`tab-item ${activeTab === 'cancelled' ? 'active' : ''}`}
          onClick={() => setActiveTab('cancelled')}
        >
          <Text className='tab-text'>已取消</Text>
        </View>
      </View>

      {/* 订单列表 */}
      <ScrollView scrollY className='order-scroll'>
        {loading ? (
          <LoadingSpinner text='加载订单中...' />
        ) : filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <View key={order.id} className='order-card'>
              {/* 订单头部 */}
              <View className='order-header'>
                <Text className='order-hotel-name'>{order.hotelName}</Text>
                <Text
                  className='order-status'
                  style={{ color: order.statusColor }}
                >
                  {order.statusText}
                </Text>
              </View>

              {/* 订单信息 */}
              <View className='order-content'>
                <View className='order-info-row'>
                  <Text className='info-label'>入住日期</Text>
                  <Text className='info-value'>{order.checkInDate}</Text>
                </View>
                <View className='order-info-row'>
                  <Text className='info-label'>离店日期</Text>
                  <Text className='info-value'>{order.checkOutDate}</Text>
                </View>
                <View className='order-info-row'>
                  <Text className='info-label'>房型</Text>
                  <Text className='info-value'>{order.roomType}</Text>
                </View>
                <View className='order-info-row'>
                  <Text className='info-label'>入住人数</Text>
                  <Text className='info-value'>{order.guestCount}人</Text>
                </View>
                <View className='order-info-row'>
                  <Text className='info-label'>酒店地址</Text>
                  <Text className='info-value address'>{order.hotelAddress}</Text>
                </View>
              </View>

              {/* 订单底部 */}
              <View className='order-footer'>
                <View className='order-price-section'>
                  <Text className='price-label'>订单金额</Text>
                  <Text className='price-value'>{order.totalPrice}</Text>
                </View>
                <View className='order-actions'>
                  {order.status === 'pending' && (
                    <View
                      className='action-btn cancel-btn'
                      onClick={() => handleCancelOrder(order.id, order.hotelName)}
                    >
                      <Text className='btn-text'>取消订单</Text>
                    </View>
                  )}
                  <View
                    className='action-btn detail-btn'
                    onClick={() => handleOrderDetail(order.id)}
                  >
                    <Text className='btn-text'>查看详情</Text>
                  </View>
                </View>
              </View>

              {/* 订单时间 */}
              <View className='order-time'>
                <Text className='time-text'>下单时间: {order.createdAt}</Text>
              </View>
            </View>
          ))
        ) : (
          <EmptyState
            image='📋'
            title='暂无订单'
            description='快去预订心仪的酒店吧~'
            buttonText='去预订'
            onButtonClick={() => Taro.switchTab({ url: '/pages/home/index' })}
          />
        )}
      </ScrollView>
    </View>
  );
}

export default OrderList;
