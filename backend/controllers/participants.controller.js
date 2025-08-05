const roomService = require('../services/participants.service.js');

const getRoomParticipants = async (req, res) => {
  const { room } = req.query; // Use query, not params

  if (!room) {
    return res.status(400).json({ error: 'Missing room name in query' });
  }

  try {
    const users = await roomService.fetchParticipants(room);
    return res.status(200).json(users);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Failed to fetch participants' });
  }
};

module.exports = {
  getRoomParticipants,
};
