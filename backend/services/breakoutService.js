const breakoutRooms = new Map();

class BreakoutService {
  static createBreakoutRoom(mainRoomName, breakoutRoomName, participants = []) {
    const roomKey = `${mainRoomName}-${breakoutRoomName}`;
    if (breakoutRooms.has(roomKey)) {
      throw new Error('Breakout room with this name already exists');
    }

    const room = {
      mainRoomName,
      breakoutRoomName,
      participants: Array.isArray(participants) ? participants : [],
      createdAt: new Date(),
    };

    breakoutRooms.set(roomKey, room);
    return room;
  }

  static getBreakoutRooms(mainRoomName) {
    const rooms = [];
    breakoutRooms.forEach((room, key) => {
      if (room.mainRoomName === mainRoomName) {
        rooms.push({
          ...room,
          roomKey: key,
        });
      }
    });
    return rooms;
  }

  static addParticipant(mainRoomName, breakoutRoomName, participant) {
    const roomKey = `${mainRoomName}-${breakoutRoomName}`;
    const room = breakoutRooms.get(roomKey);

    if (!room) {
      throw new Error('Breakout room not found');
    }

    if (!Array.isArray(room.participants)) {
      room.participants = [];
    }

    if (!room.participants.includes(participant)) {
      room.participants.push(participant);
    }

    return room;
  }

  static removeParticipant(mainRoomName, breakoutRoomName, participant) {
    const roomKey = `${mainRoomName}-${breakoutRoomName}`;
    const room = breakoutRooms.get(roomKey);

    if (!room) {
      throw new Error('Breakout room not found');
    }

    if (!Array.isArray(room.participants)) {
      room.participants = [];
    }

    room.participants = room.participants.filter((p) => p !== participant);
    return room;
  }

  static deleteBreakoutRoom(mainRoomName, breakoutRoomName) {
    const roomKey = `${mainRoomName}-${breakoutRoomName}`;
    if (!breakoutRooms.has(roomKey)) {
      throw new Error('Breakout room not found');
    }

    breakoutRooms.delete(roomKey);
    return true;
  }

  static getBreakoutRoom(mainRoomName, breakoutRoomName) {
    const roomKey = `${mainRoomName}-${breakoutRoomName}`;
    const room = breakoutRooms.get(roomKey);

    if (!room) {
      throw new Error('Breakout room not found');
    }

    return room;
  }

  // Automatically assign participants to rooms evenly
  static autoAssignParticipants(mainRoomName, participants, roomCount) {
    if (!Array.isArray(participants) || roomCount < 1) {
      throw new Error('Invalid participants or room count');
    }

    const assignments = Array.from({ length: roomCount }, () => []);
    participants.forEach((participant, index) => {
      const roomIndex = index % roomCount;
      assignments[roomIndex].push(participant);
    });

    const createdRooms = [];
    for (let i = 0; i < roomCount; i++) {
      const breakoutRoomName = `auto-room-${i + 1}`;
      const room = this.createBreakoutRoom(mainRoomName, breakoutRoomName, assignments[i]);
      createdRooms.push(room);
    }

    return createdRooms;
  }
}

module.exports = BreakoutService;
