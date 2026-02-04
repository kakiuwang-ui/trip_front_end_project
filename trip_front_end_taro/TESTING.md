# 测试指南

本文档提供酒店预订小程序的完整测试指南，帮助团队成员快速验证功能。

## 目录
- [环境准备](#环境准备)
- [后端服务器测试](#后端服务器测试)
- [前端小程序测试](#前端小程序测试)
- [功能测试清单](#功能测试清单)
- [API 集成测试](#api-集成测试)
- [常见问题排查](#常见问题排查)

---

## 环境准备

### Node.js 版本要求
- Node.js >= 18.0.0
- npm >= 9.0.0

检查版本:
```bash
node -v
npm -v
```

### 依赖安装

1. **后端依赖安装**
```bash
# 在项目根目录执行
npm install
```

2. **前端依赖安装**
```bash
# 在 trip_front_end_taro 目录执行
cd trip_front_end_taro
npm install
```

### 微信开发者工具
下载并安装微信开发者工具:
- 官网: https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html
- 版本: Stable Build (稳定版)

---

## 后端服务器测试

### 1. 启动后端服务

在项目根目录执行:
```bash
npm run dev
```

预期输出:
```
> trip-front-end-project@1.0.0 dev
> next dev

  ▲ Next.js 15.1.6
  - Local:        http://localhost:3000

 ✓ Starting...
 ✓ Ready in 2.3s
```

### 2. 验证数据库连接

后端使用 SQLite 数据库，启动时会自动连接。如果看到以下输出表示数据库正常:
```
✓ Database connected
✓ Prisma client initialized
```

### 3. API 端点测试

使用 curl 或浏览器测试以下 API 端点:

#### 3.1 获取城市列表
```bash
curl http://localhost:3000/api/locations
```

预期响应:
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "北京", "description": "首都北京"},
    {"id": 2, "name": "上海", "description": "魔都上海"},
    ...
  ]
}
```

#### 3.2 获取标签列表
```bash
curl http://localhost:3000/api/tags
```

预期响应:
```json
{
  "success": true,
  "data": [
    {"id": 1, "name": "豪华酒店"},
    {"id": 2, "name": "经济型"},
    ...
  ]
}
```

#### 3.3 获取酒店列表
```bash
curl 'http://localhost:3000/api/hotels?locationId=1'
```

预期响应:
```json
{
  "success": true,
  "data": [
    {
      "id": 6,
      "nameZh": "大酒店",
      "starRating": 3,
      "address": "中国",
      "location": {"id": 1, "name": "北京"},
      ...
    }
  ]
}
```

#### 3.4 用户登录测试
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@trip.com", "password": "password123"}'
```

预期响应:
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "测试用户",
    "email": "user@trip.com"
  }
}
```

### 4. 常见错误排查

#### 错误: Port 3000 already in use
解决方案:
```bash
# 查找占用端口的进程
lsof -i :3000

# 终止进程
kill -9 <PID>
```

#### 错误: Database connection failed
解决方案:
```bash
# 重新生成 Prisma Client
npx prisma generate

# 重新运行数据库迁移
npx prisma db push
```

---

## 前端小程序测试

### 1. 启动开发模式

在 `trip_front_end_taro` 目录执行:
```bash
npm run dev:weapp
```

预期输出:
```
> hotel-book-taro@1.0.0 dev:weapp
> taro build --type weapp --watch

✓ Webpack compiled successfully
✓ Starting development server
```

编译完成后，会在 `trip_front_end_taro/dist` 目录生成微信小程序代码。

### 2. 在微信开发者工具中导入项目

1. 打开微信开发者工具
2. 点击「导入项目」
3. 项目目录选择: `/path/to/trip_front_end_project/trip_front_end_taro/dist`
4. AppID: 使用测试号或输入「test」
5. 项目名称: hotel-book-taro
6. 点击「导入」

### 3. 配置 API 基础 URL

确保 API 基础 URL 配置正确:

文件: `src/services/request.js`
```javascript
const BASE_URL = process.env.TARO_APP_API_BASE_URL || 'http://localhost:3000/api'
```

开发环境默认使用 `http://localhost:3000/api`，无需修改。

### 4. 启用本地网络调试

在微信开发者工具中:
1. 点击右上角「详情」
2. 勾选「不校验合法域名、web-view (业务域名)、TLS 版本以及 HTTPS 证书」
3. 确保「本地设置」中勾选了「不校验合法域名」

---

## 功能测试清单

### 首页 (home/index.jsx)

测试步骤:
1. **城市选择功能**
   - [ ] 点击「选择城市」按钮
   - [ ] 验证弹出城市列表选择器
   - [ ] 选择一个城市（如「北京」）
   - [ ] 验证城市名称显示更新

2. **日期选择功能**
   - [ ] 点击「入住日期」选择器
   - [ ] 选择一个日期
   - [ ] 验证日期显示更新
   - [ ] 点击「离店日期」选择器
   - [ ] 选择一个晚于入住日期的日期
   - [ ] 验证日期显示更新

3. **搜索关键词输入**
   - [ ] 在搜索框输入「豪华」
   - [ ] 验证输入内容显示正确

4. **跳转到酒店列表**
   - [ ] 点击「搜索」按钮
   - [ ] 验证页面跳转到酒店列表页
   - [ ] 验证搜索参数正确传递

预期结果:
- 城市数据从后端 API 加载
- 日期选择器正常工作
- 搜索参数正确传递到酒店列表页

---

### 酒店列表 (hotelList/index.jsx)

测试步骤:
1. **加载酒店列表**
   - [ ] 从首页跳转到酒店列表页
   - [ ] 验证显示 loading 状态
   - [ ] 验证酒店列表数据加载成功
   - [ ] 验证至少显示 1 个酒店卡片

2. **显示酒店基本信息**
   - [ ] 验证酒店名称显示正确
   - [ ] 验证星级显示（⭐ 符号）
   - [ ] 验证价格显示格式正确（¥999）
   - [ ] 验证地址信息显示

3. **点击跳转到详情页**
   - [ ] 点击任意酒店卡片
   - [ ] 验证跳转到酒店详情页
   - [ ] 验证酒店 ID 和日期参数正确传递

API 测试:
```javascript
// 打开控制台查看网络请求
// 应该看到:
// ✅ 获取酒店列表成功: {success: true, data: [...]}
```

预期结果:
- 酒店数据从后端 API 加载（非硬编码）
- 数据格式转换正确（nameZh → name, starRating → stars）
- 点击跳转正常

---

### 我的 (mine/index.jsx)

#### 未登录状态测试:
1. **显示未登录状态**
   - [ ] 打开「我的」页面
   - [ ] 验证显示「未登录」文字
   - [ ] 验证显示「点击下方按钮登录」提示
   - [ ] 验证显示「立即登录」和「注册账号」按钮

2. **登录按钮功能**
   - [ ] 点击「立即登录」按钮
   - [ ] 验证跳转到登录页 `/pages/login/index`

3. **注册按钮功能**
   - [ ] 点击「注册账号」按钮
   - [ ] 验证跳转到注册页 `/pages/register/index`

4. **订单列表跳转（需登录）**
   - [ ] 点击「我的订单」菜单项
   - [ ] 验证显示提示「请先登录」
   - [ ] 验证 1.5 秒后自动跳转到登录页

#### 已登录状态测试:
1. **登录用户**
   - [ ] 在登录页输入测试账号密码
   - [ ] 登录成功后返回「我的」页面

2. **显示用户信息**
   - [ ] 验证显示用户名称
   - [ ] 验证显示「欢迎回来」文字
   - [ ] 验证显示「退出登录」按钮

3. **退出登录功能**
   - [ ] 点击「退出登录」按钮
   - [ ] 验证弹出确认对话框
   - [ ] 点击「确定」
   - [ ] 验证页面状态切换为未登录
   - [ ] 验证 Token 已清除

---

## API 集成测试

### 网络请求拦截器测试

在控制台查看请求日志:
```javascript
// 应该看到:
// 🌐 [GET] /api/locations
// ✅ 获取位置列表成功: {...}
```

### Token 自动注入测试

1. 登录成功后，查看后续请求
2. 在控制台查看请求头
3. 验证包含 `Authorization: Bearer <token>`

测试代码（在控制台执行）:
```javascript
// 获取当前 token
const token = Taro.getStorageSync('token')
console.log('Token:', token)
```

### 401 自动跳转测试

1. 手动删除 Token:
```javascript
Taro.removeStorageSync('token')
```

2. 访问需要认证的 API（如获取订单列表）
3. 验证自动跳转到登录页
4. 验证显示提示「登录已过期，请重新登录」

### 错误处理测试

1. **网络错误测试**
   - 关闭后端服务器
   - 在小程序中执行任意 API 请求
   - 验证显示错误提示 Toast

2. **API 错误测试**
   - 使用错误的参数调用 API
   - 验证显示后端返回的错误信息

---

## 常见问题排查

### Q1: 微信开发者工具显示「request:fail」

**原因**: 未开启本地网络调试权限

**解决方案**:
1. 在微信开发者工具中打开「详情」
2. 勾选「不校验合法域名」
3. 重新编译小程序

---

### Q2: API 请求返回 404

**原因**: 后端服务器未启动或 API 路径错误

**解决方案**:
1. 检查后端服务器是否运行: `curl http://localhost:3000/api/locations`
2. 检查 API 路径是否正确
3. 查看控制台错误日志

---

### Q3: 登录后仍显示未登录

**原因**: Token 未正确保存或已过期

**解决方案**:
1. 在控制台检查 Token:
```javascript
console.log(Taro.getStorageSync('token'))
console.log(Taro.getStorageSync('user'))
```
2. 如果为空，重新登录
3. 检查 `src/services/auth.js` 中 Token 保存逻辑

---

### Q4: 页面跳转失败

**原因**: 路由未在 `app.config.js` 中配置

**解决方案**:
1. 打开 `src/app.config.js`
2. 在 `pages` 数组中添加页面路径
3. 重新编译小程序

示例:
```javascript
export default defineAppConfig({
  pages: [
    'pages/home/index',
    'pages/hotelList/index',
    'pages/mine/index',
    'pages/login/index',        // 添加这一行
    'pages/register/index',     // 添加这一行
  ],
})
```

---

### Q5: 数据显示为空或 undefined

**原因**: 数据格式转换错误或 API 返回数据结构变化

**解决方案**:
1. 在控制台查看 API 返回数据:
```javascript
console.log('API 响应:', response)
```
2. 检查数据转换逻辑（如 `nameZh → name`）
3. 验证后端 API 返回格式是否符合预期

---

## 测试报告模板

完成测试后，可以使用以下模板记录测试结果:

```markdown
# 测试报告

**测试日期**: 2026-02-03
**测试人员**: [姓名]
**测试环境**: 微信开发者工具 Stable

## 测试结果汇总
- ✅ 后端 API 测试: 通过
- ✅ 首页功能测试: 通过
- ✅ 酒店列表测试: 通过
- ✅ 我的页面测试: 通过
- ⚠️  登录注册测试: 部分通过（登录页未实现）

## 发现的问题
1. [问题描述]
   - 重现步骤: ...
   - 预期结果: ...
   - 实际结果: ...
   - 截图: ...

## 建议
1. [改进建议]
```

---

## 下一步

完成测试后，可以参考以下文档继续开发:
- [开发文档](./DEVELOPMENT.md) - 学习如何开发新功能
- [README](./README.md) - 项目概览和快速开始

如有问题，请联系项目负责人或查看项目 Issues。
