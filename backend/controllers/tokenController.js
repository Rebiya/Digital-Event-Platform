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
    res.status(200).json({ token, url: livekitUrl });
  } catch (err) {
    console.error('Token generation failed:', err.message);
    const msg = err.message === 'Main room already exists' ? err.message : 'Token generation failed';
    res.status(500).json({ error: msg });
  }
};

const claimHost = async (req, res) => {
  const { roomName, userName, approver } = req.body;

  try {
    const room = await prisma.room.findUnique({ where: { name: roomName } });
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.host !== approver) {
      return res.status(403).json({ error: 'Only current host can assign new host' });
    }

    await prisma.room.update({
      where: { name: roomName },
      data: { host: userName }
    });

    return res.status(200).json({ message: `Success: ${userName} is now the host.` });
  } catch (err) {
    console.error('Host claim error:', err);
    return res.status(500).json({ error: 'Failed to assign new host' });
  }
};

module.exports = { getToken, claimHost };
