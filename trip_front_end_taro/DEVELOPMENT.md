# 开发文档

本文档提供酒店预订小程序的完整开发指南，帮助开发者快速上手项目开发。

## 目录
- [项目架构](#项目架构)
- [核心模块详解](#核心模块详解)
- [开发规范](#开发规范)
- [新页面开发指南](#新页面开发指南)
- [常见开发场景](#常见开发场景)
- [调试技巧](#调试技巧)

---

## 项目架构

### 技术栈
- **前端框架**: Taro 4.1.11
- **UI 框架**: React 18.0.0
- **HTTP 请求**: Taro.request
- **日期处理**: dayjs 1.11.13
- **代码规范**: ESLint + Prettier
- **版本控制**: Git

### 后端技术栈
- **框架**: Next.js 15
- **ORM**: Prisma
- **数据库**: SQLite (开发环境)
- **认证**: JWT

### 前后端分离架构

```
┌─────────────────────────────────────────────────────────────┐
│                    用户端小程序 (Taro)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Pages (页面层)                                       │  │
│  │  - home/           首页                               │  │
│  │  - hotelList/      酒店列表页                         │  │
│  │  - mine/           我的页面                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Services (服务层)                                    │  │
│  │  - auth.js         认证服务                           │  │
│  │  - hotel.js        酒店服务                           │  │
│  │  - booking.js      预订服务                           │  │
│  │  - location.js     位置服务                           │  │
│  │  - tag.js          标签服务                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Infrastructure (基础设施层)                          │  │
│  │  - request.js      HTTP 请求封装                      │  │
│  │  - storage.js      本地存储管理                       │  │
│  │  - format.js       数据格式化                         │  │
│  │  - constants.js    常量定义                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           ↓ HTTP Request
┌─────────────────────────────────────────────────────────────┐
│                    后端服务器 (Next.js)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  API Routes                                           │  │
│  │  - /api/auth       认证接口                           │  │
│  │  - /api/hotels     酒店接口                           │  │
│  │  - /api/bookings   预订接口                           │  │
│  │  - /api/locations  位置接口                           │  │
│  │  - /api/tags       标签接口                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                           ↓                                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Database (Prisma + SQLite)                           │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 目录结构

```
trip_front_end_taro/
├── src/
│   ├── app.config.js          # Taro 应用配置
│   ├── app.jsx                # 应用入口
│   ├── app.css                # 全局样式
│   ├── pages/                 # 页面目录
│   │   ├── home/              # 首页
│   │   │   ├── index.jsx
│   │   │   └── index.css
│   │   ├── hotelList/         # 酒店列表页
│   │   ├── mine/              # 我的页面
│   │   ├── login/             # 登录页
│   │   ├── register/          # 注册页
│   │   ├── hotelDetail/       # 酒店详情页
│   │   └── orderList/         # 订单列表页
│   ├── services/              # 服务层（API 调用）
│   │   ├── request.js         # HTTP 请求封装
│   │   ├── auth.js            # 认证服务
│   │   ├── hotel.js           # 酒店服务
│   │   ├── booking.js         # 预订服务
│   │   ├── location.js        # 位置服务
│   │   └── tag.js             # 标签服务
│   └── utils/                 # 工具函数
│       ├── storage.js         # 本地存储
│       ├── format.js          # 数据格式化
│       └── constants.js       # 常量定义
├── dist/                      # 编译输出目录
├── package.json
└── project.config.json        # 微信小程序配置
```

---

## 核心模块详解

### 1. HTTP 请求层 (src/services/request.js)

#### 功能概述
- 封装 Taro.request，提供统一的 HTTP 请求接口
- 自动注入 JWT Token
- 统一错误处理
- 401 自动跳转到登录页

#### 核心代码

```javascript
import Taro from '@tarojs/taro'

const BASE_URL = process.env.TARO_APP_API_BASE_URL || 'http://localhost:3000/api'

/**
 * 通用请求封装
 */
function request(url, options = {}) {
  const { method = 'GET', data, header = {} } = options

  // 1. 自动注入 Token
  const token = Taro.getStorageSync('token')
  if (token) {
    header['Authorization'] = `Bearer ${token}`
  }

  return Taro.request({
    url: `${BASE_URL}${url}`,
    method,
    data,
    header: {
      'Content-Type': 'application/json',
      ...header,
    },
  })
    .then((response) => {
      const { statusCode, data } = response

      // 2. 处理 401 未授权
      if (statusCode === 401) {
        Taro.showToast({
          title: '登录已过期，请重新登录',
          icon: 'none',
        })
        Taro.removeStorageSync('token')
        Taro.removeStorageSync('user')
        setTimeout(() => {
          Taro.navigateTo({ url: '/pages/login/index' })
        }, 1500)
        throw new Error('Unauthorized')
      }

      // 3. 处理业务错误
      if (!data.success) {
        Taro.showToast({
          title: data.message || '请求失败',
          icon: 'none',
        })
        throw new Error(data.message || 'Request failed')
      }

      return data
    })
    .catch((error) => {
      console.error('Request error:', error)
      if (!error.message.includes('Unauthorized')) {
        Taro.showToast({
          title: '网络请求失败',
          icon: 'none',
        })
      }
      throw error
    })
}

// 导出常用 HTTP 方法
export const get = (url, params) => request(url, { method: 'GET', data: params })
export const post = (url, data) => request(url, { method: 'POST', data })
export const put = (url, data) => request(url, { method: 'PUT', data })
export const del = (url, data) => request(url, { method: 'DELETE', data })
```

#### 使用示例

```javascript
import { get, post } from '../services/request'

// GET 请求
const hotels = await get('/hotels', { locationId: 1 })

// POST 请求
const result = await post('/auth/login', {
  email: 'user@trip.com',
  password: 'password123'
})
```

---

### 2. 本地存储层 (src/utils/storage.js)

#### 功能概述
- 封装 Taro 本地存储 API
- 提供 Token 和用户信息管理
- 自动处理 JSON 序列化

#### API 说明

| 方法 | 参数 | 返回值 | 说明 |
|------|------|--------|------|
| `setToken(token)` | `string` | - | 保存 JWT Token |
| `getToken()` | - | `string \| null` | 获取 Token |
| `setUser(user)` | `object` | - | 保存用户信息 |
| `getUser()` | - | `object \| null` | 获取用户信息 |
| `clearAuth()` | - | - | 清除认证信息 |
| `isAuthenticated()` | - | `boolean` | 检查是否已登录 |

#### 使用示例

```javascript
import { storage } from '../utils/storage'

// 保存登录信息
storage.setToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...')
storage.setUser({ id: 1, name: '张三', email: 'user@trip.com' })

// 检查登录状态
if (storage.isAuthenticated()) {
  const user = storage.getUser()
  console.log('当前用户:', user.name)
}

// 退出登录
storage.clearAuth()
```

---

### 3. 服务层 (src/services/*.js)

#### 3.1 认证服务 (auth.js)

```javascript
import { post } from './request'
import { storage } from '../utils/storage'

/**
 * 用户登录
 */
export const login = async (data) => {
  const res = await post('/auth/login', {
    email: data.username,
    password: data.password,
  })

  if (res.success && res.accessToken) {
    storage.setToken(res.accessToken)
    storage.setUser(res.user)
  }

  return res
}

/**
 * 用户注册
 */
export const register = async (data) => {
  return await post('/auth/register', data)
}

/**
 * 退出登录
 */
export const logout = async () => {
  storage.clearAuth()
}
```

#### 3.2 酒店服务 (hotel.js)

```javascript
import { get } from './request'

/**
 * 获取酒店列表
 * @param {object} params - 查询参数
 * @param {number} params.locationId - 位置 ID
 * @param {string} params.tags - 标签列表（逗号分隔）
 * @param {string} params.keyword - 搜索关键词
 */
export const getHotels = async (params = {}) => {
  const queryParams = {}

  if (params.locationId) {
    queryParams.locationId = params.locationId
  }

  if (params.tags) {
    queryParams.tags = Array.isArray(params.tags)
      ? params.tags.join(',')
      : params.tags
  }

  if (params.keyword) {
    queryParams.keyword = params.keyword
  }

  return await get('/hotels', queryParams)
}

/**
 * 获取酒店详情
 */
export const getHotelById = async (id) => {
  return await get(`/hotels/${id}`)
}

/**
 * 获取酒店房型列表
 */
export const getHotelRoomTypes = async (hotelId) => {
  return await get(`/hotels/${hotelId}/room-types`)
}
```

#### 3.3 预订服务 (booking.js)

```javascript
import { get, post, put } from './request'

/**
 * 创建预订
 */
export const createBooking = async (data) => {
  return await post('/bookings', {
    hotelId: data.hotelId,
    roomTypeId: data.roomTypeId,
    checkInDate: data.checkInDate,
    checkOutDate: data.checkOutDate,
    guestCount: data.guestCount || 1,
    totalPrice: data.totalPrice,
    guestInfo: {
      specialRequests: data.specialRequests || '',
    },
  })
}

/**
 * 获取我的预订列表
 */
export const getMyBookings = async (params = {}) => {
  return await get('/bookings', params)
}

/**
 * 取消预订
 */
export const cancelBooking = async (id) => {
  return await put(`/bookings/${id}`, { status: 'cancelled' })
}
```

---

### 4. 数据格式化 (src/utils/format.js)

#### 功能概述
- 提供统一的数据格式化函数
- 日期、价格、星级等常用格式化

#### API 说明

```javascript
/**
 * 格式化价格
 * @param {number} price - 价格（分）
 * @param {boolean} showSymbol - 是否显示货币符号
 * @returns {string} 格式化后的价格
 */
export const formatPrice = (price, showSymbol = true) => {
  const formatted = Number(price).toFixed(0)
  return showSymbol ? `¥${formatted}` : formatted
}

/**
 * 格式化日期
 * @param {string|Date} date - 日期
 * @param {string} format - 格式化模板
 * @returns {string} 格式化后的日期
 */
export const formatDate = (date, format = 'YYYY-MM-DD') => {
  return dayjs(date).format(format)
}

/**
 * 格式化星级
 * @param {number} rating - 星级（1-5）
 * @returns {string} 星级字符串（⭐⭐⭐）
 */
export const formatStars = (rating) => {
  const stars = Math.min(Math.max(Math.floor(rating), 1), 5)
  return '⭐'.repeat(stars)
}

/**
 * 计算天数差
 * @param {string} startDate - 开始日期
 * @param {string} endDate - 结束日期
 * @returns {number} 天数
 */
export const getDaysDiff = (startDate, endDate) => {
  return dayjs(endDate).diff(dayjs(startDate), 'day')
}
```

#### 使用示例

```javascript
import { formatPrice, formatDate, formatStars } from '../utils/format'

// 格式化价格
console.log(formatPrice(29900))  // ¥299

// 格式化日期
console.log(formatDate(new Date()))  // 2026-02-03

// 格式化星级
console.log(formatStars(4))  // ⭐⭐⭐⭐
```

---

## 开发规范

### 代码风格

#### 1. 命名约定

- **文件名**: 小驼峰命名（camelCase）
  ```
  hotelList.jsx  ✅
  HotelList.jsx  ❌
  hotel_list.jsx ❌
  ```

- **组件名**: 大驼峰命名（PascalCase）
  ```javascript
  function HotelList() { }  ✅
  function hotelList() { }  ❌
  ```

- **变量名**: 小驼峰命名
  ```javascript
  const hotelList = []      ✅
  const hotel_list = []     ❌
  ```

- **常量名**: 全大写下划线分隔
  ```javascript
  const API_BASE_URL = '...'  ✅
  const apiBaseUrl = '...'    ❌
  ```

#### 2. 组件开发规范

使用 React Hooks:
```javascript
import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'

function MyComponent() {
  // 1. 状态定义
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(false)

  // 2. 副作用
  useEffect(() => {
    loadData()
  }, [])

  // 3. 事件处理函数
  const loadData = async () => {
    setLoading(true)
    try {
      const res = await getHotels()
      setData(res.data)
    } catch (error) {
      console.error('加载失败:', error)
    } finally {
      setLoading(false)
    }
  }

  // 4. 渲染
  return (
    <View>
      {loading ? <Text>加载中...</Text> : <Text>数据已加载</Text>}
    </View>
  )
}

export default MyComponent
```

#### 3. API 调用规范

```javascript
// ✅ 正确示例
const loadHotels = async () => {
  try {
    setLoading(true)
    const res = await getHotels({ locationId: 1 })

    if (res.success) {
      setHotels(res.data)
    }
  } catch (error) {
    console.error('获取酒店列表失败:', error)
    Taro.showToast({ title: '加载失败', icon: 'none' })
  } finally {
    setLoading(false)
  }
}

// ❌ 错误示例（没有错误处理）
const loadHotels = async () => {
  const res = await getHotels({ locationId: 1 })
  setHotels(res.data)
}
```

#### 4. 样式规范

使用 CSS Modules 或独立 CSS 文件:
```css
/* index.css */
.container {
  padding: 20px;
  background-color: #f5f5f5;
}

.hotel-card {
  margin-bottom: 16px;
  padding: 16px;
  background-color: #fff;
  border-radius: 8px;
}

.hotel-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}
```

---

## 新页面开发指南

### 步骤 1: 创建页面文件

在 `src/pages/` 目录下创建新页面:

```bash
mkdir src/pages/hotelDetail
touch src/pages/hotelDetail/index.jsx
touch src/pages/hotelDetail/index.css
```

### 步骤 2: 编写页面组件

[src/pages/hotelDetail/index.jsx](src/pages/hotelDetail/index.jsx)
```javascript
import React, { useState, useEffect } from 'react'
import { View, Text } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import { getHotelById } from '../../services/hotel'
import './index.css'

function HotelDetail() {
  const router = useRouter()
  const hotelId = router.params.id

  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadHotelDetail()
  }, [])

  const loadHotelDetail = async () => {
    try {
      setLoading(true)
      const res = await getHotelById(hotelId)

      if (res.success) {
        setHotel(res.data)
      }
    } catch (error) {
      console.error('获取酒店详情失败:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <View className='loading'>加载中...</View>
  }

  return (
    <View className='hotel-detail'>
      <Text className='hotel-name'>{hotel?.nameZh}</Text>
      <Text className='hotel-address'>{hotel?.address}</Text>
    </View>
  )
}

export default HotelDetail
```

### 步骤 3: 添加样式

[src/pages/hotelDetail/index.css](src/pages/hotelDetail/index.css)
```css
.hotel-detail {
  padding: 20px;
}

.hotel-name {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 10px;
}

.hotel-address {
  font-size: 14px;
  color: #666;
}
```

### 步骤 4: 配置路由

编辑 [src/app.config.js](src/app.config.js):
```javascript
export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/hotelList/index',
    'pages/hotelDetail/index',  // 添加这一行
    'pages/mine/index',
  ],
  window: {
    backgroundTextStyle: 'light',
    navigationBarBackgroundColor: '#fff',
    navigationBarTitleText: '酒店预订',
    navigationBarTextStyle: 'black',
  },
})
```

### 步骤 5: 页面跳转

从其他页面跳转到新页面:
```javascript
// 带参数跳转
Taro.navigateTo({
  url: `/pages/hotelDetail/index?id=${hotelId}&checkIn=${checkInDate}`
})
```

---

## 常见开发场景

### 场景 1: 如何添加新的 API 服务

1. 在 `src/services/` 创建新服务文件:

```javascript
// src/services/review.js
import { get, post } from './request'

/**
 * 获取酒店评论列表
 */
export const getHotelReviews = async (hotelId) => {
  return await get(`/hotels/${hotelId}/reviews`)
}

/**
 * 发布评论
 */
export const createReview = async (data) => {
  return await post('/reviews', data)
}

export default {
  getHotelReviews,
  createReview,
}
```

2. 在页面中使用:

```javascript
import { getHotelReviews } from '../../services/review'

const loadReviews = async () => {
  const res = await getHotelReviews(hotelId)
  setReviews(res.data)
}
```

---

### 场景 2: 如何实现页面跳转传参

#### 发送参数

```javascript
// 简单参数
Taro.navigateTo({
  url: `/pages/hotelDetail/index?id=123&name=豪华酒店`
})

// 复杂参数（对象）
const params = {
  locationId: 1,
  checkInDate: '2026-02-05',
  checkOutDate: '2026-02-06',
  keyword: '豪华'
}

Taro.navigateTo({
  url: `/pages/hotelList/index?params=${encodeURIComponent(JSON.stringify(params))}`
})
```

#### 接收参数

```javascript
import { useRouter } from '@tarojs/taro'

function MyPage() {
  const router = useRouter()

  // 简单参数
  const id = router.params.id
  const name = router.params.name

  // 复杂参数
  const params = router.params.params
    ? JSON.parse(decodeURIComponent(router.params.params))
    : {}

  console.log('ID:', id)
  console.log('参数:', params)
}
```

---

### 场景 3: 如何处理用户认证

#### 检查登录状态

```javascript
import { storage } from '../../utils/storage'

const checkAuth = () => {
  if (!storage.isAuthenticated()) {
    Taro.showToast({ title: '请先登录', icon: 'none' })
    setTimeout(() => {
      Taro.navigateTo({ url: '/pages/login/index' })
    }, 1500)
    return false
  }
  return true
}

const handleBooking = () => {
  if (!checkAuth()) return

  // 执行预订操作
  createBooking(bookingData)
}
```

#### 监听登录状态变化

```javascript
import Taro from '@tarojs/taro'

useEffect(() => {
  checkAuth()

  // 监听页面显示（从登录页返回时刷新）
  const unloadCallback = Taro.useDidShow(() => {
    checkAuth()
  })

  return () => {
    if (unloadCallback) unloadCallback()
  }
}, [])
```

---

### 场景 4: 如何格式化数据展示

#### 后端数据格式转前端格式

```javascript
// 后端返回的数据
const backendData = {
  nameZh: '豪华大酒店',
  starRating: 5,
  basePrice: 29900,  // 单位：分
}

// 转换为前端展示格式
const frontendData = {
  name: backendData.nameZh,
  stars: formatStars(backendData.starRating),  // ⭐⭐⭐⭐⭐
  price: formatPrice(backendData.basePrice),   // ¥299
}
```

#### 批量转换

```javascript
const transformHotels = (hotels) => {
  return hotels.map(hotel => ({
    id: hotel.id,
    name: hotel.nameZh,
    stars: formatStars(hotel.starRating),
    price: formatPrice(hotel.basePrice),
    location: hotel.location?.name || '未知',
    image: hotel.images?.[0] || '/images/default-hotel.png',
  }))
}
```

---

## 调试技巧

### 1. 微信开发者工具调试

#### 查看控制台日志

1. 打开微信开发者工具
2. 点击「调试器」标签
3. 选择「Console」面板
4. 查看 `console.log` 输出

#### 查看网络请求

1. 在「调试器」中选择「Network」面板
2. 查看所有 HTTP 请求
3. 点击请求查看详细信息（Headers、Request、Response）

#### 断点调试

1. 在「Sources」面板中找到源文件
2. 点击行号设置断点
3. 重新加载页面，程序会在断点处暂停
4. 使用「Step Over」、「Step Into」等按钮调试

---

### 2. 网络请求调试

#### 查看请求日志

在服务层添加详细日志:
```javascript
export const getHotels = async (params = {}) => {
  console.log('🌐 [GET] /api/hotels', params)

  try {
    const res = await get('/hotels', params)
    console.log('✅ 获取酒店列表成功:', res)
    return res
  } catch (error) {
    console.error('❌ 获取酒店列表失败:', error)
    throw error
  }
}
```

#### 模拟 API 响应

在开发时可以使用 Mock 数据:
```javascript
const useMockData = false  // 开关

export const getHotels = async (params = {}) => {
  if (useMockData) {
    // 返回 Mock 数据
    return {
      success: true,
      data: [
        { id: 1, nameZh: '测试酒店', starRating: 5 }
      ]
    }
  }

  return await get('/hotels', params)
}
```

---

### 3. 状态调试

#### React DevTools

虽然微信开发者工具不支持 React DevTools，但可以通过以下方式调试状态:

```javascript
function HotelList() {
  const [hotels, setHotels] = useState([])

  // 调试：打印状态变化
  useEffect(() => {
    console.log('🔍 hotels 状态更新:', hotels)
  }, [hotels])

  return <View>...</View>
}
```

#### 自定义调试面板

```javascript
function DebugPanel({ data }) {
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <View className='debug-panel'>
      <Text>调试信息: {JSON.stringify(data)}</Text>
    </View>
  )
}
```

---

## 最佳实践

### 1. 错误处理

```javascript
// ✅ 推荐：完整的错误处理
const loadData = async () => {
  try {
    setLoading(true)
    setError(null)

    const res = await getHotels()
    setData(res.data)
  } catch (error) {
    console.error('加载失败:', error)
    setError(error.message)

    Taro.showToast({
      title: '加载失败，请重试',
      icon: 'none'
    })
  } finally {
    setLoading(false)
  }
}
```

### 2. 性能优化

```javascript
// 使用 useMemo 缓存计算结果
const filteredHotels = useMemo(() => {
  return hotels.filter(hotel => hotel.starRating >= 4)
}, [hotels])

// 使用 useCallback 缓存函数引用
const handleHotelClick = useCallback((id) => {
  Taro.navigateTo({ url: `/pages/hotelDetail/index?id=${id}` })
}, [])
```

### 3. 代码复用

```javascript
// 自定义 Hook
function useHotelList(params) {
  const [hotels, setHotels] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadHotels()
  }, [params])

  const loadHotels = async () => {
    setLoading(true)
    try {
      const res = await getHotels(params)
      setHotels(res.data)
    } finally {
      setLoading(false)
    }
  }

  return { hotels, loading, reload: loadHotels }
}

// 使用
function HotelListPage() {
  const { hotels, loading } = useHotelList({ locationId: 1 })

  return (
    <View>
      {loading ? <Loading /> : <HotelList hotels={hotels} />}
    </View>
  )
}
```

---

## 下一步

- 参考 [测试指南](./TESTING.md) 测试你的代码
- 查看 [README](./README.md) 了解项目概览
- 阅读 Taro 官方文档: https://taro-docs.jd.com/

如有问题，欢迎在项目 Issues 中提问。
