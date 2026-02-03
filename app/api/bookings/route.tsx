
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/app/api/utils/auth';

/**
 * @swagger
 * /api/bookings:
 *   get:
 *     summary: 获取预订列表
 *     description: 获取预订列表。支持查询当前用户的预订，或商户查询自己名下酒店的预订。
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: query
 *         name: merchantId
 *         schema:
 *           type: integer
 *         description: 商户ID (选填，若提供则返回该商户名下酒店的所有预订)
 *     responses:
 *       200:
 *         description: 成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *   post:
 *     summary: 创建预订
 *     description: 用户预订酒店房间
 *     tags:
 *       - Bookings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hotelId
 *               - roomTypeId
 *               - checkInDate
 *               - checkOutDate
 *             properties:
 *               hotelId:
 *                 type: integer
 *               roomTypeId:
 *                 type: integer
 *               checkInDate:
 *                 type: string
 *                 format: date
 *                 description: YYYY-MM-DD
 *               checkOutDate:
 *                 type: string
 *                 format: date
 *                 description: YYYY-MM-DD
 *               guestCount:
 *                 type: integer
 *               guestInfo:
 *                 type: object
 *     responses:
 *       201:
 *         description: 预订成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     status:
 *                       type: string
 *                     totalPrice:
 *                       type: number
 *       400:
 *         description: 输入无效或库存不足
 *       401:
 *         description: 未登录
 */

export async function GET(request: NextRequest) {
  try {
    const authResult = verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const currentUserId = authResult.user.userId;

    const { searchParams } = new URL(request.url);
    const merchantIdParam = searchParams.get('merchantId');

    let where: any = {};

    if (merchantIdParam) {
      // 商户查询自己酒店的订单
      // 安全检查：确保当前用户就是查询的商户，或者是管理员
      const merchantId = parseInt(merchantIdParam);
      
      // 这里简单校验：如果请求特定merchantId，当前用户必须是该merchant (或者我们可以允许Admin)
      // 如果不是同一个用户，暂时拒绝 (防止用户枚举别人的订单)
      // 但如果当前角色是管理员，可以放行。这里主要服务于 Dashboard (用户查自己的)。
      if (merchantId !== currentUserId) {
         // 可选：检查是否管理员。这里简单起见，仅允许查自己。
         return NextResponse.json({ success: false, error: '无权查看他人商户订单' }, { status: 403 });
      }

      where = {
        hotel: {
          merchantId: merchantId
        }
      };
    } else {
      // 普通用户查询自己的订单
      where = {
        userId: currentUserId
      };
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        hotel: {
          select: {
            id: true,
            nameZh: true,
            images: true
          }
        },
        roomType: {
          select: {
            id: true,
            name: true,
          }
        },
        user: {
           select: {
               id: true,
               name: true,
               email: true,
               phone: true
           }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error) {
    console.error('Fetch bookings error:', error);
    return NextResponse.json({ success: false, error: '获取预订列表失败' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {

  try {
    // 1. 验证用户
    const authResult = verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const userId = authResult.user.userId;

    // 2. 解析请求
    const body = await request.json();
    const { hotelId, roomTypeId, checkInDate, checkOutDate, guestCount = 1, guestInfo } = body;

    // 简单校验
    if (!hotelId || !roomTypeId || !checkInDate || !checkOutDate) {
      return NextResponse.json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start >= end) {
      return NextResponse.json({ success: false, error: '日期无效' }, { status: 400 });
    }

    // 验证 start 是否在今天之后? (可选业务逻辑，暂不严格限制)

    // 3. 事务处理：检查库存并扣减
    const result = await prisma.$transaction(async (tx) => {
      // 3.1 获取房型基础信息
      const roomType = await tx.roomType.findUnique({
        where: { id: roomTypeId },
      });
      if (!roomType || roomType.hotelId !== hotelId) {
        throw new Error('房型不存在或不属于该酒店');
      }

      // 3.2 计算每一天的价格和库存
      // 需要遍历 checkIn 到 checkOut 的每一天
      let currentDate = new Date(start);
      let totalPrice = 0;

      while (currentDate < end) {
        // 查找当天的可用性记录
        // 注意：Prisma Date 比较需要精确匹配，建议统一时区或仅用 Date部分。
        // 这里假设数据库存的是 UTC 0点，或者我们会 Upsert
        // 简化起见，我们先查询
        const dateKey = new Date(currentDate);

        let availability = await tx.roomAvailability.findUnique({
          where: {
            roomTypeId_date: {
              roomTypeId: roomTypeId,
              date: dateKey,
            },
          },
        });

        // 如果没有可用性记录，通常意味着使用默认配置
        // 需要判断是否创建记录? 为了由数据库保证并发安全，最好是 Upsert 或者 Lock。
        // 但 findUnique 没法 Lock。
        // 策略：如果不存在，则基于 RoomType 默认值计算。
        // 但为了记录 'booked' 数量，我们需要这条记录存在。
        
        let price = availability?.price ?? roomType.price;
        const totalQuota = availability?.quota ?? roomType.stock;
        
        // 检查是否关闭
        if (availability?.isClosed) {
            throw new Error(`日期 ${currentDate.toISOString().split('T')[0]} 房间已关闭`);
        }

        // 检查库存
        // 当前已定数量。如果 availability 不存在，booked = 0
        const currentBooked = availability?.booked ?? 0;
        
        if (currentBooked >= totalQuota) {
             throw new Error(`日期 ${currentDate.toISOString().split('T')[0]} 房间已售罄`);
        }

        totalPrice += Number(price); // Decimal 转 Number 计算 (需注意精度，这里简化)
        
        // 3.3 更新库存 (自增 booked)
        // 使用 upsert 确保记录存在并原子更新
        await tx.roomAvailability.upsert({
            where: {
                roomTypeId_date: {
                    roomTypeId: roomTypeId,
                    date: dateKey
                }
            },
            update: {
                booked: { increment: 1 }
            },
            create: {
                roomTypeId: roomTypeId,
                date: dateKey,
                booked: 1,
                quota: roomType.stock,
                price: roomType.price
            }
        });

        // 下一天
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // 3.4 创建订单
      const booking = await tx.booking.create({
        data: {
            userId,
            hotelId,
            roomTypeId,
            checkInDate: start,
            checkOutDate: end,
            guestCount,
            totalPrice: totalPrice, // 应该根据实际精度处理
            status: 'pending', // 默认状态
            guestInfo: guestInfo ?? {}
        }
      });

      return booking;
    });

    return NextResponse.json({ success: true, data: result }, { status: 201 });

  } catch (error: any) {
    console.error('Create booking error:', error);
    return NextResponse.json({ success: false, error: error.message || '预订失败' }, { status: 500 });
  }
}
