const BreakoutService = require('../services/breakoutService');
const { generateToken } = require('../services/tokenService');

const createBreakoutRoom = async (req, res) => {
  const { mainRoomName, breakoutRoomName, hostId, participants, autoAssign, roomCount } = req.body;

  try {
    let result;
    if (autoAssign) {
      result = await BreakoutService.autoAssignParticipants(mainRoomName, hostId, roomCount);
      // Handle successful auto-assignment
      return res.status(201).json({
        success: true,
        message: `🎉 Successfully created ${roomCount} breakout rooms! Participants have been automatically distributed across all rooms.`,
        data: {
          rooms: result,
          totalRooms: result.length,
          totalParticipants: result.reduce((sum, room) => sum + room.participants.length, 0)
        }
      });
    } else {
      result = await BreakoutService.createBreakoutRoom(
        mainRoomName, 
        breakoutRoomName, 
        hostId, 
        participants || []
      );
      // Handle successful manual creation
      return res.status(201).json({
        success: true,
        message: `✅ Breakout room "${breakoutRoomName}" has been created successfully! ${result.participants.length} participants are now ready to join.`,
        data: {
          room: result,
          participantCount: result.participants.length
        }
      });
    }
  } catch (error) {
    // Handle different types of errors with user-friendly messages
    let statusCode = 400;
    let userMessage = error.message;

    if (error.message.includes("doesn't exist")) {
      statusCode = 404;
      userMessage = `❌ ${error.message} Please make sure you're in the correct room.`;
    } else if (error.message.includes("already exists")) {
      statusCode = 409;
      userMessage = `⚠️ ${error.message} Please choose a different name.`;
    } else if (error.message.includes("Invalid participants") || error.message.includes("must join")) {
      statusCode = 400;
      userMessage = `👥 ${error.message}`;
    } else if (error.message.includes("Invalid room count")) {
      statusCode = 400;
      userMessage = `🔢 ${error.message}`;
    } else {
      statusCode = 500;
      userMessage = '🚫 Something went wrong while creating the breakout room. Please try again.';
    }

    res.status(statusCode).json({
      success: false,
      message: userMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const getBreakoutRooms = async (req, res) => {
  const { mainRoomName } = req.params;

  try {
    const rooms = await BreakoutService.getBreakoutRooms(mainRoomName);
    
    if (rooms.length === 0) {
      return res.json({
        success: true,
        message: `📋 No breakout rooms found for "${mainRoomName}". Create some to get started!`,
        data: {
          rooms: [],
          totalRooms: 0
        }
      });
    }

    res.json({
      success: true,
      message: `📚 Found ${rooms.length} breakout room${rooms.length > 1 ? 's' : ''} in "${mainRoomName}"`,
      data: {
        rooms: rooms,
        totalRooms: rooms.length,
        totalParticipants: rooms.reduce((sum, room) => sum + room.participants.length, 0)
      }
    });
  } catch (error) {
    let statusCode = 400;
    let userMessage = error.message;

    if (error.message.includes("doesn't exist")) {
      statusCode = 404;
      userMessage = `❌ Main room "${mainRoomName}" not found. Please check the room name.`;
    } else {
      statusCode = 500;
      userMessage = '🚫 Unable to retrieve breakout rooms. Please try again.';
    }

    res.status(statusCode).json({
      success: false,
      message: userMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const joinBreakoutRoom = async (req, res) => {
  const { mainRoomName, breakoutRoomName, userName } = req.body;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  try {
    // First, add the participant to the breakout room
    await BreakoutService.addParticipant(mainRoomName, breakoutRoomName, userName);

    // Generate token for the breakout room
    const roomName = `${mainRoomName}-${breakoutRoomName}`;
    const token = await generateToken(roomName, userName, apiKey, apiSecret);

    res.json({
      success: true,
      message: `🚪 Welcome to breakout room "${breakoutRoomName}"! You're all set to join the conversation.`,
      data: {
        token: token,
        roomName: breakoutRoomName,
        fullRoomName: roomName
      }
    });
  } catch (error) {
    let statusCode = 400;
    let userMessage = error.message;

    if (error.message.includes("doesn't exist")) {
      statusCode = 404;
      userMessage = `❌ ${error.message} Please check the room names.`;
    } else if (error.message.includes("must join main room")) {
      statusCode = 403;
      userMessage = `🔒 You need to join the main room "${mainRoomName}" before accessing breakout rooms.`;
    } else if (error.message.includes("already in breakout room")) {
      statusCode = 409;
      userMessage = `👋 You're already in breakout room "${breakoutRoomName}"!`;
    } else {
      statusCode = 500;
      userMessage = '🚫 Unable to join the breakout room. Please try again.';
    }

    res.status(statusCode).json({
      success: false,
      message: userMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const leaveBreakoutRoom = async (req, res) => {
  const { mainRoomName, breakoutRoomName, userName } = req.body;

  try {
    const updatedRoom = await BreakoutService.removeParticipant(mainRoomName, breakoutRoomName, userName);
    
    res.json({
      success: true,
      message: `👋 You have successfully left breakout room "${breakoutRoomName}". You can rejoin anytime!`,
      data: {
        room: updatedRoom,
        remainingParticipants: updatedRoom.participants.length
      }
    });
  } catch (error) {
    let statusCode = 400;
    let userMessage = error.message;

    if (error.message.includes("doesn't exist")) {
      statusCode = 404;
      userMessage = `❌ ${error.message} Please check the room names.`;
    } else if (error.message.includes("not in breakout room")) {
      statusCode = 400;
      userMessage = `🤷‍♂️ You're not currently in breakout room "${breakoutRoomName}".`;
    } else {
      statusCode = 500;
      userMessage = '🚫 Unable to leave the breakout room. Please try again.';
    }

    res.status(statusCode).json({
      success: false,
      message: userMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const deleteBreakoutRoom = async (req, res) => {
  const { mainRoomName, breakoutRoomName } = req.params;

  try {
    const result = await BreakoutService.deleteBreakoutRoom(mainRoomName, breakoutRoomName);
    
    res.json({
      success: true,
      message: `🗑️ Breakout room "${breakoutRoomName}" has been deleted successfully. All participants have been removed.`,
      data: {
        deleted: result,
        roomName: breakoutRoomName
      }
    });
  } catch (error) {
    let statusCode = 400;
    let userMessage = error.message;

    if (error.message.includes("doesn't exist")) {
      statusCode = 404;
      userMessage = `❌ ${error.message} The room may have already been deleted.`;
    } else {
      statusCode = 500;
      userMessage = '🚫 Unable to delete the breakout room. Please try again.';
    }

    res.status(statusCode).json({
      success: false,
      message: userMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createBreakoutRoom,
  getBreakoutRooms,
  joinBreakoutRoom,
  leaveBreakoutRoom,
  deleteBreakoutRoom
};
