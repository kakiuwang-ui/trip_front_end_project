/**
 * 收藏列表页面
 * 显示用户收藏的所有酒店
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Image } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { getMyFavorites, removeFavorite } from '../../services/favorite';
import { formatStars, formatPrice } from '../../utils/format';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import './index.css';

function FavoriteList() {
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  // 加载收藏列表
  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await getMyFavorites();

      if (res.success && res.data && res.data.length > 0) {
        const formattedFavorites = res.data.map(fav => {
          const hotel = fav.hotel;
          const images = hotel.images && hotel.images.length > 0
            ? (typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images)
            : [];

          return {
            id: fav.id,
            hotelId: hotel.id,
            name: hotel.nameZh || hotel.name,
            stars: formatStars(hotel.starRating),
            starRating: hotel.starRating || 3,
            score: hotel.rating || '4.5',
            address: hotel.address || '',
            price: formatPrice(hotel.minPrice),
            priceNum: hotel.minPrice || 0,
            img: images[0] || 'http://localhost:3000/uploads/1770189062477-9-2026-02-03185959.png',
            createdAt: fav.createdAt
          };
        });

        setFavorites(formattedFavorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('❌ 加载收藏列表失败:', error);
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' });
    } finally {
      setLoading(false);
    }
  };

  // 下拉刷新
  usePullDownRefresh(async () => {
    await loadFavorites();
    Taro.stopPullDownRefresh();
  });

  // 取消收藏
  const handleRemoveFavorite = (hotelId, e) => {
    e.stopPropagation();

    Taro.showModal({
      title: '取消收藏',
      content: '确定要取消收藏这家酒店吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await removeFavorite(hotelId);

            if (result.success) {
              Taro.showToast({ title: '已取消收藏', icon: 'success', duration: 1500 });
              // 从列表中移除
              setFavorites(favorites.filter(f => f.hotelId !== hotelId));
            }
          } catch (error) {
            Taro.showToast({ title: '取消失败，请重试', icon: 'none' });
          }
        }
      }
    });
  };

  // 点击酒店卡片
  const handleHotelClick = (hotelId) => {
    Taro.navigateTo({
      url: `/pages/hotelDetail/index?id=${hotelId}`
    });
  };

  if (loading) {
    return (
      <View className='favorite-page-container'>
        <LoadingSpinner text='加载中...' fullScreen />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View className='favorite-page-container'>
        <EmptyState
          image='💝'
          title='暂无收藏'
          description='快去收藏心仪的酒店吧'
          buttonText='去逛逛'
          onButtonClick={() => Taro.switchTab({ url: '/pages/home/index' })}
        />
      </View>
    );
  }

  return (
    <View className='favorite-page-container'>
      <View className='favorite-count'>
        <Text className='count-text'>共收藏{favorites.length}家酒店</Text>
      </View>

      <View className='favorite-list'>
        {favorites.map((hotel) => (
          <View key={hotel.id} className='favorite-card' onClick={() => handleHotelClick(hotel.hotelId)}>
            <Image className='hotel-image' src={hotel.img} mode='aspectFill' />

            <View className='hotel-info'>
              <View className='name-row'>
                <Text className='hotel-name'>{hotel.name}</Text>
                <Text className='hotel-stars'>{hotel.stars}</Text>
              </View>

              <View className='score-row'>
                <View className='score-badge'>{hotel.score}</View>
                <Text className='score-text'>分</Text>
              </View>

              <Text className='hotel-address'>{hotel.address}</Text>

              <View className='bottom-row'>
                <View className='price-box'>
                  <Text className='price-symbol'>¥</Text>
                  <Text className='price-value'>{hotel.priceNum}</Text>
                  <Text className='price-unit'>起</Text>
                </View>

                <View
                  className='favorite-btn active'
                  onClick={(e) => handleRemoveFavorite(hotel.hotelId, e)}
                >
                  <Text className='favorite-icon'>❤️</Text>
                  <Text className='favorite-text'>已收藏</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export default FavoriteList;
