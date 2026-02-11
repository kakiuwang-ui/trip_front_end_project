import { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, Textarea, Button } from '@tarojs/components';
import Taro from '@tarojs/taro';
import { useTheme } from '../../utils/useTheme';
import './index.css';

const AiAssistant = () => {
  const { cssVars } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'msg_0', role: '', content: '您好！我是您的旅行助手。请问您想去哪里旅行，或者对酒店有什么要求？' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastMsgId, setLastMsgId] = useState('msg_0');
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const dragState = useRef({ dragging: false, startX: 0, startY: 0, startPosX: 0, startPosY: 0, moved: false });
  const screenRef = useRef({ w: 375, h: 667 });
  const BTN_SIZE = 54;

  useEffect(() => {
    const info = Taro.getSystemInfoSync();
    screenRef.current = { w: info.windowWidth, h: info.windowHeight };
    setPos({ x: info.windowWidth - BTN_SIZE - 16, y: info.windowHeight - BTN_SIZE - 100 });
  }, []);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    dragState.current = {
      dragging: true,
      startX: touch.clientX,
      startY: touch.clientY,
      startPosX: pos.x,
      startPosY: pos.y,
      moved: false,
    };
  };

  const handleTouchMove = (e) => {
    if (!dragState.current.dragging) return;
    const touch = e.touches[0];
    const dx = touch.clientX - dragState.current.startX;
    const dy = touch.clientY - dragState.current.startY;
    if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
      dragState.current.moved = true;
    }
    const { w, h } = screenRef.current;
    const newX = Math.min(Math.max(0, dragState.current.startPosX + dx), w - BTN_SIZE);
    const newY = Math.min(Math.max(0, dragState.current.startPosY + dy), h - BTN_SIZE);
    setPos({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    if (!dragState.current.moved) {
      setIsOpen(true);
    }
    dragState.current.dragging = false;
  };

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
    setInput('');
    setLoading(true);

    try {
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
    <View className='ai-assistant-wrapper' style={cssVars}>
      {/* 可拖拽悬浮按钮 */}
      <View
        className='ai-float-btn'
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          width: `${BTN_SIZE}px`,
          height: `${BTN_SIZE}px`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <Text className='ai-btn-text'>AI</Text>
      </View>

      {/* 聊天主窗口 */}
      {isOpen && (
        <View className='ai-chat-window'>
          <View className='chat-header'>
            <View className='header-left'>
              <Text className='header-title'>AI 旅行助手</Text>
            </View>
            <View className='header-close' onClick={() => setIsOpen(false)}>×</View>
          </View>

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
                <View className='message-bubble'>
                  <Text className='message-text'>{item.content}</Text>
                </View>
              </View>
            ))}
            {loading && (
              <View className='message-row bot-row'>
                <View className='message-bubble loading-bubble'>
                  <View className='dot-flashing'></View>
                </View>
              </View>
            )}
          </ScrollView>

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
              className='chat-send-btn'
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
