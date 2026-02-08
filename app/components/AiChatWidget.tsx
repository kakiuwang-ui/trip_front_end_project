'use client';

import { useState, useRef, useEffect } from 'react';
import { FloatButton, Card, Input, List, Avatar, Button, Spin, theme } from 'antd';
import { MessageOutlined, CloseOutlined, UserOutlined, RobotOutlined, SendOutlined } from '@ant-design/icons';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '您好！我是您的旅行助手。请问您想去哪里旅行，或者对酒店有什么要求？' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { token } = theme.useToken();

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMsg] 
        }),
      });

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      
      // Create a placeholder for assistant message
      let currentAssistantMsg: Message = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, currentAssistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        currentAssistantMsg.content += chunk;
        
        // Update the last message with new content
        setMessages(prev => {
           const newMsgs = [...prev];
           newMsgs[newMsgs.length - 1] = { ...currentAssistantMsg };
           return newMsgs;
        });
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，服务暂时不可用，请稍后再试。' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      <FloatButton 
        type="primary" 
        icon={<MessageOutlined />} 
        onClick={() => setIsOpen(!isOpen)}
        style={{ right: 24, bottom: 24, zIndex: 1000 }}
        tooltip="AI 旅行助手"
      />
      
      {isOpen && (
        <Card 
          style={{ 
            position: 'fixed', 
            right: 24, 
            bottom: 80, 
            width: 380, 
            height: 600, 
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)',
            padding: 0
          }}
          styles={{ 
            body: { 
              padding: 0, 
              display: 'flex', 
              flexDirection: 'column', 
              height: '100%' 
            }
          }}
          title={
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RobotOutlined style={{ color: token.colorPrimary }} />
              <span>AI 旅行助手</span>
            </div>
          }
          extra={<Button type="text" icon={<CloseOutlined />} onClick={() => setIsOpen(false)} />}
        >
          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', background: '#f5f5f5' }}>
            <List
              dataSource={messages}
              split={false}
              renderItem={(item) => (
                <List.Item style={{ padding: '8px 0', border: 'none', justifyContent: item.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{ 
                    display: 'flex', 
                    flexDirection: item.role === 'user' ? 'row-reverse' : 'row',
                    gap: 8,
                    maxWidth: '85%'
                  }}>
                    <Avatar 
                      icon={item.role === 'user' ? <UserOutlined /> : <RobotOutlined />} 
                      style={{ backgroundColor: item.role === 'user' ? token.colorPrimary : '#87d068', flexShrink: 0 }} 
                    />
                    <div style={{ 
                      backgroundColor: item.role === 'user' ? token.colorPrimary : '#fff', 
                      color: item.role === 'user' ? '#fff' : '#000',
                      padding: '8px 12px', 
                      borderRadius: 12,
                      borderTopRightRadius: item.role === 'user' ? 2 : 12,
                      borderTopLeftRadius: item.role === 'user' ? 12 : 2,
                      wordWrap: 'break-word',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                      {item.content}
                    </div>
                  </div>
                </List.Item>
              )}
            />
            {loading && <div style={{ textAlign: 'center', padding: 8 }}><Spin size="small" /></div>}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '12px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 8, background: '#fff' }}>
            <Input.TextArea 
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="我想去北京..."
              autoSize={{ minRows: 1, maxRows: 3 }}
              style={{ resize: 'none' }}
              disabled={loading}
            />
            <Button 
              type="primary" 
              icon={<SendOutlined />} 
              onClick={() => handleSend()} 
              loading={loading}
            />
          </div>
        </Card>
      )}
    </>
  );
}
