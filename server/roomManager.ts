// /server/roomManager.ts

import type WebSocket from 'ws';
import type {
  PlayerSlot,
  PlayerInfo,
  RoomState,
  ServerMessage,
} from '../src/lib/wsProtocol';

const ENERGY_PER_TAP = 10;
const BATTLE_DURATION_SECONDS = 30;
const GAME_TICK_MS = 100;
const COUNTDOWN_SECONDS = 3;

interface Room {
  id: string;
  players: Record<PlayerSlot, { ws: WebSocket; info: PlayerInfo }>;
  state: RoomState;
  tickInterval: ReturnType<typeof setInterval> | null;
  countdownTimeouts: ReturnType<typeof setTimeout>[];
  started: boolean;
}

const rooms = new Map<string, Room>();

function generateRoomId(): string {
  return `room_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function createRoomState(roomId: string): RoomState {
  return {
    roomId,
    energyA: 0,
    energyB: 0,
    tapsA: 0,
    tapsB: 0,
    timeRemaining: BATTLE_DURATION_SECONDS,
    winner: null,
  };
}

function sendToClient(ws: WebSocket, msg: ServerMessage): void {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify(msg));
  }
}

function broadcastToRoom(room: Room, msg: ServerMessage): void {
  sendToClient(room.players.A.ws, msg);
  sendToClient(room.players.B.ws, msg);
}

function detectWinner(state: RoomState): PlayerSlot | null {
  if (state.timeRemaining > 0) return null;

  const winner =
    state.energyA > state.energyB ? 'A' :
    state.energyB > state.energyA ? 'B' : null;

  console.log(`[detectWinner] timeRemaining=${state.timeRemaining} energyA=${state.energyA} energyB=${state.energyB} => winner=${winner ?? 'DRAW'}`);
  return winner;
}

function endGame(room: Room, winner: PlayerSlot | null): void {
  room.state.winner = winner;
  stopGameTick(room);

  console.log(`[endGame] room=${room.id} winner=${winner ?? 'DRAW'} energyA=${room.state.energyA} energyB=${room.state.energyB} tapsA=${room.state.tapsA} tapsB=${room.state.tapsB}`);

  broadcastToRoom(room, {
    type: 'GAME_END',
    winner,
    finalState: { ...room.state },
  });
}

function gameTick(room: Room): void {
  if (room.state.winner !== null) {
    stopGameTick(room);
    return;
  }

  broadcastToRoom(room, {
    type: 'STATE_UPDATE',
    state: { ...room.state },
  });
}

function startGameTick(room: Room): void {
  room.started = true;
  console.log(`[startGameTick] room=${room.id} game started, duration=${BATTLE_DURATION_SECONDS}s`);
  room.tickInterval = setInterval(() => gameTick(room), GAME_TICK_MS);

  // Timer countdown: decrement timeRemaining every second
  const timerInterval = setInterval(() => {
    if (room.state.winner !== null || !room.started) {
      clearInterval(timerInterval);
      return;
    }

    room.state.timeRemaining -= 1;

    if (room.state.timeRemaining <= 0) {
      room.state.timeRemaining = 0;
      clearInterval(timerInterval);
      console.log(`[timer] room=${room.id} time reached 0, determining winner`);
      const winner = detectWinner(room.state);
      endGame(room, winner);
    }
  }, 1000);
}

function stopGameTick(room: Room): void {
  room.started = false;
  if (room.tickInterval !== null) {
    clearInterval(room.tickInterval);
    room.tickInterval = null;
  }
}

function clearCountdownTimeouts(room: Room): void {
  room.countdownTimeouts.forEach(clearTimeout);
  room.countdownTimeouts = [];
}

// ── Public API ──

export function createAndStartRoom(
  playerA: { ws: WebSocket; info: PlayerInfo },
  playerB: { ws: WebSocket; info: PlayerInfo },
): string {
  const roomId = generateRoomId();
  const state = createRoomState(roomId);

  const room: Room = {
    id: roomId,
    players: {
      A: playerA,
      B: playerB,
    },
    state,
    tickInterval: null,
    countdownTimeouts: [],
    started: false,
  };

  rooms.set(roomId, room);

  // Send MATCH_FOUND
  sendToClient(playerA.ws, {
    type: 'MATCH_FOUND',
    roomId,
    slot: 'A',
    opponent: playerB.info,
  });
  sendToClient(playerB.ws, {
    type: 'MATCH_FOUND',
    roomId,
    slot: 'B',
    opponent: playerA.info,
  });

  // Start countdown sequence
  for (let i = COUNTDOWN_SECONDS; i >= 1; i--) {
    const timeout = setTimeout(() => {
      broadcastToRoom(room, { type: 'COUNTDOWN', count: i });
    }, (COUNTDOWN_SECONDS - i) * 1000);
    room.countdownTimeouts.push(timeout);
  }

  // BATTLE_START after countdown
  const startTimeout = setTimeout(() => {
    broadcastToRoom(room, { type: 'BATTLE_START' });
    startGameTick(room);
  }, COUNTDOWN_SECONDS * 1000);
  room.countdownTimeouts.push(startTimeout);

  return roomId;
}

export function handleTap(roomId: string, slot: PlayerSlot): void {
  const room = rooms.get(roomId);
  if (!room || !room.started || room.state.winner !== null) return;

  if (slot === 'A') {
    room.state.energyA += ENERGY_PER_TAP;
    room.state.tapsA += 1;
  } else {
    room.state.energyB += ENERGY_PER_TAP;
    room.state.tapsB += 1;
  }
}

export function removePlayer(ws: WebSocket): void {
  for (const [roomId, room] of rooms) {
    const slotA = room.players.A.ws === ws ? 'A' : null;
    const slotB = room.players.B.ws === ws ? 'B' : null;
    const slot = slotA ?? slotB;

    if (slot) {
      const otherSlot: PlayerSlot = slot === 'A' ? 'B' : 'A';
      const otherPlayer = room.players[otherSlot];

      stopGameTick(room);
      clearCountdownTimeouts(room);

      sendToClient(otherPlayer.ws, { type: 'OPPONENT_LEFT' });
      rooms.delete(roomId);
      return;
    }
  }
}

export function getRoomCount(): number {
  return rooms.size;
}
