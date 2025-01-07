import { initialConfig } from "@/config";
import { logger } from "@/lib/logger";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Upsert default admin user
    // Check if admin user already exists
    const adminUserExists = await prisma.user.count({
      where: {
        email: "admin@ezauth.com",
      },
    });
    if (adminUserExists > 0) {
      logger.info("✅ Admin user already exists");
    } else {
      const hashedPassword = await Bun.password.hash("Admin@123");
      const adminUser = await prisma.user.create({
        data: {
          email: "admin@ezauth.com",
          password: hashedPassword,
          isVerifiedEmail: true,
          metadata: {
            role: "superadmin",
            firstName: "Admin",
            lastName: "EzAuth",
          },
        },
      });
      // Audit log
      await prisma.auditLog.create({
        data: {
          type: "seed",
          data: {
            adminUserId: adminUser.id,
          },
        },
      });
      logger.info(`✅ Admin user created: ${adminUser.email} (ID: ${adminUser.id})`);
    }

    // Upsert system setting
    await prisma.systemSetting.upsert({
      where: {
        id: 1,
      },
      create: {
        data: {
          ...initialConfig,
        },
      },
      update: {
        data: {
          ...initialConfig,
        },
      },
    });
    logger.info("✅ System setting updated");

    logger.info("✅ Prisma seed completed");
  } catch (error) {
    logger.error(error);
    throw error;
  } finally {
    await prisma.$disconnect();
    process.exit(0);
  }
}

main();
