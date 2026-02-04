import React, { useState } from 'react';
import { View, Text, Button } from '@tarojs/components';
import './index.css';

/**
 * 筛选面板组件
 * @param {boolean} visible - 是否显示
 * @param {function} onClose - 关闭回调
 * @param {function} onConfirm - 确认回调
 * @param {object} defaultFilters - 默认筛选条件
 */
function FilterPanel({ visible, onClose, onConfirm, defaultFilters = {} }) {
  // 价格区间
  const [priceRange, setPriceRange] = useState(defaultFilters.priceRange || null);
  // 星级
  const [starRating, setStarRating] = useState(defaultFilters.starRating || null);
  // 设施
  const [facilities, setFacilities] = useState(defaultFilters.facilities || []);

  // 价格选项
  const priceOptions = [
    { label: '不限', value: null },
    { label: '200以下', value: [0, 200] },
    { label: '200-500', value: [200, 500] },
    { label: '500-1000', value: [500, 1000] },
    { label: '1000以上', value: [1000, 99999] }
  ];

  // 星级选项
  const starOptions = [
    { label: '不限', value: null },
    { label: '三星级', value: 3 },
    { label: '四星级', value: 4 },
    { label: '五星级', value: 5 }
  ];

  // 设施选项
  const facilityOptions = [
    '免费WiFi',
    '免费停车',
    '游泳池',
    '健身房',
    '儿童乐园',
    '餐厅',
    '会议室',
    '机场接送'
  ];

  // 切换设施选择
  const toggleFacility = (facility) => {
    if (facilities.includes(facility)) {
      setFacilities(facilities.filter(f => f !== facility));
    } else {
      setFacilities([...facilities, facility]);
    }
  };

  // 重置筛选
  const handleReset = () => {
    console.log('🔄 FilterPanel 重置筛选');
    setPriceRange(null);
    setStarRating(null);
    setFacilities([]);
  };

  // 确认筛选
  const handleConfirm = () => {
    console.log('🎯 FilterPanel 确认筛选:', { priceRange, starRating, facilities });
    onConfirm({
      priceRange,
      starRating,
      facilities
    });
  };

  if (!visible) return null;

  return (
    <View className='filter-panel-mask' onClick={onClose}>
      <View className='filter-panel-content' onClick={(e) => e.stopPropagation()}>
        {/* 标题栏 */}
        <View className='filter-header'>
          <Text className='filter-title'>筛选</Text>
          <Text className='filter-reset' onClick={handleReset}>重置</Text>
        </View>

        {/* 价格区间 */}
        <View className='filter-section'>
          <Text className='filter-section-title'>价格区间</Text>
          <View className='filter-options'>
            {priceOptions.map((option) => (
              <View
                key={option.label}
                className={`filter-option ${JSON.stringify(priceRange) === JSON.stringify(option.value) ? 'active' : ''}`}
                onClick={() => setPriceRange(option.value)}
              >
                <Text>{option.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 星级 */}
        <View className='filter-section'>
          <Text className='filter-section-title'>星级</Text>
          <View className='filter-options'>
            {starOptions.map((option) => (
              <View
                key={option.label}
                className={`filter-option ${starRating === option.value ? 'active' : ''}`}
                onClick={() => setStarRating(option.value)}
              >
                <Text>{option.label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 设施 */}
        <View className='filter-section'>
          <Text className='filter-section-title'>酒店设施</Text>
          <View className='filter-options'>
            {facilityOptions.map((facility) => (
              <View
                key={facility}
                className={`filter-option ${facilities.includes(facility) ? 'active' : ''}`}
                onClick={() => toggleFacility(facility)}
              >
                <Text>{facility}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* 底部按钮 */}
        <View className='filter-footer'>
          <Button className='filter-btn cancel' onClick={onClose}>取消</Button>
          <Button className='filter-btn confirm' onClick={handleConfirm}>确定</Button>
        </View>
      </View>
    </View>
  );
}

export default FilterPanel;
