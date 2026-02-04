'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Tag,
  Input,
  Select,
  Popconfirm,
  App,
  Form,
  Drawer,
  Descriptions,
  Image
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  SearchOutlined,
  PoweroffOutlined,
  ReloadOutlined,
  EyeOutlined,
  StopOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { getHotels } from '@/app/services/hotel';
import { updateHotelStatus } from '@/app/services/review';
import { getLocations } from '@/app/services/admin';
import type { Hotel, Location } from '@/app/types';

export default function HotelManagementPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<Location[]>([]);
  
  // Filter states
  const [searchText, setSearchText] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<number | undefined>(undefined);
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  
  // Drawer states
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);

  const { message } = App.useApp();

  useEffect(() => {
    fetchLocations();
    fetchHotels();
  }, []);

  const fetchLocations = async () => {
    try {
      const res = await getLocations();
      setLocations(res.data || []);
    } catch (error) {
      console.error('Fetch locations error:', error);
    }
  };

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchText) params.keyword = searchText;
      if (selectedLocation) params.locationId = selectedLocation;
      if (selectedStatus) params.status = selectedStatus;

      const res = await getHotels(params);
      setHotels(res.data || []);
    } catch (error) {
      console.error('获取酒店列表失败:', error);
      message.error('获取酒店列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchHotels();
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedLocation(undefined);
    setSelectedStatus(undefined);
    // Needed to trigger re-fetch with empty params, but state update is async.
    // Better to just call fetch with empty directly or rely on useEffect deps if we used them (but we don't automatedly).
    // Let's just manually refetch next tick or directly.
    getHotels({}).then(res => setHotels(res.data || [])).finally(()=>setLoading(false));
  };

  const handleView = (record: Hotel) => {
    setSelectedHotel(record);
    setDrawerVisible(true);
  };

  const handleStatusChange = async (hotelId: number, newStatus: string) => {
    try {
      await updateHotelStatus(hotelId, newStatus);
      message.success('状态更新成功');
      fetchHotels();
    } catch (error: any) {
      console.error('状态更新失败:', error);
      message.error(error.response?.data?.error || '更新失败');
    }
  };

  const columns: TableColumnsType<Hotel> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '酒店名称',
      dataIndex: 'nameZh',
      key: 'nameZh',
      render: (text, record) => (
        <div>
          <div className="font-medium">{text}</div>
          <div className="text-gray-400 text-xs">{record.nameEn}</div>
        </div>
      ),
    },
    {
      title: '城市',
      key: 'location',
      render: (_, record) => record.location?.name || '未知',
    },
    {
      title: '星级',
      dataIndex: 'starRating',
      key: 'starRating',
      render: (rating) => rating ? `${rating}星` : '未评级',
    },
    {
      title: '商户',
      key: 'merchant',
      render: (_, record) => record.merchant?.name || record.merchant?.email || '未知',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = 
            status === 'published' ? 'success' :
            status === 'pending' ? 'processing' :
            status === 'rejected' ? 'error' :
            'default';
        const text = 
            status === 'published' ? '已发布' :
            status === 'pending' ? '待审核' :
            status === 'rejected' ? '已拒绝' :
            '已下线';
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
           <Button icon={<EyeOutlined />} type="link" onClick={() => handleView(record)}>查看</Button>
           {record.status === 'published' && (
            <>
              <Popconfirm
                  title="确定要强制下线该酒店吗？"
                  description="下线后用户将无法检索到该酒店"
                  onConfirm={() => handleStatusChange(record.id, 'offline')}
                  okText="确定"
                  cancelText="取消"
              >
                  <Button type="link" danger icon={<PoweroffOutlined />}>
                  下线
                  </Button>
              </Popconfirm>
              <Popconfirm
                  title="确定要驳回该酒店吗？"
                  description="酒店状态将变为已拒绝，商户需重新提交"
                  onConfirm={() => handleStatusChange(record.id, 'rejected')}
                  okText="确定"
                  cancelText="取消"
              >
                  <Button type="link" danger icon={<StopOutlined />}>
                  驳回
                  </Button>
              </Popconfirm>
            </>
           )}
           {record.status === 'offline' && (
             <Popconfirm
                title="确定要恢复该酒店上线吗？"
                onConfirm={() => handleStatusChange(record.id, 'published')}
                okText="确定"
                cancelText="取消"
             >
                 <Button type="link" style={{color: 'green'}} icon={<CheckOutlined />}>
                 上线
                 </Button>
             </Popconfirm>
           )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }} className="p-4 bg-white dark:bg-zinc-800 rounded-lg shadow-sm">
        <Form layout="inline">
            <Form.Item label="搜索">
                <Input 
                    placeholder="酒店名称/地址" 
                    value={searchText} 
                    onChange={e => setSearchText(e.target.value)}
                    style={{ width: 200 }} 
                />
            </Form.Item>
            <Form.Item label="城市">
                <Select
                    allowClear
                    placeholder="选择城市"
                    style={{ width: 150 }}
                    value={selectedLocation}
                    onChange={setSelectedLocation}
                    options={locations.map(loc => ({ label: loc.name, value: loc.id }))}
                />
            </Form.Item>
            <Form.Item label="状态">
                <Select
                    allowClear
                    placeholder="状态"
                    style={{ width: 120 }}
                    value={selectedStatus}
                    onChange={setSelectedStatus}
                    options={[
                        { label: '已发布', value: 'published' },
                        { label: '待审核', value: 'pending' },
                        { label: '已下线', value: 'offline' },
                        { label: '已拒绝', value: 'rejected' },
                    ]}
                />
            </Form.Item>
            <Form.Item>
                <Space>
                    <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>查询</Button>
                    <Button icon={<ReloadOutlined />} onClick={handleReset}>重置</Button>
                </Space>
            </Form.Item>
        </Form>
      </div>

      <Table
        columns={columns}
        dataSource={hotels}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Drawer
        title="酒店详情"
        placement="right"
        size="large"
        onClose={() => setDrawerVisible(false)}
        open={drawerVisible}
      >
        {selectedHotel && (
          <>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="酒店名称">
                {selectedHotel.nameZh}
              </Descriptions.Item>
              <Descriptions.Item label="英文名称">
                {selectedHotel.nameEn || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="城市">
                {selectedHotel.location?.name || '未知'}
              </Descriptions.Item>
              <Descriptions.Item label="地址">
                {selectedHotel.address}
              </Descriptions.Item>
              <Descriptions.Item label="星级">
                {selectedHotel.starRating}星
              </Descriptions.Item>
              <Descriptions.Item label="设施">
                {Array.isArray(selectedHotel.facilities) ? selectedHotel.facilities.join(', ') : '-'}
              </Descriptions.Item>
              <Descriptions.Item label="描述">
                {selectedHotel.description || '-'}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={selectedHotel.status === 'published' ? 'success' : selectedHotel.status === 'pending' ? 'processing' : 'default'}>
                  {selectedHotel.status === 'published' ? '已发布' : selectedHotel.status === 'pending' ? '待审核' : selectedHotel.status}
                </Tag>
              </Descriptions.Item>
            </Descriptions>

            {selectedHotel.images && selectedHotel.images.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>酒店图片</h4>
                <Image.PreviewGroup>
                  <Space wrap>
                    {selectedHotel.images.map((img, index) => (
                      <Image
                        key={index}
                        width={100}
                        src={img}
                        alt={`酒店图片${index + 1}`}
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </div>
            )}

            {selectedHotel.roomTypes && selectedHotel.roomTypes.length > 0 && (
              <div style={{ marginTop: 16 }}>
                <h4>房型列表</h4>
                <Table
                  dataSource={selectedHotel.roomTypes}
                  rowKey="id"
                  pagination={false}
                  columns={[
                    { title: '房型', dataIndex: 'name', key: 'name' },
                    {
                      title: '价格',
                      dataIndex: 'price',
                      key: 'price',
                      render: (price: number) => `¥${price}`,
                    },
                    { title: '库存', dataIndex: 'stock', key: 'stock' }
                  ]}
                />
              </div>
            )}
          </>
        )}
      </Drawer>
    </div>
  );
}
