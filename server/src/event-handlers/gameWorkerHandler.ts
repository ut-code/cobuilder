import { serverEmitEvent, serverOnEvent } from "shared";
import { WebSocket } from "ws";
import { Worker } from "node:worker_threads";
import { WorkerEvent } from "../game/game.worker";

export default function gameWorkerHandler(
  socket: WebSocket,
  gameWorker: Worker,
  userId: number,
  onClose: () => void
) {
  // eslint-disable-next-line no-param-reassign
  gameWorker.on("message", (value: WorkerEvent) => {
    switch (value.event) {
      case "game-data:update": {
        serverEmitEvent(socket, value);
        break;
      }
      default: {
        throw new Error();
      }
    }
  });
  serverOnEvent(socket, "message", (data) => {
    switch (data.event) {
      case "player:create": {
        gameWorker.postMessage({
          event: "player:create",
          newUserData: {
            id: data.newUserData.id,
          },
        });
        break;
      }
      case "keyboard-inputs:update": {
        gameWorker.postMessage({
          event: "keyboard-inputs:update",
          typistData: {
            id: data.typistData.id,
          },
          keyboardInputs: data.keyboardInputs,
        });
        break;
      }
      default: {
        throw new Error();
      }
    }
  });
  serverOnEvent(socket, "close", () => {
    console.log(`User ${userId} disconnected`);
    onClose();
  });
}
