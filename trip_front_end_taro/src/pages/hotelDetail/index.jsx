import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, Image, ScrollView, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import dayjs from 'dayjs';
import { getHotelById, getHotelRoomTypes } from '../../services/hotel';
import { createBooking } from '../../services/booking';
import { addFavorite, removeFavorite, checkFavorite } from '../../services/favorite';
import { formatPrice, formatStars } from '../../utils/format';
import { storage } from '../../utils/storage';
import Calendar from '../../components/Calendar';
import BookingConfirm from '../../components/BookingConfirm';
import LoadingSpinner from '../../components/LoadingSpinner';
import './index.css';

function HotelDetail() {
  // 获取路由参数
  const router = useRouter();
  const hotelId = router.params.id;
  const checkIn = router.params.checkIn;
  const checkOut = router.params.checkOut;

  // 状态管理
  const [hotel, setHotel] = useState(null);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [headerOpacity, setHeaderOpacity] = useState(0);
  const [showHeaderTitle, setShowHeaderTitle] = useState(false);
  const [startDate, setStartDate] = useState(checkIn || dayjs().format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(checkOut || dayjs().add(1, 'day').format('YYYY-MM-DD'));
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState(null);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // 加载酒店详情和房型数据
  useEffect(() => {
    if (hotelId) {
      loadHotelDetail();
      checkHotelFavorite();
    }
  }, [hotelId]);

  const loadHotelDetail = async () => {
    try {
      setLoading(true);
      console.log('🏨 开始加载酒店详情, hotelId:', hotelId);

      // 加载酒店详情
      const hotelRes = await getHotelById(hotelId);
      console.log('🏨 酒店详情API响应:', hotelRes);

      if (hotelRes.success && hotelRes.data) {
        const rawData = hotelRes.data;

        // 处理设施数据：如果是JSON字符串则解析，否则使用默认值
        let facilitiesList = [];
        if (rawData.facilities) {
          try {
            facilitiesList = typeof rawData.facilities === 'string'
              ? JSON.parse(rawData.facilities)
              : rawData.facilities;
          } catch (e) {
            facilitiesList = ['免费WiFi', '24小时前台', '行李寄存'];
          }
        } else {
          facilitiesList = ['免费WiFi', '24小时前台', '行李寄存'];
        }

        // 处理图片数据
        let imageUrl = 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400';
        if (rawData.images) {
          try {
            const images = typeof rawData.images === 'string'
              ? JSON.parse(rawData.images)
              : rawData.images;
            if (Array.isArray(images) && images.length > 0) {
              imageUrl = images[0];
            }
          } catch (e) {
            // 使用默认图片
          }
        }

        const hotelData = {
          id: rawData.id,
          name: rawData.nameZh || rawData.name || '未知酒店',
          stars: formatStars(rawData.starRating || 3),
          score: '4.8',
          scoreDesc: '超棒',
          reviews: '4695点评',
          collects: '6.3万收藏',
          tags: rawData.hotelTags?.map(t => t.tag?.name).filter(Boolean) || [rawData.location?.name || '市中心'],
          notice: rawData.description || '优质酒店，环境舒适，服务周到',
          services: facilitiesList,
          price: rawData.basePrice || '299',
          img: imageUrl,
          address: rawData.address || '未知地址',
          location: rawData.location?.name || '市中心',
        };
        console.log('🏨 处理后的酒店数据:', hotelData);
        setHotel(hotelData);

        // 加载房型列表
        const roomTypesRes = await getHotelRoomTypes(hotelId);

        if (roomTypesRes.success && roomTypesRes.data && roomTypesRes.data.length > 0) {
          const transformedRoomTypes = roomTypesRes.data.map(room => {
            // 解析amenities JSON字符串
            let amenitiesList = [];
            if (room.amenities) {
              try {
                amenitiesList = typeof room.amenities === 'string'
                  ? JSON.parse(room.amenities)
                  : room.amenities;
              } catch (e) {
                amenitiesList = ['免费WiFi', '独立卫浴'];
              }
            }

            return {
              id: room.id,
              name: room.name || '标准大床房',
              bed: room.description || '大床',
              area: room.description || '30㎡',
              floor: '10-20层',
              capacity: '2人入住',
              price: parseFloat(room.price) || 299,
              features: amenitiesList
            };
          });
          console.log('🛏️ 处理后的房型数据:', transformedRoomTypes);
          setRoomTypes(transformedRoomTypes);

          // 默认选择第一个房型
          if (transformedRoomTypes.length > 0) {
            setSelectedRoomTypeId(transformedRoomTypes[0].id);
          }
        } else {
          console.log('⚠️ 后端没有房型数据');
          setRoomTypes([]);
        }
      }
    } catch (error) {
      console.error('获取酒店详情失败:', error);
      Taro.showToast({
        title: '加载失败，请重试',
        icon: 'none'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    const scrollTop = e.detail.scrollTop;
    setScrollTop(scrollTop);

    const opacity = Math.min(scrollTop / 150, 1);
    setHeaderOpacity(opacity);

    setShowHeaderTitle(scrollTop > 100);
  };

  // 检查酒店是否已收藏
  const checkHotelFavorite = async () => {
    try {
      const res = await checkFavorite(hotelId);
      if (res.success) {
        setIsFavorite(res.data?.isFavorite || false);
      }
    } catch (error) {
      console.error('❌ 检查收藏状态失败:', error);
    }
  };

  // 切换收藏状态
  const handleCollect = async () => {
    try {
      if (isFavorite) {
        const res = await removeFavorite(hotelId);
        if (res.success) {
          setIsFavorite(false);
          Taro.showToast({ title: '已取消收藏', icon: 'success', duration: 1500 });
        }
      } else {
        const res = await addFavorite(hotelId);
        if (res.success) {
          setIsFavorite(true);
          Taro.showToast({ title: '收藏成功', icon: 'success', duration: 1500 });
        }
      }
    } catch (error) {
      console.error('❌ 收藏操作失败:', error);
      Taro.showToast({ title: '操作失败，请重试', icon: 'none' });
    }
  };

  const handleMapClick = () => {
    if (hotel?.address) {
      Taro.showToast({
        title: `地址: ${hotel.address}`,
        icon: 'none',
        duration: 2000
      });
    }
  };

  const handleFacilityClick = () => {
    Taro.showToast({
      title: '查看设施政策',
      icon: 'none',
      duration: 1500
    });
  };

  const handleOpenCalendar = () => {
    setIsCalendarVisible(true);
  };

  const handleViewRoom = (roomId) => {
    setSelectedRoomTypeId(roomId);
    Taro.showToast({
      title: '已选择此房型',
      icon: 'success',
      duration: 1000
    });
  };

  const handleAskHotel = () => {
    Taro.makePhoneCall({
      phoneNumber: '400-123-4567'
    });
  };

  const handleBookNow = async () => {
    // 检查是否已登录
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

    // 检查是否选择了房型
    if (!selectedRoomTypeId) {
      Taro.showToast({
        title: '请先选择房型',
        icon: 'none'
      });
      return;
    }

    // 显示预订确认弹窗
    setShowBookingConfirm(true);
  };

  // 确认预订
  const handleConfirmBooking = async (guestInfo) => {
    // 验证表单
    if (!guestInfo.guestName.trim()) {
      Taro.showToast({
        title: '请填写入住人姓名',
        icon: 'none'
      });
      return;
    }

    if (!guestInfo.guestPhone.trim()) {
      Taro.showToast({
        title: '请填写联系电话',
        icon: 'none'
      });
      return;
    }

    try {
      const selectedRoom = roomTypes.find(r => r.id === selectedRoomTypeId);
      const totalPrice = (selectedRoom?.price || 0) * getNightCount();

      const bookingData = {
        hotelId: hotel.id,
        roomTypeId: selectedRoomTypeId,
        checkInDate: startDate,
        checkOutDate: endDate,
        guestCount: guestInfo.guestCount,
        totalPrice: totalPrice,
        specialRequests: guestInfo.specialRequests || '',
        guestName: guestInfo.guestName,
        guestPhone: guestInfo.guestPhone,
        arrivalTime: guestInfo.arrivalTime
      };

      const result = await createBooking(bookingData);

      if (result.success) {
        setShowBookingConfirm(false);
        Taro.showToast({
          title: '预订成功',
          icon: 'success'
        });
        setTimeout(() => {
          Taro.navigateTo({ url: '/pages/orderList/index' });
        }, 1500);
      }
    } catch (error) {
      console.error('预订失败:', error);
      Taro.showToast({
        title: error.message || '预订失败，请重试',
        icon: 'none'
      });
    }
  };

  const getNightCount = useCallback(() => {
    if (!startDate || !endDate) return 1;
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (end.isAfter(start, 'day')) {
      return end.diff(start, 'day');
    }
    return 1;
  }, [startDate, endDate]);

  const handleCalendarSelect = (start, end) => {
    console.log('Calendar select:', { start, end });
    setStartDate(start || '');
    setEndDate(end || '');
  };

  const handleCalendarConfirm = () => {
    console.log('Calendar confirm');
    setIsCalendarVisible(false);
  };

  const filterTags = ['含早餐', '立即确认', '大床房', '双床房', '免费取消'];

  const facilities = [
    { icon: '🏢', text: '2020年开业' },
    { icon: '🎋', text: '新中式风' },
    { icon: '🅿️', text: '免费停车' },
    { icon: '🌊', text: '一线江景' },
    { icon: '🛏️', text: '江景房' },
    { icon: '📋', text: '设施政策' }
  ];

  // Loading 状态
  if (loading) {
    return (
      <View className='detail-page-container'>
        <LoadingSpinner text='加载中...' fullScreen />
      </View>
    );
  }

  // 数据为空
  if (!hotel) {
    return (
      <View className='detail-page-container'>
        <View style={{ padding: '100rpx', textAlign: 'center' }}>
          <Text>酒店信息不存在</Text>
        </View>
      </View>
    );
  }

  return (
    <View className='detail-page-container'>
      {/* 1.顶部导航栏 - 动态效果 */}
      <View
        className='detail-header'
        style={{
          backgroundColor: `rgba(255, 255, 255, ${headerOpacity})`,
          color: headerOpacity > 0.5 ? '#333' : '#fff'
        }}
      >
        <Text
          className='header-back'
          onClick={() => Taro.navigateBack()}
          style={{ color: headerOpacity > 0.5 ? '#333' : '#fff' }}
        >
          {'<'}
        </Text>
        <Text
          className='header-title'
          style={{
            opacity: showHeaderTitle ? 1 : 0,
            color: headerOpacity > 0.5 ? '#333' : '#fff'
          }}
        >
          {hotel.name}
        </Text>
      </View>

      <ScrollView
        scrollY
        className='scroll-content'
        onScroll={handleScroll}
        scrollTop={scrollTop}
      >
        {/* 2.媒体区域 */}
        <View className='media-box'>
          <Image className='main-media-img' src={hotel.img} mode='aspectFill' />
          <View className='media-tags-row'>
            <Text className='media-tag'>封面</Text>
            <Text className='media-tag'>精选</Text>
            <Text className='media-tag'>位置</Text>
            <Text className='media-tag'>相册</Text>
          </View>
          <View className='preview-icon'>▶</View>
          <View className='tag-sq-btn'>口碑榜</View>
        </View>

        {/* 3.核心信息卡片 */}
        <View className='info-card'>
          <View className='info-card-header'>
            <Text className='hotel-name'>{hotel.name}</Text>
            <Text className='hotel-stars'>{hotel.stars}</Text>
          </View>

          <View className='rank-section'>
            <Text className='hotel-rank-tag'>优质酒店</Text>
            <Text className='rank-text'>{hotel.location}精选酒店</Text>
          </View>

          {/* 设施图标行 */}
          <View className='facility-icon-row'>
            {facilities.map((item, index) => (
              <View key={index} className='facility-item'>
                <Text className='icon-placeholder'>{item.icon}</Text>
                <Text className='facility-text'>{item.text}</Text>
              </View>
            ))}
            <View className='shortcut-arrow' onClick={handleFacilityClick}>{'>'}</View>
          </View>

          {/* 评分与地址 (分栏显示) */}
          <View className='info-detail-cols'>
            <View className='col-left'>
              <View className='score-section'>
                <Text className='score-badge'>{hotel.score}</Text>
                <View className='score-info'>
                  <Text className='score-desc'>{hotel.scoreDesc}</Text>
                  <Text className='reviews-count'>{hotel.reviews.replace('点评', '条')}</Text>
                </View>
              </View>
              <Text className='recommendation-text'>"{hotel.notice || '舒适安逸'}"</Text>
            </View>
            <View className='col-right' onClick={handleMapClick}>
              <Text className='distance-text'>查看位置信息</Text>
              <Text className='address-text'>{hotel.address}</Text>
              <View className='map-section'>
                <View className='map-icon-small'>📍</View>
                <Text className='map-text'>地图</Text>
              </View>
            </View>
          </View>

          <View className='info-card-separator'></View>

          {/* 日期信息行 */}
          <View className='date-info-row' onClick={handleOpenCalendar}>
            <View className='date-left-info'>
              <View className='date-item-group'>
                <Text className='date-val-num'>{dayjs(startDate).format('M月D日')}</Text>
                <Text className='date-desc-text'>入住</Text>
              </View>
              <View className='date-divider-line'></View>
              <View className='date-item-group'>
                <Text className='date-val-num'>{dayjs(endDate).format('M月D日')}</Text>
                <Text className='date-desc-text'>离店</Text>
              </View>
            </View>
            <Text className='night-count-total'>{getNightCount()}晚</Text>
            <Text className='date-change-arrow'>{'>'}</Text>
          </View>

          <Text className='date-note'>点击修改入住和离店日期</Text>

          {/* 快捷筛选条件 */}
          <View className='quick-filter-row'>
            {filterTags.map(tag => (
              <View key={tag} className='quick-filter-tag'>{tag}</View>
            ))}
            <Text className='more-filter'>筛选 {'>'}</Text>
          </View>
        </View>

        {/* 4.房型列表区块 */}
        <View className='room-type-section'>
          {roomTypes.length > 0 ? (
            roomTypes.map((room) => (
              <View key={room.id} className='room-card'>
                <View className='room-header'>
                  <Text className='room-header-title'>{room.name}</Text>
                  {room.features && room.features.length > 0 && (
                    <View className='room-header-right-tag'>
                      {room.features.slice(0, 2).map((feature, index) => (
                        <Text key={index} className='room-tag-item'>{feature}</Text>
                      ))}
                    </View>
                  )}
                </View>

                <View className='room-preview-row'>
                  <Image className='room-preview-img' src={hotel.img} mode='aspectFill' />
                  <View className='room-preview-details'>
                    <Text className='room-title'>{room.name}</Text>
                    <Text className='room-specs'>
                      {room.bed} · {room.area} · {room.capacity} · {room.floor}
                    </Text>
                  </View>
                </View>

                <View className='room-footer'>
                  <View className='price-section'>
                    <Text className='room-price-symbol'>¥</Text>
                    <Text className='room-price-val'>{room.price}</Text>
                    <Text className='room-price-unit'>起</Text>
                  </View>
                  <Button
                    className={`room-detail-btn ${selectedRoomTypeId === room.id ? 'selected' : ''}`}
                    onClick={() => handleViewRoom(room.id)}
                  >
                    {selectedRoomTypeId === room.id ? '已选择' : '选择房型'}
                  </Button>
                </View>
              </View>
            ))
          ) : (
            <View style={{ padding: '40rpx', textAlign: 'center' }}>
              <Text>暂无房型信息</Text>
            </View>
          )}
        </View>

        {/* 底部留白 */}
        <View style={{ height: '130rpx' }} />
      </ScrollView>

      {/* 5.底部悬浮操作栏 */}
      <View className='sticky-footer'>
        <View className='footer-price-area'>
          <Text className='footer-price-symbol'>¥</Text>
          <Text className='footer-price-val'>{hotel.price}</Text>
        </View>
        <View className='footer-right-group'>
          <View
            className='footer-collect-btn'
            onClick={handleCollect}
          >
            <Text>{isFavorite ? '❤️' : '🤍'}</Text>
            <Text>{isFavorite ? '已收藏' : '收藏'}</Text>
          </View>
          <Button className='footer-action-btn' onClick={handleBookNow}>
            立即预订
          </Button>
        </View>
      </View>

      {/* 日历选择器 */}
      {isCalendarVisible && (
        <Calendar
          visible={isCalendarVisible}
          onClose={() => setIsCalendarVisible(false)}
          onSelect={handleCalendarSelect}
          onConfirm={handleCalendarConfirm}
          startDate={startDate}
          endDate={endDate}
          today={dayjs()}
          mode="range"
        />
      )}

      {/* 预订确认弹窗 */}
      <BookingConfirm
        visible={showBookingConfirm}
        hotel={hotel}
        room={roomTypes.find(r => r.id === selectedRoomTypeId)}
        checkIn={dayjs(startDate).format('M月D日')}
        checkOut={dayjs(endDate).format('M月D日')}
        nights={getNightCount()}
        totalPrice={(roomTypes.find(r => r.id === selectedRoomTypeId)?.price || 0) * getNightCount()}
        onClose={() => setShowBookingConfirm(false)}
        onConfirm={handleConfirmBooking}
      />
    </View>
  );
}

export default HotelDetail;
