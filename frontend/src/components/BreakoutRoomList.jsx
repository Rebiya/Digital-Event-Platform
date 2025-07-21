import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocalParticipant } from '@livekit/components-react';
import { breakoutService } from '../services/breakoutService';

const BreakoutRoomList = ({ onClose }) => {
  const [rooms, setRooms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { roomName: mainRoomName } = useParams();
  const navigate = useNavigate();
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    loadBreakoutRooms();
  }, [mainRoomName]);

  const loadBreakoutRooms = async () => {
    try {
      const roomList = await breakoutService.getBreakoutRooms(mainRoomName);
      setRooms(roomList);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (breakoutRoomName) => {
    try {
      const token = await breakoutService.joinBreakoutRoom(
        mainRoomName,
        breakoutRoomName,
        localParticipant.name
      );
      
      // Store the token and navigate to the breakout room
      localStorage.setItem('livekit-token', token);
      navigate(`/room/${mainRoomName}-${breakoutRoomName}`);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteRoom = async (breakoutRoomName) => {
    if (!window.confirm('Are you sure you want to delete this breakout room?')) {
      return;
    }

    try {
      await breakoutService.deleteBreakoutRoom(mainRoomName, breakoutRoomName);
      loadBreakoutRooms();
    } catch (error) {
      setError(error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4 w-64">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-white">Breakout Rooms</h3>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
        >
          ×
        </button>
      </div>

      {error && (
        <div className="bg-red-500 bg-opacity-20 text-red-100 p-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}

      {rooms.length === 0 ? (
        <p className="text-gray-400 text-center py-4">No breakout rooms available</p>
      ) : (
        <div className="space-y-2">
          {rooms.map((room) => (
            <div
              key={room.roomKey}
              className="bg-gray-700 rounded p-3 space-y-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-white font-medium">{room.breakoutRoomName}</h4>
                  <p className="text-sm text-gray-400">
                    {room.participants.length} participant(s)
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteRoom(room.breakoutRoomName)}
                  className="text-red-400 hover:text-red-300 text-sm"
                >
                  Delete
                </button>
              </div>

              <div className="text-sm text-gray-300">
                Participants:
                <ul className="mt-1 space-y-1">
                  {room.participants.map((participant, index) => (
                    <li key={index} className="text-gray-400">
                      • {participant}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={() => handleJoinRoom(room.breakoutRoomName)}
                className="w-full mt-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
              >
                Join Room
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BreakoutRoomList; 