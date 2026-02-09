import React, { useState, useEffect } from 'react';
import { View, Text, Image, Input, Map, CoverView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { getHotels } from '../../services/hotel';
import { formatStars, formatPrice } from '../../utils/format';
import { DEFAULT_HOTEL_IMAGE } from '../../config/images';
import FilterPanel from '../../components/FilterPanel';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import './index.css';

function HotelList() {
  // 酒店列表数据
  const [hotelList, setHotelList] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  // 搜索参数
  const [searchParams, setSearchParams] = useState({});
  // 加载状态
  const [loading, setLoading] = useState(true);
  // 筛选参数
  const [filterParams, setFilterParams] = useState({
    sortBy: 'recommend',
    priceRange: null,
    starRating: null,
    facilities: []
  });
  // 显示筛选面板
  const [showFilter, setShowFilter] = useState(false);
  // 排序方式
  const [sortBy, setSortBy] = useState('recommend'); // recommend, distance, priceAsc, priceDesc
  // 搜索关键词（用于列表页实时搜索）
  const [localSearchKeyword, setLocalSearchKeyword] = useState('');
  // 视图模式：list 或 map
  const [viewMode, setViewMode] = useState('list');
  // 地图相关
  const [markers, setMarkers] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [mapCenter, setMapCenter] = useState({
    latitude: 31.2304,
    longitude: 121.4737
  });

  // 页面加载时获取路由参数并加载酒店数据
  useEffect(() => {
    const instance = Taro.getCurrentInstance();
    const paramsStr = instance.router?.params?.params;

    if (paramsStr) {
      try {
        const params = JSON.parse(decodeURIComponent(paramsStr));
        setSearchParams(params);
        loadHotels(params);
      } catch (error) {
        console.error('❌ 解析参数失败:', error);
        loadHotels();
      }
    } else {
      loadHotels();
    }
  }, []);

  // 当筛选条件或排序方式改变时，重新过滤和排序
  useEffect(() => {
    filterAndSortHotels();
  }, [hotelList, filterParams, sortBy, localSearchKeyword]);

  // 加载酒店列表
  const loadHotels = async (params = {}) => {
    setLoading(true);

    try {
      const res = await getHotels({
        locationId: params.locationId,
        keyword: params.keyword,
        priceRange: params.priceRange,
        starRating: params.starRating,
        tags: params.tags
      });

      if (res.success && res.data && res.data.length > 0) {
        // 转换后端数据格式
        const formattedHotels = res.data.map(hotel => {
          const images = hotel.images && hotel.images.length > 0
            ? (typeof hotel.images === 'string' ? JSON.parse(hotel.images) : hotel.images)
            : [];

          const facilities = hotel.facilities
            ? (typeof hotel.facilities === 'string' ? JSON.parse(hotel.facilities) : hotel.facilities)
            : [];

          return {
            id: hotel.id,
            name: hotel.nameZh || hotel.name,
            stars: formatStars(hotel.starRating),
            starRating: hotel.starRating || 3,
            score: hotel.rating || '4.5',
            scoreDesc: hotel.rating >= 4.8 ? '超棒' : hotel.rating >= 4.5 ? '很好' : '不错',
            reviews: `${hotel.reviewCount || 0}点评`,
            collects: `${((hotel.favoriteCount || 0) / 10000).toFixed(1)}万收藏`,
            tags: hotel.location?.name ? [hotel.location.name] : [],
            notice: hotel.description || '',
            services: Array.isArray(facilities) ? facilities.slice(0, 4) : [],
            price: hotel.minPrice || '0',
            priceNum: parseInt(hotel.minPrice) || 0,
            img: images[0] || DEFAULT_HOTEL_IMAGE,
            facilities: Array.isArray(facilities) ? facilities : [],
            latitude: hotel.latitude,
            longitude: hotel.longitude,
            address: hotel.address || ''
          };
        });

        setHotelList(formattedHotels);

        // 生成地图标记
        generateMapMarkers(formattedHotels);
      } else {
        setHotelList([]);
        setMarkers([]);
      }
    } catch (error) {
      console.error('❌ 加载酒店列表失败:', error);
      Taro.showToast({ title: '加载失败，请重试', icon: 'none' });
      setHotelList([]);
    } finally {
      setLoading(false);
    }
  };

  // 生成地图标记
  const generateMapMarkers = (hotels) => {
    const mapMarkers = hotels
      .filter(hotel => hotel.latitude && hotel.longitude) // 只显示有坐标的酒店
      .map((hotel) => ({
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
          bgColor: '#FF6B00',
          padding: 8,
          display: 'ALWAYS',
          textAlign: 'center'
        }
      }));

    setMarkers(mapMarkers);

    // 设置地图中心为第一个酒店位置
    if (mapMarkers.length > 0) {
      setMapCenter({
        latitude: mapMarkers[0].latitude,
        longitude: mapMarkers[0].longitude
      });
    }
  };

  // 筛选和排序酒店
  const filterAndSortHotels = () => {
    console.log('🔍 开始筛选和排序', { sortBy, filterParams, hotelListLength: hotelList.length });
    let filtered = [...hotelList];

    // 关键词搜索（本地搜索）
    if (localSearchKeyword && localSearchKeyword.trim()) {
      const keyword = localSearchKeyword.trim().toLowerCase();
      const beforeLength = filtered.length;
      filtered = filtered.filter(h =>
        h.name.toLowerCase().includes(keyword) ||
        (h.notice && h.notice.toLowerCase().includes(keyword)) ||
        h.tags.some(tag => tag.toLowerCase().includes(keyword))
      );
      console.log(`🔎 关键词搜索: ${beforeLength} -> ${filtered.length} (${keyword})`);
    }

    // 价格筛选
    if (filterParams.priceRange) {
      const [min, max] = filterParams.priceRange;
      const beforeLength = filtered.length;
      filtered = filtered.filter(h => h.priceNum >= min && h.priceNum <= max);
      console.log(`💰 价格筛选: ${beforeLength} -> ${filtered.length} (${min}-${max}元)`);
    }

    // 星级筛选
    if (filterParams.starRating) {
      const beforeLength = filtered.length;
      filtered = filtered.filter(h => h.starRating === filterParams.starRating);
      console.log(`⭐ 星级筛选: ${beforeLength} -> ${filtered.length} (${filterParams.starRating}星)`);
    }

    // 设施筛选
    if (filterParams.facilities && filterParams.facilities.length > 0) {
      const beforeLength = filtered.length;
      filtered = filtered.filter(h =>
        filterParams.facilities.every(f => h.facilities.includes(f))
      );
      console.log(`🏊 设施筛选: ${beforeLength} -> ${filtered.length} (${filterParams.facilities.join(', ')})`);
    }

    // 排序
    switch (sortBy) {
      case 'priceAsc':
        filtered.sort((a, b) => a.priceNum - b.priceNum);
        console.log('📊 排序: 价格升序', filtered.map(h => `${h.name}:¥${h.priceNum}`));
        break;
      case 'priceDesc':
        filtered.sort((a, b) => b.priceNum - a.priceNum);
        console.log('📊 排序: 价格降序', filtered.map(h => `${h.name}:¥${h.priceNum}`));
        break;
      case 'distance':
        // 距离排序（这里暂时使用价格模拟）
        filtered.sort((a, b) => a.priceNum - b.priceNum);
        console.log('📊 排序: 位置距离（用价格模拟）', filtered.map(h => `${h.name}:¥${h.priceNum}`));
        break;
      case 'recommend':
      default:
        // 推荐排序（使用评分）
        filtered.sort((a, b) => parseFloat(b.score) - parseFloat(a.score));
        console.log('📊 排序: 推荐排序（评分）', filtered.map(h => `${h.name}:${h.score}分`));
        break;
    }

    console.log(`✅ 筛选排序完成: 共${filtered.length}个酒店`);
    setFilteredHotels(filtered);
  };

  // 下拉刷新
  usePullDownRefresh(async () => {
    await loadHotels(searchParams);
    Taro.stopPullDownRefresh();
  });

  // 切换排序方式
  const handleSortChange = (newSortBy) => {
    setSortBy(newSortBy);

    // 显示排序提示
    const sortNames = {
      'recommend': '推荐排序',
      'distance': '位置距离',
      'priceAsc': '价格升序',
      'priceDesc': '价格降序'
    };

    Taro.showToast({
      title: `已切换到${sortNames[newSortBy]}`,
      icon: 'none',
      duration: 1000
    });
  };

  // 打开筛选面板
  const handleOpenFilter = () => {
    setShowFilter(true);
  };

  // 确认筛选
  const handleConfirmFilter = (filters) => {
    console.log('✅ 酒店列表页接收到筛选参数:', filters);
    setFilterParams(filters);
    setShowFilter(false);

    // 构建筛选信息提示
    let filterInfo = [];
    if (filters.priceRange) {
      const [min, max] = filters.priceRange;
      filterInfo.push(`价格${min}-${max}元`);
    }
    if (filters.starRating) {
      filterInfo.push(`${filters.starRating}星级`);
    }
    if (filters.facilities && filters.facilities.length > 0) {
      filterInfo.push(`${filters.facilities.length}个设施`);
    }

    const message = filterInfo.length > 0 ? `已应用: ${filterInfo.join(', ')}` : '筛选已应用';
    Taro.showToast({ title: message, icon: 'success', duration: 2000 });
  };

  // 点击酒店卡片
  const handleHotelClick = (hotelId) => {
    Taro.navigateTo({
      url: `/pages/hotelDetail/index?id=${hotelId}&checkIn=${searchParams.checkInDate || ''}&checkOut=${searchParams.checkOutDate || ''}`
    });
  };

  // 返回上一页
  const handleBack = () => {
    Taro.navigateBack();
  };

  // 切换视图模式
  const toggleViewMode = () => {
    const newMode = viewMode === 'list' ? 'map' : 'list';
    setViewMode(newMode);

    if (newMode === 'map') {
      // 切换到地图视图时，更新地图标记
      generateMapMarkers(filteredHotels);
    }
  };

  // 点击地图标记
  const handleMarkerTap = (e) => {
    const markerId = e.detail.markerId;
    const hotel = filteredHotels.find(h => h.id === markerId);
    if (hotel) {
      setSelectedHotel(hotel);
    }
  };

  // 关闭酒店卡片
  const handleCloseCard = () => {
    setSelectedHotel(null);
  };

  return (
    <View className='list-page-container'>
      {/* 顶部搜索条 */}
      <View className='header-nav-section'>
        <View className='back-arrow-icon' onClick={handleBack}>{'<'}</View>
        <View className='search-pill-box'>
          <View className='pill-city-info'>
            <Text className='pill-city-name'>{searchParams.locationName || '上海'}</Text>
            <View className='pill-date-box'>
              <Text className='p-date'>住 {searchParams.checkInDate || '01-09'}</Text>
              <Text className='p-date'>离 {searchParams.checkOutDate || '01-10'}</Text>
            </View>
            <Text className='p-night'>1晚</Text>
          </View>
          <View className='pill-input-box'>
            <Input
              className='p-search-input'
              placeholder={searchParams.keyword || '位置/品牌/酒店'}
              placeholderStyle='color:#999;font-size:26rpx;'
              value={localSearchKeyword}
              onInput={(e) => setLocalSearchKeyword(e.detail.value)}
            />
          </View>
        </View>
        <View className='map-entry-box' onClick={toggleViewMode}>
          <View className='map-icon-dot'></View>
          <Text className='map-text-small'>{viewMode === 'list' ? '地图' : '列表'}</Text>
        </View>
      </View>

      {/* 筛选栏 */}
      <View className='filter-tab-bar'>
        <View
          className={`filter-tab-item ${sortBy === 'recommend' ? 'active' : ''}`}
          onClick={() => handleSortChange('recommend')}
        >
          推荐排序 <View className='s-arrow'></View>
        </View>
        <View
          className={`filter-tab-item ${sortBy === 'distance' ? 'active' : ''}`}
          onClick={() => handleSortChange('distance')}
        >
          位置距离 <View className='s-arrow'></View>
        </View>
        <View
          className={`filter-tab-item ${sortBy === 'priceAsc' || sortBy === 'priceDesc' ? 'active' : ''}`}
          onClick={() => handleSortChange(sortBy === 'priceAsc' ? 'priceDesc' : 'priceAsc')}
        >
          价格 {sortBy === 'priceAsc' ? '↑' : '↓'}
        </View>
        <View className='filter-tab-item' onClick={handleOpenFilter}>
          筛选 <View className='f-icon'></View>
          {(filterParams.priceRange || filterParams.starRating || filterParams.facilities.length > 0) && (
            <View className='filter-badge'></View>
          )}
        </View>
      </View>

      {/* 筛选结果统计 */}
      {!loading && (
        <View className='result-stats-bar'>
          <Text className='stats-text'>找到 {filteredHotels.length} 家酒店</Text>
          {searchParams.priceRange && (
            <Text className='stats-filter-tag'>{searchParams.priceRange}</Text>
          )}
          {searchParams.starRating && (
            <Text className='stats-filter-tag'>{searchParams.starRating}</Text>
          )}
          {searchParams.tags && (
            <Text className='stats-filter-tag'>{searchParams.tags.replace(/,/g, ' · ')}</Text>
          )}
        </View>
      )}

      {/* 酒店列表/地图视图 */}
      {loading ? (
        <LoadingSpinner text='加载中...' />
      ) : filteredHotels.length === 0 ? (
        <EmptyState
          image='🏨'
          title='没有找到符合条件的酒店'
          description='试试调整筛选条件或换个搜索词吧'
          buttonText='重新搜索'
          onButtonClick={() => loadHotels(searchParams)}
        />
      ) : viewMode === 'list' ? (
        <View className='hotel-list-body'>
          {filteredHotels.map((hotel) => (
            <View key={hotel.id} className='hotel-card-box' onClick={() => handleHotelClick(hotel.id)}>
              <View className='hotel-card-left'>
                <Image className='hotel-card-img' src={hotel.img} mode='aspectFill' />
                <View className='play-icon-overlay'>▶</View>
              </View>
              <View className='hotel-card-right'>
                <View className='h-name-row'>
                  <Text className='h-name-text'>{hotel.name}</Text>
                  <Text className='h-stars-text'>{hotel.stars}</Text>
                </View>

                <View className='h-score-row'>
                  <View className='h-score-badge'>{hotel.score}</View>
                  <Text className='h-score-title'>{hotel.scoreDesc}</Text>
                  <Text className='h-reviews-text'>{hotel.reviews} · {hotel.collects}</Text>
                </View>

                {hotel.tags.length > 0 && (
                  <View className='h-location-row'>
                    {hotel.tags.map((t) => (
                      <Text key={t} className='h-loc-tag'>{t}</Text>
                    ))}
                  </View>
                )}

                {hotel.notice && (
                  <View className='h-boss-notice'>
                    <Text className='h-notice-content'>{hotel.notice}</Text>
                  </View>
                )}

                {hotel.services.length > 0 && (
                  <View className='h-service-row'>
                    {hotel.services.map((s, idx) => (
                      <Text key={`${s}-${idx}`} className='h-service-pill'>{s}</Text>
                    ))}
                  </View>
                )}

                <View className='h-price-row'>
                  <View className='h-price-left'>
                    <Text className='h-diamond-price'>钻石贵宾价 {'>'}</Text>
                  </View>
                  <View className='h-price-right'>
                    <Text className='h-price-symbol'>¥</Text>
                    <Text className='h-price-val'>{hotel.price}</Text>
                    <Text className='h-price-unit'>起</Text>
                  </View>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className='hotel-map-container'>
          <Map
            className='hotel-map-view'
            longitude={mapCenter.longitude}
            latitude={mapCenter.latitude}
            scale={14}
            markers={markers}
            onMarkerTap={handleMarkerTap}
            showLocation
          />

          {/* 选中酒店的详情卡片 */}
          {selectedHotel && (
            <View className='hotel-card-popup'>
              <View className='card-close' onClick={handleCloseCard}>✕</View>
              <View className='card-content' onClick={() => handleHotelClick(selectedHotel.id)}>
                <Image className='card-image' src={selectedHotel.img} mode='aspectFill' />
                <View className='card-info'>
                  <Text className='card-name'>{selectedHotel.name}</Text>
                  <View className='card-rating'>
                    <Text className='rating-score'>{selectedHotel.score}分</Text>
                    <Text className='rating-stars'>{selectedHotel.stars}</Text>
                  </View>
                  <Text className='card-address'>{selectedHotel.address}</Text>
                  <View className='card-price-row'>
                    <Text className='price-label'>¥</Text>
                    <Text className='price-value'>{selectedHotel.price}</Text>
                    <Text className='price-unit'>起</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>
      )}

      {/* 筛选面板 */}
      <FilterPanel
        visible={showFilter}
        defaultFilters={filterParams}
        onClose={() => setShowFilter(false)}
        onConfirm={handleConfirmFilter}
      />
    </View>
  );
}

export default HotelList;
