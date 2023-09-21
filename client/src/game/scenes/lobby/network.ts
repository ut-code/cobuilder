import { LobbyData, User, clientEmitEvent, clientOnEvent } from "shared";
import { NetworkManager } from "../../models";

export default class LobbySceneNetworkManager extends NetworkManager {
  onLobbyData: () => void;

  lobbyData: LobbyData = { rooms: [] };

  constructor(user: User, onLobbyData: () => void) {
    super(user);
    this.onLobbyData = onLobbyData;
    clientOnEvent(this.socket, "message", (data) => {
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
