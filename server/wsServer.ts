// /server/wsServer.ts

import { WebSocketServer, type WebSocket } from 'ws';
import { enqueue, dequeue, tryMatch } from './matchmaking';
import { createAndStartRoom, handleTap, removePlayer } from './roomManager';
import type { ClientMessage, PlayerSlot } from '../src/lib/wsProtocol';

const WS_PORT = 3001;
const MATCH_POLL_MS = 200;

const wss = new WebSocketServer({ port: WS_PORT });

const playerRooms = new Map<WebSocket, string>();

function handleMessage(ws: WebSocket, raw: string): void {
  let msg: ClientMessage;
  try {
    msg = JSON.parse(raw) as ClientMessage;
  } catch {
    ws.send(JSON.stringify({ type: 'ERROR', message: 'Invalid JSON' }));
    return;
  }

  switch (msg.type) {
    case 'JOIN_QUEUE':
      enqueue(ws, msg);
      break;

    case 'TAP': {
      const roomId = playerRooms.get(ws);
      if (!roomId) return;

      const room = findSlot(ws, roomId);
      if (room) handleTap(roomId, room);
      break;
    }

    case 'LEAVE_ROOM': {
      const roomId = playerRooms.get(ws);
      if (roomId) {
        removePlayer(ws);
        playerRooms.delete(ws);
      }
      break;
    }
  }
}

function findSlot(ws: WebSocket, roomId: string): PlayerSlot | null {
  // We need access to room internals to determine slot.
  // For simplicity, we'll track it via a parallel map.
  return slotMap.get(ws) ?? null;
}

const slotMap = new Map<WebSocket, PlayerSlot>();

function processMatchmaking(): void {
  const match = tryMatch();
  if (!match) return;

  const [playerA, playerB] = match;
  const roomId = createAndStartRoom(
    { ws: playerA.ws, info: playerA.info },
    { ws: playerB.ws, info: playerB.info },
  );

  playerRooms.set(playerA.ws, roomId);
  playerRooms.set(playerB.ws, roomId);
  slotMap.set(playerA.ws, 'A');
  slotMap.set(playerB.ws, 'B');
}

wss.on('connection', (ws) => {
  ws.on('message', (data) => {
    handleMessage(ws, data.toString());
  });

  ws.on('close', () => {
    dequeue(ws);
    removePlayer(ws);
    playerRooms.delete(ws);
    slotMap.delete(ws);
  });

  ws.on('error', () => {
    dequeue(ws);
    removePlayer(ws);
    playerRooms.delete(ws);
    slotMap.delete(ws);
  });
});

// Matchmaking poll loop
const matchInterval = setInterval(processMatchmaking, MATCH_POLL_MS);

console.log(`MOANTAP WebSocket server running on ws://localhost:${WS_PORT}`);

export { wss, matchInterval };
