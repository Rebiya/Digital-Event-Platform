const { generateToken } = require('../services/tokenService');
const prisma = require('../services/prismaClient');

const getToken = async (req, res) => {
  const { roomName, userName } = req.body;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const livekitUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !livekitUrl) {
    return res.status(500).json({ error: 'LiveKit config missing' });
  }

  if (!roomName || !userName) {
    return res.status(400).json({ error: 'roomName and userName required' });
  }

  try {
    const token = await generateToken(roomName, userName, apiKey, apiSecret);
    res.json({ token, url: livekitUrl });
  } catch (err) {
    console.error('Token generation failed:', err);
    res.status(500).json({ error: 'Token generation failed' });
  }
};



const claimHost = async (req, res) => {
  const { roomName, userName } = req.body;

  try {
    const room = await prisma.room.findUnique({ where: { name: roomName } });
    if (!room) return res.status(404).json({ error: 'Room not found' });

    // Change host
    await prisma.room.update({
      where: { name: roomName },
      data: { host: userName }
    });

    res.json({ message: `${userName} is now the host` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Host claim failed' });
  }
};


module.exports = { getToken, claimHost };

