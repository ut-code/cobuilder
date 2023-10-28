import { LobbyData, User, clientEmitEvent, clientOnEvent } from "shared";
import BaseNetworkManager from "../base/network";

export default class LobbySceneNetworkManager extends BaseNetworkManager {
  onLobbyData: () => void;

  onGameStart: () => void;

  lobbyData: LobbyData = { rooms: [] };

  constructor(user: User, onLobbyData: () => void, onGameStart: () => void) {
    super(user);
    this.onLobbyData = onLobbyData;
    this.onGameStart = onGameStart;
    clientOnEvent(this.socket, "message", (data) => {
      switch (data.event) {
        case "lobby-data:update": {
          this.updateLobbyData(data.lobbyData);
          this.onLobbyData();
          break;
        }
        case "game:start": {
          this.onGameStart();
          break;
        }
        default: {
          throw new Error(`Unexpected event: ${data.event}`);
        }
      }
    });
  }

  sendCreateRoom() {
    if (!this.checkIsSocketOpen()) return;
    clientEmitEvent(this.socket, { event: "room:create" });
  }

  sendJoinRoom(roomId: number) {
    if (!this.checkIsSocketOpen()) return;
    clientEmitEvent(this.socket, { event: "room:join", roomId });
  }

  sendLeaveRoom() {
    if (!this.checkIsSocketOpen()) return;
    clientEmitEvent(this.socket, { event: "room:leave" });
  }

  private updateLobbyData(lobbyData: LobbyData) {
    this.lobbyData = lobbyData;
  }
}
