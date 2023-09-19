import {
  User,
  clientEmitEvent,
  GameData,
  clientOnEvent,
  LobbyData,
} from "shared";

const { VITE_SERVER_ORIGIN } = import.meta.env;

export abstract class NetworkManager {
  user: User;

  protected socket: WebSocket;

  constructor(user: User) {
    this.user = user;
    this.socket = new WebSocket("ws://localhost:5000");
    this.socket.onopen = () => {
      clientEmitEvent(this.socket, {
        event: "connection",
        networkManagerName: this.constructor.name,
        userConnecting: this.user,
      });
    };
  }

  destroy() {
    this.socket.close();
  }
}

export class LoginSceneNetworkManager extends NetworkManager {
  sendLogin() {
    this.socket.send(JSON.stringify(this.user));
  }
}

export class MainSceneNetworkManager extends NetworkManager {
  private onGameData: () => void;

  gameData: GameData = {
    playerStatuses: [],
    bulletStatuses: [],
    obstacleStatuses: [],
  };

  constructor(user: User, onGameData: () => void) {
    super(user);
    this.onGameData = onGameData;
    clientOnEvent(this.socket, (data) => {
      switch (data.event) {
        case "game-data:update": {
          this.updateGameData(data.gameData as GameData);
          this.onGameData();
          break;
        }
        default: {
          throw new Error(`Unexpected event: ${data.event}`);
        }
      }
    });
  }

  sendCreatePlayer() {
    clientEmitEvent(this.socket, {
      event: "player:create",
      newUserData: this.user,
    });
  }

  sendUserKeyboardInputs(inputs: Map<string, boolean>) {
    const data = JSON.stringify(Object.fromEntries(inputs));
    clientEmitEvent(this.socket, {
      event: "keyboard-inputs:update",
      typistData: this.user,
      keyboardInputs: data,
    });
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
    clientOnEvent(this.socket, (data) => {
      switch (data.event) {
        case "lobby-data:update": {
          this.updateLobbyData(data.lobbyData);
          this.onLobbyData();
          break;
        }
        default: {
          throw new Error(`Unexpected event: ${data.event}`);
        }
      }
    });
  }

  sendCreateRoom() {
    clientEmitEvent(this.socket, { event: "room:create" });
  }

  sendJoinRoom() {
    clientEmitEvent(this.socket, { event: "room:join" });
  }

  sendLeaveRoom() {
    clientEmitEvent(this.socket, { event: "room:leave" });
  }

  private updateLobbyData(lobbyData: LobbyData) {
    this.lobbyData = lobbyData;
  }
}
