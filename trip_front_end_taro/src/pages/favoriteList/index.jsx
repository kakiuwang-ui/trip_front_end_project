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
import { useTheme } from '../../utils/useTheme'
import './index.css';
import AiChatWidget from '../../components/AiChatWidget';

function FavoriteList() {
  const { cssVars } = useTheme()
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
          { id: null, name: '全部收藏', count: 0 },
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
      Taro.showToast({ title: '请选择要删除的酒店', icon: 'none' });
      return;
    }

    Taro.showModal({
      title: '批量删除',
      content: `确定要删除选中的 ${selectedHotels.length} 家酒店吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await batchRemoveFavorites(selectedHotels);
            if (result.success) {
              Taro.showToast({ title: '删除成功', icon: 'success' });
              setFavorites(favorites.filter(f => !selectedHotels.includes(f.hotelId)));
              setSelectedHotels([]);
              setIsEditMode(false);
            }
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' });
          }
        }
      }
    });
  };

  // 创建新收藏夹
  const handleCreateFolder = () => {
    Taro.showModal({
      title: '创建收藏夹',
      editable: true,
      placeholderText: '请输入收藏夹名称',
      success: async (res) => {
        if (res.confirm && res.content) {
          try {
            const result = await createFavoriteFolder(res.content);
            if (result.success) {
              Taro.showToast({ title: '创建成功', icon: 'success' });
              loadFavoriteFolders();
            }
          } catch (error) {
            Taro.showToast({ title: '创建失败', icon: 'none' });
          }
        }
      }
    });
  };

  // 移动到收藏夹
  const handleMoveToFolder = () => {
    if (selectedHotels.length === 0) {
      Taro.showToast({ title: '请选择要移动的酒店', icon: 'none' });
      return;
    }

    const folderNames = folders.filter(f => f.id !== null).map(f => f.name);
    if (folderNames.length === 0) {
      Taro.showToast({ title: '请先创建收藏夹', icon: 'none' });
      return;
    }

    Taro.showActionSheet({
      itemList: folderNames,
      success: async (res) => {
        const targetFolder = folders.filter(f => f.id !== null)[res.tapIndex];
        try {
          const result = await moveFavoritesToFolder(selectedHotels, targetFolder.id);
          if (result.success) {
            Taro.showToast({ title: '移动成功', icon: 'success' });
            setSelectedHotels([]);
            setIsEditMode(false);
            loadFavorites();
          }
        } catch (error) {
          Taro.showToast({ title: '移动失败', icon: 'none' });
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
      <View className='favorite-page-container' style={cssVars}>
        <LoadingSpinner text='加载中...' fullScreen />
      </View>
    );
  }

  if (favorites.length === 0) {
    return (
      <View className='favorite-page-container' style={cssVars}>
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
    <View className='favorite-page-container' style={cssVars}>
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
              <Text>+ 新建</Text>
            </View>
          </View>
        </View>
      )}

      {/* 操作栏 */}
      <View className='favorite-actions'>
        <View className='favorite-count'>
          <Text className='count-text'>共收藏{favorites.length}家酒店</Text>
        </View>
        <View className='action-buttons'>
          {isEditMode ? (
            <>
              <Button className='action-btn' size='mini' onClick={toggleSelectAll}>
                {selectedHotels.length === favorites.length ? '取消全选' : '全选'}
              </Button>
              <Button className='action-btn' size='mini' onClick={handleMoveToFolder}>
                移动
              </Button>
              <Button className='action-btn danger' size='mini' onClick={handleBatchDelete}>
                删除
              </Button>
              <Button className='action-btn' size='mini' onClick={toggleEditMode}>
                完成
              </Button>
            </>
          ) : (
            <Button className='action-btn' size='mini' onClick={toggleEditMode}>
              管理
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
                  <Text className='favorite-icon'>♥</Text>
                  <Text className='favorite-text'>已收藏</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
      <AiChatWidget />
    </View>
  );
}

export default FavoriteList;
