import { NextResponse } from 'next/server';
import { openai } from '@/app/lib/openai';
import { prisma } from '@/app/lib/prisma';
import type { Prisma } from '@/app/generated/prisma/client';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages history is required' }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]; 
    const messageContent = lastUserMessage.content;

    // Step 1: Analyze user request to extract search filters
    // Use recent context for better extraction
    const recentContext = messages.slice(-3).map((m: any) => `${m.role === 'user' ? '用户' : '助手'}: ${m.content}`).join('\n');

    const extractionPrompt = `
      你是一个AI旅行助手。请根据以下对话历史，特别是用户最新的请求，提取搜索信息。
      返回一个包含以下字段的JSON对象：
      - destination: string (城市或地点名称，例如 "北京", "纽约")。如果未指定，则为 null。
      - minPrice: number (每晚最低价格)。如果未指定，则为 null。
      - maxPrice: number (每晚最高价格)。如果未指定，则为 null。
      - amenities: string[] (所需设施列表，例如 "泳池", "wifi")。
      - keywords: string[] (其他搜索关键词，例如 "靠近机场", "豪华")。
      - sort: "price_asc" | "price_desc" | "rating" | null。

      对话历史:
      ${recentContext}
    `;

    const extractionResponse = await openai.chat.completions.create({
      model: process.env.MODEL_ID as string,
      messages: [
        { role: 'system', content: "你是一个乐于助人的助手。" }, 
        { role: 'user', content: extractionPrompt }
      ],
      response_format: { type: 'json_object' },
    });

    const criteria = JSON.parse(extractionResponse.choices[0].message.content || '{}');
    console.log('AI Extraction Criteria:', criteria);

    // Step 2: Build Prisma Query
    const where: Prisma.HotelWhereInput = {
      status: 'published', // Only show published hotels
    };

    if (criteria.destination) {
      where.OR = [
        { location: { name: { contains: criteria.destination } } },
        { address: { contains: criteria.destination } },
        { nameZh: { contains: criteria.destination } },
        { nameEn: { contains: criteria.destination } }
      ];
    }

    // Keyword search integration (basic)
    if (criteria.keywords && criteria.keywords.length > 0) {
      const keywordConditions = criteria.keywords.map((k: string) => ({
        OR: [
          { description: { contains: k } },
          { nameZh: { contains: k } }
        ]
      }));
      // Add to AND
      if (!where.AND) where.AND = [];
      if (Array.isArray(where.AND)) {
         where.AND.push(...keywordConditions);
      }
    }

    const hotels = await prisma.hotel.findMany({
      where,
      include: {
        location: true,
        roomTypes: {
           select: {
             price: true,
             name: true
           }
        },
        hotelTags: {
          include: {
             tag: true
          }
        }
      },
      take: 20, // Limit candidates
    });

    // Step 3: Refine candidates (filtering by price in memory)
    let candidates = hotels.map(h => {
       const prices = h.roomTypes.map(r => Number(r.price));
       const minRate = prices.length > 0 ? Math.min(...prices) : 0;
       const maxRate = prices.length > 0 ? Math.max(...prices) : 0;
       return {
         ...h,
         priceRange: { min: minRate, max: maxRate }
       };
    });

    if (criteria.minPrice) {
      candidates = candidates.filter(h => h.priceRange.max >= criteria.minPrice);
    }
    if (criteria.maxPrice) {
      candidates = candidates.filter(h => h.priceRange.min <= criteria.maxPrice);
    }
    
    // Sort
    if (criteria.sort === 'price_asc') {
       candidates.sort((a, b) => a.priceRange.min - b.priceRange.min);
    } else if (criteria.sort === 'price_desc') {
       candidates.sort((a, b) => b.priceRange.min - a.priceRange.min);
    } else if (criteria.sort === 'rating') {
       // Assuming starRating is populated, otherwise 0
       candidates.sort((a, b) => (b.starRating || 0) - (a.starRating || 0));
    }
    
    // Limit results
    const topCandidates = candidates.slice(0, 5);

    // If no hotels found, we still want to chat, but with empty hotel list.
    // We don't return early anymore unless it was a pure DB error.
    let hotelContext: any[] = [];
    if (topCandidates.length > 0) {
      hotelContext = topCandidates.map(h => ({
        id: h.id,
        name: h.nameZh,
        location: h.location?.name || h.address,
        priceRange: `${h.priceRange.min} - ${h.priceRange.max}`,
        description: h.description ? h.description.substring(0, 100) + "..." : "暂无描述",
        rating: h.starRating,
        tags: h.hotelTags.map(t => t.tag.name).join(", ")
      }));
    }

    const systemPrompt = `
      你是一个乐于助人的旅行专家助手。
      
      我根据用户的请求找到了一些相关的酒店信息（如果为空则表示没找到符合条件的）：
      ${JSON.stringify(hotelContext, null, 2)}
      
      请根据以上信息回复用户。
      1. 如果有酒店，请热情推荐，提及价格和特色。
      2. 如果没有酒店，或者用户只是在闲聊，请正常对话。
      3. 如果用户询问建议，请引导他们提供更多偏好。
    `;

    const streamResponse = await openai.chat.completions.create({
        model: (process.env.DOUBAO_MODEL_ID || process.env.MODEL_ID || 'ep-20250208generic') as string,
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages // Pass full conversation history
        ],
        stream: true,
    });

    // Create a ReadableStream for the response
    const stream = new ReadableStream({
        async start(controller) {
            for await (const chunk of streamResponse) {
                const content = chunk.choices[0]?.delta?.content || "";
                if (content) {
                    controller.enqueue(new TextEncoder().encode(content));
                }
            }
            controller.close();
        },
    });

    return new Response(stream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('AI Recommend Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
