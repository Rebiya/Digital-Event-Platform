const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class BreakoutService {

  /**
   * Create breakout room (manual assignment)
   * @param {string} mainRoomName - Name of the main room
   * @param {string} breakoutRoomName - Name of the breakout room
   * @param {string} hostId - ID of the host user
   * @param {string[]} participantIds - Array of participant IDs
   * @returns {Promise<Object>} Created breakout room
   */
  static async createBreakoutRoom(mainRoomName, breakoutRoomName, hostId, participantIds = []) {
    // 1. Validate main room exists and get participants
    const mainRoom = await prisma.room.findUnique({
      where: { name: mainRoomName },
      include: { 
        participants: { include: { user: true } },
        breakoutRooms: { where: { name: breakoutRoomName } }
      }
    });
    
    if (!mainRoom) {
      throw new Error(`Main room not found`);
    }

    // 2. Check if breakout room name already exists
    if (mainRoom.breakoutRooms.length > 0) {
      throw new Error(`Room name already taken`);
    }

    // Get participant user IDs for quick lookup
    const mainRoomParticipantIds = new Set(mainRoom.participants.map(p => p.userId));

    // 3. Validate host exists and is in main room
    if (!mainRoomParticipantIds.has(hostId)) {
      throw new Error(`Host must join main room first`);
    }

    // 4. Validate all participants are in main room
    const invalidParticipants = participantIds.filter(id => !mainRoomParticipantIds.has(id));
    if (invalidParticipants.length > 0) {
      throw new Error(`Some participants not in main room`);
    }

    // 5. Remove host from participants list to avoid duplicates
    const uniqueParticipants = participantIds.filter(id => id !== hostId);

    // 6. Create breakout room with participants
    const breakoutRoom = await prisma.breakoutRoom.create({
      data: {
        name: breakoutRoomName,
        mainRoomId: mainRoom.id,
        hostId: hostId,
        participants: {
          create: [
            { userId: hostId, isHost: true },
            ...uniqueParticipants.map(userId => ({ userId, isHost: false }))
          ]
        }
      },
      include: {
        participants: { include: { user: true } },
        mainRoom: true
      }
    });

    return breakoutRoom;
  }

  /**
   * Automatically assign participants to breakout rooms
   * @param {string} mainRoomName - Name of the main room
   * @param {string} hostId - ID of the host user
   * @param {number} roomCount - Number of rooms to create
   * @returns {Promise<Object[]>} Created rooms array
   */
  static async autoAssignParticipants(mainRoomName, hostId, roomCount) {
    // 1. Validate main room exists
    const mainRoom = await prisma.room.findUnique({
      where: { name: mainRoomName },
      include: { 
        participants: {
          include: { user: true }
        } 
      }
    });
    
    if (!mainRoom) {
      throw new Error(`Main room "${mainRoomName}" doesn't exist.`);
    }

    // 2. Validate host is in main room
    const host = mainRoom.participants.find(p => p.userId === hostId);
    if (!host) {
      throw new Error(`Host must be in the main room to create breakout rooms.`);
    }

    // 3. Get all participants (excluding host)
    const participants = mainRoom.participants
      .filter(p => p.userId !== hostId)
      .map(p => p.userId);

    if (participants.length === 0) {
      throw new Error(`No participants available for breakout rooms (except host).`);
    }

    // 4. Validate room count
    if (roomCount < 1 || roomCount > 10) {
      throw new Error(`Invalid room count. Please choose between 1-10 rooms.`);
    }

    // 5. Distribute participants evenly
    const assignments = Array.from({ length: roomCount }, () => []);
    participants.forEach((userId, index) => {
      assignments[index % roomCount].push(userId);
    });

    // 6. Create breakout rooms
    const createdRooms = [];
    for (let i = 0; i < roomCount; i++) {
      const roomName = `Group ${i + 1}`;
      const roomParticipants = assignments[i];
      
      const room = await prisma.breakoutRoom.create({
        data: {
          name: roomName,
          mainRoomId: mainRoom.id,
          hostId: i === 0 ? hostId : roomParticipants[0] || hostId, // First room gets main host
          participants: {
            create: [
              { userId: hostId, isHost: i === 0 }, // Only first room host is main host
              ...roomParticipants.map(userId => ({ userId, isHost: false }))
            ]
          }
        },
        include: {
          participants: {
            include: { user: true }
          }
        }
      });
      
      createdRooms.push(room);
    }

    return createdRooms;
  }

  /**
   * Get all breakout rooms for a main room
   * @param {string} mainRoomName - Name of the main room
   * @returns {Promise<Object[]>} Array of breakout rooms
   */
  static async getBreakoutRooms(mainRoomName) {
    const mainRoom = await prisma.room.findUnique({
      where: { name: mainRoomName },
    });

    if (!mainRoom) {
      throw new Error(`Main room "${mainRoomName}" doesn't exist.`);
    }

    const breakoutRooms = await prisma.breakoutRoom.findMany({
      where: { mainRoomId: mainRoom.id },
      include: {
        participants: {
          include: {
            user: true
          }
        },
        mainRoom: true
      }
    });

    return breakoutRooms;
  }

  /**
   * Add participant to breakout room
   * @param {string} mainRoomName - Name of the main room
   * @param {string} breakoutRoomName - Name of the breakout room
   * @param {string} userId - ID of user to add
   * @returns {Promise<Object>} Updated breakout room
   */
  static async addParticipant(mainRoomName, breakoutRoomName, userId) {
    // Find the main room
    const mainRoom = await prisma.room.findUnique({
      where: { name: mainRoomName },
    });

    if (!mainRoom) {
      throw new Error(`Main room "${mainRoomName}" doesn't exist.`);
    }

    // Find the breakout room
    const breakoutRoom = await prisma.breakoutRoom.findFirst({
      where: {
        name: breakoutRoomName,
        mainRoomId: mainRoom.id
      }
    });

    if (!breakoutRoom) {
      throw new Error(`Breakout room "${breakoutRoomName}" not found in "${mainRoomName}".`);
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error(`User with ID ${userId} doesn't exist.`);
    }

    // Verify user is in main room
    const inMainRoom = await prisma.roomParticipant.findUnique({
      where: {
        roomId_userId: {
          roomId: mainRoom.id,
          userId: userId
        }
      }
    });

    if (!inMainRoom) {
      throw new Error(`User must join main room "${mainRoomName}" before joining breakout rooms.`);
    }

    // Check if already in breakout room
    const existingParticipant = await prisma.breakoutRoomParticipant.findUnique({
      where: {
        breakoutRoomId_userId: {
          breakoutRoomId: breakoutRoom.id,
          userId: userId
        }
      }
    });

    if (existingParticipant) {
      throw new Error(`User is already in breakout room "${breakoutRoomName}".`);
    }

    // Add participant
    await prisma.breakoutRoomParticipant.create({
      data: {
        breakoutRoomId: breakoutRoom.id,
        userId: userId,
        isHost: false
      }
    });

    // Return updated room
    const updatedRoom = await prisma.breakoutRoom.findUnique({
      where: { id: breakoutRoom.id },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    return updatedRoom;
  }

  /**
   * Remove participant from breakout room
   * @param {string} mainRoomName - Name of the main room
   * @param {string} breakoutRoomName - Name of the breakout room
   * @param {string} userId - ID of user to remove
   * @returns {Promise<Object>} Updated breakout room
   */
  static async removeParticipant(mainRoomName, breakoutRoomName, userId) {
    // Find the main room
    const mainRoom = await prisma.room.findUnique({
      where: { name: mainRoomName },
    });

    if (!mainRoom) {
      throw new Error(`Main room "${mainRoomName}" doesn't exist.`);
    }

    // Find the breakout room
    const breakoutRoom = await prisma.breakoutRoom.findFirst({
      where: {
        name: breakoutRoomName,
        mainRoomId: mainRoom.id
      }
    });

    if (!breakoutRoom) {
      throw new Error(`Breakout room "${breakoutRoomName}" not found in "${mainRoomName}".`);
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error(`User with ID ${userId} doesn't exist.`);
    }

    // Check if user is in breakout room
    const participant = await prisma.breakoutRoomParticipant.findUnique({
      where: {
        breakoutRoomId_userId: {
          breakoutRoomId: breakoutRoom.id,
          userId: userId
        }
      }
    });

    if (!participant) {
      throw new Error(`User is not in breakout room "${breakoutRoomName}".`);
    }

    // Remove participant
    await prisma.breakoutRoomParticipant.delete({
      where: {
        breakoutRoomId_userId: {
          breakoutRoomId: breakoutRoom.id,
          userId: userId
        }
      }
    });

    // Return updated room
    const updatedRoom = await prisma.breakoutRoom.findUnique({
      where: { id: breakoutRoom.id },
      include: {
        participants: {
          include: {
            user: true
          }
        }
      }
    });

    return updatedRoom;
  }

  /**
   * Delete a breakout room
   * @param {string} mainRoomName - Name of the main room
   * @param {string} breakoutRoomName - Name of the breakout room
   * @returns {Promise<boolean>} True if deleted successfully
   */
  static async deleteBreakoutRoom(mainRoomName, breakoutRoomName) {
    // Find the main room
    const mainRoom = await prisma.room.findUnique({
      where: { name: mainRoomName },
    });

    if (!mainRoom) {
      throw new Error(`Main room "${mainRoomName}" doesn't exist.`);
    }

    // Find the breakout room
    const breakoutRoom = await prisma.breakoutRoom.findFirst({
      where: {
        name: breakoutRoomName,
        mainRoomId: mainRoom.id
      }
    });

    if (!breakoutRoom) {
      throw new Error(`Breakout room "${breakoutRoomName}" not found in "${mainRoomName}".`);
    }

    // Delete all participants first
    await prisma.breakoutRoomParticipant.deleteMany({
      where: {
        breakoutRoomId: breakoutRoom.id
      }
    });

    // Delete the breakout room
    await prisma.breakoutRoom.delete({
      where: {
        id: breakoutRoom.id
      }
    });

    return true;
  }
}

module.exports = BreakoutService;