// prisma/seed.ts
import { PrismaClient } from '../app/generated/prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- 1. Locations (中国部分热门地级市/旅游城市) ---
  const locationsData = [
    { name: '北京', description: '中华人民共和国首都' },
    { name: '上海', description: '国际化大都市' },
    { name: '广州', description: '历史文化名城，美食之都' },
    { name: '深圳', description: '现代化的滨海城市' },
    { name: '杭州', description: '人间天堂，西湖美景' },
    { name: '成都', description: '天府之国，熊猫故乡' },
    { name: '西安', description: '十三朝古都，兵马俑' },
    { name: '重庆', description: '山城，火锅之都' },
    { name: '苏州', description: '园林之城，东方威尼斯' },
    { name: '南京', description: '六朝古都' },
    { name: '三亚', description: '热带海滨度假胜地' },
    { name: '厦门', description: '海上花园' },
    { name: '青岛', description: '帆船之都，啤酒之城' },
    { name: '大理', description: '风花雪月，苍山洱海' },
    { name: '长沙', description: '娱乐之都，美食胜地' },
    { name: '武汉', description: '江城，九省通衢' },
    { name: '昆明', description: '春城' },
    { name: '哈尔滨', description: '冰城' },
    { name: '丽江', description: '纳西古乐，玉龙雪山' },
    { name: '桂林', description: '桂林山水甲天下' },
  ];

  for (const loc of locationsData) {
    const existing = await prisma.location.findFirst({ where: { name: loc.name } });
    if (!existing) {
      await prisma.location.create({ data: loc });
      console.log(`Created location: ${loc.name}`);
    } else {
      console.log(`Location already exists: ${loc.name}`);
    }
  }

  // --- 2. Tags (常用酒店标签) ---
  const tagsData = [
    '免费WiFi',
    '含早餐',
    '免费停车',
    '游泳池',
    '健身房',
    '亲子友好',
    '商务出差',
    '情侣约会',
    '度假胜地',
    '温泉酒店',
    '海景房',
    '靠近地铁',
    '接送机服务',
    '宠物友好',
    '24小时前台',
    '无烟房',
    '行政酒廊',
    '会议室',
    '洗衣服务',
    '行李寄存',
  ];

  for (const tagName of tagsData) {
    const existing = await prisma.tag.findUnique({ where: { name: tagName } });
    if (!existing) {
      await prisma.tag.create({ data: { name: tagName } });
      console.log(`Created tag: ${tagName}`);
    } else {
      console.log(`Tag already exists: ${tagName}`);
    }
  }

  // --- 3. Permissions (来自 PERMISSIONS.md) ---
  const permissionsData = [
    // 酒店管理
    { name: 'HOTEL_AUDIT', description: '允许审核酒店状态（如：批准上线、驳回、强制下线等）' },
    { name: 'HOTEL_DELETE', description: '允许删除任何酒店' },
    // 用户管理
    { name: 'USER_READ', description: '允许查看所有用户列表' },
    { name: 'USER_UPDATE', description: '允许修改其他用户的信息' },
    { name: 'USER_DELETE', description: '允许删除其他用户的账户' },
    // 标签管理
    { name: 'TAG_CREATE', description: '允许创建新的标签' },
    { name: 'TAG_UPDATE', description: '允许修改现有标签的名称' },
    { name: 'TAG_DELETE', description: '允许删除标签' },
    // 位置管理
    { name: 'LOCATION_CREATE', description: '允许创建新的地理位置' },
    { name: 'LOCATION_UPDATE', description: '允许修改现有位置的信息' },
    { name: 'LOCATION_DELETE', description: '允许删除地理位置' },
  ];

  for (const perm of permissionsData) {
    await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: { name: perm.name, description: perm.description },
    });
    console.log(`Upserted permission: ${perm.name}`);
  }

  // --- 4. Roles & RolePermissions (User, Merchant, Admin) ---
  
  // 4.1 普通用户 (USER)
  await prisma.role.upsert({
    where: { name: 'USER' },
    update: { description: '普通用户，可以浏览和预订' },
    create: { name: 'USER', description: '普通用户，可以浏览和预订' },
  });
  console.log('Upserted role: USER');

  // 4.2 商户 (MERCHANT)
  await prisma.role.upsert({
    where: { name: 'MERCHANT' },
    update: { description: '商户，可以创建和管理自己的酒店' },
    create: { name: 'MERCHANT', description: '商户，可以创建和管理自己的酒店' },
  });
  console.log('Upserted role: MERCHANT');

  // 4.3 管理员 (ADMIN) - 并分配所有权限
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: { description: '超级管理员，拥有系统最高权限' },
    create: { name: 'ADMIN', description: '超级管理员，拥有系统最高权限' },
  });
  console.log('Upserted role: ADMIN');

  // 获取所有权限ID
  const allPermissions = await prisma.permission.findMany();
  
  // 为管理员分配所有权限
  for (const perm of allPermissions) {
    // 检查关联是否已存在，防止重复插入报错 (虽然 upsert role 不会删关联，但这里手动检查更稳)
    // Prisma 的 createMnay 或 upsert 在多对多关系中间表中操作需谨慎，这里用 safe check
    const existingRelation = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      },
    });

    if (!existingRelation) {
      await prisma.rolePermission.create({
        data: {
          roleId: adminRole.id,
          permissionId: perm.id,
        },
      });
      console.log(`Assigned permission ${perm.name} to ADMIN`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
