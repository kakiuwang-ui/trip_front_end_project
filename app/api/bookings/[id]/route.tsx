
import { prisma } from '@/app/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/app/api/utils/auth';

/**
 * @swagger
 * /api/bookings/{id}:
 *   put:
 *     summary: 更新预订
 *     description: 用户更新预订信息 (如入住人信息或取消订单)
 *     tags:
 *       - Bookings
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               guestInfo:
 *                 type: object
 *               status:
 *                 type: string
 *                 enum: [cancelled]
 *     responses:
 *       200:
 *         description: 更新成功
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
 *                     guestInfo:
 *                       type: object
 *   delete:
 *     summary: 删除预订
 *     description: 用户删除预订记录 (并将释放库存)
 *     tags:
 *       - Bookings
 *     responses:
 *       200:
 *         description: 删除成功
 */

export async function PUT(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const bookingId = parseInt(params.id);
    const authResult = verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const userId = authResult.user.userId;

    // 1. 获取订单校验权限 - 需要包含酒店信息以检查商户权限
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { hotel: true }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: '订单不存在' }, { status: 404 });
    }

    const isUser = booking.userId === userId;
    const isMerchant = booking.hotel?.merchantId === userId;

    if (!isUser && !isMerchant) {
      return NextResponse.json({ success: false, error: '无权操作此订单' }, { status: 403 });
    }

    const body = await request.json();
    const { guestInfo, status } = body;

    // 2. 处理取消订单 (用户和商户均可)
    if (status === 'cancelled') {
        if (booking.status === 'cancelled') {
           return NextResponse.json({ success: true, message: '订单已取消' });
        }

        // 开启事务释放库存
        await prisma.$transaction(async (tx) => {
            await tx.booking.update({
                where: { id: bookingId },
                data: { status: 'cancelled' }
            });

            // 归还库存
            if (booking.roomTypeId) {
                let currentDate = new Date(booking.checkInDate);
                const end = new Date(booking.checkOutDate);

                while (currentDate < end) {
                    const dateKey = new Date(currentDate);
                    // 减少 booked 计数
                    await tx.roomAvailability.updateMany({
                    where: {
                        roomTypeId: booking.roomTypeId!,
                        date: dateKey
                    },
                    data: {
                        booked: { decrement: 1 }
                    } 
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            }
        });
        return NextResponse.json({ success: true, message: '订单已取消' });
    }

    // 3. 处理其他更新 (仅商户可操作)
    if (!isMerchant) {
        return NextResponse.json({ success: false, error: '只有商户可以修改订单信息' }, { status: 403 });
    }

    // 普通更新 (如 guestInfo 或其他状态)
    const updateData: any = {};
    if (guestInfo) updateData.guestInfo = guestInfo;
    if (status) updateData.status = status;

    const updatedBooking = await prisma.booking.update({
        where: { id: bookingId },
        data: updateData
    });

    return NextResponse.json({ success: true, data: updatedBooking });
  } catch (error) {
    console.error('Update booking error:', error);
    return NextResponse.json({ success: false, error: '更新订单失败' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const bookingId = parseInt(params.id);
    const authResult = verifyAuth(request);
    if (!authResult.success) {
      return NextResponse.json({ success: false, error: authResult.error }, { status: authResult.status });
    }
    const userId = authResult.user.userId;

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { hotel: true }
    });

    if (!booking) {
      return NextResponse.json({ success: false, error: '订单不存在' }, { status: 404 });
    }

    const isUser = booking.userId === userId;
    const isMerchant = booking.hotel?.merchantId === userId;

    if (!isUser && !isMerchant) {
      return NextResponse.json({ success: false, error: '无权操作此订单' }, { status: 403 });
    }

    // 删除前如果订单有效，应该释放库存。
    // 假设 'pending' 或 'confirmed' 占用库存，'cancelled' 不占用。
    // 如果直接删除，应该归还。
    const shouldRestoreStock = booking.status === 'pending' || booking.status === 'confirmed';

    await prisma.$transaction(async (tx) => {
         await tx.booking.delete({
             where: { id: bookingId }
         });

         if (shouldRestoreStock && booking.roomTypeId) {
            let currentDate = new Date(booking.checkInDate);
            const end = new Date(booking.checkOutDate);

            while (currentDate < end) {
                const dateKey = new Date(currentDate);
                await tx.roomAvailability.updateMany({
                   where: {
                       roomTypeId: booking.roomTypeId,
                       date: dateKey
                   },
                   data: {
                       booked: { decrement: 1 }
                   } 
                });
                currentDate.setDate(currentDate.getDate() + 1);
            }
         }
    });

    return NextResponse.json({ success: true, message: '订单已删除' });
  } catch (error) {
    console.error('Delete booking error:', error);
    return NextResponse.json({ success: false, error: '删除订单失败' }, { status: 500 });
  }
}
