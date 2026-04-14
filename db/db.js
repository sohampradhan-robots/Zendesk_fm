const { PrismaClient } = require("../generated/prisma");

// Singleton — reuse the same client across all modules
const prisma = new PrismaClient();

module.exports = prisma;
