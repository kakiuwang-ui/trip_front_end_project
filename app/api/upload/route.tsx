import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

/**
 * @swagger
 * /api/upload:
 *   post:
 *     summary: 上传图片
 *     description: 上传单个图片文件，保存到服务器并返回可访问的静态资源URL。目前仅支持单文件上传。
 *     tags:
 *       - Upload
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: 要上传的图片文件
 *     responses:
 *       201:
 *         description: 上传成功
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 url:
 *                   type: string
 *                   description: 图片的相对访问路径
 *                   example: "/uploads/hotel-1-123456789.jpg"
 *       400:
 *         description: 请求无效 (未找到文件)
 *       500:
 *         description: 服务器内部错误
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: '未找到文件' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // 生成唯一文件名: timestamp-random-original_name
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1000);
    // 处理文件名，只保留字母数字和点，防止路径遍历或非法字符
    const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const filename = `${timestamp}-${random}-${safeName}`;
    
    // 确保上传目录存在
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, filename);
    
    // 写入文件
    fs.writeFileSync(filePath, buffer);

    // 返回 URL (相对于 public 目录, 即网站根目录)
    const url = `/uploads/${filename}`;
    
    return NextResponse.json({ success: true, url }, { status: 201 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, error: '上传失败' },
      { status: 500 }
    );
  }
}
