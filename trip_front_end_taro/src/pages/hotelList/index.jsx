import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView } from '@tarojs/components';
import Taro, { usePullDownRefresh } from '@tarojs/taro';
import { getHotels } from '../../services/hotel';
import { formatStars, formatPrice } from '../../utils/format';
import './index.css';

// 演示数据（作为后备）
const demoHotels = [
    // 原有2个酒店
    {
      id: 1,
      name: '上海陆家嘴禧玥酒店',
      stars: '⭐⭐⭐⭐⭐',
      score: '4.8',
      scoreDesc: '超棒',
      reviews: '4695点评',
      collects: '6.3万收藏',
      tags: ['近外滩', '东方明珠'],
      notice: '25楼是沪上知名米其林新荣记',
      services: ['免费升房', '新中式风', '免费停车', '一线江景'],
      price: '936',
      img: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400'
    },
    {
      id: 2,
      name: '艺龙安悦酒店(上海浦东大道歇浦路地铁站店)',
      stars: '⭐⭐⭐',
      score: '4.7',
      scoreDesc: '超棒',
      reviews: '6729点赞',
      collects: '4.5万收藏',
      tags: ['近歇浦路地铁站', '置汇旭辉广场'],
      notice: '临滨江步道可欣赏陆家嘴夜景',
      services: ['免费停车', '免费洗衣服务', '机器人服务', '自助早餐'],
      price: '297',
      oldPrice: '199',
      img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400'
    },
    // 🆕 新增4个酒店（模仿原有格式，字段完整，id递增）
    {
      id: 3,
      name: '上海外滩茂悦大酒店',
      stars: '⭐⭐⭐⭐⭐',
      score: '4.6',
      scoreDesc: '很好',
      reviews: '1.2万点评',
      collects: '8.9万收藏',
      tags: ['外滩核心区', '黄浦江景'],
      notice: '顶层酒吧可俯瞰外滩全景',
      services: ['行政酒廊', '室内泳池', '健身中心', '江景房'],
      price: '1280',
      oldPrice: '1580',
      img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=400'
    },
    {
      id: 4,
      name: '7天优品酒店(上海静安寺店)',
      stars: '⭐⭐⭐',
      score: '4.5',
      scoreDesc: '很好',
      reviews: '8960点评',
      collects: '3.2万收藏',
      tags: ['近静安寺', '南京西路'],
      notice: '步行5分钟至静安寺地铁站',
      services: ['免费WiFi', '自助洗衣', '24小时前台', '行李寄存'],
      price: '239',
      oldPrice: '299',
      img: 'https://images.unsplash.com/photo-1551887190-1930361f6692?w=400'
    },
    {
      id: 5,
      name: '上海虹桥英迪格酒店',
      stars: '⭐⭐⭐⭐',
      score: '4.7',
      scoreDesc: '超棒',
      reviews: '7530点评',
      collects: '5.6万收藏',
      tags: ['近虹桥高铁站', '国家会展中心'],
      notice: '酒店提供免费接送班车至会展中心',
      services: ['亲子房', '免费停车', '中西早餐', '会议室'],
      price: '659',
      oldPrice: '799',
      img: 'https://images.unsplash.com/photo-1583445077513-1914121479cf?w=400'
    },
    {
      id: 6,
      name: '上海迪士尼乐园酒店',
      stars: '⭐⭐⭐⭐⭐',
      score: '4.9',
      scoreDesc: '极致',
      reviews: '2.1万点评',
      collects: '15.8万收藏',
      tags: ['迪士尼园区内', '亲子友好'],
      notice: '可直达迪士尼乐园，含双人早餐+乐园接驳车',
      services: ['主题房', '儿童乐园', '泳池', '免费停车', '礼宾服务'],
      price: '1980',
      oldPrice: '2380',
      img: 'https://images.unsplash.com/photo-1600984645877-1ddd2d899a5f?w=400'
    }
  ];

