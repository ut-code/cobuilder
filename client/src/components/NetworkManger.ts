import { Socket, io } from "socket.io-client";
import { Vector3 } from "./scenes/models";

const { VITE_WEB_SERVER } = import.meta.env;

export type PlayerStatus = {
  id: number;
  HP: number;
  position: Vector3;
  rotation: Vector3;
  isDead: boolean;
};

export type BulletStatus = {
  id: number;
  position: Vector3;
  rotation: Vector3;
};

type StatusesHandler = (
  playerStatuses: PlayerStatus[],
  bullets: BulletStatus[]
) => void;

export default class NetworkManager {
  playerId: number;

  socket: Socket;

  onGameData?: StatusesHandler;

  constructor(playerId: number, onGameData?: StatusesHandler) {
    this.playerId = playerId;
    this.onGameData = onGameData;
    this.socket = io(VITE_WEB_SERVER as string);
    this.socket.on(
      "gameData",
      (playerStatuses: PlayerStatus[], bulletStatuses: BulletStatus[]) => {
        if (!this.onGameData) throw new Error();
        this.onGameData(playerStatuses, bulletStatuses);
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
