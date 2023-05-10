import { Socket, io } from "socket.io-client";
import { Vector3 } from "./scenes/models";

const { WEB_SERVER } = import.meta.env;

export default class NetworkManager {
  socket: Socket;

  onGameData?: (
    playerStatuses: {
      id: number;
      position: Vector3;
      rotation: Vector3;
    }[]
  ) => void;

  constructor() {
    this.socket = io(WEB_SERVER || "http://localhost:5000");
    this.socket.on(
      "playerStatuses",
      (
        playerStatuses: {
          id: number;
          position: Vector3;
          rotation: Vector3;
        }[]
      ) => {
        if (!this.onGameData) throw new Error();
        this.onGameData(playerStatuses);
      }
    );
  }

  sendCreatePlayer(playerId: number) {
    this.socket.emit("createPlayer", playerId);
  }

  sendUserKeyboardInputs(playerId: number, inputs: Map<string, boolean>) {
    const data = JSON.stringify(Object.fromEntries(inputs));
    this.socket.emit("userKeyboardInputs", playerId, data);
  }

  destroy() {
    this.socket.disconnect();
  }
}
