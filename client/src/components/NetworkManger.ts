import { Socket, io } from "socket.io-client";
import { Vector3 } from "./scenes/models";

const { VITE_WEB_SERVER } = import.meta.env;

export default class NetworkManager {
  playerId: number;

  socket: Socket;

  onGameData?: (
    playerStatuses: {
      id: number;
      position: Vector3;
      rotation: Vector3;
    }[]
  ) => void;

  constructor(playerId: number) {
    this.playerId = playerId;
    this.socket = io(VITE_WEB_SERVER as string);
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

  sendCreatePlayer() {
    this.socket.emit("createPlayer", this.playerId);
  }

  sendUserKeyboardInputs(inputs: Map<string, boolean>) {
    const data = JSON.stringify(Object.fromEntries(inputs));
    this.socket.emit("userKeyboardInputs", this.playerId, data);
  }

  destroy() {
    this.socket.disconnect();
  }
}
