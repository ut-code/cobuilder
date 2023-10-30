import { GameData, User, clientEmitEvent, clientOnEvent } from "shared";
import BaseNetworkManager from "../base/network";

export default class MainSceneNetworkManager extends BaseNetworkManager {
  private onGameData: () => void;

  gameData: GameData = {
    fighterStatuses: [],
    bulletStatuses: [],
    obstacleStatuses: [],
  };

  constructor(
    user: User,
    onGameData: () => void,
    previousNetworkManager?: BaseNetworkManager
  ) {
    super(user, previousNetworkManager);
    this.onGameData = onGameData;
    clientEmitEvent(this.socket, { event: "fighter:create" });
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

  sendCreateFighter() {
    console.log("sendCreateFighter");
    if (!this.checkIsSocketOpen()) return;
    clientEmitEvent(this.socket, {
      event: "fighter:create",
    });
  }

  sendUserKeyboardInputs(inputs: Map<string, boolean>) {
    if (!this.checkIsSocketOpen()) return;
    const data = JSON.stringify(Object.fromEntries(inputs));
    clientEmitEvent(this.socket, {
      event: "keyboard-inputs:update",
      keyboardInputs: data,
    });
  }

  private updateGameData(gameData: GameData) {
    this.gameData = gameData;
  }
}
