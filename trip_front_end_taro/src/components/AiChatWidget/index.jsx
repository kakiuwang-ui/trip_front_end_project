import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import './index.css';

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'msg_0', role: '', content: '您好！我是您的旅行助手。请问您想去哪里旅行，或者对酒店有什么要求？' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastMsgId, setLastMsgId] = useState('msg_0');

  // 当消息更新时，自动滚动到底部
  useEffect(() => {
    if (messages.length > 0) {
      setLastMsgId(`msg_${messages.length - 1}`);
    }
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = {
      id: `msg_${messages.length}`,
      role: '',
      content: input
    };

    setMessages(prev => [...prev, userMsg]);
    const userInput = input;
    setInput('');
    setLoading(true);

    try {
      // 注意：小程序环境通常不支持原生的流式读取，
      // 这里建议使用 Taro.request 或标准交互
      const response = await Taro.request({
        url: 'http://localhost:3000/api/ai/recommend',
        method: 'POST',
        data: {
          messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content }))
        }
      });

      if (response.statusCode === 200) {
        const assistantMsg = {
          id: `msg_${messages.length + 1}`,
          role: '',
          content: response.data.content || '我收到您的消息了！'
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        throw new Error('请求失败');
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: `err_${Date.now()}`,
        role: '',
        content: '抱歉，服务暂时不可用，请稍后再试。'
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className='ai-assistant-wrapper'>
      {/* 1.悬浮触发按钮 */}
      <View className='ai-float-btn' onClick={() => setIsOpen(true)}>
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
                className={`message-row ${item.role === '' ? 'user-row' : 'bot-row'}`}
              >
                <View className='avatar-sm'>{item.role === '' ? '👤' : '🤖'}</View>
                <View className='message-bubble'>
                  <Text className='message-text'>{item.content}</Text>
                </View>
              </View>
            ))}
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
              placeholder='我想去上海预订酒店...'
              autoHeight
              fixed
              cursorSpacing={20}
            />
            <Button
              className={`chat-send-btn ${!input.trim() ? '' : ''}`}
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              发送
            </Button>
          </View>
        </View>
      )}
    </View>
  );
};

export default AiAssistant;