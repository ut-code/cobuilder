import { Socket, io } from "socket.io-client";
import { Vector3 } from "./utils/vector3";
import { SceneType } from "./commons/models";

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

export abstract class NetworkManager {
  type: SceneType | null = null;

  protected socket: Socket;

  constructor() {
    this.socket = io(VITE_SERVER_ORIGIN as string, {
      query: { type: this.type },
    });
  }

  destroy() {
    this.socket.disconnect();
  }
}

export class MainSceneNetworkManager extends NetworkManager {
  type: SceneType = "main";

  playerId: number;

  onGameData?: StatusesHandler;

  constructor(playerId: number, onGameData?: StatusesHandler) {
    super();
    this.playerId = playerId;
    this.onGameData = onGameData;
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

  sendCreatePlayer() {
    this.socket.emit("createPlayer", this.playerId);
  }

  sendUserKeyboardInputs(inputs: Map<string, boolean>) {
    const data = JSON.stringify(Object.fromEntries(inputs));
    this.socket.emit("userKeyboardInputs", this.playerId, data);
  }
}

export class LobbySceneNetworkManager extends NetworkManager {
  type: SceneType = "lobby";

  sendCreateRoom() {
    this.socket.emit("createRoom");
  }

  sendJoinRoom() {
    this.socket.emit("joinRoom");
  }

  sendLeaveRoom() {
    this.socket.emit("leaveRoom");
  }
}
