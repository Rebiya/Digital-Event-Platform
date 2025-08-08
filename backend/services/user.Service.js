const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createUser = async ({ username, email }) => {
  // Check for existing email
  const emailExists = await prisma.user.findUnique({ where: { email } });
  if (emailExists) {
    throw new Error('A user with this email already exists.');
  }

  // Check for existing username
  const usernameExists = await prisma.user.findUnique({ where: { username } });
  if (usernameExists) {
    throw new Error('A user with this username already exists.');
  }

  return await prisma.user.create({
    data: { username, email },
  });
};

module.exports = {
  createUser,
};
