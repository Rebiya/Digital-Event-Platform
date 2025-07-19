import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LiveKitRoom } from '@livekit/components-react';
import '@livekit/components-styles';
import JoinPage from './components/JoinPage';
import RoomPage from './components/RoomPage';
import './App.css';

function App() {
  // Verify the LiveKit URL is loaded from .env
  const livekitUrl = import.meta.env.VITE_LIVEKIT_URL;
  console.log(livekitUrl);
  
  if (!livekitUrl) {
    console.error('Missing LiveKit URL in environment variables');
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-white">
        <div className="text-center p-6 bg-red-900 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">Configuration Error</h2>
          <p>LiveKit server URL is not configured.</p>
          <p>Please check your .env file and restart the application.</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gray-900">
        <Routes>
          <Route path="/" element={<Navigate to="/join" replace />} />
          <Route path="/join" element={<JoinPage />} />
          <Route 
            path="/room/:roomName" 
            element={
              <LiveKitRoom
                serverUrl={livekitUrl}
                token={localStorage.getItem('livekit-token')}
                connect={true}
                onError={(error) => {
                  console.error('LiveKit connection error:', error);
                  alert(`Connection failed: ${error.message}`);
                }}
                onDisconnected={() => {
                  localStorage.removeItem('livekit-token');
                  window.location.href = '/join';
                }}
              >
                <RoomPage />
              </LiveKitRoom>
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;