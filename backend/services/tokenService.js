const { AccessToken } = require('livekit-server-sdk');
const prisma = require('./prismaClient');

const generateTokenFromUsername = async (roomName, username, apiKey, apiSecret) => {
  // Step 0: Look up user
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error('User not found.');
  }

  const userId = user.id;

  // Step 1: Check if the room exists
  let room = await prisma.room.findUnique({
    where: { name: roomName },
    include: { participants: true },
  });

  let isHost = false;

  // Step 2: If room doesn't exist, create it and assign host
  if (!room) {
    room = await prisma.room.create({
      data: {
        name: roomName,
        hostId: userId,
        participants: {
          create: {
            userId,
            isHost: true,
          }
        }
      },
      include: { participants: true },
    });
    isHost = true;
  } else {
    // Step 3: Check if user already in room
    const existingParticipant = await prisma.roomParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId,
        },
      },
    });

    if (existingParticipant) {
      isHost = existingParticipant.isHost;
    } else {
      const existingParticipants = await prisma.roomParticipant.findMany({
        where: { roomId: room.id },
      });

      isHost = existingParticipants.length === 0;

      await prisma.roomParticipant.create({
        data: {
          roomId: room.id,
          userId,
          isHost,
        },
      });

      if (isHost) {
        await prisma.room.update({
          where: { id: room.id },
          data: { hostId: userId },
        });
      }
    }
  }

  // Step 4: Generate LiveKit token
  const token = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    name: username,
    metadata: JSON.stringify({ userId, username, isHost }),
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: isHost,
  });

  return {
    token: await token.toJwt(),
    isHost,
  };
};

module.exports = { generateTokenFromUsername };
