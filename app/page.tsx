'use client';

import { Button, Card, Typography, Space, Divider } from 'antd';
import { GlobalOutlined, RocketOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { FeatureItem } from './components/FeatureItem';

const { Title, Paragraph, Text } = Typography;

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#e6f7ff] to-white">
      <Navbar />

      <main className="flex flex-1 flex-wrap items-center justify-center gap-16 p-12">
        {/* 左侧宣传语 */}
        <div className="max-w-[500px]">
          <Title className="!mb-6 !text-5xl !text-[#1f1f1f]">
            上易宿<br />
            <span className="text-[#1677ff]">让你的酒店</span><br />
            被世界发现
          </Title>
          <Paragraph className="!mb-8 !text-lg !text-gray-500">
            加入易宿酒店管理平台，轻松管理房源，连接全球旅客。
            <br />
            高效、便捷、专业的酒店管理解决方案。
          </Paragraph>
          
          <Space size="large" className="mt-8">
            <FeatureItem 
              icon={<GlobalOutlined />}
              title="全球覆盖"
              description="触达海量潜在住客"
            />
            <FeatureItem 
              icon={<RocketOutlined />}
              title="极速入驻"
              description="简单几步开启业务"
            />
          </Space>
        </div>

        {/* 右侧登录/注册卡片 */}
        <Card 
          className="w-[400px] !rounded-2xl !bg-white/50 !shadow-xl backdrop-blur-sm"
          variant="borderless"
        >
          <div className="mb-6 text-center">
            <Title level={3} className="!mb-2">欢迎回来</Title>
            <Text type="secondary">登录商户后台管理您的酒店</Text>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="/auth/login" className="w-full">
              <Button type="primary" size="large" block className="!h-12 !text-base">
                商户登录
              </Button>
            </Link>
            
            <div className="flex items-center justify-center gap-4">
              <Divider className="!min-w-0 !w-10 !my-0" />
              <Text type="secondary" className="text-sm">还没有账号？</Text>
              <Divider className="!min-w-0 !w-10 !my-0" />
            </div>

            <Link href="/auth/register" className="w-full">
              <Button size="large" block className="!h-12 !text-base">
                立即注册
              </Button>
            </Link>
          </div>

          <div className="mt-6 text-center">
            <Text type="secondary" className="text-xs">
              登录即代表您同意易宿服务条款和隐私政策
            </Text>
          </div>
        </Card>
      </main>

      <Footer />
    </div>
  );
}
