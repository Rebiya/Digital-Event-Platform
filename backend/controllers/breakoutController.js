const BreakoutService = require('../services/breakoutService');
const { generateToken } = require('../services/tokenService');

const createBreakoutRoom = async (req, res) => {
  const { mainRoomName, breakoutRoomName, participants, autoAssign, roomCount } = req.body;

  try {
    if (autoAssign) {
      if (!Array.isArray(participants) || !roomCount) {
        return res.status(400).json({ error: 'participants and roomCount required for auto assignment' });
      }

      const rooms = BreakoutService.autoAssignParticipants(mainRoomName, participants, roomCount);
      return res.json({ createdRooms: rooms });
    }

    const room = BreakoutService.createBreakoutRoom(mainRoomName, breakoutRoomName, participants || []);
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const getBreakoutRooms = async (req, res) => {
  const { mainRoomName } = req.params;

  try {
    const rooms = BreakoutService.getBreakoutRooms(mainRoomName);
    res.json(rooms);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const joinBreakoutRoom = async (req, res) => {
  const { mainRoomName, breakoutRoomName, userName } = req.body;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  try {
    BreakoutService.addParticipant(mainRoomName, breakoutRoomName, userName);

    const roomName = `${mainRoomName}-${breakoutRoomName}`;
    const token = await generateToken(roomName, userName, apiKey, apiSecret);

    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const leaveBreakoutRoom = async (req, res) => {
  const { mainRoomName, breakoutRoomName, userName } = req.body;

  try {
    const room = BreakoutService.removeParticipant(mainRoomName, breakoutRoomName, userName);
    res.json(room);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

const deleteBreakoutRoom = async (req, res) => {
  const { mainRoomName, breakoutRoomName } = req.params;

  try {
    const result = BreakoutService.deleteBreakoutRoom(mainRoomName, breakoutRoomName);
    res.json({ success: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

module.exports = {
  createBreakoutRoom,
  getBreakoutRooms,
  joinBreakoutRoom,
  leaveBreakoutRoom,
  deleteBreakoutRoom
};
