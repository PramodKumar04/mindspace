import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ROOM_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const createRoomCode = () => {
  let code = '';
  for (let i = 0; i < 6; i += 1) {
    code += ROOM_CODE_ALPHABET[Math.floor(Math.random() * ROOM_CODE_ALPHABET.length)];
  }
  return code;
};

export default function JoinLobby() {
  const [room, setRoom] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const heading = useMemo(() => {
    return user?.role === 'counselor' ? 'Start or join a session' : 'Join a counselling session';
  }, [user?.role]);

  const handleJoin = (code = room) => {
    const normalizedCode = String(code || '').trim().toUpperCase();
    if (!normalizedCode) {
      return;
    }

    navigate(`/video/${normalizedCode}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
        <div className="w-16 h-16 mx-auto bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <polygon points="23 7 16 12 23 17 23 7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-gray-900 text-center mb-2">{heading}</h1>
        <p className="text-gray-500 text-center mb-8">
          {user?.role === 'counselor'
            ? 'Use the booking meeting code or create an instant room for a live session.'
            : 'Enter the meeting code shared by your counsellor to join the same video room.'}
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">
              Meeting code
            </label>
            <input
              type="text"
              value={room}
              onChange={(e) => setRoom(e.target.value.toUpperCase())}
              placeholder="e.g. A7K9Q2"
              className="w-full border-gray-300 rounded-2xl px-4 py-3 border focus:ring-indigo-500 focus:border-indigo-500 shadow-sm text-center text-lg tracking-[0.35em] font-mono uppercase"
              onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
              maxLength={6}
            />
          </div>

          <button
            onClick={() => handleJoin()}
            className="w-full bg-indigo-600 text-white font-bold py-3 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
          >
            Join with code
          </button>

          {user?.role === 'counselor' && (
            <div className="border-t border-gray-200 pt-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Need a quick room?</p>
              <button
                onClick={() => handleJoin(createRoomCode())}
                className="w-full bg-white border border-indigo-200 text-indigo-700 font-bold py-3 rounded-2xl hover:bg-indigo-50 transition"
              >
                Generate instant room
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
