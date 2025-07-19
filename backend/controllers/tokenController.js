const { generateToken } = require('../services/tokenService');

const getToken = async (req, res) => {
  const { roomName, userName } = req.body;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ error: 'LiveKit API key/secret missing' });
  }

  if (!roomName || !userName) {
    return res.status(400).json({ error: 'roomName and userName required' });
  }

  try {
    const token = await generateToken(roomName, userName, apiKey, apiSecret); // ✅ await
    res.json({ token });
  } catch (err) {
    console.error('Token generation failed:', err);
    res.status(500).json({ error: 'Token generation failed' });
  }
};

module.exports = { getToken };
