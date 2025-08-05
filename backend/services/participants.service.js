const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const fetchParticipants = async (roomName) => {
  const room = await prisma.room.findUnique({
    where: { name: roomName },
    include: {
      participants: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!room) throw new Error('Room not found');

  const users = room.participants.map(p => ({
    id: p.user.id,
    username: p.user.username,
    joinedAt: p.joinedAt,
  }));

  return users;
};

module.exports = {
  fetchParticipants,
};
