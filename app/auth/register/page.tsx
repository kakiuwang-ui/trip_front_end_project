'use client';

import { useState, useEffect } from 'react';
import { Form, Input, Button, Card, Typography, Select, App } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { register } from '@/app/services/auth';
import type { RegisterData } from '@/app/types';

const { Title } = Typography;
const { Option } = Select;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();
  const { message } = App.useApp();

  useEffect(() => {
    setMounted(true);
  }, []);

  const onFinish = async (values: RegisterData & { confirmPassword: string }) => {
    try {
      setLoading(true);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = values;
      await register(registerData);

      message.success('注册成功，请使用新账号登录');
      router.push('/auth/login');
    } catch (error: any) {
      console.error('注册失败:', error);
      message.error(error.response?.data?.error || '注册失败，请检查填写信息');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div
      suppressHydrationWarning
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
    >
      <Card
        suppressHydrationWarning
        style={{
          width: '100%',
          maxWidth: 450,
          margin: 20,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
          borderRadius: 8,
        }}
        styles={{
          body: { padding: 40 },
        }}
      >
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>
          易宿酒店管理系统
        </Title>
        <Title level={4} style={{ textAlign: 'center', marginBottom: 24, fontWeight: 'normal' }}>
          注册
        </Title>

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item

            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="邮箱"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            rules={[
              { pattern: /^1[3-9]\d{9}$/, message: '请输入有效的手机号' },
            ]}
          >
            <Input
              placeholder="手机号（选填）"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少 6 个字符' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="确认密码"
            />
          </Form.Item>
          
          <Form.Item
            name="name"
            rules={[
               { required: true, message: '请输入姓名/昵称' }
            ]}
          >
             <Input
               prefix={<UserOutlined />}
               placeholder="姓名"
             />
          </Form.Item>

          <Form.Item
             name="phone"
             rules={[
                 { pattern: /^[0-9-]{6,20}$/, message: '请输入有效的电话号码' }
             ]}
          >
             <Input
               prefix={<PhoneOutlined />}
               placeholder="电话号码 (选填)"
             />
          </Form.Item>

          <Form.Item
            name="role"
            rules={[{ required: true, message: '请选择角色' }]}
          >
            <Select placeholder="选择角色">
              <Option value="merchant">商户</Option>
              <Option value="user">普通用户</Option>
            </Select>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              block
            >
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            已有账号？ <Link href="/auth/login">立即登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
