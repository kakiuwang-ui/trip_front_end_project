'use client';

import { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown, message } from 'antd';
import type { MenuProps } from 'antd';
import {
  ShopOutlined,
  UserOutlined,
  LogoutOutlined,
  CalendarOutlined,
  DashboardOutlined,
  OrderedListOutlined,
} from '@ant-design/icons';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useMerchantAuth } from '@/app/hooks/useAuth';
import { logout } from '@/app/services/auth';

const { Header, Sider, Content } = Layout;

export default function MerchantLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const { user, loading } = useMerchantAuth();

  const handleLogout = () => {
    logout();
    message.success('退出登录成功');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: handleLogout,
    },
  ];

  const menuItems: MenuProps['items'] = [
    {
      key: '/merchant/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
      onClick: () => router.push('/merchant/dashboard'),
    },
    {
      key: '/merchant/hotels',
      icon: <ShopOutlined />,
      label: '酒店管理',
      onClick: () => router.push('/merchant/hotels'),
    },
    {
      key: '/merchant/calendar',
      icon: <CalendarOutlined />,
      label: '房间日历',
      onClick: () => router.push('/merchant/calendar'),
    },
    {
      key: '/merchant/bookings',
      icon: <OrderedListOutlined />,
      label: '预订管理',
      onClick: () => router.push('/merchant/bookings'),
    },
  ];

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        加载中...
      </div>
    );
  }

  const isDark = theme === 'dark';

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider collapsible collapsed={collapsed} onCollapse={setCollapsed}>
        <div
          style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: collapsed ? '14px' : '18px',
            fontWeight: 'bold',
          }}
        >
          {collapsed ? '易宿' : '易宿酒店管理'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[pathname]}
          items={menuItems}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            background: isDark ? '#141414' : '#fff',
            padding: '0 24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 1px 4px rgba(0,21,41,.08)',
          }}
        >
          <div style={{ fontSize: '16px', fontWeight: 500 }}>
            商户管理系统
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <Dropdown menu={{ items: userMenuItems }}>
              <div
                style={{
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <Avatar icon={<UserOutlined />} />
                <span>{user?.name}</span>
              </div>
            </Dropdown>
          </div>
        </Header>

        <Content style={{ margin: '24px' }}>
          <div
            style={{
              background: isDark ? '#1f1f1f' : '#fff',
              padding: '24px',
              minHeight: 'calc(100vh - 112px)',
              borderRadius: '8px',
            }}
          >
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
