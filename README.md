# 易宿酒店管理系统

基于 Next.js 的现代化酒店预订和管理平台。

视频演示：https://www.bilibili.com/video/BV1GxArztEK5/
## 技术栈

- **框架**: Next.js 16.1.6 (App Router)
- **UI 库**: React 19.2.3
- **组件库**: Ant Design 6.2.2
- **主题管理**: next-themes (支持深色模式)
- **语言**: TypeScript 5

## 项目结构

```
trip_front_end_project/
├── app/                    # Next.js 应用目录
│   ├── components/        # 共享组件
│   ├── layout.tsx         # 根布局
│   ├── page.tsx          # 首页
│   ├── providers.tsx     # 全局 Provider 配置
│   └── globals.css       # 全局样式
├── public/               # 静态资源
├── legacy/              # 旧版项目代码（仅供参考）
│   ├── hotel-admin/     # React + Vite 管理端
│   ├── hotel-web/       # React + Vite 用户端
│   ├── hotel-mobile/    # Taro 移动端
│   ├── hotel-backend/   # Express.js 后端
│   └── docs/           # 项目文档和数据模型
└── ...配置文件
```

## 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 查看应用。

### 构建生产版本

```bash
npm run build
npm start
```

## 功能特性

### 已完成

- ✅ Next.js 项目基础架构
- ✅ Ant Design 组件库集成
- ✅ 深色模式支持
- ✅ 中文语言包配置
- ✅ TypeScript 类型支持

### 开发中

- 🚧 用户认证（登录/注册）
- 🚧 管理员后台
- 🚧 商户管理端
- 🚧 用户端酒店浏览和预订

## Legacy 项目

`legacy/` 目录包含了原有的 React + Vite 项目代码，作为功能迁移的参考。如需运行旧版项目，请查看 `legacy/README.md`。

**注意**: 新功能开发应基于根目录的 Next.js 项目，`legacy/` 目录仅作参考用途。

## 相关文档

- [Next.js 文档](https://nextjs.org/docs)
- [Ant Design 文档](https://ant.design/docs/react/introduce-cn)
- [数据模型设计](legacy/docs/数据模型.jpg)
- [开发计划](legacy/docs/development-plan.md)
