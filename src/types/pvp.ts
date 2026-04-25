import type { MoanState } from './tap';

// ── Player ──

export type PlayerSlot = 'A' | 'B';

export interface PlayerInfo {
  id: string;
  name: string;
}

export interface PlayerState {
  energy: number;
  taps: number;
  moanState: MoanState;
}

// ── Battle ──

export interface BattleState {
  playerA: PlayerState;
  playerB: PlayerState;
  timeRemaining: number;
  energyBarPosition: number;
  winner: PlayerSlot | null;
}

export interface BattleSignals {
  intensity: number;
  dominance: PlayerSlot | null;
  tension: number;
  momentum: number;
  tapBurst: number;
}

// ── Room ──

export interface RoomState {
  roomId: string;
  energyA: number;
  energyB: number;
  tapsA: number;
  tapsB: number;
  timeRemaining: number;
  winner: PlayerSlot | null;
}

// ── WS Client → Server ──

export interface ClientJoinQueue {
  type: 'JOIN_QUEUE';
  playerId: string;
  playerName: string;
}

export interface ClientTap {
  type: 'TAP';
}

export interface ClientLeaveRoom {
  type: 'LEAVE_ROOM';
}

export type ClientMessage =
  | ClientJoinQueue
  | ClientTap
  | ClientLeaveRoom;

// ── WS Server → Client ──

export interface ServerMatchFound {
  type: 'MATCH_FOUND';
  roomId: string;
  slot: PlayerSlot;
  opponent: PlayerInfo;
}

export interface ServerCountdown {
  type: 'COUNTDOWN';
  count: number;
}

export interface ServerBattleStart {
  type: 'BATTLE_START';
}

export interface ServerStateUpdate {
  type: 'STATE_UPDATE';
  state: RoomState;
}

export interface ServerGameEnd {
  type: 'GAME_END';
  winner: PlayerSlot | null;
  finalState: RoomState;
}

export interface ServerOpponentLeft {
  type: 'OPPONENT_LEFT';
}

export interface ServerError {
  type: 'ERROR';
  message: string;
}

export type ServerMessage =
  | ServerMatchFound
  | ServerCountdown
  | ServerBattleStart
  | ServerStateUpdate
  | ServerGameEnd
  | ServerOpponentLeft
  | ServerError;
