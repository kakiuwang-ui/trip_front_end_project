// prisma/seed-hotels.ts - 添加酒店和房型测试数据
import { PrismaClient } from '../app/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始添加酒店测试数据...');

  // 获取必要的基础数据
  const locations = await prisma.location.findMany();
  const tags = await prisma.tag.findMany();
  const merchantRole = await prisma.role.findUnique({ where: { name: 'MERCHANT' } });

  if (!merchantRole) {
    throw new Error('商户角色不存在，请先运行 npm run db:seed');
  }

  // 查找或创建测试商户
  let testMerchant = await prisma.user.findUnique({
    where: { email: 'merchant@hotel.com' }
  });

  if (!testMerchant) {
    // bcrypt hash for "123456"
    testMerchant = await prisma.user.create({
      data: {
        name: '测试商户',
        email: 'merchant@hotel.com',
        password: '$2a$10$xQk6QJK5h.VlN9F5R4oXUOXlYLlUJWdGIe6pT0JKLfJRXGXZ8Y8gm',
        roleId: merchantRole.id,
      }
    });
    console.log('创建测试商户: merchant@hotel.com');
  }

  // 酒店测试数据
  const hotelsData = [
    {
      nameZh: '上海陆家嘴禧玥酒店',
      nameEn: 'Shanghai Lujiazui Xiyue Hotel',
      address: '上海市浦东新区陆家嘴环路1000号',
      locationName: '上海',
      starRating: 5,
      description: '位于陆家嘴金融中心，毗邻东方明珠和上海中心大厦。酒店25楼设有米其林三星餐厅新荣记，提供高端中式美食体验。客房配备落地窗，可俯瞰黄浦江美景。',
      facilities: JSON.stringify(['免费WiFi', '游泳池', '健身房', '免费停车', '米其林餐厅', '行政酒廊', '24小时前台']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800',
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800'
      ]),
      openingYear: 2018,
      tags: ['免费WiFi', '游泳池', '免费停车', '商务出差'],
      roomTypes: [
        {
          name: '豪华江景大床房',
          description: '特大床 2.0m，45㎡',
          price: 936,
          amenities: JSON.stringify(['江景', '免费WiFi', '智能马桶', '胶囊咖啡机', '独立浴缸']),
          stock: 10
        },
        {
          name: '行政套房',
          description: '特大床 2.0m，68㎡',
          price: 1580,
          amenities: JSON.stringify(['江景', '独立客厅', '免费酒廊', '胶囊咖啡机', '智能家居']),
          stock: 5
        }
      ]
    },
    {
      nameZh: '艺龙安悦酒店(上海浦东歇浦路地铁站店)',
      nameEn: 'eLong Anyue Hotel Pudong',
      address: '上海市浦东新区浦东大道2400号',
      locationName: '上海',
      starRating: 3,
      description: '地理位置优越，距离歇浦路地铁站步行仅3分钟，临近置汇旭辉广场。酒店配备智能机器人服务，提供高性价比的住宿体验。',
      facilities: JSON.stringify(['免费WiFi', '免费停车', '自助早餐', '机器人服务', '洗衣服务']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800',
        'https://images.unsplash.com/photo-1551887190-1930361f6692?w=800'
      ]),
      openingYear: 2020,
      tags: ['免费WiFi', '免费停车', '靠近地铁', '亲子友好'],
      roomTypes: [
        {
          name: '精选大床房',
          description: '大床 1.8m，28㎡',
          price: 297,
          amenities: JSON.stringify(['免费WiFi', '独立卫浴', '空调', '电视', '吹风机']),
          stock: 15
        },
        {
          name: '亲子双床房',
          description: '双床 1.2m×2，32㎡',
          price: 358,
          amenities: JSON.stringify(['免费WiFi', '儿童拖鞋', '儿童浴袍', '空调', '电视']),
          stock: 8
        }
      ]
    },
    {
      nameZh: '上海外滩茂悦大酒店',
      nameEn: 'The Bund Hyatt Hotel Shanghai',
      address: '上海市黄浦区中山东一路199号',
      locationName: '上海',
      starRating: 5,
      description: '坐落于外滩核心区域，拥有得天独厚的黄浦江景观。顶层Sky Bar提供360度全景视野，是欣赏外滩夜景的最佳地点。酒店融合了现代奢华与海派文化。',
      facilities: JSON.stringify(['免费WiFi', '室内泳池', '健身中心', 'Sky Bar', '江景房', '行政酒廊', '礼宾服务']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800'
      ]),
      openingYear: 2015,
      tags: ['免费WiFi', '游泳池', '海景房', '商务出差'],
      roomTypes: [
        {
          name: '外滩江景豪华房',
          description: '特大床 2.0m，42㎡',
          price: 1280,
          amenities: JSON.stringify(['外滩江景', '免费迷你吧', 'Nespresso咖啡机', '智能马桶']),
          stock: 10
        },
        {
          name: '外滩江景套房',
          description: '特大床 2.0m，80㎡',
          price: 2380,
          amenities: JSON.stringify(['180度江景', '独立客厅', '双卫生间', '免费酒廊', '管家服务']),
          stock: 5
        }
      ]
    },
    {
      nameZh: '7天优品酒店(上海静安寺店)',
      nameEn: '7 Days Premium Shanghai Jingan Temple',
      address: '上海市静安区南京西路688号',
      locationName: '上海',
      starRating: 3,
      description: '地处静安寺商圈核心地带，步行5分钟可达静安寺地铁站。酒店提供经济实惠的住宿选择。',
      facilities: JSON.stringify(['免费WiFi', '自助洗衣', '24小时前台', '行李寄存']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1551887190-1930361f6692?w=800'
      ]),
      openingYear: 2019,
      tags: ['免费WiFi', '靠近地铁', '24小时前台'],
      roomTypes: [
        {
          name: '优品大床房',
          description: '大床 1.8m，22㎡',
          price: 239,
          amenities: JSON.stringify(['免费WiFi', '独立卫浴', '空调', '电视']),
          stock: 20
        },
        {
          name: '优品双床房',
          description: '双床 1.2m×2，25㎡',
          price: 269,
          amenities: JSON.stringify(['免费WiFi', '独立卫浴', '空调', '电视', '保险箱']),
          stock: 15
        }
      ]
    },
    {
      nameZh: '上海虹桥英迪格酒店',
      nameEn: 'Hotel Indigo Shanghai Hongqiao',
      address: '上海市闵行区申滨路333号',
      locationName: '上海',
      starRating: 4,
      description: '毗邻虹桥高铁站和国家会展中心，交通便利。酒店提供免费接送班车至会展中心。',
      facilities: JSON.stringify(['免费WiFi', '免费停车', '免费班车', '会议室', '中西早餐']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1583445077513-1914121479cf?w=800'
      ]),
      openingYear: 2017,
      tags: ['免费WiFi', '免费停车', '商务出差', '亲子友好'],
      roomTypes: [
        {
          name: '高级大床房',
          description: '大床 1.8m，32㎡',
          price: 659,
          amenities: JSON.stringify(['免费WiFi', '中西早餐', 'Nespresso咖啡机']),
          stock: 15
        },
        {
          name: '亲子主题房',
          description: '大床 1.8m + 儿童床，38㎡',
          price: 899,
          amenities: JSON.stringify(['儿童帐篷', '儿童玩具', '儿童浴袍', '免费WiFi', '中西早餐']),
          stock: 8
        }
      ]
    },
    {
      nameZh: '上海迪士尼乐园酒店',
      nameEn: 'Shanghai Disneyland Hotel',
      address: '上海市浦东新区申迪西路1009号',
      locationName: '上海',
      starRating: 5,
      description: '位于上海迪士尼度假区内，步行即可到达迪士尼乐园。提供迪士尼主题房间，配备双人早餐和乐园接驳车服务。',
      facilities: JSON.stringify(['免费WiFi', '主题房', '儿童乐园', '泳池', '免费停车', '乐园接驳']),
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1600984645877-1ddd2d899a5f?w=800'
      ]),
      openingYear: 2016,
      tags: ['主题房', '亲子友好', '度假胜地', '游泳池'],
      roomTypes: [
        {
          name: '迪士尼主题房',
          description: '特大床 2.0m，45㎡',
          price: 1980,
          amenities: JSON.stringify(['迪士尼装饰', '双人早餐', '乐园接驳', '迪士尼礼品']),
          stock: 10
        },
        {
          name: '迪士尼套房',
          description: '特大床 2.0m + 儿童床，68㎡',
          price: 3280,
          amenities: JSON.stringify(['迪士尼装饰', '独立客厅', '双人早餐', '乐园接驳', '管家服务']),
          stock: 5
        }
      ]
    }
  ];

  // 创建酒店和房型数据
  for (const hotelData of hotelsData) {
    const location = locations.find(l => l.name === hotelData.locationName);
    if (!location) {
      console.log(`位置 ${hotelData.locationName} 不存在，跳过酒店 ${hotelData.nameZh}`);
      continue;
    }

    // 检查酒店是否已存在
    const existingHotel = await prisma.hotel.findFirst({
      where: { nameZh: hotelData.nameZh }
    });

    if (existingHotel) {
      console.log(`酒店已存在: ${hotelData.nameZh}`);
      continue;
    }

    // 创建酒店
    const hotel = await prisma.hotel.create({
      data: {
        merchantId: testMerchant.id,
        locationId: location.id,
        nameZh: hotelData.nameZh,
        nameEn: hotelData.nameEn,
        address: hotelData.address,
        starRating: hotelData.starRating,
        description: hotelData.description,
        facilities: hotelData.facilities,
        images: hotelData.images,
        openingYear: hotelData.openingYear,
        status: 'published'
      }
    });

    console.log(`✅ 创建酒店: ${hotelData.nameZh} (ID: ${hotel.id})`);

    // 为酒店添加标签
    for (const tagName of hotelData.tags) {
      const tag = tags.find(t => t.name === tagName);
      if (tag) {
        await prisma.hotelTag.create({
          data: {
            hotelId: hotel.id,
            tagId: tag.id
          }
        });
      }
    }

    // 创建房型
    for (const roomData of hotelData.roomTypes) {
      await prisma.roomType.create({
        data: {
          hotelId: hotel.id,
          name: roomData.name,
          description: roomData.description,
          price: roomData.price,
          amenities: roomData.amenities,
          stock: roomData.stock
        }
      });
      console.log(`  ✅ 创建房型: ${roomData.name} (¥${roomData.price})`);
    }
  }

  console.log('\n✅ 酒店测试数据添加完成！');
}

main()
  .catch((e) => {
    console.error('❌ 错误:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
