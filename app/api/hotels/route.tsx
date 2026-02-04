// app/api/hotels/route.ts
import { prisma } from '@/app/lib/prisma'; 
import { NextRequest, NextResponse } from 'next/server';

/**
 * @swagger
 * /api/hotels:
 *   get:
 *     summary: 获取酒店列表
 *     description: 获取酒店列表，支持通过位置ID和状态进行筛选
 *     tags:
 *       - Hotels
 *     parameters:
 *       - in: query
 *         name: locationId
 *         schema:
 *           type: integer
 *         description: 位置ID过滤
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *         description: 酒店状态过滤
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: 酒店标签过滤 (逗号分隔，需同时满足所有标签)
 *     responses:
 *       200:
 *         description: 成功获取酒店列表
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
 *                     properties:
 *                       id:
 *                         type: integer
 *                       nameZh:
 *                         type: string
 *                       address:
 *                         type: string
 *                       description:
 *                         type: string
 *                       starRating:
 *                         type: integer
 *                       location:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                       merchant:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                       hotelTags:
 *                         type: array
 *                         items:
 *                           type: object
 *                           properties:
 *                             tag:
 *                               type: object
 *                               properties:
 *                                 id:
 *                                   type: integer
 *                                 name:
 *                                   type: string
 *       500:
 *         description: 服务器内部错误
 */
// GET - 获取酒店列表（支持查询参数过滤）
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');
    const merchantId = searchParams.get('merchantId');
    const status = searchParams.get('status');
    const tags = searchParams.get('tags');

    const where: any = {};
    if (locationId) where.locationId = parseInt(locationId);
    if (merchantId) where.merchantId = parseInt(merchantId);

    // 仅在没有指定status且不是商户查询自己的酒店时，才默认过滤为published
    if (status) {
      where.status = status;
    } else if (!merchantId) {
      // 默认只显示已发布的酒店（仅对公开查询）
      where.status = 'published';
    }
    
    // 如果有tags参数，解析并添加过滤条件 (满足所有tag)
    if (tags) {
      const tagList = tags.split(',').filter(t => t.trim().length > 0);
      if (tagList.length > 0) {
        where.AND = tagList.map(tagName => ({
          hotelTags: {
            some: {
              tag: {
                name: tagName
              }
            }
          }
        }));
      }
    }

    const hotels = await prisma.hotel.findMany({
      where,
      include: {
        location: true, // 包含关联的Location信息
        merchant: { select: { id: true, name: true, email: true } }, // 包含商户的部分信息
        hotelTags: { include: { tag: true } }, // 返回酒店的标签信息
        roomTypes: true, // 包含关联的房型信息
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ success: true, data: hotels });
  } catch (error) {
    console.error('Fetch hotels error:', error);
    return NextResponse.json({ success: false, error: '获取酒店列表失败' }, { status: 500 });
  }
}

/**
 * @swagger
 * /api/hotels:
 *   post:
 *     summary: 创建新酒店
 *     description: 创建一个新的酒店记录
 *     tags:
 *       - Hotels
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - nameZh
 *               - address
 *               - merchantId
 *             properties:
 *               nameZh:
 *                 type: string
 *                 description: 酒店中文名称
 *               nameEn:
 *                 type: string
 *                 description: 酒店英文名称
 *               address:
 *                 type: string
 *                 description: 酒店地址
 *               starRating:
 *                 type: number
 *                 description: 星级
 *               description:
 *                 type: string
 *                 description: 酒店描述
 *               facilities:
 *                 type: object
 *                 description: 设施列表 (JSON格式)
 *               openingYear:
 *                 type: integer
 *                 description: 开业年份
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: 酒店图片URL列表
 *               merchantId:
 *                 type: integer
 *                 description: 商户ID
 *               locationId:
 *                 type: integer
 *                 description: 位置ID
 *     responses:
 *       201:
 *         description: 酒店创建成功
 *       400:
 *         description: 请求参数错误
 *       500:
 *         description: 服务器内部错误
 */
// POST - 创建新酒店
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const merchantId = Number(body.merchantId);
    const locationId = body.locationId ? Number(body.locationId) : undefined;
    const starRating = body.starRating ? Number(body.starRating) : undefined;
    
    // Extract nested data
    const roomTypes = Array.isArray(body.roomTypes) ? body.roomTypes : [];
    const tagIds = Array.isArray(body.tagIds) ? body.tagIds : [];

    if (
      !body.nameZh ||
      !body.address ||
      Number.isNaN(merchantId) ||
      (locationId !== undefined && Number.isNaN(locationId)) ||
      (starRating !== undefined && Number.isNaN(starRating))
    ) {
      return NextResponse.json({ success: false, error: '缺少必要字段' }, { status: 400 });
    }

    const createData: any = {
        nameZh: body.nameZh,
        nameEn: body.nameEn,
        address: body.address,
        starRating: starRating ?? null,
        description: body.description,
        facilities: body.facilities, // 注意：facilities是Json类型
        openingYear: body.openingYear ? Number(body.openingYear) : null,
        images: body.images,
        merchantId,
        locationId: locationId ?? null,
        // status 使用schema中定义的默认值 "pending"
    };

    // Construct nested creation for Room Types
    if (roomTypes.length > 0) {
        createData.roomTypes = {
            create: roomTypes.map((rt: any) => ({
                name: rt.name,
                description: rt.description,
                price: rt.price,
                stock: rt.stock || 0,
                discount: rt.discount || 1,
            }))
        };
    }

    // Construct nested creation for Hotel Tags
    if (tagIds.length > 0) {
        createData.hotelTags = {
            create: tagIds.map((tagId: number) => ({
                tag: {
                    connect: { id: Number(tagId) }
                }
            }))
        };
    }

    const newHotel = await prisma.hotel.create({
      data: createData,
    });

    return NextResponse.json({ success: true, data: newHotel }, { status: 201 });
  } catch (error) {
    console.error('Create hotel error:', error);
    return NextResponse.json({ success: false, error: '创建酒店失败' }, { status: 500 });
  }
}