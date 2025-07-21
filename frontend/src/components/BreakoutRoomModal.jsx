import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useParticipants, useLocalParticipant } from '@livekit/components-react';
import { breakoutService } from '../services/breakoutService';

const BreakoutRoomModal = ({ isOpen, onClose, onRoomCreated }) => {
  const [roomName, setRoomName] = useState('');
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { roomName: mainRoomName } = useParams();
  const participants = useParticipants();
  const { localParticipant } = useLocalParticipant();

  const handleParticipantToggle = (participantName) => {
    setSelectedParticipants(prev => {
      if (prev.includes(participantName)) {
        return prev.filter(p => p !== participantName);
      } else {
        return [...prev, participantName];
      }
    });
  };

  const handleRandomAssignment = () => {
    const allParticipants = participants.map(p => p.name);
    if (localParticipant) {
      allParticipants.push(localParticipant.name);
    }
    setSelectedParticipants(allParticipants);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await breakoutService.createBreakoutRoom(
        mainRoomName,
        roomName,
        selectedParticipants
      );
      onRoomCreated();
      onClose();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Create Breakout Room</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 text-red-100 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Room Name
            </label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Enter room name"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Select Participants
              </label>
              <button
                type="button"
                onClick={handleRandomAssignment}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Select All
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 bg-gray-700 rounded p-2">
              {participants.map((participant) => (
                <div
                  key={participant.sid}
                  className="flex items-center space-x-2 p-2 hover:bg-gray-600 rounded"
                >
                  <input
                    type="checkbox"
                    id={participant.sid}
                    checked={selectedParticipants.includes(participant.name)}
                    onChange={() => handleParticipantToggle(participant.name)}
                    className="rounded border-gray-400 text-blue-500 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={participant.sid}
                    className="text-white cursor-pointer flex-1"
                  >
                    {participant.name}
                  </label>
                </div>
              ))}
              {localParticipant && (
                <div className="flex items-center space-x-2 p-2 hover:bg-gray-600 rounded">
                  <input
                    type="checkbox"
                    id={localParticipant.sid}
                    checked={selectedParticipants.includes(localParticipant.name)}
                    onChange={() => handleParticipantToggle(localParticipant.name)}
                    className="rounded border-gray-400 text-blue-500 focus:ring-blue-500"
                  />
                  <label
                    htmlFor={localParticipant.sid}
                    className="text-white cursor-pointer flex-1"
                  >
                    {localParticipant.name} (You)
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !roomName || selectedParticipants.length === 0}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BreakoutRoomModal; 