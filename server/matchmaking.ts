// /server/matchmaking.ts

import type WebSocket from 'ws';
import type { PlayerInfo, ClientJoinQueue } from '../src/lib/wsProtocol';

interface QueuedPlayer {
  ws: WebSocket;
  info: PlayerInfo;
}

const queue: QueuedPlayer[] = [];

export function enqueue(ws: WebSocket, data: ClientJoinQueue): void {
  const player: QueuedPlayer = {
    ws,
    info: { id: data.playerId, name: data.playerName },
  };

  // Prevent duplicate queue entries from same socket
  const existing = queue.findIndex((p) => p.ws === ws);
  if (existing !== -1) {
    queue.splice(existing, 1);
  }

  queue.push(player);
}

export function dequeue(ws: WebSocket): void {
  const idx = queue.findIndex((p) => p.ws === ws);
  if (idx !== -1) queue.splice(idx, 1);
}

export function tryMatch(): [QueuedPlayer, QueuedPlayer] | null {
  if (queue.length < 2) return null;

  const playerA = queue.shift()!;
  const playerB = queue.shift()!;
  return [playerA, playerB];
}

export function getQueueLength(): number {
  return queue.length;
}
