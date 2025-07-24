const { AccessToken } = require('livekit-server-sdk');
const prisma = require('./prismaClient');

const generateToken = async (roomName, userName, apiKey, apiSecret) => {
  // Check if room exists
  let room = await prisma.room.findUnique({ where: { name: roomName } });

  let isHost = false;

  if (!room) {
    // First joiner = host
    await prisma.room.create({
      data: {
        name: roomName,
        host: userName
      }
    });
    isHost = true;
  } else if (room.host === userName) {
    isHost = true;
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: userName,
    name: userName,
    metadata: JSON.stringify({
      isHost,
    })
  });

  token.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true
  });

  return await token.toJwt();
};

module.exports = { generateToken };
