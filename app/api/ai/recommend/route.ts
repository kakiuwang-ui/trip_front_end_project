import { NextResponse } from 'next/server';
import { ChatOpenAI } from "@langchain/openai";
import { z } from "zod";
import { SystemMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { prisma } from '@/app/lib/prisma';
import type { Prisma } from '@/app/generated/prisma/client';

// Define the extraction schema using Zod
const searchSchema = z.object({
  destination: z.string().nullable().describe("城市或地点名称"),
  minPrice: z.number().nullable().describe("每晚最低价格"),
  maxPrice: z.number().nullable().describe("每晚最高价格"),
  amenities: z.array(z.string()).describe("所需设施列表"),
  keywords: z.array(z.string()).describe("其他搜索关键词"),
  sort: z.enum(["price_asc", "price_desc", "rating"]).nullable().describe("排序方式")
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages history is required' }, { status: 400 });
    }

    // Initialize LangChain Chat Model
    const model = new ChatOpenAI({
        modelName: process.env.MODEL_ID,
        openAIApiKey: process.env.OPENAI_API_KEY,
        configuration: { baseURL: process.env.BASE_URL, },
        temperature: 0, 
    });

    // Convert raw messages to LangChain message format
    const langChainMessages = messages.map((m: any) => {
        if (m.role === 'user') return new HumanMessage(m.content);
        if (m.role === 'assistant') return new AIMessage(m.content);
        return new SystemMessage(m.content);
    });

    // Step 1: Extract Search Criteria using structured output
    const extractor = model.withStructuredOutput(searchSchema);
    
    // Use recent context for extraction
    const recentMessages = langChainMessages.slice(-3);
    const extractionPrompt = new SystemMessage("你是一个AI旅行助手。请从用户的对话中提取酒店搜索条件。如果用户没有明确提到某个条件，请设为null。");
    
    // Invoke the extractor
    const criteria = await extractor.invoke([extractionPrompt, ...recentMessages]);
    console.log('AI Extraction Criteria:', criteria);

    // Step 2: Build Prisma Query
    const where: Prisma.HotelWhereInput = {
      status: 'published',
    };

    if (criteria.destination) {
      where.OR = [
        { location: { name: { contains: criteria.destination } } },
        { address: { contains: criteria.destination } },
        { nameZh: { contains: criteria.destination } },
        { nameEn: { contains: criteria.destination } }
      ];
    }

    if (criteria.keywords && criteria.keywords.length > 0) {
      const keywordConditions = criteria.keywords.map((k: string) => ({
        OR: [
          { description: { contains: k } },
          { nameZh: { contains: k } }
        ]
      }));
      if (!where.AND) where.AND = [];
      if (Array.isArray(where.AND)) {
         where.AND.push(...keywordConditions); 
      }
    }

    const hotels = await prisma.hotel.findMany({
      where,
      include: {
        location: true,
        roomTypes: { select: { price: true, name: true } },
        hotelTags: { include: { tag: true } }
      },
      take: 20,
    });

    // Step 3: Refine candidates
    let candidates = hotels.map(h => {
       const prices = h.roomTypes.map(r => Number(r.price));
       const minRate = prices.length > 0 ? Math.min(...prices) : 0;
       const maxRate = prices.length > 0 ? Math.max(...prices) : 0;
       return { ...h, priceRange: { min: minRate, max: maxRate } };
    });

    if (criteria.minPrice) {
      candidates = candidates.filter(h => h.priceRange.max >= criteria.minPrice!);
    }
    if (criteria.maxPrice) {
      candidates = candidates.filter(h => h.priceRange.min <= criteria.maxPrice!);
    }
    
    if (criteria.sort === 'price_asc') {
       candidates.sort((a, b) => a.priceRange.min - b.priceRange.min);
    } else if (criteria.sort === 'price_desc') {
       candidates.sort((a, b) => b.priceRange.min - a.priceRange.min);
    } else if (criteria.sort === 'rating') {
       candidates.sort((a, b) => (b.starRating || 0) - (a.starRating || 0));
    }

    const topCandidates = candidates.slice(0, 5);
    
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

    // Step 4: Generate Streaming Response
    const systemPromptText = `
      你是一个乐于助人的旅行专家助手。
      
      我根据用户的请求找到了一些相关的酒店信息（如果为空则表示没找到符合条件的）：
      ${JSON.stringify(hotelContext, null, 2)}
      
      请根据以上信息回复用户。
      1. 如果有酒店，请热情推荐，提及价格和特色。
      2. 如果没有酒店，或者用户只是在闲聊，请正常对话。
      3. 如果用户询问建议，请引导他们提供更多偏好。
    `;

    // Instantiate a model for streaming conversation
    const chatModel = new ChatOpenAI({
        modelName: process.env.MODEL_ID,
        openAIApiKey: process.env.OPENAI_API_KEY,
        configuration: { baseURL: process.env.BASE_URL, },
        temperature: 0.7, 
        streaming: true,
    });

    const stream = await chatModel.stream([
        new SystemMessage(systemPromptText),
        ...langChainMessages
    ]);

    // Convert LangChain stream to web standard ReadableStream
    const readableStream = new ReadableStream({
        async start(controller) {
            for await (const chunk of stream) {
                if (chunk.content) {
                    controller.enqueue(new TextEncoder().encode(chunk.content as string));
                }
            }
            controller.close();
        },
    });

    return new Response(readableStream, {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });

  } catch (error) {
    console.error('AI Recommend Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
