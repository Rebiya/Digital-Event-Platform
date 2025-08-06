const { generateTokenFromUsername } = require('../services/tokenService');

const joinRoom = async (req, res) => {
  const { roomName, userName } = req.body; // <- corrected here

  try {
    const { token, isHost } = await generateTokenFromUsername(
      roomName,
      userName, // <- pass the correct variable
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET
    );

    res.status(200).json({
      success: true,
      token,
      isHost,
    });
  } catch (err) {
    console.error('Join Room Error:', err.message);

    if (err.message === 'User not found.') {
      return res.status(404).json({ error: 'Username not found. Please check and try again.' });
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};


module.exports = { joinRoom };