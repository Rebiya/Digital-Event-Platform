const { generateToken } = require('../services/tokenService');


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

module.exports = { getToken };

