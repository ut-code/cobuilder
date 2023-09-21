import { GameData, User, clientEmitEvent, clientOnEvent } from "shared";
import { NetworkManager } from "../../models";

export default class MainSceneNetworkManager extends NetworkManager {
  private onGameData: () => void;

  gameData: GameData = {
    playerStatuses: [],
    bulletStatuses: [],
    obstacleStatuses: [],
  };

  constructor(user: User, onGameData: () => void, onOpen: () => void) {
    super(user);
    this.onGameData = onGameData;
    clientOnEvent(this.socket, "open", onOpen);
    clientOnEvent(this.socket, "message", (data) => {
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
