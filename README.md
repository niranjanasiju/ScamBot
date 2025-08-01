# Simple Chatbot

A simple real-time chatbot application built with Next.js and Socket.io that responds with "abc" to any user message.

## Features

- **Simple chat interface** - No login or room codes required
- **Instant responses** - Bot replies "abc" to any message
- **Real-time communication** using Socket.io
- **Modern UI** with Tailwind CSS and shadcn/ui components
- **Responsive design** for all devices

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Node.js with Socket.io
- **UI Components**: shadcn/ui
- **Real-time Communication**: Socket.io

## Project Structure

```
useless/
├── app/                    # Next.js App Router
│   ├── page.js            # Main chatbot interface
│   ├── layout.js          # Root layout with metadata
│   └── globals.css        # Global styles
├── components/
│   └── ui/                # shadcn/ui components
│       ├── button.jsx
│       ├── card.jsx
│       └── input.jsx
├── hooks/
│   └── useSocket.js       # Main socket connection hook
├── server.js              # Socket.io server with chatbot logic
└── package.json           # Dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd useless
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the Socket.io server**
   ```bash
   node server.js
   ```

4. **Start the Next.js development server** (in a new terminal)
   ```bash
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## Usage

1. **Enter your name** to start chatting
2. **Type any message** and press Enter or click Send
3. **The bot will respond** with "abc" to every message
4. **Chat history is preserved** during your session

## API Reference

### Socket Events

#### Client to Server
- `joinChat` - Join the chat with username
- `sendMessage` - Send a message to the bot

#### Server to Client
- `chatJoined` - Confirmation of joining chat with message history
- `newMessage` - New message from user or bot
- `error` - Error message

## How It Works

The application uses Socket.io for real-time communication between the client and server. When a user sends a message:

1. Client emits `sendMessage` event with the message data
2. Server receives the message and broadcasts it to all clients
3. Server automatically replies with "abc" after a 500ms delay
4. Both messages appear in the chat interface in real-time

## Development

### Adding Features

The chatbot logic is in `server.js`. To change the bot's response, modify the auto-reply section:

```javascript
// Auto-reply with "abc" after a short delay
setTimeout(() => {
  const botMessageObject = {
    id: Date.now() + Math.random(),
    username: 'bot',
    message: 'abc', // Change this to customize the response
    timestamp: new Date(),
    type: 'bot'
  }
  // ... rest of the logic
}, 500)
```

### Styling

The app uses Tailwind CSS for styling. Main styles are in:
- `app/globals.css` - Global styles and Tailwind imports
- Component files - Tailwind classes applied directly

## License

MIT License
