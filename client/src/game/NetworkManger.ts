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

export type GameData = {
  playerStatuses: PlayerStatus[];
  bulletStatuses: BulletStatus[];
  obstacleStatuses: ObstacleStatus[];
};

export type RoomData = {
  id: number;
  users: User[];
};

export type LobbyData = {
  rooms: RoomData[];
};

export abstract class NetworkManager {
  user: User;

  protected socket: Socket;

  constructor(user: User) {
    this.user = user;
    this.socket = io(VITE_SERVER_ORIGIN as string, {
      query: {
        networkManagerName: this.constructor.name,
        user: JSON.stringify(user),
      },
    });
  }

  destroy() {
    this.socket.disconnect();
  }
}

export class LoginSceneNetworkManager extends NetworkManager {
  sendLogin() {
    this.socket.emit("login", this.user);
  }
}

export class MainSceneNetworkManager extends NetworkManager {
  private onGameData: () => void;

  gameData: {
    playerStatuses: PlayerStatus[];
    bulletStatuses: BulletStatus[];
    obstacleStatuses: ObstacleStatus[];
  } = { playerStatuses: [], bulletStatuses: [], obstacleStatuses: [] };

  constructor(user: User, onGameData: () => void) {
    super(user);
    this.onGameData = onGameData;
    this.socket.on("gameData", (gameData: GameData) => {
      this.updateGameData(gameData);
      this.onGameData();
    });
  }

  sendCreatePlayer() {
    this.socket.emit("createPlayer", this.user);
  }

  sendUserKeyboardInputs(inputs: Map<string, boolean>) {
    const data = JSON.stringify(Object.fromEntries(inputs));
    this.socket.emit("userKeyboardInputs", this.user, data);
  }

  private updateGameData(gameData: GameData) {
    this.gameData = gameData;
  }
}

export class LobbySceneNetworkManager extends NetworkManager {
  onLobbyData: () => void;

  lobbyData: LobbyData = { rooms: [] };

  constructor(user: User, onLobbyData: () => void) {
    super(user);
    this.onLobbyData = onLobbyData;
    this.socket.on("lobbyData", (lobbyData: LobbyData) => {
      this.updateLobbyData(lobbyData);
      this.onLobbyData();
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

  private updateLobbyData(lobbyData: LobbyData) {
    this.lobbyData = lobbyData;
  }
}
