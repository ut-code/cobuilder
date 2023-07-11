import { Socket, io } from "socket.io-client";
import { Vector3 } from "./utils/vector3";

const { VITE_SERVER_ORIGIN } = import.meta.env;

export type PlayerStatus = {
  id: number;
  HP: number;
  score: number;
  position: Vector3;
  rotation: Vector3;
  isDead: boolean;
};

export type BulletStatus = {
  id: number;
  position: Vector3;
  rotation: Vector3;
};

export type ObstacleStatus = {
  id: number;
  position: Vector3;
  rotation: Vector3;
};

type StatusesHandler = (
  playerStatuses: PlayerStatus[],
  bulletStatuses: BulletStatus[],
  obstacleStatuses: ObstacleStatus[]
) => void;

export default class NetworkManager {
  playerId: number;

  socket: Socket;

  onGameData?: StatusesHandler;

  constructor(playerId: number, onGameData?: StatusesHandler) {
    this.playerId = playerId;
    this.onGameData = onGameData;
    this.socket = io(VITE_SERVER_ORIGIN as string);
    this.socket.on(
      "gameData",
      (
        playerStatuses: PlayerStatus[],
        bulletStatuses: BulletStatus[],
        obstacleStatuses: ObstacleStatus[]
      ) => {
        if (!this.onGameData) throw new Error();
        this.onGameData(playerStatuses, bulletStatuses, obstacleStatuses);
      }
    );
  }

  sendCreateRoom() {
    this.socket.emit("createRoom", this.playerId);
  }

  sendJoinRoom() {
    this.socket.emit("joinRoom", this.playerId);
  }

  sendLeaveRoom() {
    this.socket.emit("leaveRoom", this.playerId);
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
