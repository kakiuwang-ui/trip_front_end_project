'use client';

import { ShopOutlined, UserOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import Link from 'next/link';

const { Title } = Typography;

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 flex items-center justify-between border-b border-gray-100 bg-white/80 px-6 py-4 backdrop-blur-md md:px-12">
      <div className="flex items-center gap-2">
        <ShopOutlined className="text-2xl text-[#1677ff]" />
        <Title level={4} style={{ margin: 0 }} className="!text-[#1677ff]">易宿酒店商户版</Title>
      </div>
      <Link href="/admin/review" className="text-sm text-gray-600 hover:text-[#1677ff]">
        管理员入口 <UserOutlined />
      </Link>
    </header>
  );
}
