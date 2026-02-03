'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  InputNumber,
  Upload,
  Tag,
  Popconfirm,
  Select,
  DatePicker,
  App,
  Card,
  Row,
  Col
} from 'antd';
import type { TableColumnsType, UploadFile, UploadProps } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { 
  getMyHotels, 
  createHotel, 
  updateHotel, 
  deleteHotel, 
  uploadImage,
  getLocations,
  getTags,
  createRoomType,
  updateRoomType,
  deleteRoomType
} from '@/app/services/hotel';
import { getStoredUser } from '@/app/services/auth';
import type { Hotel, RoomType, Location, Tag as HotelTag } from '@/app/types';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

// 房型动态表单组件
interface RoomListProps {
  value?: RoomType[];
  onChange?: (value: RoomType[]) => void;
}

function RoomList({ value = [], onChange }: RoomListProps) {
  const handleAdd = () => {
    // @ts-ignore - Temporary ID for key handling if needed, though index is used usually
    onChange?.([...value, { name: '', price: 0, stock: 1, discount: 1, description: '' }]);
  };

  const handleRemove = (index: number) => {
    const newRooms = [...value];
    newRooms.splice(index, 1);
    onChange?.(newRooms);
  };

  const handleChange = (index: number, field: keyof RoomType, val: any) => {
    const newRooms = [...value];
    // @ts-ignore
    newRooms[index] = { ...newRooms[index], [field]: val };
    onChange?.(newRooms);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {value.map((room, index) => (
        <Card key={room.id || index} size="small" type="inner" title={`房型 ${index + 1}`} extra={
            <Button type="link" danger onClick={() => handleRemove(index)}>
                删除
            </Button>
        }>
            <Row gutter={16}>
                <Col span={8}>
                     <Input
                        placeholder="房型名称"
                        value={room.name}
                        onChange={(e) => handleChange(index, 'name', e.target.value)}
                        addonBefore="名称"
                        style={{ marginBottom: 8 }}
                      />
                </Col>
                <Col span={8}>
                    <InputNumber
                        placeholder="价格"
                        value={room.price}
                        onChange={(val) => handleChange(index, 'price', val)}
                        min={0}
                        addonBefore="价格"
                        style={{ width: '100%', marginBottom: 8 }}
                    />
                </Col>
                 <Col span={8}>
                    <InputNumber
                        placeholder="库存"
                        value={room.stock}
                        onChange={(val) => handleChange(index, 'stock', val)}
                        min={0}
                        addonBefore="库存"
                        style={{ width: '100%', marginBottom: 8 }}
                    />
                </Col>
                <Col span={24}>
                    <Input
                        placeholder="房型描述（选填）"
                        value={room.description}
                        onChange={(e) => handleChange(index, 'description', e.target.value)}
                        addonBefore="描述"
                     />
                </Col>
            </Row>
        </Card>
      ))}
      <Button type="dashed" onClick={handleAdd} block icon={<PlusOutlined />}>
        添加房型
      </Button>
    </div>
  );
}

