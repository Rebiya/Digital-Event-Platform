const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createUser = async ({ username, email }) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error('A user with this email already exists.');
  }

  return await prisma.user.create({
    data: { username, email },
  });
};


module.exports = {
  createUser,
};
