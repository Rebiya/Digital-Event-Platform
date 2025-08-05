// Controller (user joins room)
const { generateToken } = require('../services/tokenService');

const joinRoom = async (req, res) => {
  const { roomName, userId, userName } = req.body;

  try {
    const { token, isHost } = await generateToken(
      roomName,
      userId,
      userName,
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET
    );

    res.status(200).json({
      success: true,
      token,
      isHost,
    });
  } catch (err) {
    console.error('Join Room Error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { joinRoom };
