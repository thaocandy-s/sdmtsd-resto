import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

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
    "menu", "drink", "buffet", "beer_art", "challenge",
    "tourist", "faq", "reservation", "contact", "media",
    "seo", "user", "role", "setting", "banner", "event",
    "restaurant", "analytics",
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
    "menu", "drink", "buffet", "beer_art", "challenge",
    "tourist", "faq", "banner", "event", "media",
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
  const staffReadModules = modules.filter(
    (m) => !["user", "role", "setting"].includes(m)
  );
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

  // Create food categories
  const foodCategories = [
    { name: "Monjayaki", slug: "monjayaki", sortOrder: 1 },
    { name: "Okonomiyaki", slug: "okonomiyaki", sortOrder: 2 },
    { name: "Yakisoba", slug: "yakisoba", sortOrder: 3 },
    { name: "Side Dishes", slug: "side-dishes", sortOrder: 4 },
    { name: "Desserts", slug: "desserts", sortOrder: 5 },
  ];

  for (const cat of foodCategories) {
    await prisma.foodCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Create drink categories
  const drinkCategories = [
    { name: "Beer", slug: "beer", sortOrder: 1 },
    { name: "Sake", slug: "sake", sortOrder: 2 },
    { name: "Shochu", slug: "shochu", sortOrder: 3 },
    { name: "Wine", slug: "wine", sortOrder: 4 },
    { name: "Cocktails", slug: "cocktails", sortOrder: 5 },
    { name: "Soft Drinks", slug: "soft-drinks", sortOrder: 6 },
  ];

  for (const cat of drinkCategories) {
    await prisma.drinkCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Create FAQ categories
  const faqCategories = [
    { name: "General", slug: "general", sortOrder: 1 },
    { name: "Reservation", slug: "reservation", sortOrder: 2 },
    { name: "Menu", slug: "menu", sortOrder: 3 },
    { name: "Payment", slug: "payment", sortOrder: 4 },
    { name: "Access", slug: "access", sortOrder: 5 },
  ];

  for (const cat of faqCategories) {
    await prisma.faqCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Create tour categories
  const tourCategories = [
    { name: "Temples & Shrines", slug: "temples-shrines", sortOrder: 1 },
    { name: "Shopping", slug: "shopping", sortOrder: 2 },
    { name: "Entertainment", slug: "entertainment", sortOrder: 3 },
    { name: "Nature & Parks", slug: "nature-parks", sortOrder: 4 },
  ];

  for (const cat of tourCategories) {
    await prisma.tourCategory.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  // Create restaurant info
  await prisma.restaurant.upsert({
    where: { slug: "resto-hub" },
    update: {},
    create: {
      name: "Resto Hub",
      slug: "resto-hub",
      description: "Authentic Japanese cuisine in an elegant, traditional atmosphere",
      address: "Tokyo, Japan",
      phone: "+81-3-0000-0000",
      email: "info@restohub.com",
      openingHours: {
        weekdays: "17:00 - 23:00",
        weekends: "12:00 - 23:00",
        holidays: "12:00 - 22:00",
      },
      holidays: { regular: "Tuesdays" },
      socialLinks: {
        instagram: "https://instagram.com/restohub",
        twitter: "https://twitter.com/restohub",
      },
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
