'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Tag,
  Space,
  Button,
  Drawer,
  Descriptions,
  Select,
  Input,
  DatePicker,
  App,
  Popconfirm,
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  EyeOutlined,
  CheckOutlined,
  CloseOutlined,
  LoginOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import type { Booking, BookingStatus } from '@/app/types';
import { getMyBookings, updateBookingStatus } from '@/app/services/booking';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Search } = Input;

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [statusFilter, setStatusFilter] = useState<BookingStatus | 'all'>('all');
  const [searchText, setSearchText] = useState('');
  const { message } = App.useApp();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const data = await getMyBookings();
      setBookings(data);
    } catch (error) {
      console.error('获取预订列表失败:', error);
      message.error('获取预订列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (record: Booking) => {
    setSelectedBooking(record);
    setDrawerVisible(true);
  };

  const handleStatusChange = async (id: number, newStatus: BookingStatus) => {
    try {
      await updateBookingStatus(id, newStatus);

      setBookings(bookings.map(b =>
        b.id === id ? { ...b, status: newStatus } : b
      ));
      message.success('状态更新成功');

      if (selectedBooking?.id === id) {
        setSelectedBooking({ ...selectedBooking, status: newStatus });
      }
    } catch (error: any) {
      console.error('更新状态失败:', error);
      message.error(error.response?.data?.error || '更新状态失败');
    }
  };

  const getStatusColor = (status: BookingStatus): string => {
    const colorMap: Record<BookingStatus, string> = {
      pending: 'orange',
      confirmed: 'blue',
      checked_in: 'green',
      checked_out: 'default',
      completed: 'gray',
      cancelled: 'red',
    };
    return colorMap[status];
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
    return textMap[status];
  };

  const filteredBookings = bookings.filter(booking => {
    const matchStatus = statusFilter === 'all' || booking.status === statusFilter;
    const searchLower = searchText.toLowerCase();
    const userName = booking.user?.name || booking.guestInfo?.name || '';
    const userPhone = booking.user?.phone || booking.guestInfo?.phone || '';
    const hotelName = booking.hotel?.nameZh || '';

    const matchSearch =
      userName.toLowerCase().includes(searchLower) ||
      userPhone.includes(searchText) ||
      hotelName.toLowerCase().includes(searchLower) ||
      false;
    return matchStatus && matchSearch;
  });

  const columns: TableColumnsType<Booking> = [
    {
      title: '订单号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '酒店名称',
      key: 'hotelName',
      render: (_, record) => record.hotel?.nameZh,
    },
    {
      title: '房型',
      key: 'roomType',
      render: (_, record) => record.roomType?.name,
    },
    {
      title: '客户姓名',
      key: 'customerName',
      render: (_, record) => record.user?.name || record.guestInfo?.name || '-',
    },
    {
      title: '联系电话',
      key: 'customerPhone',
      render: (_, record) => record.user?.phone || record.guestInfo?.phone || '-',
    },
    {
      title: '入住日期',
      dataIndex: 'checkInDate',
      key: 'checkInDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '退房日期',
      dataIndex: 'checkOutDate',
      key: 'checkOutDate',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
    },
    {
      title: '入住人数',
      dataIndex: 'guestCount',
      key: 'guestCount',
      width: 80,
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
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 250,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            查看
          </Button>

          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="确认此预订？"
                onConfirm={() => handleStatusChange(record.id!, 'confirmed')}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  size="small"
                  icon={<CheckOutlined />}
                >
                  确认
                </Button>
              </Popconfirm>
              <Popconfirm
                title="取消此预订？"
                onConfirm={() => handleStatusChange(record.id!, 'cancelled')}
                okText="确定"
                cancelText="取消"
              >
                <Button
                  type="link"
                  size="small"
                  danger
                  icon={<CloseOutlined />}
                >
                  取消
                </Button>
              </Popconfirm>
            </>
          )}

          {record.status === 'confirmed' && (
            <Popconfirm
              title="办理入住？"
              onConfirm={() => handleStatusChange(record.id!, 'checked_in')}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                icon={<LoginOutlined />}
              >
                入住
              </Button>
            </Popconfirm>
          )}

          {record.status === 'checked_in' && (
            <Popconfirm
              title="办理退房？"
              onConfirm={() => handleStatusChange(record.id!, 'checked_out')}
              okText="确定"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                icon={<LogoutOutlined />}
              >
                退房
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 16 }}>
        <Search
          placeholder="搜索客户姓名、电话、酒店"
          allowClear
          style={{ width: 300 }}
          onSearch={setSearchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          style={{ width: 150 }}
          value={statusFilter}
          onChange={setStatusFilter}
        >
          <Select.Option value="all">全部状态</Select.Option>
          <Select.Option value="pending">待确认</Select.Option>
          <Select.Option value="confirmed">已确认</Select.Option>
          <Select.Option value="checked_in">已入住</Select.Option>
          <Select.Option value="checked_out">已退房</Select.Option>
          <Select.Option value="cancelled">已取消</Select.Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={filteredBookings}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 1200 }}
      />

      <Drawer
        title="预订详情"
        placement="right"
        size={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
        extra={
          selectedBooking && (
            <Tag color={getStatusColor(selectedBooking.status)}>
              {getStatusText(selectedBooking.status)}
            </Tag>
          )
        }
      >
        {selectedBooking && (
          <>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="订单号">{selectedBooking.id}</Descriptions.Item>
              <Descriptions.Item label="酒店名称">{selectedBooking.hotel?.nameZh}</Descriptions.Item>
              <Descriptions.Item label="房型">{selectedBooking.roomType?.name}</Descriptions.Item>
              <Descriptions.Item label="客户姓名">{selectedBooking.user?.name || selectedBooking.guestInfo?.name || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedBooking.user?.phone || selectedBooking.guestInfo?.phone || '-'}</Descriptions.Item>
              <Descriptions.Item label="电子邮箱">{selectedBooking.user?.email || selectedBooking.guestInfo?.email || '-'}</Descriptions.Item>
              <Descriptions.Item label="入住日期">
                {dayjs(selectedBooking.checkInDate).format('YYYY年MM月DD日')}
              </Descriptions.Item>
              <Descriptions.Item label="退房日期">
                {dayjs(selectedBooking.checkOutDate).format('YYYY年MM月DD日')}
              </Descriptions.Item>
              <Descriptions.Item label="住宿天数">
                {dayjs(selectedBooking.checkOutDate).diff(dayjs(selectedBooking.checkInDate), 'day')}天
              </Descriptions.Item>
              <Descriptions.Item label="入住人数">{selectedBooking.guestCount}</Descriptions.Item>
              <Descriptions.Item label="总价">¥{selectedBooking.totalPrice}</Descriptions.Item>
              <Descriptions.Item label="特殊要求">
                {selectedBooking.guestInfo?.specialRequests || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="创建时间">
                {selectedBooking.createdAt ? dayjs(selectedBooking.createdAt).format('YYYY-MM-DD HH:mm') : '-'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              {selectedBooking.status === 'pending' && (
                <>
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => handleStatusChange(selectedBooking.id!, 'confirmed')}
                  >
                    确认预订
                  </Button>
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => handleStatusChange(selectedBooking.id!, 'cancelled')}
                  >
                    取消预订
                  </Button>
                </>
              )}

              {selectedBooking.status === 'confirmed' && (
                <Button
                  type="primary"
                  icon={<LoginOutlined />}
                  onClick={() => handleStatusChange(selectedBooking.id!, 'checked_in')}
                >
                  办理入住
                </Button>
              )}

              {selectedBooking.status === 'checked_in' && (
                <Button
                  type="primary"
                  icon={<LogoutOutlined />}
                  onClick={() => handleStatusChange(selectedBooking.id!, 'checked_out')}
                >
                  办理退房
                </Button>
              )}
            </div>
          </>
        )}
      </Drawer>
    </div>
  );
}
