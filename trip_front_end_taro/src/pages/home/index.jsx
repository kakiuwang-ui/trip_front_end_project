import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Input, Button, Swiper, SwiperItem } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Calendar from '../../components/Calendar';
import { getLocations } from '../../services/location';
import { getTags } from '../../services/tag';
import dayjs from 'dayjs';
import './index.css';

function Home() {
  // --- 基础状态：标签切换 ---
  const [currentTab, setCurrentTab] = useState(0);
  const tabs = ['国内', '海外', '钟点房', '民宿'];

  // --- 位置和标签数据（从 API 获取）---
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [tags, setTags] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');

  // --- 日历控制状态 ---
  const [isCalendarVisible, setIsCalendarVisible] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // 实际上的今天和明天
  const today = dayjs();
  const tomorrow = today.add(1, 'day');

  // 检查当前标签是否为钟点房
  const isHourlyRoom = useMemo(() => currentTab === 2, [currentTab]);

  // 检查当前时间是否在凌晨0点到6点之间
  const isEarlyMorning = useMemo(() => {
    const currentHour = today.hour();
    return currentHour >= 0 && currentHour < 6;
  }, [today]);

  // 初始化默认日期（今天和明天）
  useEffect(() => {
    if (!startDate && !endDate) {
      // 只在首次加载时设置默认日期
      const todayStr = today.format('YYYY-MM-DD');
      const tomorrowStr = tomorrow.format('YYYY-MM-DD');
      setStartDate(todayStr);
      setEndDate(tomorrowStr);
    }
  }, [today, tomorrow]);

  // 加载位置和标签数据
  useEffect(() => {
    loadInitialData();
  }, []);

  // 加载初始数据（位置和标签）
  const loadInitialData = async () => {
    try {
      // 并发加载位置和标签数据
      const [locationsRes, tagsRes] = await Promise.all([
        getLocations(),
        getTags()
      ]);

      // 处理位置数据
      if (locationsRes.success && locationsRes.data) {
        setLocations(locationsRes.data);
        // 默认选择第一个位置
        if (locationsRes.data.length > 0) {
          setSelectedLocation(locationsRes.data[0]);
        }
      }

      // 处理标签数据
      if (tagsRes.success && tagsRes.data) {
        // 只显示前 3 个标签
        setTags(tagsRes.data.slice(0, 3));
      }
    } catch (error) {
      console.error('❌ 加载初始数据失败:', error);
      // 使用默认数据
      setSelectedLocation({ id: 1, name: '上海' });
    }
  };

  // ----------------------- 事件处理函数 -----------------------
  // 1. 打开日历：点击日期行触发
  const handleOpenCalendar = () => {
    setIsCalendarVisible(true);
  };

  // 2. 日历确认选择：接收日历返回日期，更新状态并关闭日历
  const handleCalendarConfirm = (start, end) => {
    console.log('日历返回:', { start, end, isHourlyRoom });
    
    setIsCalendarVisible(false);
    
    if (isHourlyRoom) {
      // 钟点房模式：只需要一个日期
      if (start) {
        setStartDate(start);
        setEndDate(''); // 钟点房不需要离店日期
      }
    } else {
      // 其他模式：日历组件会返回两个日期
      // 注意：日历组件在选择过程中会多次调用onSelect：
      // 1. 第一次选择入住日期：start=日期, end=''
      // 2. 第二次选择离店日期：start=入住日期, end=离店日期
      if (start && end) {
        // 当两个日期都存在时，同时更新
        setStartDate(start);
        setEndDate(end);
      } else if (start) {
        // 只传入了入住日期，说明选择了新的入住日期，需要重置离店日期
        setStartDate(start);
        setEndDate(''); // 重置离店日期
      }
    }
  };

  // 3. 计算晚数或显示钟点房
  const getNightCount = () => {
    if (isHourlyRoom) {
      return '钟点房';
    }
    
    // 使用当前选中的日期计算
    const start = startDate ? dayjs(startDate) : today;
    const end = endDate ? dayjs(endDate) : tomorrow;
    
    // 确保离店日期晚于入住，按天计算差值
    if (end.isAfter(start, 'day')) {
      return `共${end.diff(start, 'day')}晚`;
    }
    return '共1晚';
  };

  // 获取显示的日期格式
  const getDisplayDate = (date, isToday = false, isTomorrow = false) => {
    if (date) {
      return dayjs(date).format('MM月DD日');
    } else if (isTomorrow) {
      return tomorrow.format('MM月DD日');
    }
    return today.format('MM月DD日');
  };

  // 获取日期描述
  const getDateDesc = (isStartDate, date) => {
    if (isHourlyRoom) {
      return date ? '入住日期' : '今天';
    }
    
    if (date) {
      return isStartDate ? '入住' : '离店';
    }
    return isStartDate ? '今天' : '明天';
  };

  // 切换标签时的处理
  const handleTabChange = (index) => {
    setCurrentTab(index);

    if (index === 2) { // 切换到钟点房
      // 如果已有开始日期，保留；否则设为今天
      if (!startDate) {
        setStartDate(today.format('YYYY-MM-DD'));
      }
      setEndDate(''); // 清空离店日期
    } else { // 切换到其他模式
      // 如果没有开始日期，设为今天
      if (!startDate) {
        setStartDate(today.format('YYYY-MM-DD'));
      }
      // 如果没有结束日期，设为明天
      if (!endDate) {
        setEndDate(tomorrow.format('YYYY-MM-DD'));
      }
    }
  };

  // 城市选择处理
  const handleCitySelect = () => {
    if (locations.length === 0) {
      Taro.showToast({ title: '加载中...', icon: 'none' });
      return;
    }

    const itemList = locations.map(loc => loc.name);

    Taro.showActionSheet({
      itemList,
      success: (res) => {
        setSelectedLocation(locations[res.tapIndex]);
      }
    });
  };

  // 查询按钮处理
  const handleSearch = () => {
    // 构建查询参数
    const params = {
      locationId: selectedLocation?.id,
      checkInDate: startDate,
      checkOutDate: endDate,
      keyword: searchKeyword.trim()
    };

    // 跳转到酒店列表页，传递参数
    Taro.navigateTo({
      url: `/pages/hotelList/index?params=${encodeURIComponent(JSON.stringify(params))}`
    });
  };

  // ----------------------- 页面渲染 -----------------------
  return (
    <View className='home-page-container'>
      {/* 顶部轮播图 */}
      <View className='top-banner-box'>
        <Swiper
          autoplay
          circular
          indicatorDots
          indicatorColor="#ffffff80"
          indicatorActiveColor="#ffffff"
          className='banner-swiper'
        >
          <SwiperItem>
            <Image
              className='banner-img'
              src='http://localhost:3000/uploads/1770189062477-9-2026-02-03185959.png'
              mode='aspectFill'
            />
          </SwiperItem>
          <SwiperItem>
            <Image
              className='banner-img'
              src='http://localhost:3000/uploads/1770189498058-967-2026-02-03185959.png'
              mode='aspectFill'
            />
          </SwiperItem>
          <SwiperItem>
            <Image
              className='banner-img'
              src='http://localhost:3000/uploads/1770189524279-198-2026-01-12155024.png'
              mode='aspectFill'
            />
          </SwiperItem>
        </Swiper>

      </View>

      {/* 搜索卡片主体 */}
      <View className='search-main-card'>
        {/* 标签切换 */}
        <View className='tabs-header-row'>
          {tabs.map((tab, index) => (
            <View
              key={index}
              className={currentTab === index ? 'tab-item-box active' : 'tab-item-box'}
              onClick={() => handleTabChange(index)}
            >
              <Text className='tab-text-val'>{tab}</Text>
              {currentTab === index && <View className='tab-active-line' />}
            </View>
          ))}
        </View>

        {/* 城市选择+搜索输入 */}
        <View className='row-section city-search-row'>
          <View className='city-wrap-box' onClick={handleCitySelect}>
            <Text className='city-label-text'>
              {selectedLocation?.name || '上海'}
            </Text>
            <View className='triangle-down-icon'></View>
          </View>
          <View className='input-wrap-box'>
            <Input
              className='search-input-el'
              placeholder='位置/品牌/酒店'
              placeholderStyle='color:#ccc;'
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
            />
          </View>
          <View className='gps-location-box'>
            <View className='gps-circle-icon'></View>
          </View>
        </View>

        {/* 日期选择行：点击打开日历 */}
        <View className='row-section date-select-row' onClick={handleOpenCalendar}>
          {isHourlyRoom ? (
            // 钟点房：只显示一个日期
            <View className='date-single-info'>
              <View className='date-item-group'>
                <Text className='date-val-num'>
                  {getDisplayDate(startDate, true)}
                </Text>
                <Text className='date-desc-text'>
                  {getDateDesc(true, startDate)}
                </Text>
              </View>
            </View>
          ) : (
            // 其他模式：显示入住和离店日期
            <View className='date-left-info'>
              <View className='date-item-group'>
                <Text className='date-val-num'>
                  {getDisplayDate(startDate, true)}
                </Text>
                <Text className='date-desc-text'>
                  {getDateDesc(true, startDate)}
                </Text>
              </View>
              <View className='date-divider-line'></View>
              <View className='date-item-group'>
                <Text className='date-val-num'>
                  {getDisplayDate(endDate, false, true)}
                </Text>
                <Text className='date-desc-text'>
                  {getDateDesc(false, endDate)}
                </Text>
              </View>
            </View>
          )}
          <Text className='night-count-total'>{getNightCount()}</Text>
        </View>

        {/* 凌晨提示条：只在0-6点显示 */}
        {isEarlyMorning && (
          <View className='night-notice-bar'>
            <Text className='moon-icon-fix'>🌙</Text>
            <Text className='notice-content-text'>
              当前已过0点，如需今天凌晨6点前入住，请选择"今天凌晨"
            </Text>
          </View>
        )}

        {/* 价格/星级筛选 */}
        <View className='row-section price-filter-row'>
          <Text className='placeholder-light-text'>价格/星级</Text>
        </View>

        {/* 快速标签 */}
        <View className='quick-tags-row'>
          {tags.length > 0 ? (
            tags.map((tag) => (
              <View key={tag.id} className='tag-bubble-item'>
                {tag.name}
              </View>
            ))
          ) : (
            <>
              <View className='tag-bubble-item'>免费停车场</View>
              <View className='tag-bubble-item'>上海浦东国际机场</View>
              <View className='tag-bubble-item'>上海虹桥...</View>
            </>
          )}
        </View>

        {/* 查询按钮 */}
        <Button className='submit-search-btn' onClick={handleSearch}>
          查询
        </Button>
      </View>

      {/* 日历组件 */}
      <Calendar
        visible={isCalendarVisible}
        onSelect={handleCalendarConfirm}
        onClose={() => setIsCalendarVisible(false)}
        startDate={startDate}
        endDate={endDate}
        today={today}
        mode={isHourlyRoom ? 'single' : 'range'}
      />
    </View>
  );
}

export default Home;