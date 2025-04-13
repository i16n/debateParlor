# Debate Parlor

A web application for timed debates and discussions. Debate Parlor allows users to engage in time-limited debates on either user-selected topics or randomly assigned topics.

## Features

- Enter your name to begin
- Choose between two debate formats:
  - **Free Topic** - Join a chatroom to argue about any topic you choose
  - **Assigned Topic** - Debate a randomly assigned topic with a partner
- 4-minute timer for each debate session
- Agreement feature in assigned topic mode - when both debaters agree, a new topic is assigned and the timer resets
- Real-time chatting with Socket.IO

## Tech Stack

- Next.js (React framework)
- Socket.IO (for real-time communication)
- TailwindCSS (for styling)
- TypeScript

## Setup Instructions

1. Install dependencies:

   ```bash
   npm install
   ```

2. Run the development server:

   ```bash
   node server.js
   ```

3. Open your browser and visit:
   ```
   http://localhost:3000
   ```

## Development Notes

The application uses:

- Next.js App Router for routing
- Socket.IO for real-time communication
- Context API for state management
- Session storage for preserving user data between pages

## Project Structure

- `app/` - Next.js app router components and pages
  - `components/` - Reusable UI components
  - `contexts/` - React context providers
  - `lib/` - Utility functions and types
- `server.js` - Socket.IO server implementation
