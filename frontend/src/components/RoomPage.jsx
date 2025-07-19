import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LiveKitRoom, 
  VideoConference, 
  RoomName,
  useRoomContext,
  useParticipants
} from '@livekit/components-react';
import '@livekit/components-styles';

const RoomPage = () => {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionState, setConnectionState] = useState('connecting');
  const room = useRoomContext();

  // Debugging: Log the LiveKit URL
  useEffect(() => {
    console.log('LiveKit Server URL:', import.meta.env.VITE_LIVEKIT_URL);
  }, []);

  // Handle room connection state
  useEffect(() => {
    if (!room) return;

    const handleDisconnected = () => {
      console.log('Disconnected from room');
      handleDisconnect();
    };

    room.on('disconnected', handleDisconnected);
    
    return () => {
      room.off('disconnected', handleDisconnected);
    };
  }, [room]);

  // Verify token exists
  useEffect(() => {
    const storedToken = localStorage.getItem('livekit-token');
    if (!storedToken) {
      console.warn('No token found, redirecting to join page');
      navigate('/join');
      return;
    }
    
    // Verify token structure
    try {
      const payload = JSON.parse(atob(storedToken.split('.')[1]));
      console.log('Token payload:', payload);
      if (!payload.video?.roomJoin || payload.video.room !== roomName) {
        throw new Error('Invalid token permissions');
      }
    } catch (e) {
      console.error('Token validation failed:', e);
      localStorage.removeItem('livekit-token');
      navigate('/join');
      return;
    }

    setToken(storedToken);
    setIsConnecting(false);
  }, [navigate, roomName]);

  const handleDisconnect = () => {
    localStorage.removeItem('livekit-token');
    localStorage.removeItem('user-name');
    navigate('/join');
  };

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white">Connecting to room...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-semibold text-white">
            <RoomName />
          </h1>
          <span className="text-gray-400">•</span>
          <ParticipantCount />
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Leave Room
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <VideoConference />
      </div>
    </div>
  );
};

const ParticipantCount = () => {
  const participants = useParticipants();
  return (
    <span className="text-gray-300">
      {participants.length + 1} participant{participants.length !== 0 ? 's' : ''}
    </span>
  );
};

export default RoomPage;