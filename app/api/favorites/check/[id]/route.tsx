import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/app/api/utils/auth';

/**
 * @swagger
 * /api/favorites/check/{id}:
 *   get:
 *     summary: 检查收藏状态
 *     description: 检查当前用户是否收藏了指定酒店
 *     tags:
 *       - Favorites
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 酒店ID
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
 *                   type: object
 *                   properties:
 *                     isFavorite:
 *                       type: boolean
 *       401:
 *         description: 未登录
 */

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authResult = verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const currentUserId = authResult.user.userId;

    const hotelId = Number(params.id);

    if (!hotelId || Number.isNaN(hotelId)) {
      return NextResponse.json({ success: false, error: '无效的酒店ID' }, { status: 400 });
    }

    const favorite = await prisma.favorite.findUnique({
      where: {
        userId_hotelId: {
          userId: currentUserId,
          hotelId: hotelId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        isFavorite: !!favorite,
      }
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    return NextResponse.json({ success: false, error: '检查收藏状态失败' }, { status: 500 });
  }
}
