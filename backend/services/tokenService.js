const { AccessToken } = require('livekit-server-sdk');

const generateToken = async (roomName, userName, apiKey, apiSecret) => {
  console.log('Generating token for:', { roomName, userName, apiKey, apiSecret });

  const token = new AccessToken(apiKey, apiSecret, {
    identity: userName,name: userName,
  });

  token.addGrant({ roomJoin: true, room: roomName , canPublish: true, canSubscribe: true });

  const jwt = await token.toJwt(); // ✅ Fix: await the Promise

  console.log('Generated JWT:', jwt);

  return jwt;
};

module.exports = { generateToken };

