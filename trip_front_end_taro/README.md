# 易宿酒店预订小程序 (Taro)

基于 Taro + React 的酒店预订移动端应用，连接 Next.js 后端 API。

## 📚 文档导航

- **[测试指南](./TESTING.md)** - 完整的测试流程和功能验证清单
- **[开发文档](./DEVELOPMENT.md)** - 开发指南、架构说明和最佳实践
- **[API 文档](http://localhost:3000/api-doc)** - 后端 API 接口文档

## 技术栈

- **框架**: Taro 4.1.11
- **UI**: React 18.0.0 + @tarojs/components
- **日期处理**: dayjs 1.11.19
- **多端支持**: 微信小程序、支付宝、H5、字节跳动等

## 项目结构

```
src/
├── pages/              # 页面
│   ├── home/           # 首页（酒店查询）
│   ├── hotelList/      # 酒店列表
│   ├── hotelDetail/    # 酒店详情（待开发）
│   ├── booking/        # 预订确认（待开发）
│   ├── orderList/      # 订单列表（待开发）
│   ├── login/          # 登录页（待开发）
│   ├── register/       # 注册页（待开发）
│   └── mine/           # 个人中心
├── components/         # 组件
│   └── Calendar/       # 日期选择组件
├── services/           # API 服务层
│   ├── request.js      # HTTP 请求封装
│   ├── auth.js         # 认证服务
│   ├── hotel.js        # 酒店服务
│   ├── booking.js      # 预订服务
│   ├── location.js     # 位置服务
│   └── tag.js          # 标签服务
├── utils/              # 工具函数
│   ├── storage.js      # 本地存储
│   ├── format.js       # 格式化工具
│   └── constants.js    # 常量定义
└── app.js              # 应用入口
```

## 快速开始

### 环境要求

- Node.js >= 16
- npm >= 8

### 安装依赖

```bash
npm install
```

### 开发

```bash
# 微信小程序
npm run dev:weapp

# H5
npm run dev:h5

# 支付宝小程序
npm run dev:alipay
```

### 构建

```bash
# 微信小程序
npm run build:weapp

# H5
npm run build:h5
```

## 后端 API 连接

### 启动后端服务

在项目根目录（上一级目录）启动 Next.js 后端：

```bash
cd ..
npm run dev
```

后端将运行在: `http://localhost:3000`

### API 配置

开发环境 API 地址已配置在 `.env.development`:

```
TARO_APP_API_BASE_URL=http://localhost:3000/api
```

生产环境请修改 `.env.production`。

## 功能模块

### 已完成

- ✅ 首页 UI（标签切换、日期选择、搜索）
- ✅ 酒店列表页 UI（下拉刷新）
- ✅ 个人中心 UI
- ✅ 日历组件（区间/单日期选择）
- ✅ HTTP 请求层和服务层
- ✅ API 集成（首页、酒店列表、个人中心）
- ✅ 用户认证（登录/退出登录）

### 待开发

- 📋 酒店详情页（15分）
- 📋 登录页（5分）
- 📋 注册页（5分）
- 📋 预订确认页
- 📋 订单列表页
- 📋 订单管理功能

### 待开发

- 📋 用户收藏
- 📋 搜索历史
- 📋 价格日历

## API 接口列表

### 认证
- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `POST /auth/refresh` - 刷新 Token

### 酒店
- `GET /hotels` - 获取酒店列表
- `GET /hotels/:id` - 获取酒店详情
- `GET /hotels/:id/room-types` - 获取房型列表

### 预订
- `POST /bookings` - 创建预订
- `GET /bookings` - 获取我的订单
- `PUT /bookings/:id` - 更新订单
- `DELETE /bookings/:id` - 取消订单

### 其他
- `GET /locations` - 获取城市列表
- `GET /tags` - 获取标签列表

## 开发规范

### 命名规范

- **文件名**: 小写 + 下划线 (如 `hotel_detail.jsx`)
- **组件名**: 大驼峰 (如 `HotelCard`)
- **函数名**: 小驼峰 (如 `getHotelList`)
- **常量名**: 大写 + 下划线 (如 `API_BASE_URL`)

### 代码风格

- 使用 ES6+ 语法
- 优先使用函数式组件和 Hooks
- API 调用统一通过 services 层
- 工具函数放在 utils 目录

### Git 提交规范

```
feat: 新功能
fix: 修复 bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 常见问题 (FAQ)

### 1. 如何测试项目？

请参考 [测试指南](./TESTING.md)，里面包含完整的测试流程和功能验证清单。

### 2. 如何调试？

微信开发者工具中开启"不校验合法域名"选项。详细调试技巧请参考 [开发文档 - 调试技巧](./DEVELOPMENT.md#调试技巧)。

### 3. 请求失败怎么办？

- 检查后端服务是否启动（`npm run dev`）
- 确认 API 地址配置正确（默认 `http://localhost:3000/api`）
- 查看控制台错误信息
- 参考 [测试指南 - 常见问题排查](./TESTING.md#常见问题排查)

### 4. 如何添加新页面？

详细步骤请参考 [开发文档 - 新页面开发指南](./DEVELOPMENT.md#新页面开发指南)。

### 5. 如何添加新的 API 服务？

参考 [开发文档 - 常见开发场景](./DEVELOPMENT.md#常见开发场景)。

## 相关链接

### 项目文档
- [测试指南](./TESTING.md) - 如何测试项目功能
- [开发文档](./DEVELOPMENT.md) - 开发指南和最佳实践
- [后端 API 文档](http://localhost:3000/api-doc) - API 接口说明
- [项目需求文档](../第五期前端训练营大作业说明.pdf) - 作业要求

### 技术文档
- [Taro 官方文档](https://taro-docs.jd.com/)
- [React 官方文档](https://react.dev/)
- [微信小程序文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)

## 开发进度

### 基础设施 (已完成)
- [x] 项目基础架构
- [x] HTTP 请求封装 (request.js)
- [x] 本地存储管理 (storage.js)
- [x] 数据格式化工具 (format.js)
- [x] 常量定义 (constants.js)

### 服务层 (已完成)
- [x] 认证服务 (auth.js)
- [x] 酒店服务 (hotel.js)
- [x] 预订服务 (booking.js)
- [x] 位置服务 (location.js)
- [x] 标签服务 (tag.js)

### 页面开发
- [x] 首页 (已集成 API)
- [x] 酒店列表 (已集成 API)
- [x] 个人中心 (已集成认证)
- [x] 日历组件
- [ ] 酒店详情页（15分 - 待开发）
- [ ] 登录页（5分 - 待开发）
- [ ] 注册页（5分 - 待开发）
- [ ] 预订确认页（待开发）
- [ ] 订单列表页（待开发）

### 文档 (已完成)
- [x] 测试指南 (TESTING.md)
- [x] 开发文档 (DEVELOPMENT.md)
- [x] README 更新

## License

MIT
