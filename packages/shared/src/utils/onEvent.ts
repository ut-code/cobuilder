import { WebSocket as ServerSocket } from "ws";
import { ClientEventData, ServerEventData } from "../schema";

export function clientOnEvent(
  socket: WebSocket,
  handler: (data: ServerEventData) => void
) {
  // eslint-disable-next-line no-param-reassign
  socket.onmessage = (event) => {
    const data = JSON.parse(event.data) as ServerEventData;
    handler(data);
  };
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
  // eslint-disable-next-line no-param-reassign
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
