import { WebSocket as ServerSocket } from "ws";
import { ClientEventData, ServerEventData } from "../schema";

export function clientOnEvent(
  socket: WebSocket,
  event: "message",
  handler: (data: ServerEventData) => void
): void;
export function clientOnEvent(
  socket: WebSocket,
  event: "open",
  handler: () => void
): void;
export function clientOnEvent(
  socket: WebSocket,
  event: string,
  handler: (data?: ServerEventData) => void
) {
  switch (event) {
    case "message": {
      // eslint-disable-next-line no-param-reassign
      socket.onmessage = (messageEvent) => {
        const data = JSON.parse(messageEvent.data) as ServerEventData;
        handler(data);
      };
      break;
    }
    case "open": {
      // eslint-disable-next-line no-param-reassign
      socket.onopen = () => {
        handler();
      };
      break;
    }
    default: {
      throw new Error();
    }
  }
}

export function serverOnEvent(
  socket: ServerSocket,
  event: "message",
  handler: (data: ClientEventData) => void
): void;
export function serverOnEvent(
  socket: ServerSocket,
  event: "close",
  handler: () => void
): void;

export function serverOnEvent(
  socket: ServerSocket,
  event: string,
  handler: (data?: ClientEventData) => void
) {
  switch (event) {
    case "message": {
      socket.on("message", (stream) => {
        const data = JSON.parse(stream.toString()) as ClientEventData;
        handler(data);
      });
      break;
    }
    case "close": {
      socket.on("close", () => {
        handler();
      });
      break;
    }
    default: {
      throw new Error();
    }
  }
}
