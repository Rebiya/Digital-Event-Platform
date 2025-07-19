# Digital Event Platform Frontend

A modern video conferencing platform built with React, LiveKit, and TailwindCSS.

## Features

- 🎥 Real-time video conferencing with LiveKit
- 👥 Multi-participant support
- 💬 Built-in chat functionality
- 🎤 Audio controls (mute/unmute)
- 📹 Video controls (camera on/off)
- 📱 Responsive design
- 🎨 Modern UI with TailwindCSS

## Tech Stack

- **React 19** - UI framework
- **Vite** - Build tool and dev server
- **LiveKit** - Real-time video/audio infrastructure
- **TailwindCSS** - Styling
- **React Router** - Client-side routing

## Getting Started

### Prerequisites

- Node.js 18+ 
- Backend server running on port 3000

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your LiveKit server URL:
```
VITE_LIVEKIT_URL=wss://your-livekit-server.com
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Building for Production

```bash
npm run build
```

## Usage

1. Navigate to `/join` to enter your name and room name
2. Click "Join Room" to connect to the video conference
3. Use the controls at the bottom to manage audio/video
4. Use the chat panel on the right for messaging
5. Click "Leave Room" to disconnect

## Project Structure

```
src/
├── components/
│   ├── JoinPage.jsx      # Room joining interface
│   └── RoomPage.jsx      # Main video conference room
├── App.jsx               # Main app with routing
├── main.jsx             # App entry point
└── index.css            # Global styles
```

## API Integration

The frontend communicates with the backend API for:
- Token generation (`POST /api/token`)
- Room management

The API proxy is configured in `vite.config.js` to forward `/api` requests to the backend server.

## Styling

The app uses TailwindCSS for styling with custom LiveKit component overrides in `App.css`. The design follows a dark theme optimized for video conferencing.
