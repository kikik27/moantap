// /lib/wsProtocol.ts — Re-exports from types (shared between server and client)

export type {
  PlayerSlot,
  PlayerInfo,
  RoomState,
  ClientMessage,
  ClientJoinQueue,
  ClientTap,
  ClientLeaveRoom,
  ServerMessage,
  ServerMatchFound,
  ServerCountdown,
  ServerBattleStart,
  ServerStateUpdate,
  ServerGameEnd,
  ServerOpponentLeft,
  ServerError,
} from '../types/pvp';
