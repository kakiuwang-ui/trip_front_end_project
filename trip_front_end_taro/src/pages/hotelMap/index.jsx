/**
 * 酒店地图页面
 * 显示酒店在地图上的位置，支持标记点击查看详情
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Map, CoverView, CoverImage } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { getHotels } from '../../services/hotel';
import { DEFAULT_HOTEL_IMAGE } from '../../config/images';
import LoadingSpinner from '../../components/LoadingSpinner';
import { useTheme } from '../../utils/useTheme'
import './index.css';

function HotelMap() {
  const { cssVars } = useTheme()
  const router = useRouter();
  const searchParams = router.params.params ? JSON.parse(decodeURIComponent(router.params.params)) : {};

  const [loading, setLoading] = useState(true);
  const [hotels, setHotels] = useState([]);
  const [markers, setMarkers] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [mapCenter, setMapCenter] = useState({
    latitude: 31.2304,  // 上海默认坐标
    longitude: 121.4737
  });

  useEffect(() => {
    loadHotels();
  }, []);

  // 加载酒店数据
  const loadHotels = async () => {
    try {
      setLoading(true);
      const res = await getHotels({
        locationId: searchParams.locationId,
        keyword: searchParams.keyword
      });

      if (res.success && res.data && res.data.length > 0) {
        const hotelData = res.data.map(hotel => {
          const images = hotel.images && hotel.images.length > 0
            ? (typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images)
            : [];

          return {
            id: hotel.id,
            name: hotel.nameZh || hotel.name,
            address: hotel.address || '',
            price: hotel.minPrice || '0',
            rating: hotel.rating || '4.5',
            starRating: hotel.starRating || 3,
            latitude: hotel.latitude || 31.2304 + (Math.random() - 0.5) * 0.1,
            longitude: hotel.longitude || 121.4737 + (Math.random() - 0.5) * 0.1,
            image: images[0] || DEFAULT_HOTEL_IMAGE
          };
        });

        setHotels(hotelData);

        // 转换为地图标记
        const mapMarkers = hotelData.map((hotel, index) => ({
          id: hotel.id,
          latitude: hotel.latitude,
          longitude: hotel.longitude,
          title: hotel.name,
          iconPath: '/assets/marker-hotel.png',
          width: 30,
          height: 30,
          callout: {
            content: `¥${hotel.price}`,
            color: '#FFFFFF',
            fontSize: 12,
            borderRadius: 8,
            bgColor: '#0066FF',
            padding: 8,
            display: 'ALWAYS',
            textAlign: 'center'
          }
        }));

        setMarkers(mapMarkers);

        // 设置地图中心为第一个酒店位置
        if (hotelData.length > 0) {
          setMapCenter({
            latitude: hotelData[0].latitude,
            longitude: hotelData[0].longitude
          });
        }
      } else {
        setHotels([]);
      }
    } catch (error) {
      console.error('❌ 加载酒店地图数据失败:', error);
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  // 点击地图标记
  const handleMarkerTap = (e) => {
    const markerId = e.detail.markerId;
    const hotel = hotels.find(h => h.id === markerId);
    if (hotel) {
      setSelectedHotel(hotel);
    }
  };

  // 关闭酒店卡片
  const handleCloseCard = () => {
    setSelectedHotel(null);
  };

  // 查看酒店详情
  const handleViewDetail = () => {
    if (selectedHotel) {
      Taro.navigateTo({
        url: `/pages/hotelDetail/index?id=${selectedHotel.id}&checkIn=${searchParams.checkInDate || ''}&checkOut=${searchParams.checkOutDate || ''}`
      });
    }
  };

  // 返回列表
  const handleBackToList = () => {
    Taro.navigateBack();
  };

  if (loading) {
    return (
      <View className='map-page-container' style={cssVars}>
        <LoadingSpinner text='加载地图中...' fullScreen />
      </View>
    );
  }

  return (
    <View className='map-page-container' style={cssVars}>
      <Map
        className='hotel-map'
        longitude={mapCenter.longitude}
        latitude={mapCenter.latitude}
        scale={14}
        markers={markers}
        onMarkerTap={handleMarkerTap}
        showLocation
      >
        {/* 返回列表按钮 */}
        <CoverView className='map-back-btn' onClick={handleBackToList}>
          <CoverView className='back-btn-content'>
            <CoverView className='back-icon'>{'<'}</CoverView>
            <CoverView className='back-text'>列表</CoverView>
          </CoverView>
        </CoverView>

        {/* 酒店数量提示 */}
        <CoverView className='hotel-count-badge'>
          <CoverView className='count-text'>共{hotels.length}家酒店</CoverView>
        </CoverView>
      </Map>

      {/* 选中酒店的详情卡片 */}
      {selectedHotel && (
        <View className='hotel-card-popup'>
          <View className='card-close' onClick={handleCloseCard}>✕</View>
          <View className='card-content' onClick={handleViewDetail}>
            <View className='card-image-wrapper'>
              <image className='card-image' src={selectedHotel.image} mode='aspectFill' />
            </View>
            <View className='card-info'>
              <Text className='card-name'>{selectedHotel.name}</Text>
              <View className='card-rating'>
                <Text className='rating-score'>{selectedHotel.rating}分</Text>
                <Text className='rating-stars'>{'⭐'.repeat(selectedHotel.starRating)}</Text>
              </View>
              <Text className='card-address'>{selectedHotel.address}</Text>
              <View className='card-price-row'>
                <Text className='price-label'>￥</Text>
                <Text className='price-value'>{selectedHotel.price}</Text>
                <Text className='price-unit'>起</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

export default HotelMap;
