// /hooks/usePvPSocket.ts

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { WsClient } from '@/lib/wsClient';
import type {
  PlayerSlot,
  PlayerInfo,
  RoomState,
  ServerMessage,
} from '@/lib/wsProtocol';

export type PvPPhase =
  | 'idle'
  | 'connecting'
  | 'queue'
  | 'matched'
  | 'countdown'
  | 'battle'
  | 'ended';

interface UsePvPSocketReturn {
  phase: PvPPhase;
  roomId: string | null;
  slot: PlayerSlot | null;
  opponent: PlayerInfo | null;
  state: RoomState | null;
  countdownValue: number | null;
  error: string | null;
  connect: (playerId: string, playerName: string) => void;
  sendTap: () => void;
  leave: () => void;
}

export function usePvPSocket(): UsePvPSocketReturn {
  const [phase, setPhase] = useState<PvPPhase>('idle');
  const [roomId, setRoomId] = useState<string | null>(null);
  const [slot, setSlot] = useState<PlayerSlot | null>(null);
  const [opponent, setOpponent] = useState<PlayerInfo | null>(null);
  const [state, setState] = useState<RoomState | null>(null);
  const [countdownValue, setCountdownValue] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clientRef = useRef<WsClient | null>(null);
  const slotRef = useRef<PlayerSlot | null>(null);

  const handleMessage = useCallback((msg: ServerMessage) => {
    switch (msg.type) {
      case 'MATCH_FOUND':
        setRoomId(msg.roomId);
        setSlot(msg.slot);
        slotRef.current = msg.slot;
        setOpponent(msg.opponent);
        setPhase('matched');
        // Brief matched state, then countdown arrives from server
        break;

      case 'COUNTDOWN':
        setCountdownValue(msg.count);
        setPhase('countdown');
        break;

      case 'BATTLE_START':
        setCountdownValue(null);
        setPhase('battle');
        break;

      case 'STATE_UPDATE':
        setState(msg.state);
        break;

      case 'GAME_END':
        setState(msg.finalState);
        setPhase('ended');
        break;

      case 'OPPONENT_LEFT':
        // Remaining player wins by default
        setState((prev) =>
          prev
            ? { ...prev, winner: prev.winner ?? slotRef.current }
            : null,
        );
        setError('Opponent disconnected — you win!');
        setPhase('ended');
        break;

      case 'ERROR':
        setError(msg.message);
        break;
    }
  }, []);

  const connect = useCallback(
    (playerId: string, playerName: string) => {
      setError(null);
      setPhase('connecting');

      const client = new WsClient();
      clientRef.current = client;

      client.connect((msg) => {
        if (msg.type === 'ERROR' && phase === 'connecting') {
          setError(msg.message);
          setPhase('idle');
          return;
        }

        // Once connected, send JOIN_QUEUE
        if (!client.isConnected()) return;

        handleMessage(msg);
      });

      // Small delay to let connection open, then join queue
      setTimeout(() => {
        if (client.isConnected()) {
          client.send({ type: 'JOIN_QUEUE', playerId, playerName });
          setPhase('queue');
        } else {
          // Connection not open yet, try again shortly
          const retryTimer = setInterval(() => {
            if (client.isConnected()) {
              client.send({ type: 'JOIN_QUEUE', playerId, playerName });
              setPhase('queue');
              clearInterval(retryTimer);
            }
          }, 200);
          setTimeout(() => clearInterval(retryTimer), 5000);
        }
      }, 300);
    },
    [handleMessage, phase],
  );

  const sendTap = useCallback(() => {
    clientRef.current?.send({ type: 'TAP' });
  }, []);

  const leave = useCallback(() => {
    clientRef.current?.send({ type: 'LEAVE_ROOM' });
    clientRef.current?.disconnect();
    clientRef.current = null;
    setPhase('idle');
    setRoomId(null);
    setSlot(null);
    setOpponent(null);
    setState(null);
    setCountdownValue(null);
    setError(null);
  }, []);

  useEffect(() => {
    return () => {
      clientRef.current?.disconnect();
    };
  }, []);

  return {
    phase,
    roomId,
    slot,
    opponent,
    state,
    countdownValue,
    error,
    connect,
    sendTap,
    leave,
  };
}
