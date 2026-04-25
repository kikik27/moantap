// /lib/wsClient.ts

import type {
  ClientMessage,
  ServerMessage,
} from './wsProtocol';

const WS_URL = typeof window !== 'undefined'
  ? `ws://${window.location.hostname}:3001`
  : 'ws://localhost:3001';
const RECONNECT_DELAY_MS = 2000;
const MAX_RECONNECT_ATTEMPTS = 5;

type MessageHandler = (msg: ServerMessage) => void;

export class WsClient {
  private ws: WebSocket | null = null;
  private handler: MessageHandler | null = null;
  private attempts = 0;
  private intentionalClose = false;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  connect(handler: MessageHandler): void {
    this.handler = handler;
    this.intentionalClose = false;
    this.attempts = 0;
    this.createConnection();
  }

  private createConnection(): void {
    if (this.intentionalClose) return;

    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.attempts = 0;
    };

    this.ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as ServerMessage;
        this.handler?.(msg);
      } catch {
        // Ignore malformed messages
      }
    };

    this.ws.onclose = () => {
      if (!this.intentionalClose) {
        this.scheduleReconnect();
      }
    };

    this.ws.onerror = () => {
      // onclose will fire after this, reconnect handled there
    };
  }

  private scheduleReconnect(): void {
    if (this.attempts >= MAX_RECONNECT_ATTEMPTS) return;

    this.attempts += 1;
    this.reconnectTimer = setTimeout(() => {
      this.createConnection();
    }, RECONNECT_DELAY_MS);
  }

  send(msg: ClientMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  disconnect(): void {
    this.intentionalClose = true;
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
