import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  LiveKitRoom,
  VideoConference,
  RoomName,
  useRoomContext,
  useParticipants,
  useLocalParticipant,
  TrackToggle,
  TrackMutedIndicator,
  useTrackToggle,
  useTracks
} from '@livekit/components-react';
import '@livekit/components-styles';

// Icons component
const MeetingIcons = {
  Mic: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  MicOff: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
    </svg>
  ),
  Camera: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  CameraOff: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17l-2-2m0 0l-2-2m2 2l-2 2m2-2l2 2" />
    </svg>
  ),
  ScreenShare: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  Participants: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Chat: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Leave: () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  )
};

const RoomPage = () => {
  const { roomName } = useParams();
  const navigate = useNavigate();
  const [token, setToken] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const room = useRoomContext();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  // Track states
  const tracks = useTracks([
    { source: 'camera', withPlaceholder: true },
    { source: 'microphone', withPlaceholder: true }
  ], { onlySubscribed: false });

  const cameraTrack = tracks.find(track => track.source === 'camera');
  const micTrack = tracks.find(track => track.source === 'microphone');

  // Toggle controls
  const { toggle: toggleMic } = useTrackToggle({ source: 'microphone' });
  const { toggle: toggleCamera } = useTrackToggle({ source: 'camera' });

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
      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        <VideoConference className="h-full w-full" />
        
        {/* Participant List Panel */}
        {showParticipants && (
          <div className="absolute top-4 right-4 w-64 bg-gray-800 bg-opacity-90 rounded-lg shadow-lg z-10 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Participants ({participants.length + 1})</h3>
              <button 
                onClick={() => setShowParticipants(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              <div className="flex items-center space-x-2 p-2 bg-gray-700 rounded">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  {localParticipant?.name?.charAt(0).toUpperCase()}
                </div>
                <span className="text-white">{localParticipant?.name} (You)</span>
                <TrackMutedIndicator source={'microphone'} />
              </div>
              {participants.map(participant => (
                <div key={participant.sid} className="flex items-center space-x-2 p-2 hover:bg-gray-700 rounded">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    {participant.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-white">{participant.name}</span>
                  <TrackMutedIndicator participant={participant} source={'microphone'} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Chat Panel */}
        {showChat && (
          <div className="absolute top-4 right-4 w-64 bg-gray-800 bg-opacity-90 rounded-lg shadow-lg z-10 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-semibold">Chat</h3>
              <button 
                onClick={() => setShowChat(false)}
                className="text-gray-400 hover:text-white"
              >
                ×
              </button>
            </div>
            <div className="h-64 mb-4 overflow-y-auto border-b border-gray-700">
              <div className="text-center text-gray-400 py-8">
                Chat functionality coming soon
              </div>
            </div>
            <div className="flex">
              <input 
                type="text" 
                placeholder="Type a message..." 
                className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-l focus:outline-none"
              />
              <button className="bg-blue-600 text-white px-3 py-2 rounded-r hover:bg-blue-700">
                Send
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Control Bar */}
      <div className="bg-gray-800 py-3 px-6 flex justify-center space-x-6">
        {/* Mic Control */}
        <TrackToggle
          source="microphone"
          className={`p-3 rounded-full ${micTrack?.isMuted ? 'bg-gray-700' : 'bg-gray-600'} hover:bg-gray-500 text-white`}
          aria-label="Toggle microphone"
        >
          {micTrack?.isMuted ? <MeetingIcons.MicOff /> : <MeetingIcons.Mic />}
        </TrackToggle>

        {/* Camera Control */}
        <TrackToggle
          source="camera"
          className={`p-3 rounded-full ${cameraTrack?.isMuted ? 'bg-gray-700' : 'bg-gray-600'} hover:bg-gray-500 text-white`}
          aria-label="Toggle camera"
        >
          {cameraTrack?.isMuted ? <MeetingIcons.CameraOff /> : <MeetingIcons.Camera />}
        </TrackToggle>

        {/* Screen Share */}
        <button
          className="p-3 rounded-full bg-gray-600 hover:bg-gray-500 text-white"
          aria-label="Share screen"
        >
          <MeetingIcons.ScreenShare />
        </button>

        {/* Participants */}
        <button
          onClick={() => setShowParticipants(!showParticipants)}
          className={`p-3 rounded-full ${showParticipants ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-gray-500 text-white`}
          aria-label="Show participants"
        >
          <MeetingIcons.Participants />
        </button>

        {/* Chat */}
        <button
          onClick={() => setShowChat(!showChat)}
          className={`p-3 rounded-full ${showChat ? 'bg-blue-600' : 'bg-gray-600'} hover:bg-gray-500 text-white`}
          aria-label="Show chat"
        >
          <MeetingIcons.Chat />
        </button>

        {/* Leave Meeting */}
        <button
          onClick={handleDisconnect}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
          aria-label="Leave meeting"
        >
          <MeetingIcons.Leave />
        </button>
      </div>
    </div>
  );
};

export default RoomPage;