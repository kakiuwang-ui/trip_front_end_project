import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/app/api/utils/auth';

/**
 * @swagger
 * /api/favorites/{id}:
 *   delete:
 *     summary: 取消收藏
 *     description: 取消收藏指定酒店
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
 *         description: 取消收藏成功
 *       404:
 *         description: 未收藏该酒店
 *       401:
 *         description: 未登录
 */

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const currentUserId = authResult.user.userId;

    const { id } = await params;
    const hotelId = Number(id);

    if (!hotelId || Number.isNaN(hotelId)) {
      return NextResponse.json({ success: false, error: '无效的酒店ID' }, { status: 400 });
    }

    // Check if favorite exists
    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_hotelId: {
          userId: currentUserId,
          hotelId: hotelId,
        },
      },
    });

    if (!existingFavorite) {
      return NextResponse.json({ success: false, error: '未收藏该酒店' }, { status: 404 });
    }

    // Delete favorite
    await prisma.favorite.delete({
      where: {
        userId_hotelId: {
          userId: currentUserId,
          hotelId: hotelId,
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: { message: '取消收藏成功' }
    });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return NextResponse.json({ success: false, error: '取消收藏失败' }, { status: 500 });
  }
}
