/**
 * 收藏列表页面
 * 显示用户收藏的所有酒店
 */
import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, Input } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import {
  getMyFavorites,
  removeFavorite,
  getFavoriteFolders,
  createFavoriteFolder,
  deleteFavoriteFolder,
  batchRemoveFavorites,
  moveFavoritesToFolder
} from '../../services/favorite';
import { formatStars, formatPrice } from '../../utils/format';
import { DEFAULT_HOTEL_IMAGE } from '../../config/images';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import { useLanguage } from '../../context/LanguageContext'; // 导入语言上下文
import './index.css';

function FavoriteList() {
  const { t } = useLanguage(); // 使用语言上下文
  
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [folders, setFolders] = useState([]);
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedHotels, setSelectedHotels] = useState([]);

  useEffect(() => {
    loadFavoriteFolders();
    loadFavorites();
  }, []);

  // 加载收藏夹列表
  const loadFavoriteFolders = async () => {
    try {
      const res = await getFavoriteFolders();
      if (res.success && res.data) {
        setFolders([
          { id: null, name: t('allFavorites'), count: 0 },
          ...res.data.map(folder => ({
            id: folder.id,
            name: folder.name,
            count: folder.favoriteCount || 0,
            description: folder.description
          }))
        ]);
      }
    } catch (error) {
      console.error('❌ 加载收藏夹列表失败:', error);
    }
  };

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
            img: images[0] || DEFAULT_HOTEL_IMAGE,
            createdAt: fav.createdAt
          };
        });

        setFavorites(formattedFavorites);
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('❌ 加载收藏列表失败:', error);
      Taro.showToast({ title: t('loadFailed'), icon: 'none' });
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
      title: t('cancelFavorite'),
      content: t('confirmCancelFavorite'),
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await removeFavorite(hotelId);

            if (result.success) {
              Taro.showToast({ title: t('favoriteCancelled'), icon: 'success', duration: 1500 });
              // 从列表中移除
              setFavorites(favorites.filter(f => f.hotelId !== hotelId));
            }
          } catch (error) {
            Taro.showToast({ title: t('cancelFailed'), icon: 'none' });
          }
        }
      }
    });
  };

  // 点击酒店卡片
  const handleHotelClick = (hotelId) => {
    if (isEditMode) {
      // 编辑模式下切换选中状态
      toggleHotelSelection(hotelId);
    } else {
      Taro.navigateTo({
        url: `/pages/hotelDetail/index?id=${hotelId}`
      });
    }
  };

  // 切换编辑模式
  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
    setSelectedHotels([]);
  };

  // 切换酒店选中状态
  const toggleHotelSelection = (hotelId) => {
    if (selectedHotels.includes(hotelId)) {
      setSelectedHotels(selectedHotels.filter(id => id !== hotelId));
    } else {
      setSelectedHotels([...selectedHotels, hotelId]);
    }
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedHotels.length === favorites.length) {
      setSelectedHotels([]);
    } else {
      setSelectedHotels(favorites.map(f => f.hotelId));
    }
  };

  // 批量删除收藏
  const handleBatchDelete = () => {
    if (selectedHotels.length === 0) {
      Taro.showToast({ title: t('selectHotelsToDelete'), icon: 'none' });
      return;
    }

    Taro.showModal({
      title: t('batchDelete'),
      content: t('confirmBatchDelete', { count: selectedHotels.length }),
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await batchRemoveFavorites(selectedHotels);
            if (result.success) {
              Taro.showToast({ title: t('deleteSuccess'), icon: 'success' });
              setFavorites(favorites.filter(f => !selectedHotels.includes(f.hotelId)));
              setSelectedHotels([]);
              setIsEditMode(false);
            }
          } catch (error) {
            Taro.showToast({ title: t('deleteFailed'), icon: 'none' });
          }
        }
      }
    });
  };

  // 创建新收藏夹
  const handleCreateFolder = () => {
    Taro.showModal({
      title: t('createFolder'),
      editable: true,
      placeholderText: t('enterFolderName'),
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            const result = await createFavoriteFolder(res.content);
            if (result.success) {
              Taro.showToast({ title: t('createSuccess'), icon: 'success' });
              loadFavoriteFolders();
            }
          } catch (error) {
            Taro.showToast({ title: t('createFailed'), icon: 'none' });
          }
        }
      }
    });
  };

  // 移动到收藏夹
  const handleMoveToFolder = () => {
    if (selectedHotels.length === 0) {
      Taro.showToast({ title: t('selectHotelsToMove'), icon: 'none' });
      return;
    }

    const folderNames = folders.filter(f => f.id !== null).map(f => f.name);
    if (folderNames.length === 0) {
      Taro.showToast({ title: t('createFolderFirst'), icon: 'none' });
      return;
    }

    Taro.showActionSheet({
      itemList: folderNames,
      success: async (res) => {
        const targetFolder = folders.filter(f => f.id !== null)[res.tapIndex];
        try {
          const result = await moveFavoritesToFolder(selectedHotels, targetFolder.id);
          if (result.success) {
            Taro.showToast({ title: t('moveSuccess'), icon: 'success' });
            setSelectedHotels([]);
            setIsEditMode(false);
            loadFavorites();
          }
        } catch (error) {
          Taro.showToast({ title: t('moveFailed'), icon: 'none' });
        }
      }
    });
  };

  // 切换收藏夹
  const handleFolderChange = (folder) => {
    setSelectedFolder(folder);
    // 根据文件夹过滤收藏列表
    loadFavorites(folder.id);
  };

  if (loading) {
    return (
      <View className='favorite-page-container'>
        <LoadingSpinner text={t('loading')} fullScreen />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View className='favorite-page-container'>
        <EmptyState
          image='💝'
          title={t('noFavorites')}
          description={t('goToCollect')}
          buttonText={t('goBrowse')}
          onButtonClick={() => Taro.switchTab({ url: '/pages/home/index' })}
        />
      </View>
    );
  }

  return (
    <View className='favorite-page-container'>
      {/* 收藏夹分类标签 */}
      {folders.length > 0 && (
        <View className='folder-tabs'>
          <View className='folder-scroll'>
            {folders.map((folder) => (
              <View
                key={folder.id || 'all'}
                className={`folder-tab ${(!selectedFolder && !folder.id) || selectedFolder?.id === folder.id ? 'active' : ''}`}
                onClick={() => handleFolderChange(folder)}
              >
                <Text className='folder-name'>{folder.name}</Text>
                <Text className='folder-count'>({folder.count})</Text>
              </View>
            ))}
            <View className='folder-tab add-folder' onClick={handleCreateFolder}>
              <Text>+ {t('newFolder')}</Text>
            </View>
          </View>
        </View>
      )}

      {/* 操作栏 */}
      <View className='favorite-actions'>
        <View className='favorite-count'>
          <Text className='count-text'>
            {t('favoriteCount', { count: favorites.length })}
          </Text>
        </View>
        <View className='action-buttons'>
          {isEditMode ? (
            <>
              <Button className='action-btn' size='mini' onClick={toggleSelectAll}>
                {selectedHotels.length === favorites.length ? t('deselectAll') : t('selectAll')}
              </Button>
              <Button className='action-btn' size='mini' onClick={handleMoveToFolder}>
                {t('move')}
              </Button>
              <Button className='action-btn danger' size='mini' onClick={handleBatchDelete}>
                {t('delete')}
              </Button>
              <Button className='action-btn' size='mini' onClick={toggleEditMode}>
                {t('done')}
              </Button>
            </>
          ) : (
            <Button className='action-btn' size='mini' onClick={toggleEditMode}>
              {t('manage')}
            </Button>
          )}
        </View>
      </View>

      <View className='favorite-list'>
        {favorites.map((hotel) => (
          <View key={hotel.id} className='favorite-card' onClick={() => handleHotelClick(hotel.hotelId)}>
            {isEditMode && (
              <View className='select-checkbox'>
                <View className={`checkbox ${selectedHotels.includes(hotel.hotelId) ? 'checked' : ''}`}>
                  {selectedHotels.includes(hotel.hotelId) && <Text>✓</Text>}
                </View>
              </View>
            )}

            <Image className='hotel-image' src={hotel.img} mode='aspectFill' />

            <View className='hotel-info'>
              <View className='name-row'>
                <Text className='hotel-name'>{hotel.name}</Text>
                <Text className='hotel-stars'>{hotel.stars}</Text>
              </View>

              <View className='score-row'>
                <View className='score-badge'>{hotel.score}</View>
                <Text className='score-text'>{t('score')}</Text>
              </View>

              <Text className='hotel-address'>{hotel.address}</Text>

              <View className='bottom-row'>
                <View className='price-box'>
                  <Text className='price-symbol'>¥</Text>
                  <Text className='price-value'>{hotel.priceNum}</Text>
                  <Text className='price-unit'>{t('startingFrom')}</Text>
                </View>

                <View
                  className='favorite-btn active'
                  onClick={(e) => handleRemoveFavorite(hotel.hotelId, e)}
                >
                  <Text className='favorite-icon'>♥</Text>
                  <Text className='favorite-text'>{t('favorited')}</Text>
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