function HotelList() {
  // 酒店列表数据
  const [hotelList, setHotelList] = useState([]);
  // 搜索参数
  const [searchParams, setSearchParams] = useState({});
  // 加载状态
  const [loading, setLoading] = useState(false);

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
      // 无参数时加载所有酒店
      loadHotels();
    }
  }, []);

  // 加载酒店列表
  const loadHotels = async (params = {}) => {
    setLoading(true);

    try {
      const res = await getHotels({
        locationId: params.locationId,
        keyword: params.keyword
      });

      if (res.success && res.data && res.data.length > 0) {
        // 转换后端数据格式为前端展示格式
        const formattedHotels = res.data.map(hotel => ({
          id: hotel.id,
          name: hotel.nameZh || hotel.name,
          stars: formatStars(hotel.starRating),
          score: hotel.rating || '4.5',
          scoreDesc: hotel.rating >= 4.8 ? '超棒' : hotel.rating >= 4.5 ? '很好' : '不错',
          reviews: `${hotel.reviewCount || 0}点评`,
          collects: `${((hotel.favoriteCount || 0) / 10000).toFixed(1)}万收藏`,
          tags: hotel.location?.name ? [hotel.location.name] : [],
          notice: hotel.description || '',
          services: hotel.facilities ? Object.keys(hotel.facilities).slice(0, 4) : [],
          price: hotel.minPrice || '0',
          img: hotel.images && hotel.images.length > 0
            ? (typeof hotel.images === 'string' ? JSON.parse(hotel.images)[0] : hotel.images[0])
            : 'https://via.placeholder.com/400'
        }));

        setHotelList(formattedHotels);
      } else {
        // 如果 API 返回空数据，使用演示数据
        Taro.showToast({ title: '暂无数据，显示演示', icon: 'none' });
        setHotelList(demoHotels);
      }
    } catch (error) {
      console.error('❌ 加载酒店列表失败:', error);
      // API 失败时使用演示数据
      Taro.showToast({ title: '加载失败，显示演示数据', icon: 'none' });
      setHotelList(demoHotels);
    } finally {
      setLoading(false);
    }
  };

  // 下拉刷新逻辑
  usePullDownRefresh(async () => {
    console.log('触发下拉刷新...');
    await loadHotels(searchParams);
    Taro.stopPullDownRefresh();
  });

  // 点击酒店卡片跳转详情页
  const handleHotelClick = (hotelId) => {
    Taro.navigateTo({
      url: `/pages/hotelDetail/index?id=${hotelId}&checkIn=${searchParams.checkInDate || ''}&checkOut=${searchParams.checkOutDate || ''}`
    });
  };

  return (
<View className='list-page-container'>
{/* 顶部搜索条 */}
<View className='header-nav-section'>
<View className='back-arrow-icon'>{'<'}</View>
<View className='search-pill-box'>
<View className='pill-city-info'>
<Text className='pill-city-name'>上海</Text>
<View className='pill-date-box'>
<Text className='p-date'>住 01-09</Text>
<Text className='p-date'>离 01-10</Text>
</View>
<Text className='p-night'>1晚</Text>
</View>
<View className='pill-input-box'>
<Text className='p-placeholder'>位置/品牌/酒店</Text>
</View>
</View>
<View className='map-entry-box'>
<View className='map-icon-dot'></View>
<Text className='map-text-small'>地图</Text>
</View>
</View>

{/* 筛选栏 */}
<View className='filter-tab-bar'>
<View className='filter-tab-item'>欢迎度排序 <View className='s-arrow'></View></View>
<View className='filter-tab-item'>位置距离 <View className='s-arrow'></View></View>
<View className='filter-tab-item'>价格/星级 <View className='s-arrow'></View></View>
<View className='filter-tab-item'>筛选 <View className='f-icon'></View></View>
</View>

{/* 横向快捷标签 - 保留scroll-x属性 */}
<ScrollView scroll-x className='quick-tags-scroll-view'>
<View className='tags-flex-container'>
{['外滩', '双床房', '含早餐', '免费兑早餐', '可订', '大床房'].map((tag) => (
<View key={tag} className='quick-tag-pill'>{tag}</View>
))}
</View>
</ScrollView>

{/* 酒店列表主体 */}
<View className='hotel-list-body'>
{hotelList.map((hotel) => (
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

<View className='h-location-row'>
{hotel.tags.map((t) => (
<Text key={t} className='h-loc-tag'>{t}</Text>
))}
</View>

<View className='h-boss-notice'>
<Text className='h-notice-content'>{hotel.notice}</Text>
</View>

<View className='h-service-row'>
{hotel.services.map((s) => (
<Text key={s} className='h-service-pill'>{s}</Text>
))}
</View>

<View className='h-price-row'>
<View className='h-price-left'>
<Text className='h-diamond-price'>钻石贵宾价 {'>'}</Text>
</View>
<View className='h-price-right'>
{hotel.oldPrice && <Text className='h-price-old'>¥{hotel.oldPrice}</Text>}
<Text className='h-price-symbol'>¥</Text>
<Text className='h-price-val'>{hotel.price}</Text>
<Text className='h-price-unit'>起</Text>
</View>
</View>

{hotel.id === 2 && (
<View className='h-promo-tags'>
<Text className='h-promo-tag-o'>钻石贵宾价</Text>
<Text className='h-promo-tag-r'>满减券</Text>
<Text className='h-promo-more'>3项优惠98 {'>'}</Text>
</View>
)}
</View>
</View>
))}
</View>
</View>
  );
}

export default HotelList;