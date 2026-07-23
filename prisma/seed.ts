import { PrismaClient, ContentStatus } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database with Japanese sample data...");

  // Create roles
  const roles = await Promise.all([
    prisma.role.upsert({
      where: { name: "ADMIN" },
      update: {},
      create: {
        name: "ADMIN",
        label: "Administrator",
        description: "Full access to all features",
      },
    }),
    prisma.role.upsert({
      where: { name: "MANAGER" },
      update: {},
      create: {
        name: "MANAGER",
        label: "Manager",
        description: "Can manage content, users, and settings",
      },
    }),
    prisma.role.upsert({
      where: { name: "EDITOR" },
      update: {},
      create: {
        name: "EDITOR",
        label: "Editor",
        description: "Can manage content but not settings or users",
      },
    }),
    prisma.role.upsert({
      where: { name: "STAFF" },
      update: {},
      create: {
        name: "STAFF",
        label: "Staff",
        description: "Can view content and manage reservations",
      },
    }),
  ]);

  const [adminRole, managerRole, editorRole, staffRole] = roles;

  // Create permissions for each role
  const modules = [
    "menu",
    "drink",
    "buffet",
    "beer_art",
    "challenge",
    "tourist",
    "faq",
    "reservation",
    "contact",
    "media",
    "seo",
    "user",
    "role",
    "setting",
    "banner",
    "event",
    "restaurant",
    "analytics",
  ];

  const actions = ["create", "read", "update", "delete", "publish"];

  // Admin gets all permissions
  for (const mod of modules) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { id: `admin-${mod}-${action}` },
        update: {},
        create: {
          id: `admin-${mod}-${action}`,
          roleId: adminRole.id,
          module: mod,
          action,
        },
      });
    }
  }

  // Manager gets all except user/role management
  const managerModules = modules.filter((m) => !["user", "role"].includes(m));
  for (const mod of managerModules) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { id: `manager-${mod}-${action}` },
        update: {},
        create: {
          id: `manager-${mod}-${action}`,
          roleId: managerRole.id,
          module: mod,
          action,
        },
      });
    }
  }

  // Editor gets content modules only
  const editorModules = [
    "menu",
    "drink",
    "buffet",
    "beer_art",
    "challenge",
    "tourist",
    "faq",
    "banner",
    "event",
    "media",
  ];
  const editorActions = ["create", "read", "update", "publish"];
  for (const mod of editorModules) {
    for (const action of editorActions) {
      await prisma.permission.upsert({
        where: { id: `editor-${mod}-${action}` },
        update: {},
        create: {
          id: `editor-${mod}-${action}`,
          roleId: editorRole.id,
          module: mod,
          action,
        },
      });
    }
  }

  // Staff gets read-only + reservation/contact
  const staffReadModules = modules.filter((m) => !["user", "role", "setting"].includes(m));
  for (const mod of staffReadModules) {
    await prisma.permission.upsert({
      where: { id: `staff-${mod}-read` },
      update: {},
      create: {
        id: `staff-${mod}-read`,
        roleId: staffRole.id,
        module: mod,
        action: "read",
      },
    });
  }

  // Staff can manage reservations and contacts
  for (const mod of ["reservation", "contact"]) {
    for (const action of ["create", "update", "delete"]) {
      await prisma.permission.upsert({
        where: { id: `staff-${mod}-${action}` },
        update: {},
        create: {
          id: `staff-${mod}-${action}`,
          roleId: staffRole.id,
          module: mod,
          action,
        },
      });
    }
  }

  // Create admin user
  const passwordHash = await bcrypt.hash("Admin@1234", 12);
  await prisma.user.upsert({
    where: { email: "admin@restohub.com" },
    update: {},
    create: {
      email: "admin@restohub.com",
      passwordHash,
      firstName: "Admin",
      lastName: "User",
      roleId: adminRole.id,
    },
  });

  // =====================================
  // 1. FOOD CATEGORIES & FOOD ITEMS (Menu)
  // =====================================
  const foodCategoriesData = [
    { name: "もんじゃ焼き", slug: "monjayaki", sortOrder: 1 },
    { name: "お好み焼き", slug: "okonomiyaki", sortOrder: 2 },
    { name: "焼きそば", slug: "yakisoba", sortOrder: 3 },
    { name: "一品料理・おつまみ", slug: "side-dishes", sortOrder: 4 },
    { name: "デザート", slug: "desserts", sortOrder: 5 },
  ];

  const createdFoodCats: Record<string, string> = {};
  for (const cat of foodCategoriesData) {
    const res = await prisma.foodCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
    createdFoodCats[cat.slug] = res.id;
  }

  const foodsData = [
    // Monjayaki
    {
      categoryId: createdFoodCats["monjayaki"],
      name: "明太もちチーズもんじゃ",
      slug: "mentai-mochi-cheese-monja",
      description:
        "一番人気の定番もんじゃ！ピリッと辛い明太子と濃厚チーズ、もちもちのお餅が絶妙なハーモニーを奏でます。",
      price: 1480,
      originalPrice: 1680,
      imageUrl:
        "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&auto=format&fit=crop",
      isPopular: true,
      isRecommended: true,
      allergens: ["Wheat", "Milk", "Soybean"],
      ingredients: "明太子、餅、ミックスチーズ, キャベツ、天かす、特製出汁",
      status: ContentStatus.PUBLISHED,
      calories: 650,
      sortOrder: 1,
    },
    {
      categoryId: createdFoodCats["monjayaki"],
      name: "豚キムチもんじゃ",
      slug: "buta-kimchi-monja",
      description: "スパイシーなキムチとジューシーな豚肉の相性が抜群。お酒が進む味わいです。",
      price: 1280,
      imageUrl:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop",
      isPopular: false,
      isRecommended: true,
      allergens: ["Pork", "Wheat", "Soybean"],
      ingredients: "豚バラ肉、熟成キムチ、キャベツ、ニラ、特製出汁",
      status: ContentStatus.PUBLISHED,
      calories: 580,
      sortOrder: 2,
    },
    {
      categoryId: createdFoodCats["monjayaki"],
      name: "海鮮スペシャルもんじゃ",
      slug: "kaisen-special-monja",
      description:
        "エビ、イカ、ホタテがたっぷり入った贅沢な海鮮もんじゃ。海の旨味が口いっぱいに広がります。",
      price: 1680,
      imageUrl:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop",
      isPopular: true,
      isRecommended: false,
      allergens: ["Shrimp", "Squid", "Wheat", "Soybean"],
      ingredients: "エビ、イカ、ベビーホタテ、小海老、キャベツ、魚介出汁",
      status: ContentStatus.PUBLISHED,
      calories: 520,
      sortOrder: 3,
    },
    // Okonomiyaki
    {
      categoryId: createdFoodCats["okonomiyaki"],
      name: "特製豚玉お好み焼き",
      slug: "special-butatama-okonomiyaki",
      description:
        "ふんわり厚焼きの生地に厳選豚バラ肉を香ばしく焼き上げた、関西風お好み焼きの王道。",
      price: 1180,
      imageUrl:
        "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&auto=format&fit=crop",
      isPopular: true,
      isRecommended: true,
      allergens: ["Egg", "Wheat", "Pork", "Soybean"],
      ingredients: "豚バラ肉、国産キャベツ、山芋、こだわり卵、オリジナルソース、かつお節",
      status: ContentStatus.PUBLISHED,
      calories: 720,
      sortOrder: 1,
    },
    {
      categoryId: createdFoodCats["okonomiyaki"],
      name: "ミックスモダン焼き",
      slug: "mix-modanyaki",
      description:
        "お好み焼きの中に太麺焼きそばを挟み込んだボリューム満点の一品。海鮮と豚肉の両方が楽しめます。",
      price: 1580,
      imageUrl:
        "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop",
      isPopular: false,
      isRecommended: true,
      allergens: ["Egg", "Wheat", "Pork", "Shrimp", "Soybean"],
      ingredients: "豚肉、エビ、イカ、焼きそば麺、キャベツ、特製ソース",
      status: ContentStatus.PUBLISHED,
      calories: 890,
      sortOrder: 2,
    },
    // Yakisoba
    {
      categoryId: createdFoodCats["yakisoba"],
      name: "ソース焼きそば",
      slug: "source-yakisoba",
      description:
        "香ばしいソースの香りが食欲をそそる伝統のソース焼きそば。もちもちのモチモチ麺が自慢です。",
      price: 980,
      imageUrl:
        "https://images.unsplash.com/photo-1617093727343-374698b1b08d?w=800&auto=format&fit=crop",
      isPopular: false,
      isRecommended: false,
      allergens: ["Wheat", "Pork", "Soybean"],
      ingredients: "中華麺、豚肉、キャベツ、もやし、紅生姜、特製秘伝ソース",
      status: ContentStatus.PUBLISHED,
      calories: 540,
      sortOrder: 1,
    },
    // Side Dishes
    {
      categoryId: createdFoodCats["side-dishes"],
      name: "枝豆（塩ゆで）",
      slug: "edamame",
      description: "ビールのお供に最適！新鮮な枝豆を絶妙な塩加減で茹であげました。",
      price: 450,
      imageUrl:
        "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop",
      isPopular: true,
      isRecommended: false,
      allergens: ["Soybean"],
      ingredients: "枝豆、塩",
      status: ContentStatus.PUBLISHED,
      calories: 120,
      sortOrder: 1,
    },
    // Desserts
    {
      categoryId: createdFoodCats["desserts"],
      name: "抹茶パフェ",
      slug: "matcha-parfait",
      description: "濃厚な宇治抹茶アイスとあんこ、白玉を贅沢に使用した和風パフェ。",
      price: 680,
      imageUrl:
        "https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=800&auto=format&fit=crop",
      isPopular: true,
      isRecommended: true,
      allergens: ["Milk", "Egg", "Soybean"],
      ingredients: "宇治抹茶アイス、白玉、小豆、コーンフレーク、生クリーム",
      status: ContentStatus.PUBLISHED,
      calories: 380,
      sortOrder: 1,
    },
  ];

  for (const food of foodsData) {
    await prisma.food.upsert({
      where: { slug: food.slug },
      update: food,
      create: food,
    });
  }

  // =====================================
  // 2. DRINK CATEGORIES & DRINKS
  // =====================================
  const drinkCategoriesData = [
    { name: "ビール", slug: "beer", description: "冷えた生ビールやクラフトビール", sortOrder: 1 },
    { name: "日本酒", slug: "sake", description: "全国から厳選した極上日本酒", sortOrder: 2 },
    { name: "焼酎", slug: "shochu", description: "本格芋焼酎・麦焼酎", sortOrder: 3 },
    { name: "ワイン", slug: "wine", description: "赤・白・スパークリングワイン", sortOrder: 4 },
    {
      name: "カクテル・ハイボール",
      slug: "cocktails",
      description: "爽やかなハイボールやカクテル",
      sortOrder: 5,
    },
    {
      name: "ソフトドリンク",
      slug: "soft-drinks",
      description: "お食事と楽しむノンアルコールドリンク",
      sortOrder: 6,
    },
  ];

  const createdDrinkCats: Record<string, string> = {};
  for (const cat of drinkCategoriesData) {
    const res = await prisma.drinkCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description },
      create: cat,
    });
    createdDrinkCats[cat.slug] = res.id;
  }

  const drinksData = [
    // Beer
    {
      categoryId: createdDrinkCats["beer"],
      name: "アサヒ スーパードライ（生）",
      slug: "asahi-super-dry",
      description: "洗練されたクリアな味、辛口。キレ味さわやかな生ビールです。",
      price: 600,
      imageUrl:
        "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=800&auto=format&fit=crop",
      isPopular: true,
      isRecommended: true,
      alcoholPercent: 5.0,
      volume: "500ml",
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
    {
      categoryId: createdDrinkCats["beer"],
      name: "クラフトIPAビール",
      slug: "craft-ipa-beer",
      description: "華やかなホップの香りと心地よい苦みが特徴の自家製クラフトIPA。",
      price: 850,
      imageUrl:
        "https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=800&auto=format&fit=crop",
      isPopular: false,
      isRecommended: true,
      alcoholPercent: 6.5,
      volume: "350ml",
      sortOrder: 2,
      status: ContentStatus.PUBLISHED,
    },
    // Sake
    {
      categoryId: createdDrinkCats["sake"],
      name: "純米大吟醸 獺祭（Dasai）",
      slug: "dassai-junmai-daiginjo",
      description: "芳醇な香りと澄み切った味わい。日本を代表する最高峰の酒。",
      price: 1200,
      imageUrl:
        "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800&auto=format&fit=crop",
      isPopular: true,
      isRecommended: true,
      alcoholPercent: 16.0,
      volume: "180ml",
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
    // Cocktails / Highball
    {
      categoryId: createdDrinkCats["cocktails"],
      name: "角ハイボール",
      slug: "kaku-highball",
      description: "強炭酸で爽快！お好み焼きもんじゃに相性抜群の定番ハイボール。",
      price: 500,
      imageUrl:
        "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop",
      isPopular: true,
      isRecommended: false,
      alcoholPercent: 7.0,
      volume: "400ml",
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
    // Soft drinks
    {
      categoryId: createdDrinkCats["soft-drinks"],
      name: "烏龍茶（アイス）",
      slug: "oolong-tea",
      description: "さっぱりとした口当たりでお肉料理の後味を爽やかに整えます。",
      price: 350,
      imageUrl:
        "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&auto=format&fit=crop",
      isPopular: false,
      isRecommended: false,
      alcoholPercent: 0,
      volume: "400ml",
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
  ];

  for (const drink of drinksData) {
    await prisma.drink.upsert({
      where: { slug: drink.slug },
      update: drink,
      create: drink,
    });
  }

  // =====================================
  // 3. BUFFET COURSES
  // =====================================
  const buffetCoursesData = [
    {
      name: "ライト食べ放題コース（90分）",
      slug: "light-buffet-90min",
      description: "定番のもんじゃ焼き・お好み焼き、サイドメニューを含むお手軽90分食べ放題コース！",
      price: 2980,
      duration: 90,
      minPeople: 2,
      maxPeople: 20,
      includes: ["定番もんじゃ焼き5種", "お好み焼き3種", "枝豆・キムチ", "ドリンクバー別料金"],
      imageUrl:
        "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop",
      isPopular: false,
      sortOrder: 1,
      status: ContentStatus.PUBLISHED,
    },
    {
      name: "プレミアム豪華食べ飲み放題コース（120分）",
      slug: "premium-buffet-120min",
      description:
        "全メニュー食べ放題＋生ビール含む豪華飲み放題付き！宴会やご家族のお食事に大人気です。",
      price: 4980,
      duration: 120,
      minPeople: 2,
      maxPeople: 30,
      includes: [
        "全もんじゃ焼き・お好み焼き",
        "海鮮焼き・特選鉄板ステーキ",
        "デザート食べ放題",
        "全ドリンク飲み放題（生ビール込）",
      ],
      imageUrl:
        "https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop",
      isPopular: true,
      sortOrder: 2,
      status: ContentStatus.PUBLISHED,
    },
  ];

  for (const course of buffetCoursesData) {
    await prisma.buffetCourse.upsert({
      where: { slug: course.slug },
      update: course,
      create: course,
    });
  }

  // =====================================
  // 4. BEER ART
  // =====================================
  const beerArtData = [
    {
      id: "beer-art-1",
      title: "富士山と桜のビールフォームアート",
      description: "ビール泡の上に描かれた日本の象徴・富士山と美しい桜のデザインアート。",
      imageUrl:
        "https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop",
      customerName: "田中 様",
      artistName: "マスター Ken",
      isPublished: true,
      sortOrder: 1,
    },
    {
      id: "beer-art-2",
      title: "かわいい柴犬ラテ風フォームアート",
      description: "飲むのがもったいない！立体的に盛り上げられた可愛らしい柴犬の泡アート。",
      imageUrl:
        "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop",
      customerName: "佐藤 様",
      artistName: "スタッフ Mayu",
      isPublished: true,
      sortOrder: 2,
    },
    {
      id: "beer-art-3",
      title: "お祝いメッセージ泡アート",
      description:
        "誕生日や記念日に人気！泡の表面に「Happy Birthday」のメッセージを描いた特製アート。",
      imageUrl:
        "https://images.unsplash.com/photo-1538488881523-2305c011e331?w=800&auto=format&fit=crop",
      customerName: "鈴木 様",
      artistName: "マスター Ken",
      isPublished: true,
      sortOrder: 3,
    },
  ];

  for (const art of beerArtData) {
    await prisma.beerArt.upsert({
      where: { id: art.id },
      update: art,
      create: art,
    });
  }

  // FAQ Categories & Tour Categories
  const faqCategories = [
    { name: "よくあるご質問（全般）", slug: "general", sortOrder: 1 },
    { name: "ご予約・ご来店について", slug: "reservation", sortOrder: 2 },
    { name: "お食事・アレルギー", slug: "menu", sortOrder: 3 },
    { name: "お支払い方法", slug: "payment", sortOrder: 4 },
    { name: "アクセス・駐車場", slug: "access", sortOrder: 5 },
  ];

  for (const cat of faqCategories) {
    await prisma.faqCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }

  const tourCategories = [
    { name: "神社・仏閣", slug: "temples-shrines", sortOrder: 1 },
    { name: "ショッピング・お土産", slug: "shopping", sortOrder: 2 },
    { name: "エンターテインメント", slug: "entertainment", sortOrder: 3 },
    { name: "自然・公園", slug: "nature-parks", sortOrder: 4 },
  ];

  for (const cat of tourCategories) {
    await prisma.tourCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: cat,
    });
  }

  // Create restaurant info
  await prisma.restaurant.upsert({
    where: { slug: "resto-hub" },
    update: {
      name: "もんじゃ・お好み焼き Resto Hub",
      description: "伝統的な和風空間で味わう本場の浅草もんじゃ焼きとお好み焼き",
      address: "東京都台東区浅草 1-2-3",
      phone: "+81-3-1234-5678",
      email: "info@restohub.jp",
    },
    create: {
      name: "もんじゃ・お好み焼き Resto Hub",
      slug: "resto-hub",
      description: "伝統的な和風空間で味わう本場の浅草もんじゃ焼きとお好み焼き",
      address: "東京都台東区浅草 1-2-3",
      phone: "+81-3-1234-5678",
      email: "info@restohub.jp",
      openingHours: {
        weekdays: "17:00 - 23:00 (L.O. 22:30)",
        weekends: "12:00 - 23:00 (L.O. 22:30)",
        holidays: "12:00 - 22:00 (L.O. 21:30)",
      },
      holidays: { regular: "毎週火曜日" },
      socialLinks: {
        instagram: "https://instagram.com/restohub_japan",
        twitter: "https://twitter.com/restohub_japan",
      },
    },
  });

  // Create Hero Banners
  await prisma.heroBanner.createMany({
    data: [
      {
        title: "鉄板・もんじゃ・居酒屋 三代目土信田商店",
        subtitle:
          "飯田橋もんじゃ！一度食べたらやみつきに！月島へ行かなくても昔ながらの本格派もんじゃを味わえます。",
        imageUrl:
          "https://images.unsplash.com/photo-1543007630-9710e4a00a20?w=1600&auto=format&fit=crop",
        sortOrder: 1,
        isActive: true,
      },
      {
        title: "昔ながらの本格派もんじゃ",
        subtitle:
          "居酒屋メニューや飲み物も品数多く揃えております。飯田橋駅、水道橋駅、九段下駅から好アクセス！",
        imageUrl:
          "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1600&auto=format&fit=crop",
        sortOrder: 2,
        isActive: true,
      },
      {
        title: "名物 泡アート超達人ビール",
        subtitle: "美味しいもんじゃ焼きと、こだわりのサワー・超達人ビールで至福のひとときを。",
        imageUrl:
          "https://images.unsplash.com/photo-1571613316887-6f8d5cbf7ef7?w=1600&auto=format&fit=crop",
        sortOrder: 3,
        isActive: true,
      },
    ],
  });

  console.log("Japanese Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
