import {
  User,
  PlayerStatus,
  BulletStatus,
  ObstacleStatus,
  GameData,
  updateGameData,
  updateLobbyData,
  LobbyData,
  createRoom,
  joinRoom,
  leaveRoom,
  NewUserData,
  createPlayer,
  updateUserKeyboardInputs,
} from "shared";

const { VITE_SERVER_ORIGIN } = import.meta.env;

export abstract class NetworkManager {
  user: User;

  protected socket: WebSocket;

  constructor(user: User) {
    this.user = user;
    this.socket = new WebSocket(VITE_SERVER_ORIGIN as string);
    this.socket.onopen = () => {
      this.socket.send(
        JSON.stringify({
          networkManagerName: this.constructor.name,
          user: JSON.stringify(user),
        })
      );
    };
  }

  destroy() {
    this.socket.close();
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
    this.socket.on(updateGameData, (gameData: GameData) => {
      this.updateGameData(gameData);
      this.onGameData();
    });
  }

  sendCreatePlayer() {
    const newUserData: NewUserData = this.user;
    this.socket.emit(createPlayer, newUserData);
  }

  sendUserKeyboardInputs(inputs: Map<string, boolean>) {
    const data = JSON.stringify(Object.fromEntries(inputs));
    this.socket.emit(updateUserKeyboardInputs, this.user, data);
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
    this.socket.on(updateLobbyData, (lobbyData: LobbyData) => {
      this.updateLobbyData(lobbyData);
      this.onLobbyData();
    });
  }

  sendCreateRoom() {
    this.socket.emit(createRoom);
  }

  sendJoinRoom() {
    this.socket.emit(joinRoom);
  }

  sendLeaveRoom() {
    this.socket.emit(leaveRoom);
  }

  private updateLobbyData(lobbyData: LobbyData) {
    this.lobbyData = lobbyData;
  }
}
