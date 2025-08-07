# LiveKit Debugging Guide

## ✅ Issues Fixed

### 1. **TrackRef Error in ParticipantGrid**
- **Problem**: Incorrect `trackRef` structure passed to `VideoTrack`
- **Solution**: Use the complete track object directly: `trackRef={cameraTrack}`

### 2. **Duplicate Key Warning**
- **Problem**: React keys not unique or stable
- **Solution**: Added `uniqueKey` property with fallback to `identity`

### 3. **Duplicate LiveKitRoom Wrapper**
- **Problem**: LiveKitRoom was wrapped twice (in App.jsx and RoomPage.jsx)
- **Solution**: Removed duplicate wrapper from RoomPage.jsx

### 4. **Connection Status Feedback**
- **Added**: `ConnectionStatus` component with real-time connection state

## 🔧 Server Configuration

### Current LiveKit Server Status
```bash
# Server is running on port 7880
ps aux | grep livekit
```

### Server Config (`livekit-server/config.yaml`)
```yaml
port: 7880
rtc:
  udp_port: 7881
  tcp_port: 7882
  use_external_ip: false

keys:
  VecViQPsDzQSImrjNr5pwqsUoFo1WCbfWxt82RaErNc=: DvaTxG7dtFjHQxK3fauSZYhwuSs4hF0oV5bWz8IHOf4=

logging:
  level: debug
```

## 🧪 Testing Steps

### 1. **Test WebSocket Connection**
```bash
# Test if WebSocket port is accessible
curl -I http://localhost:7880
```

### 2. **Test Token Generation**
```bash
# Check if backend is running
curl http://localhost:3001/api/token
```

### 3. **Browser Console Checks**
- Open DevTools → Console
- Look for:
  - WebSocket connection errors
  - Token validation errors
  - Track subscription errors

### 4. **Network Tab**
- Check WebSocket connection status
- Verify token requests/responses
- Look for CORS errors

## 🚀 Quick Fixes

### If WebSocket Connection Fails:
```bash
# Restart LiveKit server
sudo systemctl restart livekit-server
# or
livekit-server --config livekit-server/config.yaml
```

### If Token Issues:
```bash
# Check backend logs
cd backend && npm run dev
```

### If CORS Issues:
Add to `livekit-server/config.yaml`:
```yaml
api:
  cors:
    allowed_origins:
      - "http://localhost:3000"
      - "http://localhost:5173"
```

## 🔍 Debugging Checklist

### ✅ Server Status
- [ ] LiveKit server running on port 7880
- [ ] Backend server running on port 3001
- [ ] WebSocket connection accessible

### ✅ Token Validation
- [ ] Token generated successfully
- [ ] Token contains correct room permissions
- [ ] Token not expired

### ✅ Frontend Connection
- [ ] No duplicate LiveKitRoom wrappers
- [ ] Correct server URL in environment
- [ ] Connection status shows properly

### ✅ Video/Audio Tracks
- [ ] Camera permissions granted
- [ ] Microphone permissions granted
- [ ] Tracks published successfully
- [ ] Video mirroring works for local participant

## 🐛 Common Issues & Solutions

### Issue: "WebSocket connection failed"
**Solution**: Check if LiveKit server is running and accessible

### Issue: "Token validation failed"
**Solution**: Verify token generation and room permissions

### Issue: "No video/audio tracks"
**Solution**: Check browser permissions and track publishing

### Issue: "Duplicate keys in React"
**Solution**: Ensure unique keys for participant tiles

## 📱 Testing with Multiple Participants

1. Open multiple browser tabs/windows
2. Join the same room with different names
3. Test camera/microphone toggles
4. Verify active speaker highlighting
5. Check responsive grid layout

## 🔧 Environment Variables

Ensure these are set in `.env`:
```env
VITE_LIVEKIT_URL=ws://localhost:7880
```

## 📊 Performance Monitoring

- Monitor WebSocket connection quality
- Check for memory leaks in video components
- Verify track subscription/unsubscription
- Monitor CPU usage during video calls

## 🆘 Emergency Reset

If everything fails:
```bash
# 1. Stop all services
sudo systemctl stop livekit-server
pkill -f "npm run dev"

# 2. Clear browser cache
# 3. Restart services
sudo systemctl start livekit-server
cd backend && npm run dev
cd frontend && npm run dev
``` 