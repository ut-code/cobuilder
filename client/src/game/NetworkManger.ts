import { Socket, io } from "socket.io-client";
import { Vector3 } from "./utils/vector3";
import { User } from "./commons/models";

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

export type RoomData = {
  id: number;
  users: User[];
};

type RoomsDataHandler = (roomsData: RoomData[]) => void;

export abstract class NetworkManager {
  userId: number;

  protected socket: Socket;

  constructor(userId: number, userName: string) {
    this.userId = userId;
    this.socket = io(VITE_SERVER_ORIGIN as string, {
      query: { networkManagerName: this.constructor.name, userId, userName },
    });
  }

  destroy() {
    this.socket.disconnect();
  }
}

export class LoginSceneNetworkManager extends NetworkManager {
  sendLogin() {
    this.socket.emit("login", this.userId);
  }
}

export class MainSceneNetworkManager extends NetworkManager {
  onGameData: StatusesHandler;

  constructor(userId: number, userName: string, onGameData: StatusesHandler) {
    super(userId, userName);
    this.onGameData = onGameData;
    this.socket.on(
      "gameData",
      (
        playerStatuses: PlayerStatus[],
        bulletStatuses: BulletStatus[],
        obstacleStatuses: ObstacleStatus[]
      ) => {
        this.onGameData(playerStatuses, bulletStatuses, obstacleStatuses);
      }
    );
  }

  sendCreatePlayer() {
    this.socket.emit("createPlayer", this.userId);
  }

  sendUserKeyboardInputs(inputs: Map<string, boolean>) {
    const data = JSON.stringify(Object.fromEntries(inputs));
    this.socket.emit("userKeyboardInputs", this.userId, data);
  }
}

export class LobbySceneNetworkManager extends NetworkManager {
  onRoomsData: RoomsDataHandler;

  constructor(userId: number, userName: string, onRoomsData: RoomsDataHandler) {
    super(userId, userName);
    this.onRoomsData = onRoomsData;
    this.socket.on("roomsData", (roomsData: RoomData[]) => {
      this.onRoomsData(roomsData);
    });
  }

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
