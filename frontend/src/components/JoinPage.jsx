import { useState ,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { livekitService } from '../services/livekitService';

const JoinPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    roomName: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();



  useEffect(() => {
    const storedToken = localStorage.getItem('livekit-token');
    if (storedToken) {
      console.log('Token contents:', JSON.parse(atob(storedToken.split('.')[1])));
    }
  }, []);


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  if (!formData.name.trim() || !formData.roomName.trim()) {
    alert('Please enter both name and room name');
    return;
  }

  setIsLoading(true);
  
  try {
    const token = await livekitService.getToken(formData.roomName, formData.name);
    
    // Verify token before storing
    if (!token || typeof token !== 'string') {
      throw new Error('Invalid token received');
    }
    
    localStorage.setItem('livekit-token', token);
    localStorage.setItem('user-name', formData.name);
    
    navigate(`/room/${formData.roomName}`);
  } catch (error) {
    console.error('Join Error:', error);
    alert(`Failed to join room: ${error.message}`);
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Digital Event Platform</h1>
          <p className="text-gray-300">Join your virtual meeting room</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter your name"
              required
            />
          </div>

          <div>
            <label htmlFor="roomName" className="block text-sm font-medium text-gray-300 mb-2">
              Room Name
            </label>
            <input
              type="text"
              id="roomName"
              name="roomName"
              value={formData.roomName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter room name"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Joining...
              </div>
            ) : (
              'Join Room'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            Powered by LiveKit
          </p>
        </div>
      </div>
    </div>
  );
};

export default JoinPage; 