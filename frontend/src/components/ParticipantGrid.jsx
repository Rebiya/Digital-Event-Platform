import React, { useMemo } from 'react';
import {
  useParticipants,
  useLocalParticipant,
  useTracks,
  TrackMutedIndicator,
  useTrackToggle,
  VideoTrack,
  useSpeakingParticipants,
  TrackRefContext,
} from '@livekit/components-react';
import '@livekit/components-styles';
import ErrorBoundary from './ErrorBoundary';

const getInitials = (name) => name ? name.charAt(0).toUpperCase() : '?';

// Generate a simple UUID-like string for fallback keys
const generateFallbackKey = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const ParticipantTile = ({ participant, isLocal, isActiveSpeaker }) => {
  // Get tracks using the new useTrack() hook
  const tracks = useTracks(
    [
      { source: 'camera', participant, withPlaceholder: true },
      { source: 'microphone', participant, withPlaceholder: true }
    ],
    { onlySubscribed: false }
  );

  const cameraTrack = tracks.find(t => 
    t.source === 'camera' && t.participant?.sid === participant.sid
  );
  
  const micTrack = tracks.find(t => 
    t.source === 'microphone' && t.participant?.sid === participant.sid
  );
  
  // For local participant, allow toggling
  const { toggle: toggleMic } = useTrackToggle({ source: 'microphone' });
  const { toggle: toggleCamera } = useTrackToggle({ source: 'camera' });

  // Show mute/unmute on hover
  const [hovered, setHovered] = React.useState(false);

  // Validate trackRef before rendering VideoTrack
  const isValidTrackRef = cameraTrack && 
    cameraTrack.publication && 
    cameraTrack.publication.track && 
    !cameraTrack.isMuted;

  console.log("ParticipantTile Debug:", {
    participantName: participant.name,
    cameraTrack: cameraTrack ? {
      hasPublication: !!cameraTrack.publication,
      hasTrack: !!cameraTrack.publication?.track,
      isMuted: cameraTrack.isMuted,
      isValid: isValidTrackRef
    } : null
  });

  return (
    <div
    className={`relative bg-gray-800 rounded-lg overflow-hidden flex flex-col items-center justify-end border-4 transition-all duration-200 ${isActiveSpeaker ? 'border-blue-500 shadow-lg' : 'border-transparent'}`}
    onMouseEnter={() => setHovered(true)}
    onMouseLeave={() => setHovered(false)}
  >
    <div className="w-full h-full flex-1 flex items-center justify-center bg-black">
      {isValidTrackRef ? (
        <ErrorBoundary>
          <TrackRefContext.Provider value={cameraTrack}>
            <VideoTrack
              trackRef={cameraTrack}
              className={`w-full h-full object-cover ${isLocal ? 'scale-x-[-1]' : ''}`}
              style={{ aspectRatio: '16/9', background: '#222' }}
            />
          </TrackRefContext.Provider>
        </ErrorBoundary>
      ) : (
        <div className="flex flex-col items-center justify-center w-full h-full" style={{ aspectRatio: '16/9', background: '#222' }}>
          <div className="w-16 h-16 rounded-full bg-gray-600 flex items-center justify-center text-3xl text-white mb-2">
            {getInitials(participant.name)}
          </div>
          <span className="text-gray-300 text-sm">{participant.name}</span>
          {cameraTrack && cameraTrack.isMuted && (
            <div className="mt-2 text-xs text-gray-400">
              Camera Off
            </div>
          )}
        </div>
      )}
    </div>
    {/* Overlay for name and mute status */}
    <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/80 to-transparent px-3 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-white font-semibold text-sm truncate max-w-[8rem]">{isLocal ? `${participant.name} (You)` : participant.name}</span>
        <TrackMutedIndicator participant={participant} source={'microphone'} />
      </div>
      {/* Show mute/unmute on hover for local participant */}
      {isLocal && hovered && (
        <div className="flex gap-2">
          <button
            className={`p-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs ${micTrack?.isMuted ? 'bg-red-600' : ''}`}
            onClick={toggleMic}
            title={micTrack?.isMuted ? 'Unmute Mic' : 'Mute Mic'}
          >
            {micTrack?.isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button
            className={`p-1 rounded bg-gray-700 hover:bg-gray-600 text-white text-xs ${cameraTrack?.isMuted ? 'bg-red-600' : ''}`}
            onClick={toggleCamera}
            title={cameraTrack?.isMuted ? 'Start Video' : 'Stop Video'}
          >
            {cameraTrack?.isMuted ? 'Start Video' : 'Stop Video'}
          </button>
        </div>
      )}
    </div>
  </div>
  );
};

const ParticipantGrid = () => {
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();
  const activeSpeakers = useSpeakingParticipants();

  // Compose all participants (local + remote) with robust key generation
  const allParticipants = useMemo(() => {
    const participantsWithKeys = [localParticipant, ...participants]
      .filter(p => p && p.sid)
      .map((p, index) => {
        // Create a truly unique key combining multiple identifiers
        const uniqueKey = [
          p.sid,                    // Primary identifier
          p.identity,               // Secondary identifier
          p.name,                   // Name as additional uniqueness
          index,                    // Index as fallback
          generateFallbackKey()     // Random fallback
        ].filter(Boolean).join('_');
        
        return {
          ...p,
          uniqueKey,
          // Store the original key components for debugging
          keyComponents: {
            sid: p.sid,
            identity: p.identity,
            name: p.name,
            index
          }
        };
      });
    
    // Debug log to check for duplicates and key generation
    console.log('Participants with unique keys:', 
      participantsWithKeys.map(p => ({
        name: p.name,
        key: p.uniqueKey,
        components: p.keyComponents
      }))
    );
    
    return participantsWithKeys;
  }, [localParticipant, participants]);

  // Responsive grid columns
  const getGridCols = (count) => {
    if (count <= 2) return 'grid-cols-1 sm:grid-cols-2';
    if (count <= 4) return 'grid-cols-2 md:grid-cols-2';
    if (count <= 6) return 'grid-cols-2 md:grid-cols-3';
    if (count <= 9) return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-3';
    return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
  };

  return (
    <ErrorBoundary>
      <div className={`w-full h-full p-2 grid gap-4 ${getGridCols(allParticipants.length)}`} style={{ alignItems: 'stretch' }}>
        {allParticipants.map((participant) => (
          <ErrorBoundary key={participant.uniqueKey}>
            <ParticipantTile
              participant={participant}
              isLocal={participant.sid === localParticipant?.sid}
              isActiveSpeaker={activeSpeakers.some(s => s.sid === participant.sid)}
            />
          </ErrorBoundary>
        ))}
      </div>
    </ErrorBoundary>
  );
};

export default ParticipantGrid;