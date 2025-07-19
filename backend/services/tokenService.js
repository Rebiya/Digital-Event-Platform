const { AccessToken } = require('livekit-server-sdk');

const generateToken = async (roomName, userName, apiKey, apiSecret) => {
  console.log('Generating token for:', { roomName, userName, apiKey, apiSecret });

  const token = new AccessToken(apiKey, apiSecret, {
    identity: userName,
  });

  token.addGrant({ roomJoin: true, room: roomName });

  const jwt = await token.toJwt(); // ✅ Fix: await the Promise

  console.log('Generated JWT:', jwt);

  return jwt;
};

module.exports = { generateToken };
