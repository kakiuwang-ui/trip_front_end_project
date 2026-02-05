/**
 * 搜索建议组件
 * 提供搜索历史和热门搜索建议
 */
import React from 'react';
import { View, Text } from '@tarojs/components';
import './index.css';

function SearchSuggestion({
  visible,
  keyword,
  searchHistory = [],
  hotSearches = [],
  onSelect,
  onClearHistory
}) {
  if (!visible) return null;

  // 根据关键词过滤历史记录
  const filteredHistory = keyword
    ? searchHistory.filter(item => item.toLowerCase().includes(keyword.toLowerCase()))
    : searchHistory;

  return (
    <View className='search-suggestion-container'>
      {/* 搜索历史 */}
      {filteredHistory.length > 0 && (
        <View className='suggestion-section'>
          <View className='section-header'>
            <Text className='section-title'>搜索历史</Text>
            <Text className='clear-btn' onClick={onClearHistory}>清空</Text>
          </View>
          <View className='history-list'>
            {filteredHistory.map((item, index) => (
              <View
                key={index}
                className='history-item'
                onClick={() => onSelect(item)}
              >
                <Text className='history-icon'>🕒</Text>
                <Text className='history-text'>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 热门搜索 */}
      {!keyword && hotSearches.length > 0 && (
        <View className='suggestion-section'>
          <View className='section-header'>
            <Text className='section-title'>热门搜索</Text>
          </View>
          <View className='hot-search-list'>
            {hotSearches.map((item, index) => (
              <View
                key={index}
                className='hot-search-item'
                onClick={() => onSelect(item)}
              >
                <Text className={`hot-rank ${index < 3 ? 'hot-rank-top' : ''}`}>
                  {index + 1}
                </Text>
                <Text className='hot-search-text'>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* 空状态 */}
      {keyword && filteredHistory.length === 0 && (
        <View className='empty-suggestion'>
          <Text className='empty-text'>暂无匹配结果</Text>
        </View>
      )}
    </View>
  );
}

export default SearchSuggestion;
