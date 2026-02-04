'use client';

import { useState, useEffect } from 'react';
import { Calendar, Badge, Select, Card, Drawer, Table, Tag, App } from 'antd';
import type { Dayjs } from 'dayjs';
import type { BadgeProps } from 'antd';
import dayjs from 'dayjs';
import { getMyHotels } from '@/app/services/hotel';
import { getHotelRoomTypes, getRoomAvailability, type RoomType, type RoomAvailability as ApiRoomAvailability } from '@/app/services/room';
import type { Hotel } from '@/app/types';

const { Option } = Select;

interface RoomAvailability {
  room_type: string;
  total_count: number;
  available_count: number;
  booked_count: number;
}

interface DayAvailability {
  date: string;
  rooms: RoomAvailability[];
}

export default function CalendarPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<number | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
  const [availabilityData, setAvailabilityData] = useState<Map<string, DayAvailability>>(new Map());
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const { message } = App.useApp();

  useEffect(() => {
    fetchHotels();
  }, []);

  useEffect(() => {
    if (selectedHotel) {
      fetchRoomTypesAndAvailability();
    }
  }, [selectedHotel]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const data = await getMyHotels();
      setHotels(data);
      if (data.length > 0) {
        setSelectedHotel(data[0].id!);
      }
    } catch (error) {
      console.error('获取酒店列表失败:', error);
      message.error('获取酒店列表失败');
    } finally {
      setLoading(false);
    }
  };

  // 获取房型和可用性数据
  const fetchRoomTypesAndAvailability = async () => {
    if (!selectedHotel) return;

    try {
      setLoading(true);

      // 获取酒店的所有房型
      const roomTypesData = await getHotelRoomTypes(selectedHotel);
      setRoomTypes(roomTypesData);

      if (roomTypesData.length === 0) {
        setAvailabilityData(new Map());
        return;
      }

      // 获取未来30天的可用性数据
      const today = dayjs();
      const endDate = today.add(30, 'day');

      const data = new Map<string, DayAvailability>();

      // 为每个房型获取可用性数据
      const availabilityPromises = roomTypesData.map(roomType =>
        getRoomAvailability(roomType.id, today.format('YYYY-MM-DD'), endDate.format('YYYY-MM-DD'))
      );

      const allAvailabilities = await Promise.all(availabilityPromises);

      // 组织数据：按日期分组
      for (let i = 0; i < 30; i++) {
        const date = today.add(i, 'day').format('YYYY-MM-DD');
        const rooms: RoomAvailability[] = roomTypesData.map((roomType, idx) => {
          // 查找该房型在该日期的可用性记录
          const availability = allAvailabilities[idx]?.find(
            (a: ApiRoomAvailability) => dayjs(a.date).format('YYYY-MM-DD') === date
          );

          // 如果有记录，使用记录数据；否则使用房型默认值
          const quota = availability?.quota ?? roomType.stock;
          const booked = availability?.booked ?? 0;
          const available = quota - booked;

          return {
            room_type: roomType.name,
            total_count: quota,
            available_count: available >= 0 ? available : 0,
            booked_count: booked,
          };
        });
        data.set(date, { date, rooms });
      }

      setAvailabilityData(data);
    } catch (error) {
      console.error('获取房型可用性失败:', error);
      message.error('获取房型可用性失败');
    } finally {
      setLoading(false);
    }
  };

  const getRoomTypes = () => {
    return roomTypes;
  };

  const getAvailabilityForDate = (date: Dayjs): RoomAvailability[] => {
    const dateStr = date.format('YYYY-MM-DD');
    const dayData = availabilityData.get(dateStr);

    if (!dayData) return [];

    if (selectedRoomType === 'all') {
      return dayData.rooms;
    }

    return dayData.rooms.filter(r => r.room_type === selectedRoomType);
  };

  const getAvailabilityRate = (available: number, total: number): number => {
    return total > 0 ? (available / total) * 100 : 0;
  };

  const getStatusColor = (rate: number): BadgeProps['status'] => {
    if (rate >= 70) return 'success';
    if (rate >= 30) return 'warning';
    return 'error';
  };

  const dateCellRender = (date: Dayjs) => {
    const rooms = getAvailabilityForDate(date);
    if (rooms.length === 0) return null;

    return (
      <div style={{ fontSize: '12px', lineHeight: '1.2' }}>
        {rooms.map((room, index) => {
          const rate = getAvailabilityRate(room.available_count, room.total_count);
          return (
            <div key={index} style={{ marginBottom: '2px' }}>
              <Badge
                status={getStatusColor(rate)}
                text={`${room.room_type}: ${room.available_count}/${room.total_count}`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  const onSelect = (date: Dayjs) => {
    setSelectedDate(date);
    setDrawerVisible(true);
  };

  const getSelectedDateData = () => {
    if (!selectedDate) return [];
    return getAvailabilityForDate(selectedDate);
  };

  const columns = [
    {
      title: '房型',
      dataIndex: 'room_type',
      key: 'room_type',
    },
    {
      title: '总数',
      dataIndex: 'total_count',
      key: 'total_count',
    },
    {
      title: '可用',
      dataIndex: 'available_count',
      key: 'available_count',
      render: (available: number, record: RoomAvailability) => {
        const rate = getAvailabilityRate(available, record.total_count);
        const color = rate >= 70 ? 'green' : rate >= 30 ? 'orange' : 'red';
        return <Tag color={color}>{available}</Tag>;
      },
    },
    {
      title: '已订',
      dataIndex: 'booked_count',
      key: 'booked_count',
    },
    {
      title: '可用率',
      key: 'rate',
      render: (_: any, record: RoomAvailability) => {
        const rate = getAvailabilityRate(record.available_count, record.total_count);
        return `${rate.toFixed(0)}%`;
      },
    },
  ];

  return (
    <div>
      <Card
        title="房间日历"
        extra={
          <div style={{ display: 'flex', gap: '16px' }}>
            <Select
              style={{ width: 200 }}
              placeholder="选择酒店"
              value={selectedHotel}
              onChange={setSelectedHotel}
              loading={loading}
            >
              {hotels.map(hotel => (
                <Option key={hotel.id} value={hotel.id!}>
                  {hotel.nameZh}
                </Option>
              ))}
            </Select>
            <Select
              style={{ width: 150 }}
              placeholder="房型筛选"
              value={selectedRoomType}
              onChange={setSelectedRoomType}
            >
              <Option value="all">全部房型</Option>
              {getRoomTypes().map(room => (
                <Option key={room.name} value={room.name}>
                  {room.name}
                </Option>
              ))}
            </Select>
          </div>
        }
        style={{ marginBottom: 16 }}
      >
        <div style={{ marginBottom: 16 }}>
          <Badge status="success" text="充足 (可用率 ≥ 70%)" style={{ marginRight: 16 }} />
          <Badge status="warning" text="紧张 (可用率 30%-70%)" style={{ marginRight: 16 }} />
          <Badge status="error" text="满房 (可用率 < 30%)" />
        </div>

        <Calendar
          cellRender={dateCellRender}
          onSelect={onSelect}
        />
      </Card>

      <Drawer
        title={selectedDate ? `${selectedDate.format('YYYY年MM月DD日')} 房间详情` : ''}
        placement="right"
        size={600}
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        <Table
          dataSource={getSelectedDateData()}
          columns={columns}
          rowKey="room_type"
          pagination={false}
        />
      </Drawer>
    </div>
  );
}
