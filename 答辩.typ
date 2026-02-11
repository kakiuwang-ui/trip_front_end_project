Prisma 定义数据模型 $->$ 创建api routes $->$ 封装Service层 $->$ 组件调用 $->$ Service $->$ 处理认证和错误

前端组件 (React) 
    ↓ 调用
Service 层 (封装 API 调用)
    ↓ HTTP 请求
Next.js API Routes (后端)
    ↓ 数据库操作
Prisma ORM
    ↓ SQL
MySQL 数据库

数据库层
文件：prisma/schema.prisma

深色模式


微信小程序要在当前目录下编译
cd trip_front_end_taro && npm run dev:weapp
