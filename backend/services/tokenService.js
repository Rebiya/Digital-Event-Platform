const { AccessToken } = require('livekit-server-sdk');
const prisma = require('./prismaClient');

const generateToken = async (roomName, userId, userName, apiKey, apiSecret) => {
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
            userId: userId,
            isHost: true,
          }
        }
      },
      include: { participants: true },
    });
    isHost = true;
  } else {
    // Check if user is already a participant
    const existingParticipant = await prisma.roomParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId,
        },
      },
    });

    if (existingParticipant) {
      // User is rejoining - use their existing host status
      isHost = existingParticipant.isHost;
    } else {
      // New participant - check if they should be host
      const existingParticipants = await prisma.roomParticipant.findMany({
        where: { roomId: room.id },
      });

      // If no other participants, this user becomes host
      isHost = existingParticipants.length === 0;

      // Create new participant record
      await prisma.roomParticipant.create({
        data: {
          roomId: room.id,
          userId,
          isHost,
        },
      });

      // Update room hostId if this user is the first participant
      if (isHost) {
        await prisma.room.update({
          where: { id: room.id },
          data: { hostId: userId },
        });
      }
    }
  }

  // Step 3: Generate LiveKit Token
  const token = new AccessToken(apiKey, apiSecret, {
    identity: userId,
    name: userName,
    metadata: JSON.stringify({ userId, userName, isHost }),
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
    roomAdmin: isHost, // Give host additional permissions
  });

  return {
    token: await token.toJwt(),
    isHost,
  };
};

module.exports = { generateToken };