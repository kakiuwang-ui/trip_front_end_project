import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/app/api/utils/auth';

/**
 * @swagger
 * /api/favorites:
 *   get:
 *     summary: 获取用户收藏列表
 *     description: 获取当前登录用户的所有收藏酒店
 *     tags:
 *       - Favorites
 *     responses:
 *       200:
 *         description: 成功获取收藏列表
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
 *                         type: string
 *                       hotelId:
 *                         type: integer
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       hotel:
 *                         type: object
 *       401:
 *         description: 未登录
 *   post:
 *     summary: 添加收藏
 *     description: 收藏一个酒店
 *     tags:
 *       - Favorites
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - hotelId
 *             properties:
 *               hotelId:
 *                 type: integer
 *                 description: 酒店ID
 *     responses:
 *       201:
 *         description: 收藏成功
 *       400:
 *         description: 参数错误或已收藏
 *       401:
 *         description: 未登录
 */

// GET - 获取用户收藏列表
export async function GET(request: NextRequest) {
  try {
    const authResult = verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const currentUserId = authResult.user.userId;

    const favorites = await prisma.favorite.findMany({
      where: { userId: currentUserId },
      include: {
        hotel: {
          include: {
            location: true,
            merchant: { select: { id: true, name: true, email: true } },
            hotelTags: { include: { tag: true } },
            roomTypes: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });

    // Format the response to include composite id
    const formattedFavorites = favorites.map(fav => ({
      id: `${fav.userId}-${fav.hotelId}`, // Create a composite ID for frontend
      hotelId: fav.hotelId,
      createdAt: fav.createdAt,
      hotel: fav.hotel,
    }));

    return NextResponse.json({ success: true, data: formattedFavorites });
  } catch (error) {
    console.error('Fetch favorites error:', error);
    return NextResponse.json({ success: false, error: '获取收藏列表失败' }, { status: 500 });
  }
}

// POST - 添加收藏
export async function POST(request: NextRequest) {
  try {
    const authResult = verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const currentUserId = authResult.user.userId;

    const body = await request.json();
    const hotelId = Number(body.hotelId);

    if (!hotelId || Number.isNaN(hotelId)) {
      return NextResponse.json({ success: false, error: '缺少酒店ID' }, { status: 400 });
    }

    // Check if hotel exists
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelId },
    });

    if (!hotel) {
      return NextResponse.json({ success: false, error: '酒店不存在' }, { status: 404 });
    }

    // Check if already favorited
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_hotelId: {
          userId: currentUserId,
          hotelId: hotelId,
        },
      },
    });

    if (existingFavorite) {
      return NextResponse.json({ success: false, error: '已收藏该酒店' }, { status: 400 });
    }

    // Create favorite
    const favorite = await prisma.favorite.create({
      data: {
        userId: currentUserId,
        hotelId: hotelId,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: `${favorite.userId}-${favorite.hotelId}`,
        message: '收藏成功'
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Add favorite error:', error);
    return NextResponse.json({ success: false, error: '添加收藏失败' }, { status: 500 });
  }
}