export default function HotelManagementPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [tags, setTags] = useState<HotelTag[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { message } = App.useApp();

  useEffect(() => {
    fetchHotels();
    fetchLocations();
    fetchTags();
  }, []);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      const res = await getMyHotels();
      // @ts-ignore
      setHotels(res.data || res || []);
    } catch (error) {
      console.error('获取酒店列表失败:', error);
      message.error('获取酒店列表失败');
    } finally {
      setLoading(false);
    }
  };
  
  const fetchLocations = async () => {
    try {
        const res = await getLocations();
        // @ts-ignore
        setLocations(res.data || []);
    } catch(e) {
        console.error(e);
    }
  }

  const fetchTags = async () => {
      try {
          const res = await getTags();
          // @ts-ignore
          setTags(res.data || []);
      } catch(e) {
          console.error(e);
      }
  }

  const handleAdd = () => {
    setEditingHotel(null);
    setFileList([]);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Hotel) => {
    setEditingHotel(record);

    // 转换日期字段
    const formData: any = {
      ...record,
      name: record.nameZh,
      name_en: record.nameEn,
      star_rating: record.starRating,
      opening_date: record.openingYear ? dayjs(`${record.openingYear}-01-01`) : null,
      locationId: record.locationId,
      // map hotelTags from [{ tag: { id, name } }] to [id, id]
      hotelTags: record.hotelTags?.map((ht: any) => ht.tagId || ht.tag?.id), 
      rooms: record.roomTypes || [],
    };

    form.setFieldsValue(formData);

    // 设置已有图片
    if (record.images && Array.isArray(record.images) && record.images.length > 0) {
      setFileList(
        (record.images as string[]).map((url, index) => ({
          uid: `-${index}`,
          name: `image-${index}`,
          status: 'done',
          url,
        }))
      );
    } else {
      setFileList([]);
    }
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteHotel(id);
      message.success('删除成功');
      fetchHotels();
    } catch (error: any) {
      console.error('删除失败:', error);
      message.error(error.response?.data?.message || '删除失败');
    }
  };

  const handleUpload: UploadProps['customRequest'] = async ({ file, onSuccess, onError }) => {
    try {
      const result = await uploadImage(file as File);
      onSuccess?.(result);
      message.success('上传成功');
    } catch (error) {
      onError?.(error as Error);
      message.error('上传失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const currentUser = getStoredUser();
      
      if (!currentUser) {
         message.error("未登录或会话已过期");
         return;
      }

      // 收集图片 URL
      const images = fileList
        .filter((file) => file.status === 'done')
        .map((file) => file.url || (file.response as any)?.url)
        .filter(Boolean) as string[];

      // 1. 准备酒店数据
      const hotelData: any = {
        nameZh: values.name,
        nameEn: values.name_en,
        address: values.address,
        locationId: values.locationId,
        starRating: values.star_rating,
        description: values.description,
        openingYear: values.opening_date ? values.opening_date.year() : undefined,
        images,
        merchantId: currentUser.id,
        // Pass nested data for creation
        tagIds: values.hotelTags, 
        roomTypes: values.rooms, 
      };

      let savedHotelId: number;

      if (editingHotel && editingHotel.id) {
        // For updates, we still mostly use the loop logic for rooms as backend update might not support nested upsert easily
        // But we can update basic info
        await updateHotel(editingHotel.id, hotelData); // Note: tagIds might need special handling on update if backend supports it, otherwise ignored
        savedHotelId = editingHotel.id;
        message.success('酒店基本信息更新成功');
        
        // Handle Rooms for Edit Mode (Manually sync)
        if (values.rooms) {
           const currentRooms = values.rooms as RoomType[];
           const originalIds = editingHotel.roomTypes?.map(r => r.id) || [];
           // @ts-ignore
           const currentIds = currentRooms.map(r => r.id).filter(id => !!id);
           
           // Delete
           const toDelete = originalIds.filter(id => !currentIds.includes(id));
           for (const id of toDelete) {
               await deleteRoomType(id);
           }
            // Upsert
           for (const room of currentRooms) {
               if (room.id) {
                   await updateRoomType(room.id, room);
               } else {
                   await createRoomType(savedHotelId, room);
               }
           }
       }

      } else {
        // For Creation, Backend now supports nested roomTypes and tagIds!
        // So we just send it all at once.
        const res = await createHotel(hotelData);
        message.success('酒店创建成功');
      }

      setModalVisible(false);
      fetchHotels();
    } catch (error: any) {
      console.error('提交失败:', error);
      message.error(error.message || '提交失败');
    }
  };

  const columns: TableColumnsType<Hotel> = [
    {
      title: '酒店名称',
      dataIndex: 'nameZh',
      key: 'nameZh',
    },
    {
      title: '城市',
      key: 'city',
      render: (_, record) => record.location?.name || '未知',
    },
    {
      title: '星级',
      dataIndex: 'starRating',
      key: 'starRating',
      render: (rating: number) => `${rating}星`,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const statusMap: Record<string, { color: string; text: string }> = {
          pending: { color: 'processing', text: '审核中' },
          rejected: { color: 'error', text: '已驳回' },
          published: { color: 'success', text: '已发布' },
          offline: { color: 'default', text: '已下线' },
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个酒店吗？"
            onConfirm={() => handleDelete(record.id!)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加酒店
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={hotels}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingHotel ? '编辑酒店' : '添加酒店'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={800}
        okText="提交"
        cancelText="取消"
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            star_rating: 3,
            rooms: [{ name: '', price: 0, stock: 1 }],
          }}
        >
          <Form.Item
            label="酒店名称 (中文)"
            name="name"
            rules={[{ required: true, message: '请输入酒店名称' }]}
          >
            <Input placeholder="请输入酒店名称" />
          </Form.Item>

          <Form.Item label="英文名称" name="name_en">
            <Input placeholder="请输入英文名称（可选）" />
          </Form.Item>

          <Form.Item
            label="城市/位置"
            name="locationId"
            rules={[{ required: true, message: '请选择城市' }]}
          >
             <Select placeholder="请选择城市">
                {locations.map(loc => (
                    <Option key={loc.id} value={loc.id}>{loc.name}</Option>
                ))}
             </Select>
          </Form.Item>

          <Form.Item
            label="地址"
            name="address"
            rules={[{ required: true, message: '请输入地址' }]}
          >
            <Input placeholder="请输入详细地址" />
          </Form.Item>

          <Form.Item
            label="星级"
            name="star_rating"
            rules={[{ required: true, message: '请选择星级' }]}
          >
            <Select>
              {[1, 2, 3, 4, 5].map((num) => (
                <Option key={num} value={num}>
                  {num}星
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="酒店开业时间"
            name="opening_date"
            rules={[{ required: true, message: '请选择酒店开业时间' }]}
          >
            <DatePicker
              picker="year"
              style={{ width: '100%' }}
              placeholder="请选择开业年份"
            />
          </Form.Item>

          <Form.Item label="标签" name="hotelTags">
            <Select
              mode="multiple"
              placeholder="请选择标签"
              style={{ width: '100%' }}
            >
              {tags.map(tag => (
                  <Option key={tag.id} value={tag.id}>{tag.name}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="酒店描述" name="description">
            <TextArea rows={4} placeholder="请输入酒店描述" />
          </Form.Item>

          <Form.Item label="酒店图片">
            <Upload
              listType="picture-card"
              fileList={fileList}
              customRequest={handleUpload}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              onRemove={(file) => {
                setFileList(fileList.filter((f) => f.uid !== file.uid));
              }}
            >
              {fileList.length >= 8 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
          </Form.Item>

          <Form.Item
            label="房型列表"
            name="rooms"
          >
            <RoomList />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
