import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, Image, Input, Button, Swiper, SwiperItem, ScrollView, Textarea } from '@tarojs/components';
import Taro from '@tarojs/taro';
import Calendar from '../../components/Calendar';
import SearchSuggestion from '../../components/SearchSuggestion';
import { getLocations } from '../../services/location';
import { getTags } from '../../services/tag';
import { BANNER_IMAGES } from '../../config/images';
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

  // --- 筛选条件 ---
  const [selectedPriceRange, setSelectedPriceRange] = useState('');
  const [selectedStarRating, setSelectedStarRating] = useState('');

  // --- 搜索建议相关状态 ---
  const [showSearchSuggestion, setShowSearchSuggestion] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const [hotSearches] = useState([
    '上海外滩酒店',
    '浦东机场附近',
    '迪士尼度假区',
    '南京路步行街',
    '虹桥枢纽',
    '豫园附近',
    '陆家嘴金融中心',
    '新天地商圈'
  ]);

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
    loadSearchHistory();
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

  // 加载搜索历史
  const loadSearchHistory = () => {
    try {
      const history = Taro.getStorageSync('searchHistory') || [];
      setSearchHistory(history);
    } catch (error) {
      console.error('❌ 加载搜索历史失败:', error);
    }
  };

  // 保存搜索历史
  const saveSearchHistory = (keyword) => {
    if (!keyword || !keyword.trim()) return;

    try {
      let history = Taro.getStorageSync('searchHistory') || [];

      // 去重：移除已存在的相同关键词
      history = history.filter(item => item !== keyword);

      // 添加到最前面
      history.unshift(keyword);

      // 最多保留10条
      if (history.length > 10) {
        history = history.slice(0, 10);
      }

      Taro.setStorageSync('searchHistory', history);
      setSearchHistory(history);
    } catch (error) {
      console.error('❌ 保存搜索历史失败:', error);
    }
  };

  // 清空搜索历史
  const handleClearSearchHistory = () => {
    Taro.showModal({
      title: '清空搜索历史',
      content: '确定要清空所有搜索历史吗？',
      success: (res) => {
        if (res.confirm) {
          try {
            Taro.removeStorageSync('searchHistory');
            setSearchHistory([]);
            Taro.showToast({ title: '已清空', icon: 'success', duration: 1000 });
          } catch (error) {
            console.error('❌ 清空搜索历史失败:', error);
          }
        }
      }
    });
  };

  // 选择搜索建议
  const handleSelectSuggestion = (keyword) => {
    setSearchKeyword(keyword);
    setShowSearchSuggestion(false);
    saveSearchHistory(keyword);
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

  // 快捷日期选择
  const handleQuickDateSelect = (type) => {
    const todayStr = today.format('YYYY-MM-DD');
    const tomorrowStr = tomorrow.format('YYYY-MM-DD');
    const dayAfterTomorrowStr = today.add(2, 'day').format('YYYY-MM-DD');
    const nextWeekStr = today.add(7, 'day').format('YYYY-MM-DD');

    switch (type) {
      case 'today':
        setStartDate(todayStr);
        setEndDate(tomorrowStr);
        break;
      case 'tomorrow':
        setStartDate(tomorrowStr);
        setEndDate(dayAfterTomorrowStr);
        break;
      case 'weekend':
        // 找到本周末（周五到周日）
        const dayOfWeek = today.day();
        const daysUntilFriday = dayOfWeek <= 5 ? 5 - dayOfWeek : 7 - dayOfWeek + 5;
        const fridayStr = today.add(daysUntilFriday, 'day').format('YYYY-MM-DD');
        const sundayStr = today.add(daysUntilFriday + 2, 'day').format('YYYY-MM-DD');
        setStartDate(fridayStr);
        setEndDate(sundayStr);
        break;
      case 'nextweek':
        setStartDate(nextWeekStr);
        setEndDate(today.add(8, 'day').format('YYYY-MM-DD'));
        break;
    }
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

  // 价格/星级筛选处理
  const handleFilterSelect = () => {
    Taro.showActionSheet({
      itemList: ['选择价格', '选择星级'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 选择价格范围
          handlePriceSelect();
        } else {
          // 选择星级
          handleStarSelect();
        }
      }
    });
  };

  // 价格选择
  const handlePriceSelect = () => {
    const priceRanges = ['不限', '0-200元', '200-400元', '400-600元', '600元以上'];
    Taro.showActionSheet({
      itemList: priceRanges,
      success: (res) => {
        setSelectedPriceRange(priceRanges[res.tapIndex] === '不限' ? '' : priceRanges[res.tapIndex]);
      }
    });
  };

  // 星级选择
  const handleStarSelect = () => {
    const starRatings = ['不限', '三星级及以上', '四星级及以上', '五星级'];
    Taro.showActionSheet({
      itemList: starRatings,
      success: (res) => {
        setSelectedStarRating(starRatings[res.tapIndex] === '不限' ? '' : starRatings[res.tapIndex]);
      }
    });
  };

  // 查询按钮处理
  const handleSearch = () => {
    const keyword = searchKeyword.trim();

    // 保存搜索历史
    if (keyword) {
      saveSearchHistory(keyword);
    }

    // 构建查询参数
    const params = {
      locationId: selectedLocation?.id,
      checkInDate: startDate,
      checkOutDate: endDate,
      keyword: keyword,
      priceRange: selectedPriceRange,
      starRating: selectedStarRating
    };

    // 关闭搜索建议
    setShowSearchSuggestion(false);

    // 跳转到酒店列表页，传递参数
    Taro.navigateTo({
      url: `/pages/hotelList/index?params=${encodeURIComponent(JSON.stringify(params))}`
    });
  };

  // 搜索框获得焦点
  const handleSearchFocus = () => {
    setShowSearchSuggestion(true);
  };

  // 搜索框失去焦点
  const handleSearchBlur = () => {
    // 延迟关闭，以便点击建议项能被触发
    setTimeout(() => {
      setShowSearchSuggestion(false);
    }, 200);
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
          interval={5000}
          duration={500}
          indicatorColor="rgba(255, 255, 255, 0.4)"
          indicatorActiveColor="#ffffff"
          className='banner-swiper'
        >
          {BANNER_IMAGES.map((img, index) => (
            <SwiperItem key={index}>
              <Image
                className='banner-img'
                src={img}
                mode='aspectFill'
                lazyLoad
              />
            </SwiperItem>
          ))}
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
          <View className='input-wrap-box' style={{ position: 'relative' }}>
            <Input
              className='search-input-el'
              placeholder='位置/品牌/酒店'
              placeholderStyle='color:#ccc;'
              value={searchKeyword}
              onInput={(e) => setSearchKeyword(e.detail.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
            <SearchSuggestion
              visible={showSearchSuggestion}
              keyword={searchKeyword}
              searchHistory={searchHistory}
              hotSearches={hotSearches}
              onSelect={handleSelectSuggestion}
              onClearHistory={handleClearSearchHistory}
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

        {/* 快捷日期选择 */}
        {!isHourlyRoom && (
          <View className='quick-date-row'>
            <View className='quick-date-item' onClick={() => handleQuickDateSelect('today')}>
              <Text className='quick-date-text'>今晚</Text>
            </View>
            <View className='quick-date-item' onClick={() => handleQuickDateSelect('tomorrow')}>
              <Text className='quick-date-text'>明晚</Text>
            </View>
            <View className='quick-date-item' onClick={() => handleQuickDateSelect('weekend')}>
              <Text className='quick-date-text'>周末</Text>
            </View>
          </View>
        )}

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
        <View className='row-section price-filter-row' onClick={handleFilterSelect}>
          <Text className={selectedPriceRange || selectedStarRating ? 'filter-active-text' : 'placeholder-light-text'}>
            {selectedPriceRange || selectedStarRating || '价格/星级'}
          </Text>
          <View className='filter-arrow-icon'></View>
        </View>

        {/* 快速标签 */}
        <View className='quick-tags-row'>
          {tags.length > 0 ? (
            tags.map((tag) => (
              <View
                key={tag.id}
                className='tag-bubble-item'
              >
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

      {/* AI 助手组件 */}
      <AiAssistant />
    </View>
  );
}

// AI 助手组件
const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { 
      id: 'msg_0', 
      role: 'assistant', 
      content: '您好！我是您的旅行助手。请问您想去哪里旅行，或者对酒店有什么要求？',
      timestamp: new Date().getTime()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastMsgId, setLastMsgId] = useState('msg_0');

  // 当消息更新时，自动滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsgIndex = messages.length - 1;
      setLastMsgId(`msg_${lastMsgIndex}`);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date().getTime()
    };

    // 添加用户消息
    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    setLoading(true);

    try {
      console.log('发送消息到API:', userInput);
      
      // 调用您的本地AI推荐API
      const response = await Taro.request({
        url: 'http://localhost:3000/api/ai/recommend',
        method: 'POST',
        timeout: 30000, // 30秒超时
        header: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        data: {
          messages: [
            ...messages.map(m => ({ 
              role: m.role, 
              content: m.content 
            })),
            { role: 'user', content: userInput }
          ]
        }
      });

      console.log('API响应:', response);

      if (response.statusCode === 200) {
        // 检查响应格式
        let aiContent = '';
        
        if (typeof response.data === 'string') {
          aiContent = response.data;
        } else if (response.data && response.data.content) {
          aiContent = response.data.content;
        } else if (response.data && response.data.recommendations) {
          // 如果API返回的是推荐列表，格式化显示
          const recs = response.data.recommendations;
          aiContent = `我为您找到了${recs.length}个推荐：\n\n` +
            recs.map((rec, index) => 
              `${index + 1}. ${rec.name || '未命名'} - ${rec.description || '暂无描述'}`
            ).join('\n');
        } else {
          aiContent = '我收到了您的请求，正在为您搜索合适的酒店...';
        }

        const assistantMsg = {
          id: `msg_${Date.now()}_ai`,
          role: 'assistant',
          content: aiContent,
          timestamp: new Date().getTime()
        };
        
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error(`请求失败，状态码: ${response.statusCode}`);
      }
    } catch (error) {
      console.error('API请求错误:', error);
      
      // 简单的错误处理
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        role: 'assistant',
        content: '抱歉，服务暂时不可用，请稍后再试。',
        timestamp: new Date().getTime()
      }]);
    } finally {
      setLoading(false);
    }
  };

  // 格式化时间
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <View className='ai-assistant-wrapper'>
      {/* 1.悬浮触发按钮 */}
      <View 
        className={`ai-float-btn ${isOpen ? 'active' : ''}`} 
        onClick={() => setIsOpen(true)}
      >
        <Text className='ai-btn-icon'>🤖</Text>
        <Text className='ai-btn-text'>AI 助手</Text>
      </View>

      {/* 2.聊天主窗口 */}
      {isOpen && (
        <View className='ai-chat-window'>
          <View className='chat-header'>
            <View className='header-left'>
              <Text className='header-avatar'>🤖</Text>
              <Text className='header-title'>AI 旅行助手</Text>
            </View>
            <View className='header-close' onClick={() => setIsOpen(false)}>×</View>
          </View>

          {/* 消息滚动区域 */}
          <ScrollView
            className='chat-scroll-view'
            scrollY
            scrollIntoView={lastMsgId}
            scrollWithAnimation
          >
            {messages.map((item, index) => (
              <View
                key={item.id}
                id={`msg_${index}`}
                className={`message-row ${item.role === 'user' ? 'user-row' : 'bot-row'}`}
              >
                <View className='avatar-sm'>{item.role === 'user' ? '👤' : '🤖'}</View>
                <View className='message-bubble'>
                  <Text className='message-text'>{item.content}</Text>
                  <Text className='message-time'>{formatTime(item.timestamp)}</Text>
                </View>
              </View>
            ))}
            
            {/* 加载动画 */}
            {loading && (
              <View className='message-row bot-row'>
                <View className='avatar-sm'>🤖</View>
                <View className='message-bubble loading-bubble'>
                  <View className='dot-flashing'></View>
                </View>
              </View>
            )}
          </ScrollView>

          {/* 输入区域 */}
          <View className='chat-input-bar'>
            <Textarea
              className='chat-input'
              value={input}
              onInput={e => setInput(e.detail.value)}
              placeholder='例如：我想去上海预订酒店，预算500-1000元...'
              autoHeight
              fixed
              cursorSpacing={20}
              maxlength={500}
              disabled={loading}
            />
            <Button
              className={`chat-send-btn ${!input.trim() || loading ? 'disabled' : ''}`}
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              {loading ? '发送中...' : '发送'}
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default Home;