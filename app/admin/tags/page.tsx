'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  App
} from 'antd';
import type { TableColumnsType } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import { getTags, createTag, updateTag, deleteTag } from '@/app/services/admin';
import type { Tag } from '@/app/types';

export default function TagManagementPage() {
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTag, setEditingTag] = useState<Tag | null>(null);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  useEffect(() => {
    fetchTags();
  }, []);

  useEffect(() => {
    if (modalVisible) {
      if (editingTag) {
        form.setFieldsValue({ name: editingTag.name });
      } else {
        form.resetFields();
      }
    }
  }, [modalVisible, editingTag, form]);

  const fetchTags = async () => {
    try {
      setLoading(true);
      const res = await getTags();
      setTags(res.data || []);
    } catch (error) {
      console.error('Fetch tags error:', error);
      message.error('获取标签列表失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingTag(null);
    setModalVisible(true);
  };

  const handleEdit = (record: Tag) => {
    setEditingTag(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteTag(id);
      message.success('删除成功');
      fetchTags();
    } catch (error: any) {
      console.error('Delete tag error:', error);
      message.error(error.response?.data?.error || '删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
        const values = await form.validateFields();
        if (editingTag) {
            await updateTag(editingTag.id, values.name);
            message.success('更新成功');
        } else {
            await createTag(values.name);
            message.success('创建成功');
        }
        setModalVisible(false);
        fetchTags();
    } catch (error: any) {
        if (error.errorFields) return; // Form validation failed
        console.error('Submit tag error:', error);
        message.error(error.response?.data?.error || '操作失败');
    }
  };

  const columns: TableColumnsType<Tag> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '标签名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个标签吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="text" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h2 className="text-xl font-bold">酒店标签管理</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增标签
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={tags}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingTag ? '编辑标签' : '新增标签'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        destroyOnHidden={true}
      >
        <Form form={form} layout="vertical">
            <Form.Item 
                name="name" 
                label="标签名称" 
                rules={[{ required: true, message: '请输入标签名称' }]}
            >
                <Input placeholder="例如：免费WiFi" />
            </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
