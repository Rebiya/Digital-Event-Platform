const { AccessToken } = require('livekit-server-sdk');
const prisma = require('./prismaClient');

const generateToken = async (roomName, userName, apiKey, apiSecret) => {
  let isHost = false;

  let room = await prisma.room.findUnique({ where: { name: roomName } });

  if (!room) {
    await prisma.room.create({
      data: {
        name: roomName,
        host: userName,
      }
    });
    isHost = true;
  } else {
    if (roomName === room.name && userName !== room.host) {
      throw new Error('Main room already exists');
    }

    if (room.host === userName) {
      isHost = true;
    }
  }

  const token = new AccessToken(apiKey, apiSecret, {
    identity: userName,
    name: userName,
    metadata: JSON.stringify({ isHost }),
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
