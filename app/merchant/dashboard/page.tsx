'use client';

import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, App } from 'antd';
import type { TableColumnsType } from 'antd';
import {
  DollarOutlined,
  ShopOutlined,
  CalendarOutlined,
  RiseOutlined,
} from '@ant-design/icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { Booking, BookingStatus } from '@/app/types';
import { getMyBookings } from '@/app/services/booking';
import { getMyHotels } from '@/app/services/hotel';
import dayjs from 'dayjs';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    todayBookings: 0,
    monthRevenue: 0,
    occupancyRate: 0,
    totalRooms: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const { message } = App.useApp();

  // 营收趋势数据（最近7天）
  const [revenueData, setRevenueData] = useState<Array<{ date: string; revenue: number }>>([]);

  // 预订量数据（最近7天）
  const [bookingData, setBookingData] = useState<Array<{ date: string; count: number }>>([]);

  // 房型占比数据
  const [roomTypeData, setRoomTypeData] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // 获取所有预订数据
      const allBookings = await getMyBookings();
      const hotels = await getMyHotels();

      // 计算统计数据
      const today = dayjs();
      const todayBookings = allBookings.filter(b =>
        dayjs(b.createdAt).isSame(today, 'day')
      ).length;

      const monthStart = today.startOf('month');
      const monthRevenue = allBookings
        .filter(b =>
          dayjs(b.createdAt).isAfter(monthStart) &&
          b.status !== 'cancelled'
        )
        .reduce((sum, b) => sum + Number(b.totalPrice), 0);

      // 计算总房间数（注意：这里需要从实际的房型数据获取，暂时使用估算值）
      // 使用 reduce 累加每个酒店下所有房型的 stock
      // @ts-ignore
      const totalRooms = hotels.reduce((sum, hotel) => {
          // @ts-ignore
          const hotelRooms = hotel.roomTypes?.reduce((rSum, room) => rSum + (room.stock || 0), 0) || 0;
          return sum + hotelRooms;
      }, 0);

      // 简单估算入住率（已确认+已入住的预订数 / 总房间数）
      // 如果 totalRooms 为 0, 入住率为 0
      const activeBookingsCount = allBookings.filter(b =>
        b.status === 'confirmed' || b.status === 'checked_in'
      ).length;
      
      const occupancyRate = totalRooms > 0 
        ? Math.round((activeBookingsCount / totalRooms) * 100) 
        : 0;

      setStats({
        todayBookings,
        monthRevenue,
        occupancyRate,
        totalRooms,
      });

      // 计算最近7天的营收趋势
      const revenueMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const date = today.subtract(i, 'day').format('MM-DD');
        revenueMap.set(date, 0);
      }

      allBookings
        .filter(b => b.status !== 'cancelled')
        .forEach(b => {
          const date = dayjs(b.createdAt).format('MM-DD');
          if (revenueMap.has(date)) {
            revenueMap.set(date, (revenueMap.get(date) || 0) + Number(b.totalPrice));
          }
        });

      const revenueArray = Array.from(revenueMap.entries()).map(([date, revenue]) => ({
        date,
        revenue,
      }));
      setRevenueData(revenueArray);

      // 计算最近7天的预订量
      const bookingMap = new Map<string, number>();
      for (let i = 6; i >= 0; i--) {
        const date = today.subtract(i, 'day').format('MM-DD');
        bookingMap.set(date, 0);
      }

      allBookings.forEach(b => {
        const date = dayjs(b.createdAt).format('MM-DD');
        if (bookingMap.has(date)) {
          bookingMap.set(date, (bookingMap.get(date) || 0) + 1);
        }
      });

      const bookingArray = Array.from(bookingMap.entries()).map(([date, count]) => ({
        date,
        count,
      }));
      setBookingData(bookingArray);

      // 计算房型占比
      const roomTypeMap = new Map<string, number>();
      allBookings
        .filter(b => b.status !== 'cancelled')
        .forEach(b => {
          const roomType = b.roomType?.name || '其他';
          roomTypeMap.set(roomType, (roomTypeMap.get(roomType) || 0) + 1);
        });

      const roomTypeArray = Array.from(roomTypeMap.entries()).map(([name, value]) => ({
        name,
        value,
      }));
      setRoomTypeData(roomTypeArray);

      // 获取最近3条预订
      const recent = allBookings
        .sort((a, b) => dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf())
        .slice(0, 3);
      setRecentBookings(recent);
    } catch (error) {
      console.error('获取仪表盘数据失败:', error);
      message.error('获取仪表盘数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: BookingStatus): string => {
    const colorMap: Record<BookingStatus, string> = {
      pending: 'orange',
      confirmed: 'blue',
      checked_in: 'green',
      checked_out: 'default',
      completed: 'cyan',
      cancelled: 'red',
    };
    return colorMap[status] || 'default';
  };

  const getStatusText = (status: BookingStatus): string => {
    const textMap: Record<BookingStatus, string> = {
      pending: '待确认',
      confirmed: '已确认',
      checked_in: '已入住',
      checked_out: '已退房',
      completed: '已完成',
      cancelled: '已取消',
    };
    return textMap[status] || status;
  };

  const columns: TableColumnsType<Booking> = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '客户姓名',
      key: 'customerName', // Changed key to be more unique/descriptive, though strictly not dataIndex
      render: (_, record) => record.user?.name || record.guestInfo?.name || '未知客户',
    },
    {
      title: '房型',
      key: 'roomType',
      render: (_, record) => record.roomType?.name || '未知房型',
    },
    {
      title: '入住日期',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
      render: (date: string) => dayjs(date).format('MM-DD'),
    },
    {
      title: '退房日期',
      dataIndex: 'checkOutDate',
      key: 'checkOutDate',
      render: (date: string) => dayjs(date).format('MM-DD'),
    },
    {
      title: '总价',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price: number) => `¥${price}`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: BookingStatus) => (
        <Tag color={getStatusColor(status)}>{getStatusText(status)}</Tag>
      ),
    },
  ];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="今日预订"
              value={stats.todayBookings}
              prefix={<CalendarOutlined />}
              suffix="单"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="本月营收"
              value={stats.monthRevenue}
              precision={2}
              prefix={<DollarOutlined />}
              suffix="元"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="入住率"
              value={stats.occupancyRate}
              prefix={<RiseOutlined />}
              suffix="%"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总房间数"
              value={stats.totalRooms}
              prefix={<ShopOutlined />}
              suffix="间"
            />
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        {/* 营收趋势 */}
        <Col xs={24} lg={12}>
          <Card title="营收趋势（近7天）" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(value) => `¥${value ?? 0}`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#1890ff"
                  strokeWidth={2}
                  name="营收（元）"
                />
              </LineChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 预订量统计 */}
        <Col xs={24} lg={12}>
          <Card title="预订量统计（近7天）" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={bookingData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#52c41a" name="预订数量" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 房型占比 */}
        <Col xs={24} lg={12}>
          <Card title="房型预订占比" loading={loading}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={roomTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {roomTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </Col>

        {/* 近期预订列表 */}
        <Col xs={24} lg={12}>
          <Card
            title="近期预订"
            extra={<a href="/merchant/bookings">查看全部</a>}
          >
            <Table
              columns={columns}
              dataSource={recentBookings}
              rowKey="id"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
